---
title: 模板语法
---


### 标签

---

小写标签诸如`<div>`之类，表示常规的HTML标签，大写标签例如 `<Widget>` 或 `<Namespace.Widget>`，表示这是一个 *component*。

```html
<script>
	import Widget from './Widget.svelte';
</script>

<div>
	<Widget/>
</div>
```


###  props 属性

---

默认情况下，属性的使用方式与HTML属性的使用方法一样。

```html
<div class="foo">
	<button disabled>can't touch this</button>
</div>
```

---
 也如HTML一样，属性值也可以去掉引号。

```html
<input type=checkbox>
```

---

属性值可以包含JavaScript表达式。

```html
<a href="page/{p}">page {p}</a>
```

---

或者其本身就是JavaScript表达式。

```html
<button disabled={!clickable}>...</button>
```

---

表达式可能会包含导致常规HTML语法高亮失效，使之不能正常显示语法高亮，因此有必要使用引号来避免此情况：

```html
<button disabled="{number !== 42}">...</button>
```

---

当出现属性名和值一样时 (`name={name}`)，可以简写为`{name}`。

```html
<!-- 两者是等价的 -->
<button disabled={disabled}>...</button>
<button {disabled}>...</button>
```

---

一般来说，传递到 components 内的值被称为 *properties* 或 *props* ，因此称之为props属性以便于区分：

与常规标签一样，`name={name}` 可以用 `{name}` 来简写。

```html
<Widget foo={bar} answer={42} text="hello"/>
```

---

*Spread 属性* 允许将多个或单个属性一同传递到标签或component。

标签或component允许使用多个 spread 属性，或者和常规属性一同使用。

```html
<Widget {...things}/>
```

---

*`$$props`* 可以传递所有 props 属性到一个 component 中，包含未使用`export`声明的  props 属性。它在特殊情况下很有用，但通常不推荐使用，因为Svelte难以优化。

```html
<Widget {...$$props}/>
```


### 文本表达式

```sv
{expression}
```

---

文本内还可以穿插 JavaScript 表达式：

```html
<h1>Hello {name}!</h1>
<p>{a} + {b} = {a + b}.</p>
```


### 注释

---

你可以在 components 内部使用 HTML注释。

```html
<!-- 这是一句注释！ -->
<h1>Hello world</h1>
```

---

以 `svelte-ignore` 开始的内容会被注释掉，直到位于注释闭合标签结束注释。 一般来说，被注释的内容包含accessibility（a11y，一些对提高可访问性有帮助的信息）信息，所以请在有充足理由时才使用它。

```html
<!-- svelte-ignore a11y-autofocus -->
<input bind:value={name} autofocus>
```


### {#if ...} 条件渲染

```sv
{#if expression}...{/if}
```
```sv
{#if expression}...{:else if expression}...{/if}
```
```sv
{#if expression}...{:else}...{/if}
```

---

使用 if 块包含条件渲染内容。

```html
{#if answer === 42}
	<p>what was the question?</p>
{/if}
```

---

可以使用 `{:else if expression}`添加更多条件，使用 `{:else}` 作为最后条件。

```html
{#if porridge.temperature > 100}
	<p>too hot!</p>
{:else if 80 > porridge.temperature}
	<p>too cold!</p>
{:else}
	<p>just right!</p>
{/if}
```


### {#each ...} 列表渲染

```sv
{#each expression as name}...{/each}
```
```sv
{#each expression as name, index}...{/each}
```
```sv
{#each expression as name, index (key)}...{/each}
```
```sv
{#each expression as name}...{:else}...{/each}
```

---

可以使用 each  块对值列表进行遍历。

```html
<h1>Shopping list</h1>
<ul>
	{#each items as item}
		<li>{item.name} x {item.qty}</li>
	{/each}
</ul>
```

你可以使用 each 块来遍历任何数组或类似数组的值，即具有`length` 属性的任何对象。

---

