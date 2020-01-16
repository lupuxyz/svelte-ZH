---
title: 添加参数
---

像过渡和动画函数一样，动作函数一样可以添加参数，该动作函数将与它所属的标签一起调用。

在本章节中，我们使用一个名为 `longpress` 的动作，只要用户按下并按下按钮时长达到预定时间，它就会触发一个根据时长关联的事件。现在切换到`longpress.js`文件，时长已经设置为500ms。

我们更改动作函数的第二个参数为 `duration` ，并将值传给 `duration` 以供`setTimeout` 函数调用：

```js
export function longpress(node, duration) {
	// ...

	const handleMousedown = () => {
		timer = setTimeout(() => {
			node.dispatchEvent(
				new CustomEvent('longpress')
			);
		}, duration);
	};

	// ...
}
```

回到 `App.svelte`，我们将`duration`值与标签进行动作的绑定：

```html
<button use:longpress={duration}
```

这看似已经完成了，但你会发现无论怎么滑动滑块设置时长，事件都只会在在2000ms时触发。

要解决这个问题，我们需要在`longpress.js`新增一个`update`方法，每当参数更改时，将调用此方法：

```js
return {
	update(newDuration) {
		duration = newDuration;
	},
	// ...
};
```

> 如果你需要将多个参数传递给一个动作，则可以将它们合进一个对象，例： `use:longpress={{duration, spiciness}}`。