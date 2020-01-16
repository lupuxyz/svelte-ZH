---
title: Contenteditable的绑定
---

支持 `contenteditable="true"`属性的标签，可以使用 `textContent` 与 `innerHTML` 属性的绑定：

```html
<div
	contenteditable="true"
	bind:innerHTML={html}
></div>
```