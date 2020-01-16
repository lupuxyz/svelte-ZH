---
title: 事件修饰符
---

DOM 事件处理程序具有额外的 *修饰符（modifiers）* 。 例如，带 `once` 修饰符的事件处理程序只运用一次：

```html
<script>
	function handleClick() {
		alert('no more alerts')
	}
</script>

<button on:click|once={handleClick}>
	Click me
</button>
```

所有修饰符列表：

* `preventDefault` ：调用`event.preventDefault()` ，在运行处理程序之前调用。比如，对客户端表单处理有用。
* `stopPropagation` ：调用 `event.stopPropagation()`, 防止事件影响到下一个元素。
* `passive` ： 优化了对 touch/wheel 事件的滚动表现(Svelte 会在合适的地方自动添加滚动条)。
* `capture` — 在 *capture* 阶段而不是*bubbling* 阶段触发事件处理程序 ([MDN docs](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture))
* `once` ：运行一次事件处理程序后将其删除。
* `self` — 仅当 event.target 是其本身时才执行。

你可以将修饰符组合在一起使用，例如：`on:click|once|capture={...}`。
