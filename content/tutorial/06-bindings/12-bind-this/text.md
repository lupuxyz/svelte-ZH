---
title: This
---

`this`可以绑定到任何标签 (或组件) 并允许你获取对渲染标签的引用。 例如，我们对`<canvas>` 标签进行绑定：

```html
<canvas
	bind:this={canvas}
	width={32}
	height={32}
></canvas>
```

注意，`canvas`的值 `undefined` 会一直存在直至组件挂载完毕，因此我们给 `onMount`添加一个 [生命周期函数](tutorial/onmount)来处理。
