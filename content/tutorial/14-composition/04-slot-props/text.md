---
title: Slot 属性
---

在当前程序中，我们有一个名为 `<Hoverable>`的组件来跟踪鼠标是否放在上面，它需要将数据传回父组件，以便我们可以渲染插入的内容。

为此，我们使用 *插槽属性（slot props)*。将`Hoverable.svelte`的`hovering`的值传递给它的slot：

```html
<div on:mouseenter={enter} on:mouseleave={leave}>
	<slot hovering={hovering}></slot>
</div>
```

> 请记住，你可以使用`{hovering}` 这种速记写法。

然后我们使用`let`来暴露`<Hoverable>` 组件内的内容：

```html
<Hoverable let:hovering={hovering}>
	<div class:active={hovering}>
		{#if hovering}
			<p>I am being hovered upon.</p>
		{:else}
			<p>Hover over me!</p>
		{/if}
	</div>
</Hoverable>
```

如果你想在其父组件中调用`active`， 你也可以给该变量重命名，

```html
<Hoverable let:hovering={active}>
	<div class:active>
		{#if active}
			<p>I am being hovered upon.</p>
		{:else}
			<p>Hover over me!</p>
		{/if}
	</div>
</Hoverable>
```

你可以根据需要拥有任意数量的组件，并在组件内部声明插槽属性。

> 命名插槽也拥有有属性，但是`let`指令需要写在 `slot="..."` 标签上而不是组件上。
