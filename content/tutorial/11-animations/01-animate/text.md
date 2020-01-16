---
title: 动画效果
---

在 [上一章](tutorial/deferred-transitions)中，当列表项从todo列表移动到另一个列表中，我们使用了延时过渡来给他创建了运动效果。

但是目前这个程序并不完善，当列表中的某一项被移出到另一个列表时，后面的列表项的补位动画显得生硬，我们还需要添加一个类似于排队自动补位的动画效果， 于是，我们需要用到`animate`指令：

首先，我们从`svelte/animate`模块导入一个名为`flip` 的函数(`flip` 即为 ['First, Last, Invert, Play'](https://aerotwist.com/blog/flip-your-animations/) 的缩写 )：

```js
import { flip } from 'svelte/animate';
```

然后添加到 `<label>` 标签：

```html
<label
	in:receive="{{key: todo.id}}"
	out:send="{{key: todo.id}}"
	animate:flip
>
```

在这种情况下，移动速度似乎有些缓慢，我们还需要设置下 `duration` 参数：

```html
<label
	in:receive="{{key: todo.id}}"
	out:send="{{key: todo.id}}"
	animate:flip="{{duration: 200}}"
>
```

> `duration` 也是一个 `d => milliseconds` 函数，其中`d` 表示标签运动时长，值越大运动时间就越长，动画效果就越慢。

请注意，所有过渡和动画都是通过CSS而不是JavaScript来创建的，这意味着它们不会阻塞（或被主线程阻塞）。