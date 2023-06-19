# 快速开始

开始使用 Lit 的方法有很多, 从我们的 Playground 和交互式教程到安装到现有项目中.

## Playground

立即开始使用交互式playground和示例. 从[Hello World](https://lit.dev/playground)开始, 然后对其进行自定义或转到更多示例.

## 互动教程

学习[分步教程](https://lit.dev/tutorials/intro-to-lit), 了解如何在几分钟内构建lit组件

## 入门套件

我们提供 TypeScript 和 JavaScript
组件入门工具包, 用于创建独立的可重用组件. 请参阅初学者工具包.

## 从npm本地安装

lit通过 npm 作为包提供.

```sh
npm i lit
```

然后导入到 JavaScript 或 TypeScript 文件中:

```js
import { html, LitElement } from "lit";
```

```ts
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
```

## 使用捆绑包

Lit
也可作为预构建的单文件捆绑包提供. 提供这些是为了在开发工作流方面提供更大的灵活性: 例如, 如果您希望下载单个文件而不是使用
npm 和构建工具. 这些捆绑包是没有依赖关系的标准 JavaScript 模块 -
任何现代浏览器都应该能够 `<script type="module">` 从这样的环境中导入和运行捆绑包:

```js
import { html, LitElement } from "https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js";
```

要浏览捆绑包, 请转到 https://cdn.jsdelivr.net/gh/lit/dist/
并使用下拉菜单转到特定版本的页面. 在该页面上, 该版本可用的每种捆绑包类型都有一个目录. 有两种类型的捆绑包:

| core | https://cdn.jsdelivr.net/gh/lit/dist@2/core/lit-core.min.js `core` 导出与 `lit` 包的主模块相同的模块            |
| ---- | -------------------------------------------------------------------------------------------------------------- |
| all  | https://cdn.jsdelivr.net/gh/lit/dist@2/all/lit-all.min.js `all` 导出 `core` 中的全部内容和大多数 `lit` 的其他模块. |

## 添加到现有项目

请参阅将光照添加到现有项目

## 开放式 WC 项目生成器

Open WC
项目有一个[项目生成器](https://open-wc.org/docs/development/generator/), 可以使用
Lit 搭建应用程序项目的基架.
