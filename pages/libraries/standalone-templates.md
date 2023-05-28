# 独立使用 lit-html

Lit将LitElement的组件模型与基于JavaScript模板的文本渲染结合到一个易于使用的包中.然而,Lit的模板部分被分解为一个名为`Lit html`的独立库,它可以在Lit组件模型之外的任何地方使用,以便高效地渲染和更新html.

## 独立包

`lit-html`包可以与`lit`分开安装

```sh
npm install lit-html
```

主要引入了`html`和`render`

```js
import { html, render } from 'lit-html';
```

独立`lit-html`包还包括完整`lit`开发人员指南中描述的以下功能的模块

- lit-html/directives/* - 内置指令
- lit-html/directive.js - 自定义指令
- lit-html/async-directive.js - 自定义异步指令
- lit-html/directive-helpers.js - 命令性更新的指令帮助程序
- lit-html/static.js - 静态 html 标记
- lit-html/polyfill-support.js- 支持与 Web 组件 polyfill 接口（请参阅样式和 lit-html 模板)

## 渲染 lit-html 模板

Lit模板是使用带有html标记的JavaScript模板文本编写的.文字的内容大多是简单的、声明性的HTML:

```html
html`<h1>Hello ${name}</h1>`
```

lit的html模板表达式不会导致创建或更新任何DOM.它只是DOM的一个描述,称为`TemplateResult`.要实际创建或更新DOM,需要将`TemplateResult`传递给`render()`,以及要渲染到的容器:

```js
import { html, render } from 'lit-html';
const name = 'world';const sayHi = html`<h1>Hello ${name}</h1>`;render(sayHi, document.body);
```

## 呈现动态数据

要使模板动态化,您可以创建一个模板.随时在数据更改时调用模板函数

```js
import { html, render } from 'lit-html';
// 定义
const myTemplate = (name) => html`<div>Hello ${name}</div>`;
Render the template with some datarender(myTemplate('earth'), document.body);
// ... Later on ...
// 渲染模板变化的部分
render(myTemplate('mars'), document.body);
```

调用模板函数时,lit-html 会捕获当前表达式值.模板函数不创建任何 DOM 节点,因此既快速又高效

Ttemplate函数返回包含模板和输入数据的`TemplateResult`.这是使用lit html的主要原则之一:**根据状态创建UI**.

调用`render`时,**lit-html 仅更新自上次渲染以来已更改的模板部分**.这使得 lit-html 更新非常快

### 渲染选项

`render` 方法还采用一个 `options` 参数，该参数允许您指定以下选项

- `host`: 调用使用`@eventName`语法注册的事件侦听器时要使用的`this`值.此选项仅在将事件侦听器指定为纯函数时适用.如果使用事件侦听器对象指定事件侦听器,则侦听器对象将用作此值.

- `renderBefore`: An optional reference node within the `container`容器中的可选引用节点,lit html将在该节点之前渲染.默认情况下,lit html将附加到容器的末尾.设置`renderBefore`允许渲染到容器内的特定点.

- `creationScope`: lit-html 对象在克隆模板(默认未`document`)将调用`importNode`,它是为高级用例提供的.

例如,如果您使用的是独立版,则可以使用`lit-html` 如下所示的渲染选项

```html
<div id="container">
  <header>My Site</header>
  <footer>Copyright 2021</footer>
</div>
```

```ts
const template = () => html`...`;
const container = document.getElementById('container');
const renderBefore = container.querySelector('footer');
render(template(), container, {renderBefore});
```

上面的示例将在 `<header>` 和 `<footer>` 之间渲染模板

**渲染选项必须是常量** 渲染选项不应在后续调用 `render` 之间更改

## 样式和 lit-html 模板

lit-html专注于一件事：渲染HTML。如何将样式应用于 lit-html 创建的 HTML 取决于您如何使用它 — 例如，如果您在组件系统（如 LitElement）中使用 lit-html，则可以遵循该组件系统使用的模式。

如何设置 HTML 样式将取决于您是否使用shadow DOM

- 如果不呈现到shadow DOM中,则可以使用全局样式表设置 HTML 样式.
- 如果要渲染到影子shadow DOM,那么您可以在shadow root中渲染 `<style>` 标签.

为了帮助动态样式,lit-html 提供了两个用于操作元素和属性的指令: `class` 和 `style`

- [`classMap`](/docs/templates/directives/#classmap) 根据对象的属性在元素上设置类.
- [`styleMap`](/docs/templates/directives/#stylemap) 根据样式属性和值的映射设置元素上的样式.
