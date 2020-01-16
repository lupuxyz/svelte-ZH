---
title: DOM 事件
---

正如我们前面章节已经看到的那样，你可以添加 `on:` 指令为标签添加事件(events)。

```html
<div on:mousemove={handleMousemove}>
	The mouse position is {m.x} x {m.y}
</div>
```