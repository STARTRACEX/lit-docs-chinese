# 入门套件

初学者工具包是可重用的照明组件的项目模板，可以发布供其他人使用。

要开始在本地处理组件，您可以使用以下初学者项目之一:

[Lit JavaScript 入门项目](https://github.com/lit/lit-element-starter-js)
[Lit TypeScript入门项目](https://github.com/lit/lit-element-starter-ts)

这两个项目都定义了一个lit组件。他们还添加了一组可选工具，用于开发、检查和测试组件

- 用于管理依赖项的 Node.js 和 npm。需要node.js 10+。
- 本地开发服务器，[Web 开发服务器](https://modern-web.dev/docs/dev-server/overview/)。
- 使用 [ESLint](https://eslint.org/)
  和[lit-analyzer](https://www.npmjs.com/package/lit-analyzer)进行检查。
- 使用 Web 测试运行程序进行测试。
- 一个使用
  [web-component-analyzer](https://www.npmjs.com/package/web-component-analyzer)
  和 [eleventy](https://www.11ty.dev/) 构建的静态文档站点

## 开始项目

### 1

如果您使用的是 TypeScript 版本的初学者，请构建项目的 JavaScript 版本:

```sh
npm run build
```

若要监视文件并在修改文件时重新生成，请在单独的 shell 中运行以下命令:

```sh
npm run build:watch
```

如果您使用的是初学者项目的 JavaScript 版本，则不需要构建步骤。

### 2

运行开发服务器:

```sh
npm run serve
```

### 3

前往 http://localhost:8000/dev/

## 编辑组件

JavaScript 在项目根目录中编辑文件 TypeScript 编辑src目录中的文件

## 重命名组件

您可能希望将组件名称从“my-element”更改为更合适的名称。使用 IDE
或其他文本编辑器可以对整个项目进行全局搜索和替换，这是最简单的方法。

_如果您使用的是 TypeScript_ 需要删除生成的文件

```sh
npm run clean
```

更改所有my-element组件名为新的组件名

更改所有MyElement类名为新的类名

更改`<script>`的`src`

_如果您使用的是 TypeScript_,并且_之前**没有**执行`npm run build:watch`_
,则再次执行

```sh
npm run build
```
