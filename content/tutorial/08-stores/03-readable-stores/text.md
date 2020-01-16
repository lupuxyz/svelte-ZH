---
title: 只读 stores
---

并非所有`stores`都需要在其他地方写入，比如，你可能有一个代表鼠标位置或者用户地理位置的`stores`，这样的`stores`从其他地方写入并无意义，对于这种情况，我们有  *只读（readable）* `stores`。

点击到 `stores.js` 选项卡， 第一个参数 `readable`可以一个是个初始值，也可以为 `null` 或 `undefined` ，第二个参数是 `start` 函数，该函数有个 `set` 回调方法，并返回一个 `stop`函数。 当`stores`首次被subscriber 时调用`start`函数，`stop`则是最后当subscriber被unsubscribes时调用。

```js
export const time = readable(new Date(), function start(set) {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return function stop() {
		clearInterval(interval);
	};
});
```
