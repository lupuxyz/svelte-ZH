---
title: 补间
---

设置值以致 DOM 更新诚然很酷。知道什么更酷吗？给那些值一个* 补间（Tweening）* 。 Svelte包含一些工具，可帮助您构建优美的用户界面，赋予这些界面一些动效。

先把 `progress` 的值`tweened`从store 模块更换到*运动(motion)*模块中:

```html
<script>
	import { tweened } from 'svelte/motion';

	const progress = tweened(0);
</script>
```

点击按钮会看见进度条已经有了缓动动画，但运动曲线似乎有些生硬，我们需要添加一个`easing` 函数，让它更平滑自然：

```html
<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const progress = tweened(0, {
		duration: 400,
		easing: cubicOut
	});
</script>
```

> `svelte/easing` 模块中包含了 [Penner的easing.js](https://github.com/danro/easing-js)，另外你也可以定制`p => t` 函数，其中 `p` 和 `t` 的取值范围在0-1之间。

`tweened`内包含的所有选项：

* `delay` ：补间开始之前（毫秒）。
* `duration` ：补间持续时间（毫秒），另外`(from, to) => milliseconds` 函数允许你指定特定时间的补间。
* `easing` ：一个 `p => t` 函数。
* `interpolate` ： `(from, to) => t => value` 用于在任意值之间插值的自定义函数。默认情况下，Svelte将在数字，日期或类似于数组和对象之间进行插值（只要它们仅包含数字和日期或其他有效的数组或对象）。如果要给（例如）colour 字符串或transformation 模型插值，请提供自定义插值器。

你还可以将这些选项传递给`progress.set` 和 `progress.update` 作为第二个参数， 在这种情况下，它们会替换掉默认值。当补间完成时，该 `set` 和 `update` 方法都会返回带有resolves方法的promise。  
