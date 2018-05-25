/**
 * Copyright 2013-2014, Facebook, Inc.
 * All rights reserved.
 *
 * This source code is licensed under the BSD-style license found in the
 * LICENSE file in the root directory of this source tree. An additional grant
 * of patent rights can be found in the PATENTS file in the same directory.
 *
 *	Additional credit to the Author of rc-css-transition-group: https://github.com/yiminghe
 *	File originally extracted from the React source, converted to ES6 by https://github.com/developit
 */

import {directClone, Component, createVNode, createComponentVNode} from 'inferno';
import {VNodeFlags, ChildFlags} from 'inferno-vnode-flags';
import { getKey, filterNullChildren } from './util';
import { mergeChildMappings, isShownInChildren, isShownInChildrenByKey, inChildren, inChildrenByKey } from './TransitionChildMapping';
import { CSSTransitionGroupChild } from './CSSTransitionGroupChild';

export class CSSTransitionGroup extends Component {
	constructor(props, context) {
		super(props, context);
		this.refs = {};
		this.state = {
			childItems: (props.children || []).slice()
		};
	}

	shouldComponentUpdate(_, { childItems }) {
		return childItems !== this.state.childItems;
	}

	componentWillMount() {
		this.currentlyTransitioningKeys = {};
		this.keysToEnter = [];
		this.keysToLeave = [];
	}

	componentWillReceiveProps({ children, exclusive, showProp }) {
		let nextChildMapping = filterNullChildren(children || []).slice();

		// last props children if exclusive
		let prevChildMapping = filterNullChildren(exclusive ? this.props.children : this.state.childItems);

		let newChildren = mergeChildMappings(
			prevChildMapping,
			nextChildMapping
		);

		if (showProp) {
			newChildren = newChildren.map( c => {
				if (!c.props[showProp] && isShownInChildren(prevChildMapping, c, showProp)) {
					c = directClone(c);
					c.props[showProp] = true;
				}
				return c;
			});
		}

		if (exclusive) {
			// make middle state children invalid
			// restore to last props children
			newChildren.forEach( c => this.stop(getKey(c)) );
		}

		this.setState({ childItems: newChildren });
		// this.forceUpdate();

		nextChildMapping.forEach( c => {
			let { key } = c,
				hasPrev = prevChildMapping && inChildren(prevChildMapping, c);
			if (showProp) {
				if (hasPrev) {
					let showInPrev = isShownInChildren(prevChildMapping, c, showProp),
						showInNow = c.props[showProp];
					if (!showInPrev && showInNow && !this.currentlyTransitioningKeys[key]) {
						this.keysToEnter.push(key);
					}
				}
			}
			else if (!hasPrev && !this.currentlyTransitioningKeys[key]) {
				this.keysToEnter.push(key);
			}
		});

		prevChildMapping.forEach( c => {
			let { key } = c,
				hasNext = nextChildMapping && inChildren(nextChildMapping, c);
			if (showProp) {
				if (hasNext) {
					let showInNext = isShownInChildren(nextChildMapping, c, showProp);
					let showInNow = c.props[showProp];
					if (!showInNext && showInNow && !this.currentlyTransitioningKeys[key]) {
						this.keysToLeave.push(key);
					}
				}
			}
			else if (!hasNext && !this.currentlyTransitioningKeys[key]) {
				this.keysToLeave.push(key);
			}
		});
	}

	performEnter(key) {
		this.currentlyTransitioningKeys[key] = true;
		let component = this.refs[key];
		if (component.componentWillEnter) {
			component.componentWillEnter( () => this._handleDoneEntering(key) );
		}
		else {
			this._handleDoneEntering(key);
		}
	}

	_handleDoneEntering(key) {
		delete this.currentlyTransitioningKeys[key];
		let currentChildMapping = filterNullChildren(this.props.children),
			showProp = this.props.showProp;
		if (!currentChildMapping || (
			!showProp && !inChildrenByKey(currentChildMapping, key)
		) || (
			showProp && !isShownInChildrenByKey(currentChildMapping, key, showProp)
		)) {
			// This was removed before it had fully entered. Remove it.
			this.performLeave(key);
		}
		else {
			this.setState({ childItems: currentChildMapping });
			// this.forceUpdate();
		}
	}

	stop(key) {
		delete this.currentlyTransitioningKeys[key];
		let component = this.refs[key];
		if (component) component.stop();
	}

	performLeave(key) {
		this.currentlyTransitioningKeys[key] = true;
		let component = this.refs[key];
		if (component && component.componentWillLeave) {
			component.componentWillLeave( () => this._handleDoneLeaving(key) );
		}
		else {
			// Note that this is somewhat dangerous b/c it calls setState()
			// again, effectively mutating the component before all the work
			// is done.
			this._handleDoneLeaving(key);
		}
	}

	_handleDoneLeaving(key) {
		delete this.currentlyTransitioningKeys[key];
		let showProp = this.props.showProp,
			currentChildMapping = filterNullChildren(this.props.children);
		if (showProp && currentChildMapping &&
			isShownInChildrenByKey(currentChildMapping, key, showProp)) {
			this.performEnter(key);
		}
		else if (!showProp && currentChildMapping && inChildrenByKey(currentChildMapping, key)) {
			// This entered again before it fully left. Add it again.
			this.performEnter(key);
		}
		else {
			this.setState({ childItems: currentChildMapping });
			// this.forceUpdate();
		}
	}

	componentDidUpdate() {
		requestAnimationFrame(() => {
			let { keysToEnter, keysToLeave } = this;
			this.keysToEnter = [];
			keysToEnter.forEach( k => this.performEnter(k) );
			this.keysToLeave = [];
			keysToLeave.forEach( k => this.performLeave(k) );
		});
	}

	render({ component, transitionName, transitionEnter, transitionLeave, transitionEnterTimeout, transitionLeaveTimeout, children, ...props }, { childItems }) {
		const childrenToRender = [];

		for (let i = 0, len = childItems.length; i < len; i++) {
			const child = childItems[i];

			if (child === null || child === undefined || typeof child === 'boolean') {
				continue;
			}

			if (Array.isArray(child)) {

			}

			const key = getKey(child);

			childrenToRender.push(
				<CSSTransitionGroupChild
					key={key}
					ref={ c => {
						this.refs[key] = c;
					}}
					name={transitionName}
					enter={transitionEnter}
					leave={transitionLeave}
					enterTimeout={transitionEnterTimeout}
					leaveTimeout={transitionLeaveTimeout}>
					{child}
				</CSSTransitionGroupChild>
			);
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

CSSTransitionGroup.defaultProps = {
	component: 'span',
	transitionEnter: true,
	transitionLeave: true
};
