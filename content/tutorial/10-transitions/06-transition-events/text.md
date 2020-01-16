---
title: 过渡事件
---

了解过渡的开始和结束可能会很有用。Svelte调度监听事件，像监听其他任何DOM事件一样：

```html
<p
	transition:fly="{{ y: 200, duration: 2000 }}"
	on:introstart="{() => status = 'intro started'}"
	on:outrostart="{() => status = 'outro started'}"
	on:introend="{() => status = 'intro ended'}"
	on:outroend="{() => status = 'outro ended'}"
>
	Flies in and out
</p>
```