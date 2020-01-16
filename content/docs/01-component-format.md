---
title: Component 格式
---

---

Components 是Svelte构建程序的基础。`.svelte`文件使用超集将它们写入HTML文件中。

在`.svelte`文件中，这三个部分（ script, styles和元素标签）都是可选的。

```html
<script>
	//代码文件
</script>

<style>
	/* 样式文件*/
</style>

<!-- 此处一般放置元素标签（多个或者为空） -->
```

### &lt;script&gt;

`<script>` 块包含创建 component 实例时运行的JavaScript。从组件的标记“可见”在内部声明（或导入）的变量。还有四个附加规则：

##### 1. 使用`export` 创建 component prop 属性

---

Svelte 使用`export`关键字将变量声明标记为 *属性* 或 *prop*, 这意味着component 的使用者可以访问它 (更多详见 [prop属性部分](docs#Attributes_and_props) )。

```html
<script>
	export let foo;

	// 作为props传入的值
	// 是即时生效的
	console.log({ foo });
</script>
```

---

你可以指定一个默认值，如果component的使用者未指定prop属性值，则使用该默认值。

在开发模式中 (请参阅 [编译器选项](docs#svelte_compile))， 如果未提供默认值且使用者未指定值，则将打印警告。要避免此警告，请确保已指定默认值，即便它是 `undefined`。

```html
<script>
	export let bar = 'optional default value';
	export let baz = undefined;
</script>
```

---

如果将`const`、 `class` 或 `function`导出到component外部，那它们将会变成只读属性，然而只有函数表达式是有效的props。

```html
<script>
	// 这些是只读的
	export const thisIs = 'readonly';

	export function greet(name) {
		alert(`hello ${name}!`);
	}

	//这是一个prop
	export let format = n => n.toFixed(2);
</script>
```

---

你可以使用保留字作为 prop 名。

```html
<script>
	let className;

	// 创建“class”属性名
	// 即使它是保留字
	export { className as class };
</script>
```

##### 2. '反应性（reactive）' 分配

---

要更改component state并触发重新渲染，只需将其指定给本地声明的变量即可。

更新表达式 (`count += 1`) 和属性分配 (`obj.x = y`) 具有相同的效果。

由于Svelte的反应性是基于分配的，因此使用`.push()`和 `.splice()`和这样的数组方法不会自动触发更新。解决此问题的选项可以在 [此教程](tutorial/updating-arrays-and-objects)中找到。

```html
<script>
	let count = 0;

	function handleClick () {
		// 如果元素标签引用'count'
		// 调用此函数将触发更新
		count = count + 1;
	}
</script>
```

##### 3. `$:` 声明反应性

---

通过使用`$:` [JS label 语法](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/label)作为前缀。可以让任何位于 top-level 的语句（即不在块或函数内部）具有反应性。每当它们依赖的值发生更改时，它们都会在 component 更新之前立即运行。

```html
<script>
	export let title;

	// 这将在“title”的prop属性更改时
	// 更新“document.title”
	$: document.title = title;

	$: {
		console.log(`multiple statements can be combined`);
		console.log(`the current title is ${title}`);
	}
</script>
```

---

如果语句完全由未声明变量的赋值组成，则Svelte替你将 `let`插入声明。

```html
<script>
	export let num;

	// 我们不需要声明“squared”和“cubed”
	// — Svelte帮我们自动声明
	$: squared = num * num;
	$: cubed = squared * num;
</script>
```

##### 4. 用 `$`前缀来存储store值

---

 *store* 是一个对象，允许通过简单的值的反应性访问 *store contract*。该 [`svelte/store` 模块](docs#svelte_store) 包含满足此 contract 的最小store实现。

每当引用 store时，都可以通过在其前面加上`$`字符来访问其在component内部的值，这会使Svelte自动声明前缀变量，并设置将在适当时取消store subscription（订阅）。

以`$`为前缀的变量要求store变量值是可更改的，以确保 store的`.set` 方法是可调用的。

注意， 不能在“if”块或函数中，必须在component的顶层声明store，例如，局部变量（不包含store值) 一定不能带有`$`前缀。

```html
<script>
	import { writable } from 'svelte/store';

	const count = writable(0);
	console.log($count); // logs 0

	count.set(1);
	console.log($count); // logs 1

	$count = 2;
	console.log($count); // logs 2
</script>
```

##### Store contract

```js
store = { subscribe: (subscription: (value: any) => void) => () => void, set?: (value: any) => void }
```

你可以通过*store contract*来实现自己的store，而无需依赖 [`svelte/store`](docs#svelte_store)：

1. 一个store 必须包含一个 `.subscribe`方法，该方法必须接受subscription 函数作为其参数，在调用时，必须使用 store 当前值通过`.subscribe`方法来使用subscription 函数。每当store值更改时，都必须同步调用store的所有活动subscription 函数。
2. `.subscribe` 方法必须返回一个unsubscribe 函数。调用 unsubscribe 函数会停止subscription功能，并且subscription 函数不会再被store调用。
3. store 可以选择包含一个 `.set` 方法, 该方法必须接受store的新值作为其参数,，并且该方法将同步调用store的所有活动的 subscription 函数。 这样的 store调用了一个*可写 store*。

为了与RxJS Observables互操作， `.subscribe` 方法还允许该方法与`.unsubscribe`方法一起返回对象，而不是直接返回 unsubscription 函数。但是请注意，除非 `.subscribe`同步调用subscription（Observable规范不需要），否则Svelte会将存储的值视为“undefined”，直到它看到为止。 


### &lt;script context="module"&gt;

---

一个`<script>` 标签具有一个`context="module"`熟悉，在模块首次 evaluates 时运行一次，而不是针对每个组件实例运行一次。 此块中声明的值可以在常规的 `<script>`代码块中访问 (和 component 的标签)， 反之亦然。

你可以使用`export`绑定到该块，它们将作为已编译模块导出。

你不能使用 `export default`来绑定，因为组件本身就是默认导出（export default）。

> 带有 `module` 声明的 `<script>` 内代码不具有反应性。虽然变量自身会更新，但重新分配它们不会触发重新渲染，对于多个组件之间共享的值，请考虑使用 [store](https://svelte.dev/docs#svelte_store).

```html
<script context="module">
	let totalComponents = 0;

	// 此处允许执行import操作，例如
	// `import Example, { alertTotal } from './Example.svelte'`
	export function alertTotal() {
		alert(totalComponents);
	}
</script>

<script>
	totalComponents += 1;
	console.log(`total number of times this component has been created: ${totalComponents}`);
</script>
```


### &lt;style&gt;

---

`<style>` 标签块中的样式仅仅生效于component内部。

这是通过将一个class添加到受影响的标签而实现的,该class基于component样式(例如 `svelte-123xyz`)。

```html
<style>
	p {
		/* 这只会影响此组件中的<p>标签 */
		color: burlywood;
	}
</style>
```

---

你可以选择使用 `:global(...)` 修饰符来添加全局样式。

```html
<style>
	:global(body) {
		/* 这里样式全局应用于 <body>内都 */
		margin: 0;
	}

	div :global(strong) {
		/* 这里表示全局应用于被<div>包裹的<strong>标签 */
		color: goldenrod;
	}
</style>
```
