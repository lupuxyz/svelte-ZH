---
title: 快速开始使用 Svelte
description: 这仅需一分钟
author: Rich Harris
authorURL: https://twitter.com/Rich_Harris
---

Svelte 是一个年轻的、现代的 [框架](/blog/frameworks-without-the-framework)。而不是像库一样在页面添加 `<script src='svelte.js'>` 标签，或者是通过`import` 或 `require`引入程序，Svelte只负责在幕后编译，从而将你的组件高效的优化为JavaScript。

因为是一个年轻的框架，所以你一开始使用它可能毫无头绪，你可能会问：我该如何上手Svelte？


## 1.学会使用REPL

 [Svelte REPL](repl) 是尝试Svelte最简单的办法。您可以从示例列表中进行选择一个来入门，并对其进行修改，直到它们执行你想要的操作为止。

<aside><p>你需要知道 <a href="https://nodejs.org/">Node.js</a> 安装使用,并且知道如何使用terminal（终端）。</p></aside>

很多时候 REPL的功能并不能满足你的需求，点击 **此处下载** 按钮你将会获得一个 `svelte-app.zip` 文件到你的电脑。

解压并打开 terminal 并设置项目：

```bash
cd /path/to/svelte-app
npm install
```

然后启动开发服务器：

```bash
npm run dev
```

浏览器访问 [localhost:5000](http://localhost:5000) 查看为你提供的应用程序，每次文件的修改 [Rollup](https://rollupjs.org) 都将对`svelte-app/src`内的文件进行重建。


## 2. 使用 degit

当你从 REPL 下载文件时，你会获得一个自定义版本的 [sveltejs/template](https://github.com/sveltejs/template) repo。你也可以使用[degit](https://github.com/Rich-Harris/degit)脚手架来获得该文件。

在 terminal（终端）中，你也可以像这样来创建项目： 

```bash
npx degit sveltejs/template my-svelte-project
cd my-svelte-project
npm install
npm run dev
```

这将在`my-svelte-project`创建以`sveltejs/template`为基础的项目，安装依赖项并在 http://localhost:5000中运行。

稍作更改后你就可以知道如何根据 [sveltejs/template](https://github.com/sveltejs/template)开始创建派生项目：

```bash
npx degit your-name/template my-new-project
```

就是如此！ 请执行 `npm run build` 来构建应用程序到生产环境，并检查template项目的[README](https://github.com/sveltejs/template/blob/master/README.md) 以获得更多诸如使用 [Now](https://zeit.co/now) 和 [Surge](http://surge.sh/)来部署的说明。

如果你不想使用 Rollup ，还可以选择 [webpack](https://github.com/sveltejs/svelte-loader)， [Browserify](https://github.com/tehshrike/sveltify) 作为构建工具， 或者使用[Svelte CLI](https://github.com/sveltejs/svelte-cli) (从2019年更新后：Svelte 3不建议现在在模板中使用 [sirv-cli](https://www.npmjs.com/package/sirv-cli) ，此CLI现已弃用 ) 以及直接使用 [API](https://github.com/sveltejs/svelte/tree/v2#api) 。如果你为其其中一种工具而制作了项目template，请与[Svelte Discord 聊天室](chat),  [@sveltejs](https://twitter.com/sveltejs)  Twitter账户一同分享它！
