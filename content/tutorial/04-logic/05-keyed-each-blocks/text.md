---
title: 为 each 块添加 key 值
---

一般来说，当你修改`each` 块中的值时，它将会在 *尾端* 进行添加或删除条目，并更新所有变化， 这可能不是你想要的效果。

查看实例比解释更有力.。尝试多次点击'Remove first thing' 按钮，这时`<Thing>` 组件是从尾端开始被移除，这显然不是我们想要的，我们希望是从上至下依次开始删除组件。

为此，我们为 `each` 块指定一个唯一标识符，作为 key 值：

```html
{#each things as thing (thing.id)}
	<Thing current={thing.color}/>
{/each}
```

`(thing.id)` 告诉 Svelte 什么地方需要改变。

> 你可以将任何对象用作 key 来使用，就像Svelte 用 `Map` 在内部作为key一样，换句话说，你可以用  `(thing)` 来代替 `(thing.id)`作为 key 值。但是，使用字符串或者数字作为 key 值通常更安全，因为这能确保它的唯一性，例如，使用来自API服务器的新数据进行更新时。 