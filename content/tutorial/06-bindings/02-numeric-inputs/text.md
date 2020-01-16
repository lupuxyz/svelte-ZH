---
title: 数字输入框
---

在DOM中，所有内容都是字符串。在你必须使用`input.value` 获取数值时， 单靠`type="number"` 或 `type="range"` 这些属性显然不能帮助到你。

有了 `bind:value`， Svelte 为你带来更好的体验：

```html
<input type=number bind:value={a} min=0 max=10>
<input type=range bind:value={a} min=0 max=10>
```