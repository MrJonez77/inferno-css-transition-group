import {Component} from 'inferno';
import {findDOMNode} from 'inferno-extras';

class CSSTransitionGroupChild extends Component {
	constructor(props, context) {
		super(props, context);

		this.classNameAndNodeQueue = [];
		this.transitionTimeouts = [];

		this.flushClassNameAndNodeQueue = this.flushClassNameAndNodeQueue.bind(this);
		this.componentWillAppear = this.componentWillAppear.bind(this);
		this.componentWillEnter = this.componentWillEnter.bind(this);
		this.componentWillLeave = this.componentWillLeave.bind(this);
	}

	componentWillUnmount() {
		this.transitionTimeouts.forEach((timeout) => {
			clearTimeout(timeout);
		});

		this.classNameAndNodeQueue.length = 0;
	}

	transition(animationType, finishCallback, userSpecifiedDelay) {
		let node = findDOMNode(this);

		if (!node) {
			if (finishCallback) {
				finishCallback();
			}
			return;
		}

		let className = this.props.name[animationType] || this.props.name + '-' + animationType,
			activeClassName = this.props.name[animationType + 'Active'] || className + '-active',
			timer = null,
			removeListeners;

		node.classList.add(className);

		// Need to do this to actually trigger a transition.
		this.queueClassAndNode(activeClassName, node);

		// Clean-up the animation after the specified delay
		const finish = (e) => {
			if (e && e.target !== node) {
				return;
			}

			clearTimeout(timer);
			if (removeListeners) removeListeners();

			node.classList.remove(className);
			node.classList.remove(activeClassName);

			if (removeListeners) removeListeners();

			// Usually this optional callback is used for informing an owner of
			// a leave animation and telling it to remove the child.
			if (finishCallback) {
				finishCallback();
			}
		};

		if (userSpecifiedDelay) {
			timer = setTimeout(finish, userSpecifiedDelay);
			this.transitionTimeouts.push(timer);
		}
	}

	queueClassAndNode(className, node) {
		this.classNameAndNodeQueue.push({
			className,
			node
		});

		if (!this.rafHandle) {
			this.rafHandle = requestAnimationFrame(() => this.flushClassNameAndNodeQueue());
		}
	}

	flushClassNameAndNodeQueue() {
		const classNameAndNodeQueue = this.classNameAndNodeQueue;

		if (!this.$UN) {
			for (let i = 0, len = classNameAndNodeQueue.length; i < len; i++) {
				const obj = classNameAndNodeQueue[i];

				obj.node.offsetHeight; // Force re-flow
				obj.node.classList.add(obj.className);
			}
		}
		classNameAndNodeQueue.length = 0;
		this.rafHandle = null;
	}

	componentWillAppear(done) {
		if (this.props.appear) {
			this.transition('appear', done, this.props.appearTimeout);
		} else {
			done();
		}
	}

	componentWillEnter(done) {
		if (this.props.enter) {
			this.transition('enter', done, this.props.enterTimeout);
		} else {
			done();
		}
	}

	componentWillLeave(done) {
		if (this.props.leave) {
			this.transition('leave', done, this.props.leaveTimeout);
		} else {
			done();
		}
	}

	render(props) {
		return props.children;
	}
}

export default CSSTransitionGroupChild;
