---
title: 出入
---

`transition` 属性可以替换为 `in` 或`out` 属性，分别对应过渡效果的入和出，可以指定其中一个，或者指定两个，让我们将 `fade` 和 `fly`同时引入：

```js
import { fade, fly } from 'svelte/transition';
```

然后将 `transition` 属性替换为`in` 和 `out`属性：

```html
<p in:fly="{{ y: 200, duration: 2000 }}" out:fade>
	Flies in, fades out
</p>
```

在这种情况下，过渡效果 *不可逆* 。