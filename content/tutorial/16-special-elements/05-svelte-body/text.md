---
title: <svelte:body>
---

和`<svelte:window>`类似，该 `<svelte:body>`标签允许你添加事件监听`document.body`。 该标签与 `mouseenter` 和 `mouseleave` 事件一起使用， 不会触发 `window`事件。

将 `mouseenter` 和 `mouseleave` 函数添加到 `<svelte:body>`标签内：

```html
<svelte:body
	on:mouseenter={handleMouseenter}
	on:mouseleave={handleMouseleave}
/>
```