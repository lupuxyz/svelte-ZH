---
title: <svelte:window>
---

如同事件可以监听 DOM 标签一样，你可以通过`window` 对象给 `<svelte:window>`标签添加事件监听：

在代码第33行，添加 `keydown` 监听事件：

```html
<svelte:window on:keydown={handleKeydown}/>
```

> 与DOM标签一样，您可以添加 [事件修饰符](tutorial/event-modifiers) ，例如 `preventDefault`。
