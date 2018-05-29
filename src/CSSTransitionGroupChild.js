import {Component, directClone} from 'inferno';
import addClass from 'dom-helpers/class/addClass';
import removeClass from 'dom-helpers/class/removeClass';
import raf from 'dom-helpers/util/requestAnimationFrame';
import {transitionEnd, animationEnd} from 'dom-helpers/transition/properties';

let events = [];

if (transitionEnd) {
	events.push(transitionEnd);
}
if (animationEnd) {
	events.push(animationEnd);
}

function addEndListener(node, listener) {
	if (events.length) {
		events.forEach(e =>
			node.addEventListener(e, listener, false));
	} else {
		setTimeout(listener, 0);
	}

	return () => {
		if (!events.length) {
			return;
		}
		events.forEach(e => node.removeEventListener(e, listener, false));
	};
}

class CSSTransitionGroupChild extends Component {
	constructor(props, context) {
		super(props, context);

		this.componentWillAppear = this.componentWillAppear.bind(this);
		this.componentWillEnter = this.componentWillEnter.bind(this);
		this.componentWillLeave = this.componentWillLeave.bind(this);
	}

	componentWillMount() {
		this.classNameAndNodeQueue = [];
		this.transitionTimeouts = [];
	}

	componentWillUnmount() {
		this.unmounted = true;

		if (this.timeout) {
			clearTimeout(this.timeout);
		}
		this.transitionTimeouts.forEach((timeout) => {
			clearTimeout(timeout);
		});

		this.classNameAndNodeQueue.length = 0;
		this.rafHandle = null;
	}

	transition(animationType, finishCallback, timeout) {
		let node = this.$LI.dom;

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

		addClass(node, className);

		// Need to do this to actually trigger a transition.
		this.queueClassAndNode(activeClassName, node);

		// Clean-up the animation after the specified delay
		const finish = (e) => {
			if (e && e.target !== node) {
				return;
			}

			clearTimeout(timer);
			if (removeListeners) removeListeners();

			removeClass(node, className);
			removeClass(node, activeClassName);

			if (removeListeners) removeListeners();

			// Usually this optional callback is used for informing an owner of
			// a leave animation and telling it to remove the child.
			if (finishCallback) {
				finishCallback();
			}
		};

		if (timeout) {
			timer = setTimeout(finish, timeout);
			this.transitionTimeouts.push(timer);
		} else if (transitionEnd) {
			removeListeners = addEndListener(node, finish);
		}
	}

	queueClassAndNode(className, node) {
		this.classNameAndNodeQueue.push({
			className,
			node
		});

		if (!this.rafHandle) {
			this.rafHandle = raf(() => this.flushClassNameAndNodeQueue());
		}
	}

	flushClassNameAndNodeQueue() {
		if (!this.unmounted) {
			this.classNameAndNodeQueue.forEach((obj) => {
				// This is for to force a repaint,
				// which is necessary in order to transition styles when adding a class name.
				/* eslint-disable no-unused-expressions */
				obj.node.scrollTop;
				/* eslint-enable no-unused-expressions */
				addClass(obj.node, obj.className);
			});
		}
		this.classNameAndNodeQueue.length = 0;
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

	render({name, appear, enter, leave, appearTimeout, enterTimeout, leaveTimeout, children, ...props}) {
		const child = Array.isArray(children) ? children[0] : children;
		const clonedChild = directClone(child);

		if (clonedChild.props) {
			Object.assign(clonedChild.props, props);
		}

		return clonedChild;
	}
}

export default CSSTransitionGroupChild;
