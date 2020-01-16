---
title: 延时过渡
---

 Svelte 过渡引擎其中一项特别强大的功能就是可以设置*延时（defer）* 过渡，以便多个效果之间协调。

以这todo lists为例， 在其中更换todo将其发送到相对的列表中。在真实世界中，物体的移动不是这般生硬，它们是有其运动轨迹，而不像这般突然出现。给程序添加运动效果能更好的帮助用户了解程序界面变化。

我们可以使用`crossfade` 函数来实现此效果，该函数创建一对称名为 `send` 和`receive`. 当一个标签被 'sent'时， 它会寻找一个被'received'的标签，并赋予一个过渡效果，反之同理。如果没有对应的接收方，过渡效果将会设置为`fallback` 。

在65行找到 `<label>`标签， 给它添加`send` 和 `receive` 过渡：

```html
<label
	in:receive="{{key: todo.id}}"
	out:send="{{key: todo.id}}"
>
```

对下一个 `<label>` 标签执行相同的操作：

```html
<label
	class="done"
	in:receive="{{key: todo.id}}"
	out:send="{{key: todo.id}}"
>
```

现在，当您切换列表项时，它们会平滑移动到新位置，没有添加过渡效果的标签仍然笨拙地跳来跳去，我们将下一章中解决它。