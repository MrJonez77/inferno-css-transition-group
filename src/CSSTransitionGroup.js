import {Component, createComponentVNode} from "inferno";
import TransitionGroup from './TransitionGroup';
import CSSTransitionGroupChild from './CSSTransitionGroupChild';
import {VNodeFlags} from "inferno-vnode-flags";

class CSSTransitionGroup extends Component {
	constructor(props, context) {
		super(props, context);
		this._wrapChild = this._wrapChild.bind(this);
	}

	// We need to provide this childFactory so that
	// CSSTransitionGroupChild can receive updates to name, enter, and
	// leave while it is leaving.
	_wrapChild(child) {
		const {transitionName, transitionAppear, transitionEnter, transitionLeave, transitionAppearTimeout, transitionEnterTimeout, transitionLeaveTimeout} = this.props;

		return createComponentVNode(
			VNodeFlags.ComponentClass,
			CSSTransitionGroupChild,
			{
				name: transitionName,
				appear: transitionAppear,
				enter: transitionEnter,
				leave: transitionLeave,
				appearTimeout: transitionAppearTimeout,
				enterTimeout: transitionEnterTimeout,
				leaveTimeout: transitionLeaveTimeout,
				children: child
			}
		);
	}

	render() {
		return createComponentVNode(
			VNodeFlags.ComponentClass,
			TransitionGroup,
			Object.assign({}, this.props, {childFactory: this._wrapChild})
		);
	}
}

CSSTransitionGroup.defaultProps = {
	transitionAppear: false,
	transitionEnter: true,
	transitionLeave: true
};

export default CSSTransitionGroup;
