---
title: <svelte:head>
---

 `<svelte:head>` 允许你在页面的 `<head>` 标签内插入内容：

```html
<svelte:head>
	<link rel="stylesheet" href="tutorial/dark-theme.css">
</svelte:head>
```

> 在服务器端渲染（SSR）模式下，  `<svelte:head>` 中的内容单独返回到HTML中。