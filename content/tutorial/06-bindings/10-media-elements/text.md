---
title: 媒体标签的绑定
---

`<audio>` 和 `<video>` 同样支持部分的属性绑定，接下来演示其中几个属性。

在代码第116行, 添加上对 `currentTime={time}`、`duration` 和 `paused` 属性的绑定

```html
<video
	poster="https://sveltejs.github.io/assets/caminandes-llamigos.jpg"
	src="https://sveltejs.github.io/assets/caminandes-llamigos.mp4"
	on:mousemove={handleMousemove}
	on:mousedown={handleMousedown}
	bind:currentTime={time}
	bind:duration
	bind:paused
></video>
```

> `bind:duration` 相当于 `bind:duration={duration}`

现在，当您单击视频时，它将视情况更新 `time`、`duration` 和 `paused` 属性的值。这意味着我们可以使用它们来创建自定义控件。

> 通常，在网页中， 你会将`currentTime`用于对 `timeupdate` 的事件监听并跟踪。但是这些事件很少触发，导致UI不稳定。 Svelte 使用`currentTime` 对 `requestAnimationFrame`进行查验，进而避免了此问题。

针对 `<audio>` 和 `<video>` 的 6 个*readonly* 属性绑定 ：

* `duration` (readonly) ：视频的总时长，以秒为单位。
* `buffered` (readonly) ：数组`{start, end}` 的对象。
* `seekable` (readonly) ：同上。
* `played` (readonly) ：同上。
* `seeking` (readonly) ：布尔值。
* `ended` (readonly)  ：布尔值。

...以及 4 个*双向* 绑定：

* `currentTime` ：视频中的当前点，以秒为单位。
* `playbackRate` ：播放视频的倍速，  `1` 为 '正常'。
* `paused` ：暂停。
* `volume` ：音量，0到1之间的值。

`<video>` 还有多出了具有*readonly* 属性`videoWidth`和`videoHeight` 属性的绑定。