---
title: 用法
---

动作(actions) 本质上是块级标签的生命周期函数。它们主要应用于一下几个方面：

* 给第三方库提供接口
* 懒加载（lazy-loaded）图像
* 工具提示
* 添加自定义事件处理程序

在当前章节的程序中，我们要使橙色矩形框变得“可移动”。 它包含了 `panstart`,、`panmove` 以及 `panend` 事件，但是这些都不是原生DOM事件，我们必须自己驱使它们，首先引入 `pannable`函数：

```js
import { pannable } from './pannable.js';
```

然后添加在标签上：

```html
<div class="box"
	use:pannable
	on:panstart={handlePanStart}
	on:panmove={handlePanMove}
	on:panend={handlePanEnd}
	style="transform:
		translate({$coords.x}px,{$coords.y}px)
		rotate({$coords.x * 0.2}deg)"
></div>
```

打开 `pannable.js` 文件，与过渡函数类似，动作函数接收`node` 和一些可选参数，并返回动作对象。该对象可以具有一个`destroy` 函数，在销毁标签时会调用该函数。

我们希望用户在将光标移到标签上时触发 `panstart`事件，用户拖动标签时触发`panmove`事件(带有 `dx` 和 `dy` 属性显示鼠标拖动的距离) ，并在用户释放光标时触发`panend`事件。.其中一种实现方法如下所示：

```js
export function pannable(node) {
	let x;
	let y;

	function handleMousedown(event) {
		x = event.clientX;
		y = event.clientY;

		node.dispatchEvent(new CustomEvent('panstart', {
			detail: { x, y }
		}));

		window.addEventListener('mousemove', handleMousemove);
		window.addEventListener('mouseup', handleMouseup);
	}

	function handleMousemove(event) {
		const dx = event.clientX - x;
		const dy = event.clientY - y;
		x = event.clientX;
		y = event.clientY;

		node.dispatchEvent(new CustomEvent('panmove', {
			detail: { x, y, dx, dy }
		}));
	}

	function handleMouseup(event) {
		x = event.clientX;
		y = event.clientY;

		node.dispatchEvent(new CustomEvent('panend', {
			detail: { x, y }
		}));

		window.removeEventListener('mousemove', handleMousemove);
		window.removeEventListener('mouseup', handleMouseup);
	}

	node.addEventListener('mousedown', handleMousedown);

	return {
		destroy() {
			node.removeEventListener('mousedown', handleMousedown);
		}
	};
}
```

更新`pannable` 函数并尝试移动橙色矩形框。

> 此实现仅用于演示目的-更完整的实现还可以考虑`touch`事件。
