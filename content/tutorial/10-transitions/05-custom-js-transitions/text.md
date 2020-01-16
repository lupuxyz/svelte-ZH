---
title:自定义 JS 过渡
---

虽然通常应该尽可能多地使用CSS进行过渡，但是如果不借助JavaScript，有些效果是无法实现的，例如“逐字打印”效果：

```js
function typewriter(node, { speed = 50 }) {
	const valid = (
		node.childNodes.length === 1 &&
		node.childNodes[0].nodeType === 3
	);

	if (!valid) {
		throw new Error(`This transition only works on elements with a single text node child`);
	}

	const text = node.textContent;
	const duration = text.length * speed;

	return {
		duration,
		tick: t => {
			const i = ~~(text.length * t);
			node.textContent = text.slice(0, i);
		}
	};
}
```