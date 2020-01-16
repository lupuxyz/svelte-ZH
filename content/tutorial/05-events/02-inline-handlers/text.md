---
title: 内联事件处理
---

你还可以在标签中添加内联事件处理程序：

```html
<div on:mousemove="{e => m = { x: e.clientX, y: e.clientY }}">
	The mouse position is {m.x} x {m.y}
</div>
```

引号不是必须的，但在语法高亮显示时很有用。

> 可能在其他框架中，出于性能原因，尤其是在循环内部，你可能会看到避免内联事件处理的建议。但是这并不适用与 Svelte，无论你使用何种形式，编译器都将它转为正确的形式。