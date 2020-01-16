---
title: 选择框的multiple属性
---

选择框含有一个名为 `multiple` 的属性，在这种情况下，它将会被设置为数组而不是单值。

回顾之前的[冰淇淋菜单案例](tutorial/group-inputs)我们可以直接将选择框替换为`<select multiple>`：

```html
<h2>Flavours</h2>

<select multiple bind:value={flavours}>
	{#each menu as flavour}
		<option value={flavour}>
			{flavour}
		</option>
	{/each}
</select>
```