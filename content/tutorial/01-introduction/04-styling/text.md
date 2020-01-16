---
title: 样式
---

你可以添加一个 `<style>` 标签在你的属性中，就如正常书写HTML一样，让我们给标签 `<p>` 添加一些样式：

```html
<style>
	p {
		color: purple;
		font-family: 'Comic Sans MS', cursive;
		font-size: 2em;
	}
</style>

<p>This is a paragraph.</p>
```

重要的是，这些样式 *作用域是局部的*。正如我们将在下一步中看到的那样，应用程序不会在你的其他文件中更改`<p>` 标签的样式。 