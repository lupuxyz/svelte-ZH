---
title: Each 块
---

如果你遇到需要遍历的数据列表，请使用 `each` 块：

```html
<ul>
	{#each cats as cat}
		<li><a target="_blank" href="https://www.youtube.com/watch?v={cat.id}">
			{cat.name}
		</a></li>
	{/each}
</ul>
```

> 表达式 `cats`是一个数组，遇到数组或类似于数组的对象 (即具有`length` 属性)。你都可以通过 `each [...iterable]`遍历迭代该对象。

你也可以将*index* 作为第二个参数(key)，类似于：

```html
{#each cats as cat, i}
	<li><a target="_blank" href="https://www.youtube.com/watch?v={cat.id}">
		{i + 1}: {cat.name}
	</a></li>
{/each}
```

如果你希望代码更加健壮，你可以使用`each cats as { id, name }`来解构，用`cat.id` 和 `cat.name` 来代替 `id` 和 `name`。