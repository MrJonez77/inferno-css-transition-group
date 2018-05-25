export function getKey(vNode) {
	return vNode.key;
}

export function isInvalid(node) {
	return node === null || node === undefined || typeof node === 'boolean';
}

export const requestAnimationFrame = (callback) => {
	if (typeof window !== 'undefined' && window.requestAnimationFrame) {
		window.requestAnimationFrame(callback);
	}
	else {
		setTimeout(callback, 17);
	}
};

function normalizeVNodes(nodes, result, index) {
	for (const len = nodes.length; index < len; index++) {
		let n = nodes[index];

		if (!isInvalid(n)) {
			if (Array.isArray(n)) {
				normalizeVNodes(n, result, 0);
			} else {
				result.push(n);
			}
		}
	}
}

export function flattenChildren(childArray) {
	const flattened = [];

	normalizeVNodes(childArray, flattened, 0);

	return flattened;
}
