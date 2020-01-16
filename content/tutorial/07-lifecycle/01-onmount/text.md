---
title: 挂载
---

自组件创建开始便包含了一个 *生命周期（lifecycle）* ，生命周期由销毁而结束。 有一些功能可让你关键时刻决定组件的生命周期。

你最常使用的是 `onMount`，它将在组件首次渲染到DOM之后运行。 在渲染元素之后我们需要与标签进行交互时，曾在以前的 [章节](tutorial/bind-this)中使用过它来控制`<canvas>`。

我们将添加一个 `onMount` 来处理通过网络加载一些数据的程序：

```html
<script>
	import { onMount } from 'svelte';

	let photos = [];

	onMount(async () => {
		const res = await fetch(`https://jsonplaceholder.typicode.com/photos?_limit=20`);
		photos = await res.json();
	});
</script>
```

> 由于使用服务器端渲染（SSR），因此建议将`fetch` 放在 `onMount` 函数内而不是放在 `<script>`标签内。 除了使用`onDestroy`函数外，生命周期函数不会在SSR期间运行，这意味着一旦组件挂载在DOM中，我们就可以避免过多的获取本应[懒加载](https://baike.baidu.com/item/%E6%87%92%E5%8A%A0%E8%BD%BD/2838950?fr=aladdin)的数据。

必须在组件初始化时调用生命周期函数，以便将回调绑定到组件实例，例如：避免 `setTimeout`。

如果`onMount` 函数回调返回一个函数，则在销毁组件时将调用该函数。