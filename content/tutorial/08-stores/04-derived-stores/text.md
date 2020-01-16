---
title: stores派生
---

你可以创建一个`stores`，其内的值可以派生(derived)于一个或多个 *其他* `stores`。在前面的示例的基础上，我们可以创建派生时间到其他页面：

```js
export const elapsed = derived(
	time,
	$time => Math.round(($time - start) / 1000)
);
```

> 可以从多个源派生`stores`， 并显式用set`指定它的值而不是返回它（这对异步调用的派生值很有用)。 更多请查阅[API 参考](docs#derived) 。
