---
title: 自定义 CSS 过渡
---

`svelte/transition` 模块含有一些内置的过渡效果，但是创建自己的过渡效果也是非常容易，举例来说，这是 `fade`过渡的代码实现：

```js
function fade(node, {
	delay = 0,
	duration = 400
}) {
	const o = +getComputedStyle(node).opacity;

	return {
		delay,
		duration,
		css: t => `opacity: ${t * o}`
	};
}
```

该函数接收两个参数（过渡应用到节点以及传入的任何参数）并返回一个过渡对象，该对象可以具有以下属性：

* `delay` ： 过渡开始（毫秒）。
* `duration`： 过渡时长（毫秒）。
* `easing` ：`p => t` easing 函数 (详见) [补间](tutorial/tweened))
* `css` ：`(t, u) => css`函数, where `u === 1 - t`。
* `tick` — a `(t, u) => {...}` 对节点有一定影响的函数。

该 `t` 值为 `0`时表示开始，值为`1` 表示结束，根据情况含义可以截然相反。

大多数情况下，您应该返回该 `css` 而不是`tick` 属性，因为 CSS animations 会运行在主线程中，以避免出现混淆。.Svelte '模拟（simulates）' 过渡效果并创建CSS animation，然后使其运行。

例如，`fade` 过渡会生成 CSS animation ，如下所示：

```css
0% { opacity: 0 }
10% { opacity: 0.1 }
20% { opacity: 0.2 }
/* ... */
100% { opacity: 1 }
```

不过我们可以发挥更大的创新，做出真正定制化的东西：

```html
<script>
	import { fade } from 'svelte/transition';
	import { elasticOut } from 'svelte/easing';

	let visible = true;

	function spin(node, { duration }) {
		return {
			duration,
			css: t => {
				const eased = elasticOut(t);

				return `
					transform: scale(${eased}) rotate(${eased * 1080}deg);
					color: hsl(
						${~~(t * 360)},
						${Math.min(100, 1000 - 1000 * t)}%,
						${Math.min(50, 500 - 500 * t)}%
					);`
			}
		};
	}
</script>
```

记住：能力越大责任越大。
