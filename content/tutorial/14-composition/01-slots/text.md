---
title: Slots
---

就如标签的可以拥有子级一样……

```html
<div>
	<p>I'm a child of the div</p>
</div>
```

组件也可以拥有子级，但是，在组件接收子级之前，你需要指定子级的位置。我们用`<slot>`标签来做到这一点，更新`Box.svelte`代码：

```html
<div class="box">
	<slot></slot>
</div>
```

您现在可以在Box组件内添加以下内容：

```html
<Box>
	<h2>Hello!</h2>
	<p>This is a box. It can contain anything.</p>
</Box>
```