export function getKey(vNode) {
	return vNode.key;
}

export function filterNullChildren(children) {
	return children && children.filter(i => i !== null && i !== undefined && typeof i !== 'boolean');
}

export const requestAnimationFrame = (callback) => {
	if (typeof window !== 'undefined' && window.requestAnimationFrame) {
		window.requestAnimationFrame(callback);
	}
	else {
		setTimeout(callback, 17);
	}
};
