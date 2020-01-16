---
title: 添加数据
---

仅仅是一些静态标记的组件不是很有趣。让我们添加一些数据。

首先，将<script></script>标签添加到您的组件并声明一个 `name` 变量。

```html
<script>
	let name = 'world';
</script>

<h1>Hello world!</h1>
```

然后，我们可以引用`name` 变量：

```html
<h1>Hello {name}!</h1>
```

在`{}`内，我们可以插入所需的任何JavaScript。尝试改变变量 `name` 的值以 [name.toUpperCase()](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/String/toUpperCase "String.prototype.toUpperCase()") 方法转为大写形式。