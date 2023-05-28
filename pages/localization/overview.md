# 本地化

本地化是在应用和组件中支持多种语言和区域的过程. Lit通过 `@lit/localize` 库提供对本地化的第一方支持, 这具有许多优势, 可以使其成为第三方本地化库的不错选择：

* 本地化模板包含本地化表达式支持和HTML标记, 变量替换不需要新的语法和插值运行时, 只需使用现有的模板即可.

* 在区域设置切换时自动重新渲染lit组件.

* 只有 1.27 KiB (缩小 + 压缩)的额外 JavaScript.

* (可选)针对每个语言环境进行编译, 将额外的 JavaScript 减少到 0 KiB.

## 安装

安装 `@lit/localize` 客户端库和 `@lit.localize` 工具` 命令行界面.

```sh
npm i @lit/localize
npm i -D @lit/localize-tools
```

## 快速开始

1. 在`msg`函数中包装字符串或模板
2. 创建一个`lit-localize.json`配置文件
3. 运行`lit-localize`提取以生成XLIFF文件

4. 编辑生成的XLIFF文件以添加`<target>`翻译标记
5. 运行`lit-locationbuild`以输出字符串和模板的本地化版本

## 使字符串和模板可本地化

要使字符串或Lit模板可本地化, 请将其包装在 `msg` 函数中. `msg` 函数返回当前处于活动状态的给定字符串或模板的版本.

在您有任何可用的翻译之前, `msg` 只需返回原始字符串或模板, 因此即使您尚未准备好实际本地化, 也可以安全使用.

```ts
import { html, LitElement } from "lit";
import { customElement, property } from "lit/decorators.js";
import { msg } from "@lit/localize";

class MyGreeter extends LitElement {
  @property()
  who = "World";

  render() {
    return msg(html`Hello <b>${this.who}</b>`);
  }
}
```

```js
import {
    html,
    LitElement
} from "lit";
import {
    msg
} from "@lit/localize";

class MyGreeter extends LitElement {
    static properties = {
        who: {},
    };

    constructor() {
        super();
        this.who = "World";
    }

