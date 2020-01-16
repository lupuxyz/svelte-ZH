---
title: class 属性
---

class一般用于给标签添加CSS样式。

像其他任何属性一样，你可以给class属性指定JavaScript代码，如下所示：

```html
<button
	class="{current === 'foo' ? 'active' : ''}"
	on:click="{() => current = 'foo'}"
>foo</button>
```

这是UI开发中的常见做法， Svelte内置了特殊指令来简化它：

```html
<button
	class:active="{current === 'foo'}"
	on:click="{() => current = 'foo'}"
>foo</button>
```

该CSS状态 `active`通过`class:active`添加到标签内，后面为一个条件表达式，当条件满足时显示该class标签`active`状态。