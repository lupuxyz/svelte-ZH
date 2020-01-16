---
title: 弹性
---

`spring` 函数能比 `tweened`函数带来更好的运动效果。

在本例中，我们有两个 `stores`，一个表示圆的坐标，另一个表示圆的尺寸，让我们给它加上弹性动画：

```html
<script>
	import { spring } from 'svelte/motion';

	let coords = spring({ x: 50, y: 50 });
	let size = spring(10);
</script>
```
在`spring` 函数内含有 `stiffness` 和 `damping`默认参数，这两个参数分别控制着弹性动画的柔性和阻尼。
我们可以给它加入自定的值：

```js
let coords = spring({ x: 50, y: 50 }, {
	stiffness: 0.1,
	damping: 0.25
});
```

左右摇晃鼠标，然后尝试拖动滑块以了解它们如何影响弹性的性能。请注意，你可以在弹性处于运动状态时调整值。