---
title: DOM 事件转发
---

事件转发也可以应用到DOM事件。

我们希望`<FancyButton>`组件内部接收外部的`handleClick()`，为此，我们只需要为`FancyButton.svelte`内的`<button>`标签添加`click` 事件即可：

```html
<button on:click>
	Click me
</button>
```