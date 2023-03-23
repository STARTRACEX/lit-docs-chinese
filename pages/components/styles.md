# 样式

组件的模板将渲染到`shadow root`.添加到组件中的样式将自动作用于`shadow root`,并且只影响组件`shadow root`中的元素.

## 向组件添加样式

在静态类字段`styles`中并使用标记模板子字面量`css`定义域内样式.以这种方式定义样式可获得最佳性能

```js
static styles = css`
    p {
      color: green;
    }
`;
```

[示例](https://lit.dev/playground/#sample=docs/components/style/basic)

添加到组件的样式使用shadow DOM限定范围,有关概述请参阅
[Shadow DOM](#shadow-dom-样式概述)

静态类字段`styles`的值有以下类型

- 单个标记模板文本

```js
static styles = css`...`;
```

- 标记模板文本的数组

```js
tatic styles = [ css`...`, css`...`];
```

### 在静态样式中使用表达式

静态样式适用于组件的所有实例.CSS 中的任何表达式都计算一次,然后对所有实例重用

对于基于树或每实例样式的自定义,请使用 CSS 自定义属性来允许元素成为主题

`css`模板只允许字符串,数字的模板嵌套表达式

```js
const mainColor = css`red`;
...
static styles = css`
  div { color: ${mainColor} }
`;
```

如果必须在文本中使用`css`本身不是`css`文本的表达式,并且确信该表达式来自完全受信任的源(如在您自己的代码中定义的常量）,则可以使用`unsafeCSS`

```js
import {css, unsafeCSS } from 'lit';
const mainColor = 'red';
...
static styles = css`
  div { color: ${unsafeCSS(mainColor)} }
`;
```

### 从超类继承样式

使用标记模板文本数组,组件可以从超类继承样式,并添加自己的样式

[示例](https://lit.dev/playground/#sample=docs/components/style/superstyles)

在编写要在TypeScript中子类化的组件时,静态样式字段应显式键入为CSSResultGroup,以允许用户灵活地使用数组重写样式:

```js tite=超类
// 防止typescript将"styles"的类型缩小为"CSSResult"
// 以便子类可以分配 例如 `[SuperElement.styles, css`...`]`;
static styles: CSSResultGroup = css`...`;
static styles=css`...`as CSSResultGroup
```

```js title=子类
static styles = [
    超类.styles,
    css``,
  ];
```

### 共享样式

通过创建导出标记样式的模块在组件之间共享样式

```js title=button-styles.js
export const buttonStyles = css`
  .blue-button {
    color: white;
    background-color: blue; }`
```

```js
import { buttonStyles } from "./button-styles.js";
class MyElement extends LitElement {
  static styles = [
    buttonStyles,
    css`
      :host { display: block;
        border: 1px solid black;
      }`,
  ];
}
```

### 样式的unicode转义

CSS 的 unicode
转义序列是一个反斜杠,后跟四个或六个十六进制数字,`css`标记模板文本中使用它们会出现错误(如`\2022`)

向样式添加 unicode 转义有两种解决方法

- 添加第二个反斜杠 `\\2022`
- 使用 JavaScript 转义序列,以`\u`开头.如`\u2022`

```js
static styles = css`
  div::before {
    content: '\u2022';
  }
```

## Shadow Dom 样式概述

添加到组件的样式可能会影响

- Shadow tree.
- 组件本身.
- 组件的子级.

### 设置 shadow tree 样式

默认情况下,Lit模板呈现为shadow tree.除了继承的 CSS
属性之外,文档级样式不会影响影子树的内容

使用标准 CSS 选择器时,仅匹配组件影子树中的元素

### 设置组件本身样式

您可以使用特殊选择器`:host`设置组件本身的样式

若要为主元素创建默认样式,请使用`:host`和`:host()`

- :host选择本身元素.
- :host(selector)选择本身元素,但仅当主机元素与选择器匹配时

[示例](https://lit.dev/playground/#sample=docs/components/style/host)

请注意,host元素也会受到来自shadow
tree外部的样式的影响,因此在`:host`和`:host()`规则中设置的样式应该视为用户可以覆盖的默认样式,例如

```css
my-element {
  display: inline-block;
}
```

您的组件可以接受子元素（就像`<ul>`元素可以有`<li>`子元素）.要渲染子元素,模板需要包含一个或多个`<slot>`元素,如使用slot元素渲染子级中所述.

`<slot>`元素充当shadow tree中的占位符,其中显示host元素的子级.

使用 CSS 伪元素通过`::slotted()`选择`<slot>`模板中包含的子元素.

- ::slotted(*)匹配所有`<slot>`元素.
- ::slotted(p)匹配`<slot>`中的段落.
- p ::slotted(*)匹配`<p>`元素的后代的`<slot>`元素.

请注意,只能使用`::slotted()`设置直接slot子项的样式.

```html
<my-element>
  <div>Stylable with ::slotted()</div>
</my-element>

<my-element>
  <div><p>Not stylable with ::slotted()</p></div>
</my-element>
```

[示例](https://lit.dev/playground/#sample=docs%2Fcomponents%2Fstyle%2Fslottedselector&project=W3sibmFtZSI6Im15LWVsZW1lbnQuanMiLCJjb250ZW50IjoiaW1wb3J0IHtMaXRFbGVtZW50LCBodG1sLCBjc3N9IGZyb20gJ2xpdCc7XG5cbmV4cG9ydCBjbGFzcyBNeUVsZW1lbnQgZXh0ZW5kcyBMaXRFbGVtZW50IHtcbiAgc3RhdGljIHN0eWxlcyA9IGNzc2BcbiAgICA6OnNsb3R0ZWQocCkgeyBjb2xvcjogYmx1ZTsgfVxuICBgO1xuICByZW5kZXIoKSB7XG4gICAgcmV0dXJuIGh0bWxgXG4gICAgICA8c2xvdD48L3Nsb3Q-XG4gICAgICA8c2xvdCBuYW1lPVwiaGlcIj48L3Nsb3Q-XG4gICAgYDtcbiAgfVxufVxuY3VzdG9tRWxlbWVudHMuZGVmaW5lKCdteS1lbGVtZW50JywgTXlFbGVtZW50KTtcbiJ9LHsibmFtZSI6ImluZGV4Lmh0bWwiLCJjb250ZW50IjoiPHNjcmlwdCB0eXBlPVwibW9kdWxlXCIgc3JjPVwiLi9teS1lbGVtZW50LmpzXCI-PC9zY3JpcHQ-XG5cbjxteS1lbGVtZW50PlxuICA8cD7nm7TmjqXlrZDlhYPntKBwPC9wPlxuICA8c3BhbiBzbG90PVwiaGlcIj48cD7lrZDlhYPntKDljIXlkKvkuoZwPC9wPjwvc3Bhbj5cbjwvbXktZWxlbWVudD4ifSx7Im5hbWUiOiJwYWNrYWdlLmpzb24iLCJjb250ZW50Ijoie1xuICBcImRlcGVuZGVuY2llc1wiOiB7XG4gICAgXCJsaXRcIjogXCJeMi4wLjBcIixcbiAgICBcIkBsaXQvcmVhY3RpdmUtZWxlbWVudFwiOiBcIl4xLjAuMFwiLFxuICAgIFwibGl0LWVsZW1lbnRcIjogXCJeMy4wLjBcIixcbiAgICBcImxpdC1odG1sXCI6IFwiXjIuMC4wXCJcbiAgfVxufSIsImhpZGRlbiI6dHJ1ZX1d)

此外,可以从shadow
tree外部设置子样式,因此样式应被视为可以覆盖`::slotted()`的默认样式

## 在模板中定义作用域样式

我们建议使用静态样式类字段以获得最佳性能.但是,有时您可能希望在 Lit
模板中定义样式.有两种方法可以在模板中添加作用域样式:

- 使用`<style>`元素添加样式.
- 使用外部样式表添加样式（不推荐）. 这些技术中的每一种都有自己的优点和缺点.

### 使用`<style>`元素添加样式

通常,样式放置在静态样式类字段中；然而,每个类对元素的静态样式求值一次.有时,您可能需要自定义每个实例的样式.为此,我们建议使用CSS属性来创建主题元素.或者,也可以在Lit模板中包含`<style>`元素.这些将按实例更新.

```js
render() {
  return html`
    <style>
      /* updated per instance */
    </style>
    <div>template content</div>
  `;
}
```

### 使用外部样式表

此方法限制和性能问题

```js
render() {
  return html`
    <style>
      :host {
        /* Warning: this approach has limitations & performance issues! */
        color: ${myColor}
      }
    </style>
    <div>template content</div>
  `;
}
```

在`<style>`元素中计算表达式是非常低效的.当`<style>`元素中的任何文本发生更改时,浏览器必须重新解析整个`<style>`元素,这将导致不必要的工作.

为了降低这一成本,将需要每个实例评估的样式与不需要的样式分开.

```js
static styles = css`/* ... */`;
  render() {
    const redStyle = html`<style> :host { color: red; } </style>`;
    return html`${this.red ? redStyle : ''}`
```

### 导入外部样式表

虽然可以在模板中包含带有`<link>`的外部样式表,但我们不建议使用此方法

样式应放置在[静态样式类](#向组件添加样式)字段中

## 动态类和样式

使样式动态化的一种方法是向模板中的类和样式添加表达式使其动态变化

Lit提供了`classMap`和`styleMa`在HTML模板中应用类和样式

有关这些指令和其他指令的详细信息,请参阅有关[内置指令](/docs/templates/directives/)的文档.

```js
import { classMap } from "lit/directives/class-map.js";
import { styleMap } from "lit/directives/style-map.js";
```

[示例](https://lit.dev/playground/#sample=docs/components/style/maps)

定义

```js
static properties = {
  classes: {},
  styles: {},
};
constructor() {
  super();
  this.classes = {someclass: true, anotherclass: true};
  this.styles = {color: 'lightgreen', fontFamily: 'Roboto'};
}
```

```ts
classes = { someclass: true, anotherclass: true };
styles = { color: "lightgreen", fontFamily: "Roboto" };
```

实现

```js
return html`
<div class=${classMap(this.classes)} style=${styleMap(this.styles)}>`;
```

## 主题

通过将 CSS 继承和 CSS 变量以及自定义属性一起使用,直接应用基于shadow
root和每个实例的主题 (在html中创建css变量并在lit组件中继承)

[示例](https://lit.dev/playground/#sample=docs/components/style/theming)

### CSS继承

CSS 继承

CSS 继承允许父元素和host元素将某些 CSS 属性传播到其后代.

并非所有 CSS 属性都会继承.继承的 CSS 属性包括:

- color
- font-*
- --* (所有 CSS 自定义属性)

参见[MDN上的CSS继承](https://developer.mozilla.org/en-US/docs/Web/CSS/inheritance)

### CSS自定义属性

所有 CSS 自定义属性都会继承

以下组件将其背景色设置为CSS变量`--my-background`,是由与DOM树中的祖先匹配的选择器设置的,否则默认为`yellow`

```js
static styles = css`
    :host {
      background-color: var(--my-background, yellow);
    }`;
```

此组件可以使用`my-element`标记作为CSS选择器来设置`--my-background`的值:

```html
<style>
  my-element {
    --my-background: rgb(67, 156, 144);
  }
</style>
<my-element></my-element>
```

`--my-background`可按`my-element`的实例进行配置

```html
<style>
  my-element {
    --my-background: rgb(67, 156, 144);
  }
  my-element.stuff {
    --my-background: #111111;
  }
</style>
<my-element></my-element>
<my-element class="stuff"></my-element>
```

参阅
[MDN上的CSS自定义属性](https://developer.mozilla.org/en-US/docs/Web/CSS/--*)
