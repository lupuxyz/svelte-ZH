---
title:制作应用程序
---

本教程旨在使你熟悉编写组件的过程。但是有时，你希望在自己的代码编辑器中编写组件。

如何做呢？首先，你需要将Svelte与构建工具集成起来。这里有对于 [Rollup](https://rollupjs.org) 和 [webpack](https://webpack.js.org/)的官方插件：

* [rollup-plugin-svelte](https://github.com/sveltejs/rollup-plugin-svelte)
* [svelte-loader](https://github.com/sveltejs/svelte-loader)

...以及各种 [社区维护的项目插件](https://github.com/sveltejs/integrations#bundler-plugins)。

当然，如果您是Web开发的新手，并且以前没有使用过类似的工具，也不要担心。我们简单整理了一篇[面向新手开发者介绍 Svelte ](blog/svelte-for-new-developers)，希望对你有所帮助。

诚然，语法高亮对于编码来说非常重要，你可以[阅读本指南了解具体方法](blog/setting-up-your-editor)，了解如何让代码编辑器支持 `.svelte` 文件的语法高亮。

再者，一旦建立好了项目，使用Svelte组件就很容易了。 编译器将每个组件转换为常规的 JavaScript 类，你只需要将它引入并用`new`实例化即可：

```js
import App from './App.svelte';

const app = new App({
	target: document.body,
	props: {
		// we'll learn about props later
		answer: 42
	}
});
```

最后，你可以根据实际使用 [组件 API](docs#Client-side_component_API) 到你的`App`中。
