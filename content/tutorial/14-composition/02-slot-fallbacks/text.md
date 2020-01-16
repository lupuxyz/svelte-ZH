---
title: Slot 保留设置
---

当外部组件并无插入值时，我们可以给`<slot>`标签添加一些默认值来作为提示信息（换句话说，我们没有向组件添加任何子级内容时，我们可以在组件内部设置一个默认值）：

```html
<div class="box">
	<slot>
		<em>no content was provided</em>
	</slot>
</div>
```

现在，我们创建两个`<Box>`组件，一个含有子级，一个没有子级：

```html
<Box>
	<h2>Hello!</h2>
	<p>This is a box. It can contain anything.</p>
</Box>

<Box/>
```