    render() {
        return msg(html`Hello <b>${this.who}</b>`);
    }
}
customElements.define("my-greeter", MyGreeter);
```

### 消息类型

通常使用Lit渲染的任何字符串或模板都可以本地化, 包括动态表达式和HTML标记.

普通字符串：

```js
msg("Hello World");
```

带表达式的纯字符串

```js
msg(str`Hello ${name}`);
```

HTML 模板:

```js
msg(html`Hello <b>World</b>`);
```

HTML 模板表达式:

```js
msg(html`Hello <b>${name}</b>`);
```

本地化消息也可以嵌套在HTML模板中:

```js
html`<button>${msg("Hello World")}</button>`;
```

### 带表达式的字符串

包含表达式的字符串必须用 `html` 或 `str` 标记才能本地化. 当字符串不包含任何html标记时, 您应该首选 `str` 而不是 `html` , 因为它的性能开销稍小. 如果忘记了带有表达式的字符串上的 `html` 或 `str` 标记, 则在运行 `lit-locate` 命令时将引发错误.

错误:

```js
import {
    msg
} from "@lit/localize";
msg(`Hello ${name}`);
```

正确:

```js
import {
    msg,
    str
} from "@lit/localize";
msg(str`Hello ${name}`);
```

在这些情况下需要 `str` 标记, 因为未标记的模板字符串文本在被 `msg` 函数接收之前被计算为常规字符串, 这意味着动态表达式值无法被捕获并替换为字符串的本地化版本.

## 区域设置代码

区域设置代码是一个字符串, 用于标识人类语言, 有时还包括区域、脚本或其他变体.

Lit
Localize不强制使用任何特定的语言环境代码系统, 但强烈建议使用[BCP 47语言标签标准](https://www.w3.org/International/articles/language-tags/index.en). BCP
47语言标签的一些示例如下：

* en: English
* es-419: Español en Latinoamérica
* zh-Hans: 简体中文

### 协议

Lit
Localize定义了一些涉及语言环境代码的术语. 这些术语在本文档、Lit本地化配置文件和Lit本地化API中使用：

<dl>
  <dt>源区域设置</dt>
  <dd>

    用于在源代码中编写字符串和模板的区域设置.

  </dd>

<dt>目标区域设置</dt>
  <dd>

    字符串和模板可以转换为的区域设置

  </dd>

<dt>活动区域设置</dt>
  <dd>

    当前显示的全局区域设置

  </dd>
</dl>

## 输出模式

Lit Localize 支持两种模式:

* 运行时模式使用LitLocalize的API在运行时加载本地化消息.
* 转换模式通过为每个语言环境构建单独的JavaScript包, 消除了LitLocalize运行时代码.

**不确认使用何种模式?**
从运行时模式开始. 切换模式很容易, 因为核心 `msg` API是相同的.

### 运行时模式

在运行时模式下, 将为每个区域设置生成一个JavaScript或TypeScript模块. 每个模块都包含该区域设置的本地化模板. 当活动区域设置切换时, 将导入该区域设置的模块, 并重新呈现所有本地化组件.

运行时模式使得切换区域设置非常快, 因为不需要重新加载页面. 但是, 与变换模式相比, 渲染性能会有轻微的性能损失.

生成的输出示例

```js
// locales/es-419.ts
export const templates = {
    hf71d669027554f48: html`Hola <b>Mundo</b>`,
};
```

参阅 [运行时模式](/docs/localization/runtime-mode)

### 转换模式

在转换模式下, 将为每个区域设置生成一个单独的文件夹. 每个文件夹都包含该区域中应用程序的完整独立构建, 并完全删除了 `msg` 包装器和所有其他LitLocalize运行时代码.

变换模式需要0
KiB的额外JavaScript, 渲染速度极快. 然而, 切换区域设置需要重新加载页面, 以便可以加载新的JavaScript包.

生成的输出示例

```js
// locales/en/my-element.js
render() {
    return html`Hello <b>World</b>`;
}
```

```js
// locales/es-419/my-element.js
render() {
    return html`Hola <b>Mundo</b>`;
}
```

参阅 [transform mode](/docs/localization/transform-mode)

### 不同之处

<table>
<thead>
<tr>
  <th></th>
  <th>运行时模式</th>
  <th>转换模式</th>
</tr>
</thead>

<tbody>
<tr>
  <td>输出</td>
  <td>每个目标区域设置的动态加载模块.</td>
  <td>每个区域设置的独立应用程序构建.</td>
</tr>

<tr>
  <td>变更语言</td>
  <td>调用<code>setLocale()</code></td>
  <td>重载页面</td>
</tr>

<tr>
  <td>JS大小</td>
  <td>1.27 KiB (缩小 + 压缩)</td>
  <td>0 KiB</td>
</tr>

<tr>
  <td>模板本地化</td>
  <td><code>msg()</code></td>
  <td><code>msg()</code></td>
</tr>

<tr>
  <td>配置</td>
  <td><code>configureLocalization()</code></td>
  <td><code>configureTransformLocalization()</code></td>
</tr>

<tr>
  <td>优势</td>
  <td>

    <ul>
      <li>更快的区域设置切换.</li>
      <li>切换区域设置时,<em>相差</em>字节更少</li>
    </ul>

  </td>
  <td>

    <ul>
      <li>更快的渲染.</li>
      <li>单个区域设置的字节数更少.</li>
    </ul>

  </td>
</tr>
</tbody>
</table>

## 配置文件

`litlocalize` 命令行工具在当前目录中查找名为 `litlocalize.json` 的配置文件. 复制粘贴以下示例以快速开始

如果要编写JavaScript, 请将 `inputFiles` 属性设置为 `.js` 源文件的位置. 如果要编写TypeScript, 请将 `tsConfig` 属性设置为 `tsConfig.json` 文件的位置, 并将 `inputFiles` 留空.

```ts
{
  "$schema": "https://raw.githubusercontent.com/lit/lit/main/packages/localize-tools/config.schema.json",
  "sourceLocale": "en",
  "targetLocales": ["es-419", "zh-Hans"],
  "tsConfig": "./tsconfig.json",
  "output": {
    "mode": "runtime",
    "outputDir": "./src/generated/locales"
  },
  "interchange": {
    "format": "xliff",
    "xliffDir": "./xliff/"
  }
}
```

```js
{
    "$schema": "https://raw.githubusercontent.com/lit/lit/main/packages/localize-tools/config.schema.json",
    "sourceLocale": "en",
    "targetLocales": ["es-419", "zh-Hans"],
    "inputFiles": [
        "src/**/*.js",
    ]
    "output": {
        "mode": "runtime",
        "outputDir": "./src/generated/locales"
    },
    "interchange": {
        "format": "xliff",
        "xliffDir": "./xliff/"
    }
}
```

## 提取

运行 `lit localize extract` 为每个目标区域设置生成XLIFF文件. XLIFF是大多数本地化工具和服务支持的XML格式. XLIFF文件将写入 `interchange.xliffDir`

```sh
lit-localize extract
```

例如, 给定源:

```js
msg("Hello World");
msg(str`Hello ${name}`);
msg(html`Hello <b>World</b>`);
```

然后将为每个目标区域设置生成一个 `<xliffDir>/<locale>.xlf` 文件

```xml
<!-- xliff/es-419.xlf -->

