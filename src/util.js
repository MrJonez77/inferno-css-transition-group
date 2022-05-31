export function getChildMapping(children) {
	if (!children) {
		return children;
	}

	const childItems = Array.isArray(children) ? children : [children];
	let result = {};

	for (let i = 0, len = childItems.length; i < len; i++) {
		const child = childItems[i];

		if (child) {
			result[child.key] = child;
		}
	}

	return result;
}

export function isUndefined(obj) {
	return obj === void 0;
}

export function mergeChildMappings(prev, next) {
	prev = prev || {};
	next = next || {};

	// For each key of `next`, the list of keys to insert before that key in
	// the combined list
	let nextKeysPending = {},
		pendingKeys = [],
		key;

	for (key in prev) {
		if (isUndefined(prev[key])) {
			continue;
		}
		if (!isUndefined(next[key])) {
			if (pendingKeys.length) {
				nextKeysPending[key] = pendingKeys;
				pendingKeys = [];
			}
		} else {
			pendingKeys.push(key);
		}
	}

	let childMapping = {}, i;

	for (key in next) {
		if (isUndefined(next[key])) {
			continue;
		}
		if (!isUndefined(nextKeysPending[key])) {
			for (i = 0; i < nextKeysPending[key].length; i++) {
				let pendingNextKey = nextKeysPending[key][i];
				childMapping[nextKeysPending[key][i]] = next[pendingNextKey] || prev[pendingNextKey];
			}
		}
		childMapping[key] = next[key] || prev[key];
	}

	// Finally, add the keys which didn't appear before any key in `next`
	for (i = 0; i < pendingKeys.length; i++) {
		key = pendingKeys[i];
		childMapping[pendingKeys[i]] = next[key] || prev[key];
	}

	return childMapping;
}

// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/hasOwnProperty
// Note: Object.hasOwn() is recommended over hasOwnProperty(), in browsers where it is supported.
export const hasOwn = Object.hasOwn || ((o, key) => Object.prototype.hasOwnProperty.call(o, key));
