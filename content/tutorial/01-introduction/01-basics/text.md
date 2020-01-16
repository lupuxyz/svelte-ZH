---
title: 基础知识
---

欢迎使用Svelte教程。这将教你轻松构建快速的小型Web应用程序所需的一切。

You can also consult the [API docs](docs) and the [examples](examples), or — if you're impatient to start hacking on your machine locally — the [60-second quickstart](blog/the-easiest-way-to-get-started).


## 什么是 Svelte?

Svelte 是用于快速构建 web 应用程序的工具。

它类似于React和Vue这样的JavaScript框架，它们的共同目标是使构建轻松的交互式用户界面变得容易。

但是有一个关键的区别：Svelte在构建时将你的应用转换为期望的JavaScript ，而不是在 *运行时*解释你的应用代码。这意味你无需为框架开销，也不会在应用首次加载时耗费时间。

你可以使用Svelte构建整个应用程序，也可以将其添加到现有代码库中。你还可以将组件作为独立的软件包导出，这些组件可以在任何地方工作，而无需添加额外的框架依赖。


## 如何使用本教程

你需要对HTML，CSS和JavaScript有一个基本的了解后，才能更容易的学习Svelte。

在学习本教程的过程中，将向你展示旨在说明新功能的小练习。章节内容是紧密衔接的，便于你更好的学习，建议你从头到尾进行学习。如有必要，你可以通过上方的下拉菜单进行导航跳转（单击“简介/基础知识”）。

每个教程章节都会有一个“ show me ”按钮，如果你无法根据说明文章编写代码，可以单击该按钮以显示最终结果。为了你能深刻理解 svelte 语法，建议手动输入代码来学习，尽量不要过分依赖它。


## 了解组件

在Svelte中，一个应用程序由一个或多个 *components* 组成，。组件是可复用的自包含代码块，它封装在一起的HTML，CSS和JavaScript，并写入`.svelte` 文件中。右侧代码编辑器中的“ hello world”示例是一个简单的组件。
