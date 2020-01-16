---
title: 尺寸的绑定
---

每个块级标签都可以对 `clientWidth`、`clientHeight`、`offsetWidth` 以及 `offsetHeight` 属性进行绑定：

```html
<div bind:clientWidth={w} bind:clientHeight={h}>
	<span style="font-size: {size}px">{text}</span>
</div>
```

这些绑定是只读的，更改`w` 和 `h` 的值不会有任何效果。

> 对标签的尺寸更改[请阅读这里](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/)。 由于涉及到额外的性能开销，因此不建议在页面中大量的使用。
>
> 使用`display: inline`的标签无法获得尺寸，当然包含有其他有尺寸的标签 (例如`<canvas>`)也不会得到正常显示。在这种情况下建议对该标签嵌套一层标签或者直接绑定它的父级。