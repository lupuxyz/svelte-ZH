---
title: Named slots
---

上一章节使用了一个*默认插槽（default slot）*，该slot直接在组件内显示，有时候你需要对子级进行细分设置，就如这个`<ContactCard>`。在这种情况下，我们可以使用 *命名插槽（named slots）*。

在`ContactCard.svelte`中，给每个<slot>标签添加`name`属性：

```html
<article class="contact-card">
	<h2>
		<slot name="name">
			<span class="missing">Unknown name</span>
		</slot>
	</h2>

	<div class="address">
		<slot name="address">
			<span class="missing">Unknown address</span>
		</slot>
	</div>

	<div class="email">
		<slot name="email">
			<span class="missing">Unknown email</span>
		</slot>
	</div>
</article>
```

然后把 `slot="..."` 添加到 `<ContactCard>` 标签内：

```html
<ContactCard>
	<span slot="name">
		P. Sherman
	</span>

	<span slot="address">
		42 Wallaby Way<br>
		Sydney
	</span>
</ContactCard>
```