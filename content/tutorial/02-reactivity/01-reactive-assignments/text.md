---
title: 指定
---

Svelte 核心是强大的 *实时反应* 系统，让你程序状态与你的 DOM 保持同步，例如，事件响应。

为了演示它，我们首先需要给`<button>`添加一个事件，将代码的第 9 行替换为：

```html
<button on:click={handleClick}>
```

编辑 `handleClick` 函数, 添加一个表达式让 `count` 值随着事件触发而发生变化。

```js
function handleClick() {
	count += 1;
}
```

将事件和函数绑定，Svelte 会告诉它的DOM在什么时候需要更新。