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

export function mergeChildMappings(prev, next) {
	prev = prev || {};
	next = next || {};

	// For each key of `next`, the list of keys to insert before that key in
	// the combined list
	let nextKeysPending = {},
		pendingKeys = [],
		key;

	for (key in prev) {
		if (next.hasOwnProperty(key)) {
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
		if (nextKeysPending.hasOwnProperty(key)) {
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
