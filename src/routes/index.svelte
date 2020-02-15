<script>
	import { Blurb, Hero, Section } from '@sveltejs/site-kit';
	import Contributors from './_components/Contributors.svelte';
	import Example from './_components/Example.svelte';
	import WhosUsingSvelte from './_components/WhosUsingSvelte.svelte';
	// import Lazy from '../components/Lazy.svelte';

	// TODO this causes a Sapper CSS bug...
	// function loadReplWidget() {
	// 	console.log('lazy loading');
	// 	return import('../components/Repl/ReplWidget.svelte').then(mod => mod.default);
	// }
</script>

<style>
	/* darken text for accessibility */
	/* TODO does this belong elsewhere? */
	:global(.back-light) {
		--text: hsl(36, 3%, 44%);
	}

	.examples {
		background: var(--second);
		color: white;
		overflow: hidden;
	}
</style>

<svelte:head>
	<title>Svelte • Cybernetically enhanced web apps.</title>

	<meta name="twitter:title" content="Svelte">
	<meta name="twitter:description" content="Cybernetically enhanced web apps">
	<meta name="Description" content="Cybernetically enhanced web apps">
</svelte:head>

<Hero
	title="Svelte"
	tagline="Cybernetically enhanced web apps"
	outline="svelte-logo-outline.svg"
	logotype="svelte-logotype.svg"
/>

<Blurb>
	<a href="blog/write-less-code" slot="one">
		<h2>书写更精简</h2>
		<p>使用你所熟悉的语言（HTML，CSS和JavaScript）构建高度灵活的组件</p>

		<span class="learn-more">了解更多</span>
	</a>

	<a href="blog/virtual-dom-is-pure-overhead" slot="two">
		<h2>没有 virtual DOM</h2>
		<p>Svelte 不仅将你的代码体积编译为更小原始 JS 、并且让你的 App 启动迅速且保持快速。</p>

		<span class="learn-more">了解更多</span>
	</a>

	<a href="blog/svelte-3-rethinking-reactivity" slot="three">
		<h2>真正的实时反应</h2>
		<p>Svelte 为 JavaScript 自身赋予反应性，从而抛弃大量的状态管理库。</p>

		<span class="learn-more">了解更多</span>
	</a>

	<div class="description" slot="what">
		<p>Svelte 是一种构建用户界面的选择。传统的框架（诸如 React 和 Vue）在 <em>浏览器中</em>完成大部分工作，而  Svelte 则将这步骤放在 <em>编译阶段</em> 且这是在你构建程序时发生的。</p>

		<p>Svelte 不使用virtual DOM 技术，但会在你编写代码时，通过实时编译的方式更新DOM代码，进而做到“边编译，边运行”。</p>

		<p><a href="blog/svelte-3-rethinking-reactivity">阅读更多</a>介绍性博客和文章 </p>
	</div>

	<div style="grid-area: start; display: flex; flex-direction: column; min-width: 0" slot="how">
		<pre class="language-bash" style="margin: 0 0 1em 0; min-width: 0; min-height: 0">
npx degit <a href="https://github.com/sveltejs/template" style="user-select: initial;">sveltejs/template</a> my-svelte-project
<span class="token comment"># 或下载并解压 <a href="https://github.com/sveltejs/template/archive/master.zip">此.zip文件</a></span>
cd my-svelte-project

npm install
npm run dev
		</pre>

		<p style="flex: 1">更多信息请参考 <a href="blog/the-easiest-way-to-get-started">快速指南</a></p>

		<p class="cta"><a rel="prefetch" href="tutorial">>学习 Svelte</a></p>
	</div>
</Blurb>

<div class="examples">
	<Example id="hello-world">
		<p>Svelte 组件建立在 HTML 内，试试添加数据。</p>
	</Example>

	<Example id="nested-components">
		<p>默认情况下，CSS是局部样式不会与其他样式冲突，或者你可以<a href="/blog/svelte-css-in-js">使用第三方 CSS-in-JS 库</a>.</p>
	</Example>

	<Example id="reactive-assignments">
		<p>通过给局部变量赋值就能触发高效、细粒度的更新，剩余的事情交给编译器去处理。</p>
	</Example>

	<Example id="svg-transitions">
		<p>使用内置于框架中的强大、高性能的模板语法来构建漂亮的UI。</p>
	</Example>
</div>

<Section>
	<h3>谁在使用 Svelte ？</h3>

	<WhosUsingSvelte/>
</Section>

<Section>
	<h3>贡献者</h3>

	<p>Svelte 是免费的开源软件，通过数百名志愿者的工作得以实现。<a href="https://github.com/sveltejs/svelte">加入我们！</a></p>

	<Contributors/>
</Section>
