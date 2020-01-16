---
title: 选择框绑定
---

我们还可以利用 `bind:value` 对 `<select>` 标签进行绑定，更改代码第 24 行：

```html
<select bind:value={selected} on:change="{() => answer = ''}">
```

即使 `<option>` 中的值是对象而非字符串， Svelte 对它进行绑定也不会有任何困难。

> 由于我们没有`selected`设置为初始值，因此绑定会自动将其(列表中的第一个)设置为默认值。  但也要注意，在绑定的目标未初始化前，`selected` 仍然是未定义的，因此我们应该谨慎的使用诸如`selected.id`中的内容。