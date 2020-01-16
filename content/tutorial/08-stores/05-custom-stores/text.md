---
title: 自定义 stores
---

只要一个对象正确的使用 `subscribe` ，它就是可以称之为`store`。因此，使用特定语法来创建自定义 `stores`变得非常容易。

例如， 这个 `count` store 在前面的例子中包含 `increment`、 `decrement` 和 `reset`组件，以防止暴露 `set` 和`update`方法，让我们改写一下：

```js
function createCount() {
	const { subscribe, set, update } = writable(0);

	return {
		subscribe,
		increment: () => update(n => n + 1),
		decrement: () => update(n => n - 1),
		reset: () => set(0)
	};
}
```

