export function chain() {
	const len = arguments.length;
	let args = [];

	for (let i = 0; i < len; i++) {
		args[i] = arguments[i];
	}

	args = args.filter((fn) => fn !== null);

	if (args.length === 0) {
		return undefined;
	}
	if (args.length === 1) {
		return args[0];
	}

	return args.reduce((current, next) => {
		return function chainedFunction() {
			current.apply(this, arguments);
			next.apply(this, arguments);
		};
	});
}

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

	function getValueForKey(key) {
		if (next.hasOwnProperty(key)) {
			return next[key];
		}

		return prev[key];
	}

	// For each key of `next`, the list of keys to insert before that key in
	// the combined list
	let nextKeysPending = {},
		pendingKeys = [];

	for (let prevKey in prev) {
		if (next.hasOwnProperty(prevKey)) {
			if (pendingKeys.length) {
				nextKeysPending[prevKey] = pendingKeys;
				pendingKeys = [];
			}
		} else {
			pendingKeys.push(prevKey);
		}
	}

	let childMapping = {}, i;

	for (let nextKey in next) {
		if (nextKeysPending.hasOwnProperty(nextKey)) {
			for (i = 0; i < nextKeysPending[nextKey].length; i++) {
				let pendingNextKey = nextKeysPending[nextKey][i];
				childMapping[nextKeysPending[nextKey][i]] = getValueForKey(
					pendingNextKey,
				);
			}
		}
		childMapping[nextKey] = getValueForKey(nextKey);
	}

	// Finally, add the keys which didn't appear before any key in `next`
	for (i = 0; i < pendingKeys.length; i++) {
		childMapping[pendingKeys[i]] = getValueForKey(pendingKeys[i]);
	}

	return childMapping;
}
