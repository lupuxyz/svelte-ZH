---
title: 写入 stores
---

不是所有程序都包含在组件内， 很多时候，你需要让你的值被多个不相关的组件和 JavaScript模块访问。

在 Svelte 中，我们通过*stores*来做到这一点。`store`是一种对象，该对象具有`subscribe`方法，此方法允许 `store`内值发生变化时告知引用该值的各模块和组件。

在 `App.svelte`中，`count` 是一个`store`对象，它分别在被`count_value` 和 `count.subscribe`回调使用。

点击`stores.js` 选项卡查看如何定义 `count`。这是一个可*写入(writable)*的`store`对象， 它还具有`subscribe`函数，具有`set` 和`update` 方法。

现在切换到 `Incrementer.svelte` 选项卡，给 `+` 按钮添加`update`方法：

```js
function increment() {
	count.update(n => n + 1);
}
```

现在点击 `+` 按钮会更新计数，切换到实现相反功能的 `Decrementer.svelte`。

最后，切换到`Resetter.svelte`，利用`set` 方法实现 `reset`功能：

```js
function reset() {
	count.set(0);
}
```