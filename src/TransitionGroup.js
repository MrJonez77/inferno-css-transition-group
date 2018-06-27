import {getChildMapping, mergeChildMappings} from "./util";
import {Component, createComponentVNode, createVNode, directClone} from "inferno";
import {ChildFlags, VNodeFlags} from "inferno-vnode-flags";

export class TransitionGroup extends Component {
	constructor(props, context) {
		super(props, context);

		this.childRefs = {};

		this.state = {
			mappedChildren: getChildMapping(props.children)
		};

		this.currentlyTransitioningKeys = {};
		this.keysToEnter = [];
		this.keysToLeave = [];

		// Bindings
		this.performAppear = this.performAppear.bind(this);
		this._handleDoneAppearing = this._handleDoneAppearing.bind(this);
		this.performEnter = this.performEnter.bind(this);
		this._handleDoneEntering = this._handleDoneEntering.bind(this);
		this.performLeave = this.performLeave.bind(this);
		this._handleDoneLeaving = this._handleDoneLeaving.bind(this);
	}

	componentDidMount() {
		let initialChildMapping = this.state.mappedChildren;

		for (let key in initialChildMapping) {
			if (initialChildMapping[key]) {
				this.performAppear(key, this.childRefs[key]);
			}
		}
	}

	componentWillReceiveProps(nextProps) {
		let nextChildMapping = getChildMapping(nextProps.children);
		let prevChildMapping = this.state.mappedChildren;

		this.setState({
			mappedChildren: mergeChildMappings(
				prevChildMapping,
				nextChildMapping,
			)
		});

		for (let key in nextChildMapping) {
			let hasPrev = prevChildMapping && prevChildMapping.hasOwnProperty(key);

			if (nextChildMapping[key] && !hasPrev && !this.currentlyTransitioningKeys[key]) {
				this.keysToEnter.push(key);
			}
		}

		for (let key in prevChildMapping) {
			let hasNext = nextChildMapping && nextChildMapping.hasOwnProperty(key);

			if (prevChildMapping[key] && !hasNext && !this.currentlyTransitioningKeys[key]) {
				this.keysToLeave.push(key);
			}
		}
	}

	componentDidUpdate() {
		const keysToEnter = this.keysToEnter;
		const keysToEnterLength = keysToEnter.length;
		let i,
			key;

		for (i = 0; i < keysToEnterLength; i++) {
			key = keysToEnter[i];
			this.performEnter(key, this.childRefs[key]);
		}

		this.keysToEnter = [];

		const keysToLeave = this.keysToLeave;
		const keysToLeaveLength = keysToLeave.length;

		for (i = 0; i < keysToLeaveLength; i++) {
			key = keysToLeave[i];
			this.performLeave(key, this.childRefs[key]);
		}

		this.keysToLeave = [];
	}

	performAppear(key, component) {
		this.currentlyTransitioningKeys[key] = true;

		if (component.componentWillAppear) {
			component.componentWillAppear(this._handleDoneAppearing.bind(this, key, component));
		} else {
			this._handleDoneAppearing(key, component);
		}
	}

	_handleDoneAppearing(key, component) {
		if (component && component.componentDidAppear) {
			component.componentDidAppear();
		}

		this.currentlyTransitioningKeys[key] = false;

		let currentChildMapping = getChildMapping(this.props.children);

		if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
			// This was removed before it had fully appeared. Remove it.
			this.performLeave(key, component);
		}
	}

	performEnter(key, component) {
		this.currentlyTransitioningKeys[key] = true;

		if (component.componentWillEnter) {
			component.componentWillEnter(this._handleDoneEntering.bind(this, key, component));
		} else {
			this._handleDoneEntering(key, component);
		}
	}

	_handleDoneEntering(key, component) {
		if (component && component.componentDidEnter) {
			component.componentDidEnter();
		}

		this.currentlyTransitioningKeys[key] = false;

		let currentChildMapping = getChildMapping(this.props.children);

		if (!currentChildMapping || !currentChildMapping.hasOwnProperty(key)) {
			// This was removed before it had fully entered. Remove it.
			this.performLeave(key, component);
		}
	}

	performLeave(key, component) {
		this.currentlyTransitioningKeys[key] = true;

		if (component && component.componentWillLeave) {
			component.componentWillLeave(this._handleDoneLeaving.bind(this, key, component));
		} else {
			// Note that this is somewhat dangerous b/c it calls setState()
			// again, effectively mutating the component before all the work
			// is done.
			this._handleDoneLeaving(key, component);
		}
	}

	_handleDoneLeaving(key, component) {
		if (component && component.componentDidLeave) {
			component.componentDidLeave();
		}

		this.currentlyTransitioningKeys[key] = false;

		let currentChildMapping = getChildMapping(this.props.children);

		if (currentChildMapping && currentChildMapping.hasOwnProperty(key)) {
			// This entered again before it fully left. Add it again.
			this.performEnter(key, this.childRefs[key]);
		} else {
			this.setState((state) => {
				let newChildren = Object.assign({}, state.mappedChildren);

				delete newChildren[key];

				return {mappedChildren: newChildren};
			});
		}
	}

	render({component, transitionName, transitionAppear, transitionEnter, transitionLeave, transitionAppearTimeout, transitionEnterTimeout, transitionLeaveTimeout, children, childFactory, ...props}, {mappedChildren}) {
		// We could get rid of the need for the wrapper node
		// by cloning a single child
		let childrenToRender = [];

		for (let key in mappedChildren) {
			let child = mappedChildren[key];

			if (child) {
				// You may need to apply reactive updates to a child as it is leaving.
				// The normal React way to do it won't work since the child will have
				// already been removed. In case you need this behavior you can provide
				// a childFactory function to wrap every child, even the ones that are
				// leaving.
				childrenToRender.push(Object.assign(
					directClone(childFactory(child)),
					{
						ref: (r) => {
							this.childRefs[key] = r;
						},
						key
					}
				));
			}
		}

		if (typeof component === 'string') {
			return createVNode(VNodeFlags.HtmlElement, component, props ? props.className : null, childrenToRender, ChildFlags.UnknownChildren, props);
		}

		return createComponentVNode(VNodeFlags.ComponentUnknown, component, {
			children: childrenToRender,
			...props
		});
	}
}

TransitionGroup.defaultProps = {
	component: 'span',
	childFactory: child => child
};

export default TransitionGroup;