<trans-unit id="s3d58dee72d4e0c27">
  <source>Hello World</source>
</trans-unit>

<trans-unit id="saed7d3734ce7f09d">
  <source>Hello <x equiv-text="${name}"/></source>
</trans-unit>

<trans-unit id="hf71d669027554f48">
  <source>Hello <x equiv-text="&lt;b&gt;"/>World<x equiv-text="&lt;/b&gt;"/></source>
</trans-unit>
```

## 使用 XLIFF 翻译

XLIFF文件可以手动编辑, 但更常见的是, 它们被发送到第三方翻译服务, 由语言专家使用专用工具编辑.

将XLIFF文件上传到所选翻译服务后, 您最终会收到新的XLIFF响应文件. 新的XLIFF文件看起来与您上传的文件一样, 但在每个 `<trans-unit>` 中插入了 `<target>` 标记.

收到新的翻译XLIFF文件后, 将其保存到配置的 `interchange.xliffDir` 目录中, 覆盖原始版本.

```xml
<!-- xliff/es-419.xlf -->

<trans-unit id="s3d58dee72d4e0c27">
  <source>Hello World</source>
  <target>Hola Mundo</target>
</trans-unit>

<trans-unit id="saed7d3734ce7f09d">
  <source>Hello <x equiv-text="${name}"/></source>
  <target>Hola <x equiv-text="${name}"/></target>
</trans-unit>

<trans-unit id="hf71d669027554f48">
  <source>Hello <x equiv-text="&lt;b&gt;"/>World<x equiv-text="&lt;/b&gt;"/></source>
  <target>Hola <x equiv-text="&lt;b&gt;"/>Mundo<x equiv-text="&lt;/b&gt;"/></target>
</trans-unit>
```

## 生成本地化模板

使用 `lit localize build` 命令将翻译合并回应用程序中. 此命令的行为取决于您配置的[output
mode]（#输出模式）.

```sh
lit-localize build
```

请参见[运行时模式]（#运行时模式）和[转换模式]（#转换模式）页面, 以了解在每种模式下构建的工作原理.

## 消息描述

使用 `msg` 函数的 `desc` 选项为字符串和模板提供可读的描述. 大多数翻译工具都会向译者展示这些描述, 强烈建议他们帮助解释信息的含义并将其置于上下文中.

```js
render() {
    return html`<button>
    ${msg("Launch", {
      desc: "Button that begins rocket launch sequence.",
    })}
  </button>`;
}
```

描述在XLIFF文件中使用 `<note>` 元素表示

```xml
<trans-unit id="s512957aa09384646">
  <source>Launch</source>
  <note>Button that begins rocket launch sequence.</note>
</trans-unit>
```

## 信息 ID

Lit Localize使用字符串哈希自动为每个 `msg` 调用生成一个ID.

如果两个 `msg` 呼叫共享相同的ID, 那么它们将被视为相同的消息, 这意味着它们将被翻译为一个单元, 并且在两个地方都将替换相同的翻译.

例如, 这两个 `msg` 调用位于两个不同的文件中, 但由于它们具有相同的内容, 因此将被视为一条消息：

```js
// file1.js
msg("Hello World");

// file2.js
msg("Hello World");
```

### ID 生成

以下内容影响ID生成:

* 字符串内容
* HTML标记
* 表达式的位置
* 字符串是否标记为`html`

以下内容**不会**影响ID生成：

* 表达式内的代码
* 表达式的计算值
* 说明
* 文件位置

例如, 所有这些消息共享相同的ID：

```js
msg(html`Hello <b>${name}</b>`);
msg(html`Hello <b>${this.name}</b>`);
msg(html`Hello <b>${this.name}</b>`, {
    desc: "A friendly greeting"
});
```

但此信息具有不同的ID：

```js
msg(html`Hello <i>${name}</i>`);
```

### 覆盖ID

通过为 `msg` 函数指定 `id` 选项, 可以覆盖消息id. 在某些情况下, 这可能是必要的, 例如当一个相同的字符串具有多个含义时, 因为每一种含义可能在另一种语言中写得不同：

```js
msg("Buffalo", {
    id: "buffalo-animal-singular"
});
msg("Buffalo", {
    id: "buffalo-animal-plural"
});
msg("Buffalo", {
    id: "buffalo-city"
});
msg("Buffalo", {
    id: "buffalo-verb"
});
```
