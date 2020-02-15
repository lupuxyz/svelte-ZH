---
title: Compile time
---

通常，您不会直接与Svelte编译器进行交互，而是使用捆绑程序插件将其集成到构建系统中

* 如果使用[Rollup](https://rollupjs.org)，请使用[rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte)。
* 如果使用[webpack](https://webpack.js.org)请使用[svelte-loader](https://github.com/sveltejs/svelte-loader)。
* 或者 [社区维护的 plugins](https://github.com/sveltejs/integrations#bundler-plugins)

尽管如此，了解打包器的用法还是很有用的，因为捆绑程序插件通常向您提供编译器选项。


### `svelte.compile`

```js
result: {
	js,
	css,
	ast,
	warnings,
	vars,
	stats
} = svelte.compile(source: string, options?: {...})
```

---

`svelte.compile` 施加魔法般获取component源代码，并将其转换为JavaScript模块来到出class。

```js
const svelte = require('svelte/compiler');

const result = svelte.compile(source, {
	// options
});
```

没有一个required，即可将以下选学校传递给编译器：

<!-- | 选项 | 类型 | 默认值
| --- | --- | --- |
| `filename` | string | `null`
| `name` | string | `"Component"`
| `format` | `"esm"` or `"cjs"` | `"esm"`
| `generate` | `"dom"` or `"ssr"` | `"dom"`
| `dev` | boolean | `false`
| `immutable` | boolean | `false`
| `hydratable` | boolean | `false`
| `legacy` | boolean | `false`
| `customElement` | boolean | `false`
| `tag` | string | null
| `accessors` | boolean | `false`
| `css` | boolean | `true`
| `loopGuardTimeout` | number | 0
| `preserveComments` | boolean | `false`
| `preserveWhitespace` | boolean | `false`
| `outputFilename` | string | `null`
| `cssOutputFilename` | string | `null`
| `sveltePath` | string | `"svelte"` -->

| 选项 | 默认 | 描述 |
| --- | --- | --- |
| `filename` | `null` | `string`， 用于调试提示和源映射。你的捆绑插件会自动进行设置。
| `name` | `"Component"` | `string` ，它设置为一个JavaScript类的名称（不过，如果它与作用域中的其他变量冲突，编译器将对它进行重命名）。它通常是从`filename`中推断出来的。 
| `format` | `"esm"` | 如果为`"esm"`，则创建一个带有`import` 和 `export`的JavaScript模块，如果是 `"cjs"`，创建一个带有`require` 和`module.exports`的CommonJS模块该模块在一些用于服务端渲染或测试的场景下很有用。
| `generate` | `"dom"` | 如果为 `"dom"`， 则Svelte会发出一个JavaScript 类来挂载到DOM。如果为`"ssr"`，Svelte 会用`render`方法发出一个适用于服务端渲染中对象，如果为 `false`，则无JavaScript 或 CSS 返回，只返回元数据。 
| `dev` | `false` | 如果为 `true`，则会将额外代码添加到组件中，这些代码在执行运行时检查并在开发过程中提供调试信息。
| `immutable` | `false` | 如果为`true`，则告诉编译器你保证不会后续改变任何对象。这使它在检查值是否已更改时不那么严格。
| `hydratable` | `false` | 如果为 `true`， 启用`hydrate: true` 运行时选项，运行component 升级现有 DOM，而不是从头开始创建新DOM。生成SSR代码时，这会向`<head>`标签添加标记，以便`hydration`知道要替换的元素。
| `legacy` | `false` | 如果为 `true`， 则生成可在IE9和IE10中使用的代码，不支持类似于`element.dataset`的这些代码。
| `accessors` | `false` | 如果为`true`，将为component的porp创建getter和setter。如果为 `false`， 则仅为只读导出值创建（即用`const`、 `class` 和 `function`声明的值）。如果编译的带有 `customElement: true` 选项则默认为 `true`。
| `customElement` | `false` | 如果为 `true`,告诉编译器生成自定义标签构造函数，而不是常规的 Svelte component。
| `tag` | `null` |  `string`，告诉编译器指定一个tag名作为自定义标签名，它必须含有且是一个小写连字字符串，类似于`"my-element"`。
| `css` | `true` | 如果是 `true`，样式将包含在JavaScript类中并在运行时注入。建议您将其设置为`false`，并使用静态生成的CSS，因为它会使JavaScript包更小以及性能会更好。
| `loopGuardTimeout` | 0 |  `number`， 告诉Svelte如果线程阻塞时长超过 `loopGuardTimeout`设置的时间时终止循环， 这对防止无限循环很有效。 **仅在`dev: true`情况下生效**
| `preserveComments` | `false` | 如果为 `true`，你的HTML注释将在服务端渲染中保留；当然默认情况下是会被删除。 
| `preserveWhitespace` | `false` | 如果为`true`，标签内的空格将会被保留，而不会被Svelte删除或折叠成单个空格。
| `outputFilename` | `null` |  `string`，用于你的 JavaScript 源映射。
| `cssOutputFilename` | `null` | `string` ，用于你的CSS 源映射。
| `sveltePath` | `"svelte"` | `svelte` 包位置，所有引入来自`svelte` 或 `svelte/[module]` 的路径都将被修改。


---

返回的`result`对象包含component的代码以及所使用的元数据字节。

```js
const {
	js,
	css,
	ast,
	warnings,
	vars,
	stats
} = svelte.compile(source);
```

* `js` 和 `css` 是具有以下属性的对象： 
	* `code` ：为JavaScript 字符串。
	* `map` ：是具有 `toString()` 和 `toUrl()` 的源映射方法。
* `ast` ：是用于表示component结构的抽象（abstract）语法树（syntax tree）。
* `warnings` 是在编译期间生成的警告对象的数组。每个警告都有几个属性：
	* `code`使用其来说明警告类别的字符串。
	* `message` 描述问题信息使其易于理解。
	* `start` 和`end`，，如果警告需要指定到特定位置，请使其为一个具备 `line`、 `column` 和 `character`属性的对象。
	* `frame`，如果含有，是用于标记代码行号突出有问题代码的字符串。Each
* `vars` 是一个component 声明数组， 例如 [eslint-plugin-svelte3](https://github.com/sveltejs/eslint-plugin-svelte3)般使用，每个变量都有几个属性：
	* `name` 顾名思义。
	* `export_name` 指定其值导出的名称（如果它需要导出） (除非已指定其`name` ，负责将使用 `export...as`导出其name)
	* `injected` 是 `true`，声明是由Svelte注入（true）还是由你编写的代码注入（false）。
	* `module` 为 `true` 且表示在脚本中声明`context="module"`。 
	* `mutated` 为 `true` 且将值的属性分配到component内部。
	* `reassigned` 为`true` 且表示重新分配值到component内部。
	* `referenced` 为 `true` 且表示值在声明之外使用值。
	* `writable` 为 `true` 如果值使用 `let` 或 `var` (不是 `const`、`class` 或 `function`)来声明。
* `stats` 是Svelte开发团队用来诊断编译器的对象，请保持其不做变动。



```js
compiled: {
	// `map` is a v3 sourcemap with toString()/toUrl() methods
	js: { code: string, map: {...} },
	css: { code: string, map: {...} },
	ast: {...}, // ESTree-like syntax tree for the component, including HTML, CSS and JS
	warnings: Array<{
		code: string,
		message: string,
		filename: string,
		pos: number,
		start: { line: number, column: number },
		end: { line: number, column: number },
		frame: string,
		toString: () => string
	}>,
	vars: Array<{
		name: string,
		export_name: string,
		injected: boolean,
		module: boolean,
		mutated: boolean,
		reassigned: boolean,
		referenced: boolean,
		writable: boolean
	}>,
	stats: {
		timings: { [label]: number }
	}
} = svelte.compile(source: string, options?: {...})
```



### `svelte.parse`

```js
ast: object = svelte.parse(
	source: string,
	options?: {
		filename?: string,
		customElement?: boolean
	}
)
```

---

该`parse` 解析一个 component，仅返回其抽象语法树。 与使用`generate: false` 选项进行编译不同，它不会对component进行任何验证或额外解析， 只会解析其自身。


```js
const svelte = require('svelte/compiler');

const ast = svelte.parse(source, { filename: 'App.svelte' });
```


### `svelte.preprocess`

```js
result: {
	code: string,
	dependencies: Array<string>
} = svelte.preprocess(
	source: string,
	preprocessors: Array<{
		markup?: (input: { content: string, filename: string }) => Promise<{
			code: string,
			dependencies?: Array<string>
		}>,
		script?: (input: { content: string, attributes: Record<string, string>, filename: string }) => Promise<{
			code: string,
			dependencies?: Array<string>
		}>,
		style?: (input: { content: string, attributes: Record<string, string>, filename: string }) => Promise<{
			code: string,
			dependencies?: Array<string>
		}>
	}>,
	options?: {
		filename?: string
	}
)
```

---

此 `preprocess` 函数为所有改动component源代码提供一个方便的钩子，例如，它可以用于将`<style lang="sass">`块转换为原生CSS。 

首个参数为component源代码，第二个参数为 *preprocessors* （预处理器）数组（如果仅有一个可为单个*preprocessors*），*preprocessors*对象可以使用 `markup`， `script` 和 `style` 作为可选函数。

各个 `markup`、`script`或 `style` 函数必须返回一个对象 (或以Promise 的 resolves来作为对象返回)和 `code` 属性来表示改动后的源代码， 以及一个`dependencies`数组（可选）。

该`markup` 将接收到 component 原文本，以及在第三个参数中指定了component的`filename`值对应的原文本。

> Preprocessor函数可能还会返回一个`map` 对象以及对应的`code`和`dependencies`， 其中 `map` 表示改动的源映射。在当前Svelte版本中，它将会被忽略， 但是将来的Svelte版本可能会考虑预处理器源映射。

```js
const svelte = require('svelte/compiler');

const { code } = svelte.preprocess(source, {
	markup: ({ content, filename }) => {
		return {
			code: content.replace(/foo/g, 'bar')
		};
	}
}, {
	filename: 'App.svelte'
});
```

---

该 `script` 和 `style`函数接收 `<script>` 和 `<style>` 标签内的内容。除了`filename`以外， 还可以获取标签的属性对象。

如果返回的是一个 `dependencies` 数组，它将被包含在结果对象中。 它使用类似于 [rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte) 来监听其他文件变更， 例如监听`<style>`标签中带有 `@import` 语句。

```js
const svelte = require('svelte/compiler');
const sass = require('node-sass');
const { dirname } = require('path');

const { code, dependencies } = svelte.preprocess(source, {
	style: async ({ content, attributes, filename }) => {
		// only process <style lang="sass">
		if (attributes.lang !== 'sass') return;

		const { css, stats } = await new Promise((resolve, reject) => sass.render({
			file: filename,
			data: content,
			includePaths: [
				dirname(filename),
			],
		}, (err, result) => {
			if (err) reject(err);
			else resolve(result);
		}));

		return {
			code: css.toString(),
			dependencies: stats.includedFiles
		};
	}
}, {
	filename: 'App.svelte'
});
```

---

多个 preprocessors 可以同时使用。第一个的输出成为第二个的输入。 `markup`函数首先运行， 然后运行 `script` 和 `style`。

```js
const svelte = require('svelte/compiler');

const { code } = svelte.preprocess(source, [
	{
		markup: () => {
			console.log('this runs first');
		},
		script: () => {
			console.log('this runs third');
		},
		style: () => {
			console.log('this runs fifth');
		}
	},
	{
		markup: () => {
			console.log('this runs second');
		},
		script: () => {
			console.log('this runs fourth');
		},
		style: () => {
			console.log('this runs sixth');
		}
	}
], {
	filename: 'App.svelte'
});
```


### `svelte.walk`

```js
walk(ast: Node, {
	enter(node: Node, parent: Node, prop: string, index: number)?: void,
	leave(node: Node, parent: Node, prop: string, index: number)?: void
})
```

---

该 `walk`函数提供一个方法，该方法使用编译器自身的内置[estree-walker](https://github.com/Rich-Harris/estree-walker)实例来遍历解析器生成的抽象语法树。


使用一个抽象语法树walker来遍历时，需传入一个带有两种可选方法的对象： `enter` 和 `leave`。其中`enter`会调用 (被parent包含)每个node。
除非在调用`enter`期间使用 `this.skip()`来跳过，否则每个node的子级都会被遍历到，继而再在node中调用`leave`。


```js
const svelte = require('svelte/compiler');
svelte.walk(ast, {
	enter(node, parent, prop, index) {
		do_something(node);
		if (should_skip_children(node)) {
			this.skip();
		}
	},
	leave(node, parent, prop, index) {
		do_something_else(node);
	}
});
```


### `svelte.VERSION`

---

请在package.json中设置以获得当前版本。

```js
const svelte = require('svelte/compiler');
console.log(`running svelte version ${svelte.VERSION}`);
```
