---
title: 输入框组绑定
---

如果你需要绑定更多值，则可以使用`bind:group` 将 `value` 属性放在一起使用。
在`bind:group`中，同一组的单选框值时互斥的，同一组的复选框会形成一个数组。

添加`bind:group` 到每一个选择框：

```html
<input type=radio bind:group={scoops} value={1}>
```

在这种情况下，我们可以给复选框标签添加一个 `each` 块来简化代码。
首先添加一个`menu`变量到 `<script>`标签中：

```js
let menu = [
	'Cookies and cream',
	'Mint choc chip',
	'Raspberry ripple'
];
```

接下来继续替换：

```html
<h2>Flavours</h2>

{#each menu as flavour}
	<label>
		<input type=checkbox bind:group={flavours} value={flavour}>
		{flavour}
	</label>
{/each}
```

现在，我们可以轻易的拓展我们的“ice cream menu”。