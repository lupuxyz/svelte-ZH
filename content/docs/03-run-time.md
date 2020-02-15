---
title: 运行时
---


### `svelte`

该`svelte`包含有 [生命周期函数](tutorial/onmount) 和 [context API](tutorial/context-api)。

#### `onMount`

```js
onMount(callback: () => void)
```
```js
onMount(callback: () => () => void)
```

---
该`onMount`函数作为将component挂载到DOM后立即执行的回调。它必须在component初始化期间被调用（但不必位于component内部；可以从外部模块调用它）。

`onMount` 不在 [服务端 component](docs#Server-side_component_API)内部运行。

```html
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		console.log('the component has mounted');
	});
</script>
```

---

如果需要`onMount`返回一个函数，则在卸载 component 时调用该函数。

```html
<script>
	import { onMount } from 'svelte';

	onMount(() => {
		const interval = setInterval(() => {
			console.log('beep');
		}, 1000);

		return () => clearInterval(interval);
	});
</script>
```

#### `beforeUpdate`

```js
beforeUpdate(callback: () => void)
```

---

给所有state变更安排一个回调函数运行在 component渲染之前。

> 首次回调运行在`onMount`初始化之前。

```html
<script>
	import { beforeUpdate } from 'svelte';

	beforeUpdate(() => {
		console.log('the component is about to update');
	});
</script>
```

#### `afterUpdate`

```js
afterUpdate(callback: () => void)
```

---

安排一个回调函数运行在 component渲染之后。

```html
<script>
	import { afterUpdate } from 'svelte';

	afterUpdate(() => {
		console.log('the component just updated');
	});
</script>
```

#### `onDestroy`

```js
onDestroy(callback: () => void)
```

---

计划在component卸载后运行的回调。

相对于 `onMount`、 `beforeUpdate`、 `afterUpdate` 和 `onDestroy`，它唯一可以运行在服务端渲染组件内部。

```html
<script>
	import { onDestroy } from 'svelte';

	onDestroy(() => {
		console.log('the component is being destroyed');
	});
</script>
```

#### `tick`

```js
promise: Promise = tick()
```

---

返回一个promise，该promise将在应用state变更后返回resolves，或者在下一个微任务中（如果没有）更改。

```html
<script>
	import { beforeUpdate, tick } from 'svelte';

	beforeUpdate(async () => {
		console.log('the component is about to update');
		await tick();
		console.log('the component just updated');
	});
</script>
```

#### `setContext`

```js
setContext(key: any, context: any)
```

---

将任意`context`对象与当前component同指定的key关联。然后，该context通过`getContext`函数应用到component的子级(包含带slot的内容)。
像生命周期函数一样，必须在component初始化期间调用它。

```html
<script>
	import { setContext } from 'svelte';

	setContext('answer', 42);
</script>
```

> Context 本身并不具有响应性。如果你需要在 context 中的值具有响应性，你需要将store传递到context中。

#### `getContext`

```js
context: any = getContext(key: any)
```

---

如果你检索父组件含有的指定最近component 的
`key`，则必须在component初始化期间调用。

```html
<script>
	import { getContext } from 'svelte';

	const answer = getContext('answer');
</script>
```

#### `createEventDispatcher`

```js
dispatch: ((name: string, detail?: any) => void) = createEventDispatcher();
```

---

创建一个可用于分发[component事件](docs#on_component_event)的事件分发器。事件分发器是一个函数，接受两个参数： `name` 和 `detail`。

Component 创建一个与 `createEventDispatcher`创建一个 [CustomEvent（自定义事件）](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent).。该事件不会 [bubble](https://developer.mozilla.org/en-US/docs/Learn/JavaScript/Building_blocks/Events#Event_bubbling_and_capture) ，也无法取消使用 `event.preventDefault()`。该 `detail` 参数对应[CustomEvent.detail](https://developer.mozilla.org/en-US/docs/Web/API/CustomEvent/detail) 属性，并且可以包含任何数据类型。

```html
<script>
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();
</script>

<button on:click="{() => dispatch('notify', 'detail value')}">Fire Event</button>
```

---

子component 分发的事件可以在其父子component中监听。调度事件时提供的任何数据都可以在事件对象上获取`detail`属性。


```html
<script>
	function callbackFunction(event) {
		console.log(`Notify fired! Detail: ${event.detail}`)
	}
</script>

<Child on:notify="{callbackFunction}"/>
```

### `svelte/store`

 `svelte/store` 模块导出函数可用于创建 [readable（可读）](docs#readable), [writable（可写）](docs#writable) 和 [derived（派生）](docs#derived) 的store。

记住，你不具备使用这些函数并使用[响应性 `$store` 语法](docs#4_Prefix_stores_with_$_to_access_their_values)在你的 component 中。所有对象正确实现`.subscribe`、 unsubscribe和 `.set`（可选）成为一个有效store就可以使用特殊语法以及Svelte内置 [`derived（派生）` store](docs#derived)。

这使得Svelte可以包含几乎所有其他响应式state处理库，阅读更多关于[store contract](docs#Store_contract)，以了解正确使用方式。


#### `writable`

```js
store = writable(value: any)
```
```js
store = writable(value: any, (set: (value: any) => void) => () => void)
```

---

它提供一个给外部组件创建 store 值的函数。它被创建为带有`set`和`update` 方法的对象。

`set`是一种接收一个参数的设置值方法。如果store值与参数值不相等，则将其设置为新参数的值。

`update`是一种接收一个参数的回调方法。回调将现有store值作为其参数，并返回要设置为store 的新值。

```js
import { writable } from 'svelte/store';

const count = writable(0);

count.subscribe(value => {
	console.log(value);
}); // logs '0'

count.set(1); // logs '1'

count.update(n => n + 1); // logs '2'
```

---

如果将函数作为第二个参数传递，则在subscriber数从0变为1（但不是从1变为2）时将调用该函数。该函数将被传递一个`set`更改store值的函数。它必须返回一个`stop` 函数在subscriber数从1变为0时调用的函数。

```js
import { writable } from 'svelte/store';

const count = writable(0, () => {
	console.log('got a subscriber');
	return () => console.log('no more subscribers');
});

count.set(1); // does nothing

const unsubscribe = count.subscribe(value => {
	console.log(value);
}); // logs 'got a subscriber', then '1'

unsubscribe(); // logs 'no more subscribers'
```

#### `readable`

```js
store = readable(value: any, (set: (value: any) => void) => () => void)
```

---
创建一个无法从“外部”设置其值的store ，第一个参数是store 的初始值。

第二个参数的readable`与的第二个参数`writable`相同`，不同的是必须使用`readable`（否则将无法更新store值）。

```js
import { readable } from 'svelte/store';

const time = readable(new Date(), set => {
	const interval = setInterval(() => {
		set(new Date());
	}, 1000);

	return () => clearInterval(interval);
});
```

#### `derived`

```js
store = derived(a, callback: (a: any) => any)
```
```js
store = derived(a, callback: (a: any, set: (value: any) => void) => void | () => void, initial_value: any)
```
```js
store = derived([a, ...b], callback: ([a: any, ...b: any[]]) => any)
```
```js
store = derived([a, ...b], callback: ([a: any, ...b: any[]], set: (value: any) => void) => void | () => void, initial_value: any)
```

---

`derived（派生）`一个源于一个或多个其他 store的store，只要这些依赖项发生变更，就会执行回调。

在简易版本中，`derived`只拥有一个store且回调返回一个派生值。


```js
import { derived } from 'svelte/store';

const doubled = derived(a, $a => $a * 2);
```

---

该回调可以以`set`作为第二个参数，并在适当的时候调用它来异步设置一个值。

在这种情况下，你还可以将第三个参数传递到`derived`，即在首次调用`set`之前派生 store 的初始值。

```js
import { derived } from 'svelte/store';

const delayed = derived(a, ($a, set) => {
	setTimeout(() => set($a), 1000);
}, 'one moment...');
```

---

右侧实例中，如果你的回调函数返回的是一个函数，则会在“a”被回调运行（或当“b”的最后一个subscriber【订阅】被unsubscribes【取订】）时被调用。

```js
import { derived } from 'svelte/store';

const tick = derived(frequency, ($frequency, set) => {
	const interval = setInterval(() => {
	  set(Date.now());
	}, 1000 / $frequency);

	return () => {
		clearInterval(interval);
	};
}, 'one moment...');
```

---

在这两种情况下，数组参数都将作为首个参数传递，而不是作为单一的store。

```js
import { derived } from 'svelte/store';

const summed = derived([a, b], ([$a, $b]) => $a + $b);

const delayed = derived([a, b], ([$a, $b], set) => {
	setTimeout(() => set($a + $b), 1000);
});
```

#### `get`

```js
value: any = get(store)
```

---

通常，你可以通过subscribing（订阅） store 并随时使用它来读取store值。但是当store的值是未被subscribed的，这时候你就可以通过`get`来完成。

>这可以通过创建subscription读取值，然后通过unsubscribing（取订）来取订。但是，在热更新代码路径（hot code paths）中不建议这样做。

```js
import { get } from 'svelte/store';

const value = get(store);
```


### `svelte/motion`

`svelte/motion`模块导出两个函数： `tweened` 和 `spring`。用于创建writable（可写）store，其值会在`set` 和 `update`之后更新，而不是立即更新。

#### `tweened`

```js
store = tweened(value: any, options)
```

Tweened（补间） store 值会在固定时间内更新，可选参数：

* `delay` (`number`, 默认值： 0) — 开始（单位毫秒）。
* `duration` (`number`,  默认值：400) — 持续时间（单位毫秒）。
* `easing` (`function`,  默认值： `t => t`) — [easing 函数](docs#svelte_easing)
* `interpolate` (`function`) — 参见下文

`store.set` 和 `store.update` 可以作为第二个 `options` 的参数，该参数将覆盖实例化时传递的选项。

这两个函数都返回一个Promise，并在tweened完成时返回resolves，如果tweened中断，则 promise 将不会返回resolves。

---

开箱即用，使用Svelte在两个数字、两个数组或两个对象之间进行插值（只要数组和对象是相同的'shape'，并且它们的'leaf'属性也是number）。

```html
<script>
	import { tweened } from 'svelte/motion';
	import { cubicOut } from 'svelte/easing';

	const size = tweened(1, {
		duration: 300,
		easing: cubicOut
	});

	function handleClick() {
		// this is equivalent to size.update(n => n + 1)
		$size += 1;
	}
</script>

<button
	on:click={handleClick}
	style="transform: scale({$size}); transform-origin: 0 0"
>embiggen</button>
```

---

如果初始化的值是`undefined`或`null`，第一个值更改将立即生效，当你具有基于component的tweened值并且在component首次渲染时不希望任何运动时，此功能很有用。

```js
const size = tweened(undefined, {
	duration: 300,
	easing: cubicOut
});

$: $size = big ? 100 : 10;
```

---

`interpolate（插入）` 选项允许你在任意值作为tweened值，它必须是一个`(a, b) => t => value`结构的函数 其中`a` 是起始值，, `b` 是结束值， `t` 必须是一个数字（取值：0-1），例如，我们可以使用 [d3-interpolate](https://github.com/d3/d3-interpolate) 包在两种颜色之间平滑地进行插值。


```html
<script>
	import { interpolateLab } from 'd3-interpolate';
	import { tweened } from 'svelte/motion';

	const colors = [
		'rgb(255, 62, 0)',
		'rgb(64, 179, 255)',
		'rgb(103, 103, 120)'
	];

	const color = tweened(colors[0], {
		duration: 800,
		interpolate: interpolateLab
	});
</script>

{#each colors as c}
	<button
		style="background-color: {c}; color: white; border: none;"
		on:click="{e => color.set(c)}"
	>{c}</button>
{/each}

<h1 style="color: {$color}">{$color}</h1>
```

#### `spring`

```js
store = spring(value: any, options)
```

`spring（弹性）` store通过`stiffness`和 `damping`参数逐步变更到目标值，而`tweened`store在改变一个固定时间变更其值。store在由它们现有速度决定的持续时间长短，从而实现更自然的运动效果。可选选项：

* `stiffness` (`number`, 默认值： `0.15`) — 取值：0-1，数值越大效果越生硬(例，灵敏度)。
* `damping` (`number`, 默认值： `0.8`) — 取值：0-1，数值越小阻尼越小（例，惯性）。
* `precision` (`number`, 默认值： `0.001`) — 粒度。用于控制上面两个参数的运动幅度大小。

---

与[`tweened`](docs#tweened) store一样，,`set` 和 `update` 在弹性动画完成时返回一个Promise resolves。 其中 `store.stiffness` 和 `store.damping` 属性可以立即改变其弹性运动特性。

`set` 和 `update` 两者可以用 `hard` 或`soft`属性对象作为第二个参数来表示弹性动画柔度，`{ hard: true }` 表示无弹性， `{ soft: n }` 表示运动曲线柔度。`{ soft: true }` 等效于 `{ soft: 0.5 }`。

[更多请参阅弹性教程](tutorial/spring)

```html
<script>
	import { spring } from 'svelte/motion';

	const coords = spring({ x: 50, y: 50 }, {
		stiffness: 0.1,
		damping: 0.25
	});
</script>
```

---

如果初始值为 `undefined` 或 `null`，则第一个值更改将立即生效，就像使用 `tweened` 值一样（参阅上文）。

```js
const size = spring();
$: $size = big ? 100 : 10;
```

### `svelte/transition`

`svelte/transition （过渡）` 模块具有六个函数： `fade`, `fly`, `slide`, `scale`, `draw` 和 `crossfade`。 它与 svelte [`transitions`](docs#Transitions)一起使用。

#### `fade（淡入淡出）`

```sv
transition:fade={params}
```
```sv
in:fade={params}
```
```sv
out:fade={params}
```

---

通过对标签透明度添加动画实现淡入淡出效果，`in`表示入，`out`表示出。

`fade` 接收以下两个参数：

* `delay` (`number`, 默认值： 0) — 起始时间点（毫秒）。
* `duration` (`number`, 默认值： 400) — 持续时间（毫秒）。

你可以查看 `fade`  [过渡变换教程](tutorial/transition)。

```html
<script>
	import { fade } from 'svelte/transition';
</script>

{#if condition}
	<div transition:fade="{{delay: 250, duration: 300}}">
		fades in and out
	</div>
{/if}
```

#### `blur（模糊）`

```sv
transition:blur={params}
```
```sv
in:blur={params}
```
```sv
out:blur={params}
```

---

`blur`对标签透明度进行一同模糊滤镜处理 。

`blur` 接收以下参数：

* `delay` (`number`, 默认值 0) — 起始点（毫秒）。
* `duration` (`number`, 默认值 400) — 持续时间（毫秒）。
* `easing` (`function`, 默认值 `cubicInOut`) — [easing 函数](docs#svelte_easing)。
* `opacity` (`number`, 默认值 0) - 不透明度（取值0-1）。
* `amount` (`number`, 默认值 5) - 模糊范围（单位是px，这里不加单位）。

```html
<script>
	import { blur } from 'svelte/transition';
</script>

{#if condition}
	<div transition:blur="{{amount: 10}}">
		fades in and out
	</div>
{/if}
```

#### `fly（移动）`

```sv
transition:fly={params}
```
```sv
in:fly={params}
```
```sv
out:fly={params}
```

---

通过改变标签的 x 和 y 以及透明度实现动画效果，其中使用`in`绑定移入, 用 `out` 绑定移出。

`fly` 接收以下参数：

* `delay` (`number`, 默认值： 0) — 起始点（毫秒）。
* `duration` (`number`, 默认值： 400) — 持续时间（毫秒）。
* `easing` (`function`, 默认值 `cubicOut`) — [easing 函数](docs#svelte_easing)
* `x` (`number`, 默认值 0) - 往x轴方向偏移量。
* `y` (`number`, 默认值 0) - 往y轴方向偏移量。
* `opacity` (`number`, 默认值 0) - 移入/移出时的目标不透明度（如果移入/移出时不同的话）动画（取值0-1）。

你可以查看 `fly`  [过渡教程](tutorial/adding-parameters-to-transitions)查看更多。

```html
<script>
	import { fly } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

{#if condition}
	<div transition:fly="{{delay: 250, duration: 300, x: 100, y: 500, opacity: 0.5, easing: quintOut}}">
		flies in and out
	</div>
{/if}
```

#### `slide（滑动）`

```sv
transition:slide={params}
```
```sv
in:slide={params}
```
```sv
out:slide={params}
```

---

将标签滑入滑出。

`slide` 接收以下参数：

* `delay` (`number`, 默认值 0) — 起始点（毫秒）。
* `duration` (`number`, 默认值 400) — 持续时间（毫秒）。
* `easing` (`function`, 默认值 `cubicOut`) — [easing 函数](docs#svelte_easing)。

```html
<script>
	import { slide } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

{#if condition}
	<div transition:slide="{{delay: 250, duration: 300, easing: quintOut }}">
		slides in and out
	</div>
{/if}
```

#### `scale（伸缩）`

```sv
transition:scale={params}
```
```sv
in:scale={params}
```
```sv
out:scale={params}
```

---

通过改变标签的大小以及透明度实现动画效果，其中使用`in`绑定伸, 用 `out` 绑定缩（两者也可以绑定相反效果）。

`scale` 接收以下参数：

* `delay` (`number`, 默认值 0) — 起始点（毫秒）
* `duration` (`number`, 默认值 400) — 持续时间（毫秒）
* `easing` (`function`, 默认值 `cubicOut`) — a[easing 函数](docs#svelte_easing)
* `start` (`number`, 默认值 0) - in / out时的目标比例（取值0-1）。
* `opacity` (`number`, 默认值 0) - in / out时的目标不透明度（取值0-1）。

```html
<script>
	import { scale } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

{#if condition}
	<div transition:scale="{{duration: 500, delay: 500, opacity: 0.5, start: 0.5, easing: quintOut}}">
		scales in and out
	</div>
{/if}
```

#### `draw（绘制）`

```sv
transition:draw={params}
```
```sv
in:draw={params}
```
```sv
out:draw={params}
```

---

对SVG标签进行路径绘制动画，就像贪吃蛇一样。 `in` 表示路径由无到有， `out` 表示路径由有到无。 `draw`仅适用于支持 `getTotalLength` 方法的元素，诸如`<path>` 和 `<polyline>`。

`draw` 接收以下参数：

* `delay` (`number`, 默认值 0) — 起始点
* `speed` (`number`, 默认值 undefined) - 动画速度，细节见下文。
* `duration` (`number` | `function`, 默认值 800) — 持续时间（毫秒）。
* `easing` (`function`, 默认值 `cubicInOut`) —  [easing 函数](docs#svelte_easing)

该`speed` 参数是一种设置相对于路径长度的过渡持续时间的方法。它是应用于路径长度的修饰符： `duration = length / speed`。速度为1的1000像素路径的持续时间为 `1000ms`,将速度设置为`0.5`表示一半的速度完成（所以持续时间加倍）， `2` 表示两倍的速度完成（所以时间减半）。

```html
<script>
	import { draw } from 'svelte/transition';
	import { quintOut } from 'svelte/easing';
</script>

<svg viewBox="0 0 5 5" xmlns="http://www.w3.org/2000/svg">
	{#if condition}
		<path transition:draw="{{duration: 5000, delay: 500, easing: quintOut}}"
					d="M2 1 h1 v1 h1 v1 h-1 v1 h-1 v-1 h-1 v-1 h1 z"
					fill="none"
					stroke="cornflowerblue"
					stroke-width="0.1px"
					stroke-linejoin="round"
		/>
	{/if}
</svg>

```


<!-- Crossfade is coming soon... -->



### `svelte/animate`

`svelte/animate` 模块导出一个函数 与 svelte [animations](docs#Animations)一起使用。

#### `flip（翻转）`

```sv
animate:flip={params}
```

`flip` 函数计算标签的开始和结束位置并在它们之间进行动画效果，并翻转`x` 和 `y`的值，`flip`由 [初始, 最终, 翻转, Play（FLIP）](https://aerotwist.com/blog/flip-your-animations/)支持。
The `flip` function calculates the start and end position of an element and animates between them, translating the `x` and `y` values. `flip` stands for [First, Last, Invert, Play](https://aerotwist.com/blog/flip-your-animations/).

`flip` 接收以下参数：

* `delay` (`number`, 默认值 0) — 起始点（毫秒）
* `duration` (`number` | `function`, 默认值 `d => Math.sqrt(d) * 120`) — 细节参见下文。
* `easing` (`function`, 默认值 [`cubicOut`](docs#cubicOut)) — an [easing 函数](docs#svelte_easing)


`duration` 可接收参数：

- 一个`number`, 单位毫秒
- 一个函数，结构 `distance: number => duration: number`，接收标签将以像素为单位移动的距离，并以毫秒为单位返回持续时间。这使您可以分配一个持续时间，该持续时间与每个标签的移距离有关。

---

查看 [animations 教程](tutorial/animate)查看示例。


```html
<script>
	import { flip } from 'svelte/animate';
	import { quintOut } from 'svelte/easing';

	let list = [1, 2, 3];
</script>

{#each list as n (n)}
	<div animate:flip="{{delay: 250, duration: 250, easing: quintOut}}">
		{n}
	</div>
{/each}
```



### `svelte/easing`

Easing 函数可指定根据时间变化的速率，在使用Svelte的内置transition和animation以及tweened和spring程序时非常有用。  `svelte/easing` 包含31个导出命名，, 一个`linear（线性）`缓动使用`in`， `out` 和 `inOut`轻松生成10种不同的缓动函数：

你可以结合 [ease visualiser](examples#easing) 和 [examples section](examples)示例了解更多。


| 缓动样式 | in | out | inOut |
| --- | --- | --- | --- |
| **back** | `backIn` | `backOut` | `backInOut` |
| **bounce** | `bounceIn` | `bounceOut` | `bounceInOut` |
| **circ** | `circIn` | `circOut` | `circInOut` |
| **cubic** | `cubicIn` | `cubicOut` | `cubicInOut` |
| **elastic** | `elasticIn` | `elasticOut` | `elasticInOut` |
| **expo** | `expoIn` | `expoOut` | `expoInOut` |
| **quad** | `quadIn` | `quadOut` | `quadInOut` |
| **quart** | `quartIn` | `quartOut` | `quartInOut` |
| **quint** | `quintIn` | `quintOut` | `quintInOut` |
| **sine** | `sineIn` | `sineOut` | `sineInOut` |


### `svelte/register`

要在 Node.js 环境中使用 Svelte 组件无需捆绑，请使用`require('svelte/register')`。 之后，你可以使用 `require` 来包含任何`.svelte` 文件。

```js
require('svelte/register');

const App = require('./App.svelte').default;

...

const { html, css, head } = App.render({ answer: 42 });
```

> 为什么要加`.default` ，是因为我们正在将原生JavaScript模块转换为Node可以识别的CommonJS模块。请注意，如果您的组件导入了JavaScript模块， 则它们将无法在Node中加载，而你也需要使用捆绑器。

要设置编译选项或使用自定义文件扩展名，请调用`register` 作为钩子函数：

```js
require('svelte/register')({
  extensions: ['.customextension'], // 默认 ： ['.html', '.svelte']
	preserveComments: true
});
```


### 客户端 component API

#### 创建 component

```js
const component = new Component(options)
```

客户端 component 使用 `generate: 'dom'` (或 `generate` 选项不指定)编译的component是JavaScript类。

```js
import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		// 类似于 App.svelte 这样
		// `export let answer`:
		answer: 42
	}
});
```

可以提供以下初始化选项：

| 选项 | 默认值 | 描述 |
| --- | --- | --- |
| `target` | **none** | 指定`HTMLElement（HTML标签）` 来渲染。此选项是必需的。
| `anchor` | `null` | `target（目标）`子级之前即将渲染的component。
| `props` | `{}` | 提供给component的属性对象。
| `hydrate` | `false` | 见下文。
| `intro` | `false` | 如果为 `true`，在初始渲染时播放transition，而不是等待后续更改。

`target目标）`的现有子级留在他们所在的地方。


---

该`hydrate`选项指示Svelte更新现有DOM标签（通常从服务端渲染）而不是创建新标签。只有在使用[`hydratable: true` 选项](docs#svelte_compile)编译component时，它才起作用，也唯有使用编译component时，它才起作用。只有当服务器渲染代码也使用`hydratable: true`编译时，<head>标签的`hydrate`才起作用，这将为<head>中的每个标签添加一个标记，以便component知道它在`hydrate`过程中负责移除哪些标签。

仅当`target目标）`只有一个子级，其子级`hydrate: true`才会生效。因此，`anchor`不能与`hydrate: true`一起使用。

现有DOM不需要匹配component，Svelte会自动纠正它。

```js
import App from './App.svelte';

const app = new App({
	target: document.querySelector('#server-rendered-html'),
	hydrate: true
});
```

#### `$set`

```js
component.$set(props)
```

---

以编程方式在实例上设置 prop ， `component.$set({ x: 1 })` 等同于 `x = 1` 在`<script>` 块内。

调用此方法可调度下一个微任务的更新，但是DOM不会同步更新。

```js
component.$set({ answer: 42 });
```

#### `$on`

```js
component.$on(event, callback)
```

---

借用 `callback` ，可以使组件每当分派一个`event`时就调用该函数。

返回一个函数，该函数在调用时将删除事件侦听器。

```js
const off = app.$on('selected', event => {
	console.log(event.detail.selection);
});

off();
```

#### `$destroy`

```js
component.$destroy()
```

从DOM中删除component并触发所有` onDestroy` 处理程序。

#### Component props

```js
component.prop
```
```js
component.prop = value
```

---

如果设置`accessors: true`编译组件，则每实例将具有该component每个prop对应的getter 和 setter。设置值将导致同步更新，请勿使用`component.$set(...)`触发默认的异步更新。

默认情况下， `accessors` 为 `false`，除非你要将其作为自定义标签来编译。

```js
console.log(app.count);
app.count += 1;
```


### 自定义 element API

---

Svelte component也可以使用`customElement: true`来告诉编译器将component编译为自定义标签。使用`<svelte:options>` [标签](docs#svelte_options)为组件指定标签名。

```html
<svelte:options tag="my-element">

<script>
	export let name = 'world';
</script>

<h1>Hello {name}!</h1>
<slot></slot>
```

---

或者，使用`tag={null}` 指示自定义标签的使用者应为其命名。

```js
import MyElement from './MyElement.svelte';

customElements.define('my-element', MyElement);
```

---

定义自定义标签后，就可以将它作为常规DOM标签使用。

```js
document.body.innerHTML = `
	<my-element>
		<p>This is some slotted content</p>
	</my-element>
`;
```

---

默认情况下，自定义标签设置 `accessors: true`后，也就意味着将所有component的 [props](docs#Attributes_and_props) 属性暴露给 DOM 标签 (有时也可以将 readable/writable 作为作为属性)。

为防止这种情况，请添加 `accessors={false}` 到 `<svelte:options>`。

```js
const el = document.querySelector('my-element');

// get the current value of the 'name' prop
console.log(el.name);

// set a new value, updating the shadow DOM
el.name = 'everybody';
```

自定义标签将component打包在非Svelte应用中使用的最有效方法，因为自定义元素将与原生HTML 和 JavaScript以及[大部分框架](https://custom-elements-everywhere.com/)一同使用，但需要注意一些重要的差异：

* 样式是被 *encapsulated（封装）*的，而不仅仅是scoped（局部)范围内。这也就意味着任何非component样式（例如你可能在global.css中含有样式），都将不适用于自定义标签， 包括带有:global(...)修饰符的样式。
* 样式不是作为单独的.css文件提取出来的，而是作为JavaScript字符串内联到组件中的
* 自定义标签通常不适合服务端渲染，因为在加载JavaScript之前，shadow DOM是不可见的
* Svelte中， slotted（插值） 内容属于 *lazily*（懒）渲染。在DOM中，它是 *eagerly*（勤）渲染。换句话说，即使component的`<slot>`标签在`{#if ...}` 也始终创建它，同样，`<slot>` 在一个 `{#each ...}`块中包含不会导致分段显示的内容被多次渲染。
*  `let:` 指令将会报废。
* 需要Polyfills来支持较旧的浏览器



### 服务端 component API

```js
const result = Component.render(...)
```

---

与客户端 component 不同，服务端component在渲染后没有生命周期，它们的全部工作就是创建一些HTML 和 CSS。因此，API有所不同。

服务端component暴露一个`render` 方法作为可选方法调用。他返回一个具有`head`、 `html` 和 `css`属性的对象，其中`head`包含`<svelte:head>`标签中设置的所有内容。

你可以通过 [`svelte/register`](docs#svelte_register)导入Svelte component到Node.js。

```js
require('svelte/register');

const App = require('./App.svelte').default;

const { head, html, css } = App.render({
	answer: 42
});
```
