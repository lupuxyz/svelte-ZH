---
title: Each 块绑定
---

你甚至可以对 `each` 块添加绑定：

```html
<input
	type=checkbox
	bind:checked={todo.done}
>

<input
	placeholder="What needs to be done?"
	bind:value={todo.text}
>
```

> 请注意，这些 `<input>`标签上的属性将会随数据的变化而变化，如果你需要使用固定的数据，因避免这样的做法，使用事件处理程序。