每个 each 还可以指定一个 *index* 作为索引， 该 index 会成为 `array.map(...)` 回调的第二参数：

```html
{#each items as item, i}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

---

如果一个 *key（键）* 是一个表达式，必须确保它其具有唯一性，能标识在列表内的每一个列表项，以便 Svelte 在列表中任意位置改变数据，而不是仅在数据末尾新增或删除。key 可以是任何对象，但是建议使用字符串和数字，因为它们允许在对象本身更改时保留身份。

```html
{#each items as item, i (item.id)}
	<li>{i + 1}: {item.name} x {item.qty}</li>
{/each}
```

---

你也可以在 each 块中任意的使用解构和遍历。

```html
{#each items as { id, name, qty }, i (id)}
	<li>{i + 1}: {name} x {qty}</li>
{/each}

{#each objects as { id, ...rest }}
	<li><span>{id}</span><MyComponent {...rest}/></li>
{/each}

{#each items as [id, ...rest]}
	<li><span>{id}</span><MyComponent values={rest}/></li>
{/each}
```

---

 each 还可以使用 `{:else}`子句，如果列表为空，则显示{:else} 条件下内容。

```html
{#each todos as todo}
	<p>{todo.text}</p>
{:else}
	<p>No tasks today!</p>
{/each}
```


### {#await ...} 异步渲染

```sv
{#await expression}...{:then name}...{:catch name}...{/await}
```
```sv
{#await expression}...{:then name}...{/await}
```
```sv
{#await expression then name}...{/await}
```

---

借助 Await 块，你可以使用表示 Promise 状态的三个分支 pending、 fulfilled 和 rejected。

```html
{#await promise}
	<!-- promise 状态是“未决” -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise 状态是 “完成” -->
	<p>The value is {value}</p>
{:catch error}
	<!-- promise 状态是“被拒绝” -->
	<p>Something went wrong: {error.message}</p>
{/await}
```

---

`catch` 块表示你在请求被拒绝时需要渲染的内容，没有则可忽略该块。

```html
{#await promise}
	<!-- promise 状态是“未决” -->
	<p>waiting for the promise to resolve...</p>
{:then value}
	<!-- promise 状态是 “完成” -->
	<p>The value is {value}</p>
{/await}
```

---

如果你不关心“未决”状态，也可以省略该块。

```html
{#await promise then value}
	<p>The value is {value}</p>
{/await}
```


### {@html ...} HTML内容插入

```sv
{@html expression}
```

---

在文本表达式中，诸如`<` 和 `>` 都将被转义，但HTML表达式不会。

HTML表达式应该是有效且完整的，`{@html "<div>"}content{@html "</div>"}` 将不会生效，因为 `</div>` 是无效的HTML标签。

> Svelte不会在注入HTML之前转义表达式。如果数据来源不受信任，则必须对其进行转义，否则将用户暴露于XSS漏洞之中。

```html
<div class="blog-post">
	<h1>{post.title}</h1>
	{@html post.content}
</div>
```


### {@debug ...} 调试模式

```sv
{@debug}
```
```sv
{@debug var1, var2, ..., varN}
```

---

可与使用 `{@debug ...}` 替换 `console.log(...)` 来使用。每当指定变量的值更改时，它都会记录这些变量的值，如果您打开了devtools，则会在`{@debug ...}` 语句位置 暂停代码执行。

它接受单个变量名：

```html
<script>
	let user = {
		firstname: 'Ada',
		lastname: 'Lovelace'
	};
</script>

{@debug user}

<h1>Hello {user.firstname}!</h1>
```

---

或被 comma-separated (逗号分隔的)的多个变量名（表达式除外）。

```html
<!-- 编译-->
{@debug user}
{@debug user1, user2, user3}

<!-- 不被编译 -->
{@debug user.firstname}
{@debug myArray[0]}
{@debug !isReady}
{@debug typeof user === 'object'}
```

`{@debug}`标签在没有任何参数时将会插入一条 `debugger` 语句，该语句在任何状态（state ）发生变化时都会被触发，这与指定变量名时恰恰相反。



### 标签指令

除了属性之外，标签还可以具有指令，它们以某种方式控制标签的行为。


#### [on:*事件名*](on_element_event)

```sv
on:eventname={handler}
```
```sv
on:eventname|modifiers={handler}
```

---

使用 `on:`指令来监听DOM事件。

```html
<script>
	let count = 0;

	function handleClick(event) {
		count += 1;
	}
</script>

<button on:click={handleClick}>
	count: {count}
</button>
```

---

可以内联声明处理程序，而不会降低性能。与属性一样，为了语法突出显示，可以为指令值加上引号。

```html
<button on:click="{() => count += 1}">
	count: {count}
</button>
```

---

使用 `|`字符为DOM事件添加修饰符。

```html
<form on:submit|preventDefault={handleSubmit}>
	<!-- the `submit` event's default is prevented,
	     so the page won't reload -->
</form>
```

可以使用的修饰符有：

* `preventDefault` ：在程序运行之前调用 `event.preventDefault()` 
* `stopPropagation` ：调用 `event.stopPropagation()`, 防止事件到达下一个标签
* `passive` ：改善了 touch/wheel 事件的滚动表现（Svelte会在合适的地方自动加上它）
* `capture`：表示在 *capture*阶段而不是*bubbling*触发其程序
* `once` ：程序运行一次后删除自身

修饰符可以串联在一起，比如`on:click|once|capture={...}`。

---

如果所使用的 `on:` 指令事件没有指定具体值，则表示 component 将会负责转发事件，这意味着组件的使用者可以侦听该事件。

```html
<button on:click>
	The component itself will emit the click event
</button>
```

---

同一事件可以有多个事件侦听器：

```html
<script>
	let counter = 0;
	function increment() {
		counter = counter + 1;
	}

	function track(event) {
		trackEvent(event)
	}
</script>

<button on:click={increment} on:click={track}>Click me!</button>
```

#### [bind:*属性*](bind_element_property)

```sv
bind:property={variable}
```

---

数据通常从父级流到子级。 `bind:` 指令允许另一种方式存在，即从子对象流向父对象，在大多数情况下用于绑定特殊标签。

最常见的绑定反映其属性的值，例如 `input.value`。

```html
<input bind:value={name}>
<textarea bind:value={text}></textarea>

<input type="checkbox" bind:checked={yes}>
```

---

如果名称与值相同，则可以使用简写形式。

```html
<!-- These are equivalent -->
<input bind:value={value}>
<input bind:value>
```

---

input框声明值类型为数字时， `input.value` 即使在DOM中键入的值时字符串， Svelte也会视其为数字， 如果输入的值为空或者是无效的值， (对于`type="number"`而言)，其值将会为 `undefined`。

```html
<input type="number" bind:value={num}>
<input type="range" bind:value={num}>
```


##### Binding `<select>` value

---

`<select>` 绑定值对应的所选择项 `<option>`的`value`，值可以是任何类型（一般在DOM中不仅是字符串类型）。

```html
<select bind:value={selected}>
	<option value={a}>a</option>
	<option value={b}>b</option>
	<option value={c}>c</option>
</select>
```

---

`<select multiple>` 标签类似于一个 checkbox 组。

```html
<select multiple bind:value={fillings}>
	<option value="Rice">Rice</option>
	<option value="Beans">Beans</option>
	<option value="Cheese">Cheese</option>
	<option value="Guac (extra)">Guac (extra)</option>
</select>
```

---

当值与所属 `<option>` 文本内容相同时，可以不写其属性。

```html
<select multiple bind:value={fillings}>
	<option>Rice</option>
	<option>Beans</option>
	<option>Cheese</option>
	<option>Guac (extra)</option>
</select>
```

---

含有 `contenteditable`属性的标签支持 `innerHTML` 属性和 `textContent` 属性绑定。

```html
<div contenteditable="true" bind:innerHTML={html}></div>
```

##### 媒体标签绑定

---

媒体标签 (`<audio>` 和 `<video>`) 也有一组绑定属性。
其中 6 个只读属性：

* `duration` (readonly) ：表示视频的总时长，以秒为单位。
* `buffered` (readonly) ：数组，包含`{start, end}` 对象。
* `seekable` (readonly) ：同上。
* `played` (readonly) ：同上。
* `seeking` (readonly) ：布尔值。
* `ended` (readonly)  ：布尔值。


以及四个双向绑定：

* `currentTime` ：视频中的当前点，以秒为单位。
* `playbackRate` ：播放视频的倍速，  `1` 为 '正常'。
* `paused` ：暂停。
* `volume` ：音量，0到1之间的值。

`<video>` 标签较之还有多出了只读属性`videoWidth`和`videoHeight`的属性。

```html
<video
	src={clip}
	bind:duration
	bind:buffered
	bind:seekable
	bind:seeking
	bind:played
	bind:ended
	bind:currentTime
	bind:paused
	bind:volume
	bind:videoWidth
	bind:videoHeight
></video>
```

##### 块级标签绑定

---

块级元素具有4个只读属性的绑定，使用[像这样](http://www.backalleycoder.com/2013/03/18/cross-browser-event-based-element-resize-detection/) 的方法进行尺寸监听：

* `clientWidth`
* `clientHeight`
* `offsetWidth`
* `offsetHeight`

```html
<div
	bind:offsetWidth={width}
	bind:offsetHeight={height}
>
	<Chart {width} {height}/>
</div>
```

#### 组绑定

```sv
bind:group={variable}
```

---

多个input值可以使用`bind:group`进行绑定。

```html
<script>
	let tortilla = 'Plain';
	let fillings = [];
</script>

<!-- radio inputs 是互斥的 -->
<input type="radio" bind:group={tortilla} value="Plain">
<input type="radio" bind:group={tortilla} value="Whole wheat">
<input type="radio" bind:group={tortilla} value="Spinach">

<!-- checkbox inputs 键入的值将会填入其数组 -->
<input type="checkbox" bind:group={fillings} value="Rice">
<input type="checkbox" bind:group={fillings} value="Beans">
<input type="checkbox" bind:group={fillings} value="Cheese">
<input type="checkbox" bind:group={fillings} value="Guac (extra)">
```

#### [bind:this](bind_element)

```sv
bind:this={dom_node}
```

---

针对传统的DOM节点，请使用 `bind:this`来绑定：

```html
<script>
	import { onMount } from 'svelte';

	let canvasElement;

	onMount(() => {
		const ctx = canvasElement.getContext('2d');
		drawStuff(ctx);
	});
</script>

<canvas bind:this={canvasElement}></canvas>
```


#### class:*name*

```sv
class:name={value}
```
```sv
class:name
```

---

`class:` 指令可以以其简写形式绑定其标签的class。

```html
<!-- 它们是等价的 -->
<div class="{active ? 'active' : ''}">...</div>
<div class:active={active}>...</div>

<!-- 简写 -->
<div class:active>...</div>

<!-- 可以包含多个class状态 -->
<div class:active class:inactive={!active} class:isAdmin>...</div>
```


#### use *action*

```sv
use:action
```
```sv
use:action={parameters}
```

```js
action = (node: HTMLElement, parameters: any) => {
	update?: (parameters: any) => void,
	destroy?: () => void
}
```

---

Action 作为一个方法用于标签被创建时调用。调用`destroy`函数返回表示标签被销毁。

```html
<script>
	function foo(node) {
		// node已挂载在DOM中

		return {
			destroy() {
				// node已从DOM中移除
			}
		};
	}
</script>

<div use:foo></div>
```

---

 Action 可以含有参数。如果返回的值含有`update` 方法， 在对 Svelte 标记的内容更新之后，只要`update`指定的参数发生变更，它都会立即应用变更。

> 不必担心为每个componet实例重新声明foo函数，Svelte会自动提升所有compoent definition内不依赖于局部状态（local state）的函数的作用范围。

```html
<script>
	export let bar;

	function foo(node, bar) {
		// node已挂载在DOM中

		return {
			update(bar) {
				// `bar` 已发生变更
			},

			destroy() {
				// node已从DOM中移除
			}
		};
	}
</script>

<div use:foo={bar}></div>
```


#### transition:*fn*

```sv
transition:fn
```
```sv
transition:fn={params}
```
```sv
transition:fn|local
```
```sv
transition:fn|local={params}
```


```js
transition = (node: HTMLElement, params: any) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

---

Transition的触发条件：状态更改、元素进入或离开DOM。

*临时(outroing)*块中的标签会一直保留在DOM中，直到当前所有transitions完成为止。

该`transition:` 指令支持 *双向(bidirectional)* 切换， 这意味着 transition 过程中可以支持逆转。(例如显示与隐藏的双向切换)

```html
{#if visible}
	<div transition:fade>
		fades in and out
	</div>
{/if}
```

> 默认情况下，component 在首次渲染时不会播放 transitions。你可以在[创建 component](docs#Client-side_component_API)时设置`intro: true` 来更改此行为。 

##### Transition 参数

---

像actions一样，transitions 可以带有参数。

(这里的两层花括号 `{{curlies}}`并非特殊语法，这是表达式标记内的对象字面量（object literal）。

```html
{#if visible}
	<div transition:fade="{{ duration: 2000 }}">
		flies in, fades out over two seconds
	</div>
{/if}
```

##### 自定义 transition 函数

---

Transitions 可以试用自定义函数。如果返回的对象具有 `css` 函数，Svelte将创建一个在标签上播放的CSS动画。

 `t`参数传递给`css`，取值范围是`0`到`1`，继而应用到easing函数。*入（In）* transitions 运行是 `0` 到 `1`， *出（out）* transitions运行是 `1` 到 `0`。 换句话说， `1` 表示标签的基础状态，好像没有transition一般。`u` 参数取值范围 `1 - t`。

该函数在transition开始之前,以不同`t` 和 `u`的参数重复调用。


```html
<script>
	import { elasticOut } from 'svelte/easing';

	export let visible;

	function whoosh(node, params) {
		const existingTransform = getComputedStyle(node).transform.replace('none', '');

		return {
			delay: params.delay || 0,
			duration: params.duration || 400,
			easing: params.easing || elasticOut,
			css: (t, u) => `transform: ${existingTransform} scale(${t})`
		};
	}
</script>

{#if visible}
	<div in:whoosh>
		whooshes in
	</div>
{/if}
```

---

自定义 transition 函数还可以返回一个名为`tick`的函数，该函数在transition过程中调用同样的`t` 和 `u` 的参数。

> 如果可以，务必使用 `css` 代替 `tick`，因为 CSS 动画可以在主线程上运行，从而防止运行在性能较差的的设备上出现混乱。

```html
<script>
	export let visible = false;

	function typewriter(node, { speed = 50 }) {
		const valid = (
			node.childNodes.length === 1 &&
			node.childNodes[0].nodeType === 3
		);

		if (!valid) return {};

		const text = node.textContent;
		const duration = text.length * speed;

		return {
			duration,
			tick: (t, u) => {
				const i = ~~(text.length * t);
				node.textContent = text.slice(0, i);
			}
		};
	}
</script>

{#if visible}
	<p in:typewriter="{{ speed: 20 }}">
		The quick brown fox jumps over the lazy dog
	</p>
{/if}
```

如果 transition 返回的是一个方法而不是一个 transition 对象，则该函数将在下一个微任务中调用。这样可以协调多个 transitions。 使 [淡入淡出效果](tutorial/deferred-transitions) 成为可能。


##### Transition 事件

---

除了所有标准DOM事件外，具有transitions功能的标签还可以调用以下事件：

* `introstart`
* `introend`
* `outrostart`
* `outroend`

```html
{#if visible}
	<p
		transition:fly="{{ y: 200, duration: 2000 }}"
		on:introstart="{() => status = 'intro started'}"
		on:outrostart="{() => status = 'outro started'}"
		on:introend="{() => status = 'intro ended'}"
		on:outroend="{() => status = 'outro ended'}"
	>
		Flies in and out
	</p>
{/if}
```

---

局部 transitions 仅在创建或销毁它们所属的块时播放，而创建或销毁其父级时不会。

```html
{#if x}
	{#if y}
		<p transition:fade>
			fades in and out when x or y change
		</p>

		<p transition:fade|local>
			fades in and out only when y changes
		</p>
	{/if}
{/if}
```


#### in:*fn*/out:*fn*

```sv
in:fn
```
```sv
in:fn={params}
```
```sv
in:fn|local
```
```sv
in:fn|local={params}
```

```sv
out:fn
```
```sv
out:fn={params}
```
```sv
out:fn|local
```
```sv
out:fn|local={params}
```

---

与`transition:`类似，但仅适用于进入 (`in:`) 或离开 (`out:`) DOM标签。

与使用transition:不同，使用in:和out:应用的转换不是双向的，就算在过渡期间块超出范围，in的过渡效果也会继续“播放”对立的out过渡效果，而不是反转。如果out过渡效果中止，过渡将从头开始。


```html
{#if visible}
	<div in:fly out:fade>
		flies in, fades out
	</div>
{/if}
```



#### animate:*fn*

```sv
animate:name
```

```sv
animate:name={params}
```

```js
animation = (node: HTMLElement, { from: DOMRect, to: DOMRect } , params: any) => {
	delay?: number,
	duration?: number,
	easing?: (t: number) => number,
	css?: (t: number, u: number) => string,
	tick?: (t: number, u: number) => void
}
```

```js
DOMRect {
	bottom: number,
	height: number,
	​​left: number,
	right: number,
	​top: number,
	width: number,
	x: number,
	y: number
}
```

---

动画触发在当内容[ each 块](docs#each)重新遍历时。当标签被移除时不会运行动画。只有在重新遍历each块的数据时才运行。 Animate 指令必须放在当前 each 块的子项的标签上。

动画可以与Svelte的[内置动画函数](docs#svelte_animate) 或 [自定义动画函数](docs#Custom_animation_functions)一起使用。

```html
<!-- 当`list`重新遍历时，动画将运行-->
{#each list as item, index (item)}
	<li animate:flip>{item}</li>
{/each}
```

##### Animation 参数

---

与 actions 和 transitions一样，动画同样具有参数。

(这里的两层花括号 `{{curlies}}`并非特殊语法，这是表达式标记内的对象字面量（object literal）。

```html
{#each list as item, index (item)}
	<li animate:flip="{{ delay: 500 }}">{item}</li>
{/each}
```

##### 自定义animation函数

---

动画可以使用“node”、 `animation` 对象和任何 `paramaters`作为参数来定义自定义函数。该 `animation` 是一个对象包含`from` 和`to`属性，每个属性都包含一个 [DOMRect](https://developer.mozilla.org/en-US/docs/Web/API/DOMRect#Properties)用于描述标签的块状 `start` 和 `end` 位置。`from` 属性是标签的DOMRect对象的起始位置 `to` 属性是标签经列表遍历和DOM渲染完成后的DOMRect对象的结束位置。

如果返回对象具有 `css` 方法， Svelte 将创建 CSS 动画在标签上播放。

此`t` 参数传递到 `css` 方法并以 `0` 和 `1` 为值的形式应用给 `easing` 函数。 `u` 的参数取值范围： `1 - t`。

该函数在动画开始之前,以不同`t` 和 `u`的参数重复调用。


```html
<script>
	import { cubicOut } from 'svelte/easing';

	function whizz(node, { from, to }, params) {

		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
			delay: 0,
			duration: Math.sqrt(d) * 120,
			easing: cubicOut,
			css: (t, u) =>
				`transform: translate(${u * dx}px, ${u * dy}px) rotate(${t*360}deg);`
		};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```

---


自定义animation函数还可以返回一个名为`tick`的函数，该函数在动画过程中调用同样的`t` 和 `u` 的参数。

> 如果可以，务必使用 `css` 代替 `tick`，因为 CSS 动画可以在主线程上运行，从而防止运行在性能较差的的设备上出现混乱。


```html
<script>
	import { cubicOut } from 'svelte/easing';

	function whizz(node, { from, to }, params) {

		const dx = from.left - to.left;
		const dy = from.top - to.top;

		const d = Math.sqrt(dx * dx + dy * dy);

		return {
		delay: 0,
		duration: Math.sqrt(d) * 120,
		easing: cubicOut,
		tick: (t, u) =>
			Object.assign(node.style, {
				color: t > 0.5 ? 'Pink' : 'Blue'
			});
	};
	}
</script>

{#each list as item, index (item)}
	<div animate:whizz>{item}</div>
{/each}
```

### Component 指令

#### [on:*event名称*](on_component_event)

```sv
on:eventname={handler}
```

---

Components 可以使用 [createEventDispatcher](docs#createEventDispatcher)来发出事件，或者进行DOM事件转发。监听component事件看来和监听DOM事件相同。

```html
<SomeComponent on:whatever={handler}/>
```

---

与DOM事件一样，如果该指令`on:`不带有值，则component会转发外部事件，也就意味着component的使用者可以监听它。

```html
<SomeComponent on:whatever/>
```


#### [bind:*property*](bind_component_property)

```sv
bind:property={variable}
```

---

你可以使用与标签相同的语法绑定到component props。

```html
<Keypad bind:value={pin}/>
```

#### [bind:this](bind_component)

```sv
bind:this={component_instance}
```

---

Components 还支持 `bind:this`，允许你编程操作component实例进行交互。

> 注意不要使用`{cart.empty}`这样的实行， 因为`cart` 值是`undefined`，将在首次渲染button 时报错。

```html
<ShoppingCart bind:this={cart}/>

<button on:click={() => cart.empty()}>
	Empty shopping cart
</button>
```



### `<slot> 组件插值`

```sv
<slot><!-- 可选回调 --></slot>
```
```sv
<slot name="x"><!-- 可选回调 --></slot>
```
```sv
<slot prop={value}></slot>
```

---

Components 可以和标签一样含有子内容。

Component内使用`<slot>`标签将component内内容暴露给外部，该标签内的内容将作为默认内容暴露给外部。

```html
<!-- App.svelte -->
<Widget></Widget>

<Widget>
	<p>本段文本将会替代slot标签内的默认内容。</p>
</Widget>

<!-- Widget.svelte -->
<div>
	<slot>
	默认内容，component外部没有内容传入时显示本段文本。
	</slot>
</div>
```

#### [`<slot name="`*name*`">`](slot_name)

---

给slot命名可以将外部内容指定给特定区域，component内部命名未被指定的内容将会作为默认内容暴露。

```html
<!-- App.svelte -->
<Widget>
	<h1 slot="header">Hello</h1>
	<p slot="footer">Copyright (c) 2019 Svelte Industries</p>
</Widget>

<!-- Widget.svelte -->
<div>
	<slot name="header">No header was provided</slot>
	<p>Some content between header and footer</p>
	<slot name="footer"></slot>
</div>
```

#### [`<slot let:`*name*`={`*value*`}>`](slot_let)

---

Slot可以零次或多次渲染，并且可以通过prop属性将值传回父级,父级使用`let:`指令将值暴露到slot模板。

通常适用的速记规则：`let:item` 等效于`let:item={item}`，并且 `<slot {item}>` 等效于`<slot item={item}>`。

```html
<!-- App.svelte -->
<FancyList {items} let:item={item}>
	<div>{item.text}</div>
</FancyList>

<!-- FancyList.svelte -->
<ul>
	{#each items as item}
		<li class="fancy">
			<slot item={item}></slot>
		</li>
	{/each}
</ul>
```

---

命名的slot也可以暴露值。该 `let:`指令位于具有slot属性的标签上。


```html
<!-- App.svelte -->
<FancyList {items}>
	<div slot="item" let:item={item}>{item.text}</div>
	<p slot="footer">Copyright (c) 2019 Svelte Industries</p>
</FancyList>

<!-- FancyList.svelte -->
<ul>
	{#each items as item}
		<li class="fancy">
			<slot name="item" item={item}></slot>
		</li>
	{/each}
</ul>

<slot name="footer"></slot>
```


### `<svelte:self>`

---

`<svelte:self>`标签允许component递归自身。 

它不能出现在标签的顶层；它必须在if或each块内，以防止死循环。

```html
<script>
	export let count;
</script>

{#if count > 0}
	<p>counting down... {count}</p>
	<svelte:self count="{count - 1}"/>
{:else}
	<p>lift-off!</p>
{/if}
```

### `<svelte:component>`

```sv
<svelte:component this={expression}/>
```

---

`<svelte:component>` 标签动态渲染component，被指定的 component 具有一个 `this` 属性。每当标签上的属性发生变化，该 component 将会销毁并重新创建渲染。

如果`this` 指向的值为`false`则不会呈现任何内容。

```html
<svelte:component this={currentSelection.component} foo={bar}/>
```


### `<svelte:window>`

```sv
<svelte:window on:event={handler}/>
```
```sv
<svelte:window bind:prop={value}/>
```

---

 `<svelte:window>` 标签允许你添加事件监听到`window` 对象，从而不用担心移除它时component 被毁，或者在服务端渲染时检查是否存在于 `window`。

```html
<script>
	function handleKeydown(event) {
		alert(`pressed the ${event.key} key`);
	}
</script>

<svelte:window on:keydown={handleKeydown}/>
```

---

您还可以绑定以下属性：

* `innerWidth`
* `innerHeight`
* `outerWidth`
* `outerHeight`
* `scrollX`
* `scrollY`
* `online` —  window.navigator.onLine的别名

除了 `scrollX` 和 `scrollY` 是只读的。

```html
<svelte:window bind:scrollY={y}/>
```


### `<svelte:body>`

```sv
<svelte:body on:event={handler}/>
```

---

和`<svelte:window>`相同，你可以通过本标签添加监听事件到 `document.body`中，例如`mouseenter` 和 `mouseleave` 并且不会触发`window`。

```html
<svelte:body
	on:mouseenter={handleMouseenter}
	on:mouseleave={handleMouseleave}
/>
```


### `<svelte:head>`

```sv
<svelte:head>...</svelte:head>
```

---

通过该标签可以将元素插入到`document.head`中。在服务端渲染时， 内容将插入到`html`的`head`中。

```html
<svelte:head>
	<link rel="stylesheet" href="tutorial/dark-theme.css">
</svelte:head>
```


### `<svelte:options>`

```sv
<svelte:options option={value}/>
```

---

`<svelte:options>` 标签为component 提供编译器选项，有关详细信息请参见 [compiler section](docs#svelte_compile)。可选的选项有： 

* `immutable={true}` — 你从不使用可变数据，因此编译器可简易相等性检查以确定值是否变更。
* `immutable={false}` — 默认选项。Svelte对于可变对象的值更改的处理会趋向保守。
* `accessors={true}` — 给 component 的 prop 添加getter和setter。
* `accessors={false}` — 默认。
* `namespace="..."` — 让component的使用名称空间，最常见的是"svg"。
* `tag="..."` — 将此组件编译为自定义标签时使用的名称。

```html
<svelte:options tag="my-custom-element"/>
```
