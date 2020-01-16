---
title: setContext 和 getContext
---

该 context API 提供了一种机制，使组件之间可以“交谈”，而无需将数据和函数作为props属性传递，或进行大量的事件调度，这是一项复杂的功能，但很有用。

[js执行过程之上下文对象(Context)](https://juejin.im/post/5c35de4ef265da61776c2961)

以使用 [Mapbox GL](https://docs.mapbox.com/mapbox-gl-js/overview/) 地图为例。 我想使用 `<MapMarker>` 组件来显示标记，但不希望在每个组件上都将对底层Mapbox实例的引用作为一个props属性来传递。

context API包含两部分：`setContext` 和 `getContext`。 如果组件调用 `setContext(key, context)`，那么任意 *child* 组件可以检索`const context = getContext(key)`的context。

在`Map.svelte`内，我们首先来设置context， 分别从`svelte`引入`setContext`，`mapbox.js`内引入`key`，并调用`setContext`：

```js
import { onMount, setContext } from 'svelte';
import { mapbox, key } from './mapbox.js';

setContext(key, {
	getMap: () => map
});
```

context对象可以是你希望设置的任何对象，就像 [生命周期函数](tutorial/onmount)，`setContext` 和`getContext` 必须在组件初始化过程中被调用； 由于 `map` 在组件挂载之前不会被创建，因此 context 对象包含的是`getMap` 函数而不是`map` 自身。

切换到另一端，在 `MapMarker.svelte`引入 Mapbox 实例：

```js
import { getContext } from 'svelte';
import { mapbox, key } from './mapbox.js';

const { getMap } = getContext(key);
const map = getMap();
```

标记现在己添加到地图中。

> 完整版本的 `<MapMarker>`还将处理“移除”和“属性更改”操作，但我们在此处只演示context。

## Context keys

在`mapbox.js`中你会看到有这么一行：

```js
const key = {};
```

我们可以使用任何东西作为 key，用例 `setContext('mapbox', ...)` 。使用字符串作为key值的不利之处在于不同的组件库可能会意外地使用同一个组件， 使用对象文本作为key值意味着在任何情况下都保证密钥不会冲突 (因为一个对象仅对其自身具有引用相等性，尽管 `"x" === "x"，`但`{} !== {}`), 即使你有在多个组件层中运行多个不同的contexts 。

## Contexts 与之 stores

Contexts 和 stores 两者何其相似。 它们的区别在于， stores 可用于程序的任何地方，而context 仅可用于组件及其子级。它（context）在一个组件需要使用多个实例，而要求实例之间的状态互不影响，这种场景中有很大优势。

事实上，你可以让两者共存，由于context不支持反应性，因此随时间变化而变化的值可以设置为stores：

```js
const { these, are, stores } = getContext(...);
```
