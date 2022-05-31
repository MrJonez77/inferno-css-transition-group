import {getChildMapping, mergeChildMappings, isUndefined, hasOwn} from "./util";
import {Component, createComponentVNode, createVNode, directClone, createRef} from "inferno";
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
				this.performAppear(key, this.childRefs[key].current);
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
			const hasPrev = prevChildMapping && !isUndefined(prevChildMapping[key]);

			if (nextChildMapping[key] && !hasPrev && !this.currentlyTransitioningKeys[key]) {
				this.keysToEnter.push(key);
			}
		}

		for (let key in prevChildMapping) {
			const hasNext = nextChildMapping && !isUndefined(nextChildMapping[key]);

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

		this.keysToEnter = [];

		for (i = 0; i < keysToEnterLength; i++) {
			key = keysToEnter[i];
			this.performEnter(key, this.childRefs[key].current);
		}

		const keysToLeave = this.keysToLeave;
		const keysToLeaveLength = keysToLeave.length;

		this.keysToLeave = [];

		for (i = 0; i < keysToLeaveLength; i++) {
			key = keysToLeave[i];
			this.performLeave(key, this.childRefs[key].current);
		}
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

		if (!currentChildMapping || !hasOwn(currentChildMapping, key)) {
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

		if (!currentChildMapping || !hasOwn(currentChildMapping, key)) {
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

		if (currentChildMapping && hasOwn(currentChildMapping, key)) {
			// This entered again before it fully left. Add it again.
			this.performEnter(key, this.childRefs[key].current);
		} else {
			this.setState((state) => {
				const newChildren = Object.assign({}, state.mappedChildren);

				newChildren[key] = undefined;

				return {mappedChildren: newChildren};
			});
		}
	}

	render({component, transitionName, transitionAppear, transitionEnter, transitionLeave, transitionAppearTimeout, transitionEnterTimeout, transitionLeaveTimeout, children, childFactory, ...props}, {mappedChildren}) {
		// We could get rid of the need for the wrapper node
		// by cloning a single child
		const childrenToRender = [];
		this.childRefs = {};

		for (let key in mappedChildren) {
			const child = mappedChildren[key];

			if (child) {
				// You may need to apply reactive updates to a child as it is leaving.
				// The normal React way to do it won't work since the child will have
				// already been removed. In case you need this behavior you can provide
				// a childFactory function to wrap every child, even the ones that are
				// leaving.
				const ref = createRef();
				this.childRefs[key] = ref;
				childrenToRender.push(Object.assign(directClone(childFactory(child)), {ref, key}));
			}
		}

		if (typeof component === 'string') {
			return createVNode(VNodeFlags.HtmlElement, component, props ? props.className : null, childrenToRender, ChildFlags.UnknownChildren, props);
		}

		return createComponentVNode(VNodeFlags.ComponentUnknown, component, Object.assign({}, props, {
			children: childrenToRender
		}));
	}
}

TransitionGroup.defaultProps = {
	component: 'span',
	childFactory: child => child
};

export default TransitionGroup;
