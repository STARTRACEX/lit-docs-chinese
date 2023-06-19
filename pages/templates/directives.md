---
sidebar_position: 5
---

# 内置指令

## 样式

### classMap

<table>
<tbody>

<tr>

<td>
Import
</td>
<td>

```js
import { classMap } from "lit/directives/class-map.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
classMap(classInfo: {[name: string]: string | boolean | number})
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

`class` 属性表达式(必须是 `class` 属性中的唯一表达式)

</td>
</tr>
</tbody>

</table>

`classMap` 指令使用 `element.classList` API有效地添加和基于用户传递的对象将类移除到元素. 每个按键对象被视为类名, 如果与键关联的值是真的, 该类被添加到元素中. 在后续渲染时以前设置的错误或不再在对象中的类将被删除.

```ts
@customElement("my-element")
class MyElement extends LitElement {
  @property({ type: Boolean })
  enabled = false;

  render() {
    const classes = { enabled: this.enabled, hidden: false };
    return html`<div class=${classMap(classes)}>Classy text</div>`;
  }
}
```

```js
class MyElement extends LitElement {
    static properties = {
        enabled: {
            type: Boolean
        },
    };

    constructor() {
        super();
        this.enabled = false;
    }

    render() {
        const classes = {
            enabled: this.enabled,
            hidden: false
        };
        return html`<div class=${classMap(classes)}>Classy text</div>`;
    }
}
customElements.define("my-element", MyElement);
```

`classMap` 必须是 `class` 属性中的唯一表达式, 但它可以 与静态值组合：

```ts
html`<div class="my-widget ${
  classMap(dynamicClasses)
}">Static and dynamic</div>`;
```

浏览更多 `classMap`

[playground](https://lit.dev/playground/#sample=examples/directive-class-map).

### styleMap

基于对象为元素设置样式特性列表.

<table>
<tbody>
<tr>
<td>引入</td>
<td>

```js
import { styleMap } from "lit/directives/style-map.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
styleMap(styleInfo: {[name: string]: string | undefined | null})
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

`style` 属性表达式(必须是 `style` 属性中的唯一表达式)

</td>
</tr>
</tbody>
</table>

`styleMap` 指令使用 `element.style` API有效地添加和
根据用户传递的对象删除元素的内联样式. 每个 对象中的键被视为样式特性名称, 值被视为
该属性的值. 在后续渲染时, 任何先前设置的样式
删除未定义或 `null` 的属性(设置为 `null` ).

```ts
@customElement("my-element")
class MyElement extends LitElement {
  @property({ type: Boolean })
  enabled = false;

  render() {
    const styles = {
      backgroundColor: this.enabled ? "blue" : "gray",
      color: "white",
    };
    return html`<p style=${styleMap(styles)}>Hello style!</p>`;
  }
}
```

```js
class MyElement extends LitElement {
    static properties = {
        enabled: {
            type: Boolean
        },
    };

    constructor() {
        super();
        this.enabled = false;
    }

    render() {
        const styles = {
            backgroundColor: this.enabled ? "blue" : "gray",
            color: "white",
        };
        return html`<p style=${styleMap(styles)}>Hello style!</p>`;
    }
}
customElements.define("my-element", MyElement);
```

对于包含破折号的CSS属性, 可以使用驼色大小写, 也可以将属性名称放在引号中. 例如, 可以将CSS属性 `font-family` 写为 `fontFamily` 或 `font-family` ：

```js
{
    fontFamily: 'roboto'
} {
    'font-family': 'roboto'
}
```

通过将整个属性名称放在引号中, 引用CSS自定义属性, 如 `--custom-color` ：

```js
{
    '--custom-color': 'steelblue'
}
```

`styleMap` 必须是 `style` 属性中的唯一表达式, 但它可以 与静态值组合：

```js
html`<p style="color: white; ${styleMap(moreStyles)}">More styles!</p>`;
```

参阅更多 `styleMap`

[playground](https://lit.dev/playground/#sample=examples/directive-style-map).

## 循环和条件

### when

根据条件呈现两个模板之一

<table>
<tbody>
<tr>
<td>引入</td>
<td>

```js
import { when } from "lit/directives/when.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
when<T, F>(
  condition: boolean,
  trueCase: () => T,
  falseCase?: () => F
)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

任意

</td>
</tr>
</tbody>
</table>

当 `condition` 为true时, 返回调用 `trueCase()` 的结果, 否则, 如果定义了 `false Case` , 则返回调用 `false Case()` .

这是一个方便的三元表达式包装器 在没有else的情况下编写内联条件要好一点.

```ts
class MyElement extends LitElement {
  render() {
    return html`
      ${
      when(this.user, () =>
        html`User: ${this.user.username}`, () =>
        html`Sign In...`)
    }
    `;
  }
}
```

### choose

根据匹配从案例列表中选择并计算模板函数 给定的 `value` .

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { choose } from "lit/directives/choose.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
choose<T, V>(
  value: T,
  cases: Array<[T, () => V]>,
  defaultCase?: () => V
)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

任意

</td>
</tr>
</tbody>
</table>

案例的结构为 `[caseValue,func]` , `value` 与匹配
`caseValue` 严格相等. 选择第一个匹配项. 大小写值
可以是任何类型, 包括基元、对象和符号.

这类似于switch语句, 但作为一个表达式, 没有fallthrough.

```ts
class MyElement extends LitElement {
  render() {
    return html`
      ${
      choose(this.section, [
        ["home", () => html`<h1>Home</h1>`],
        ["about", () => html`<h1>About</h1>`],
      ], () => html`<h1>Error</h1>`)
    }
    `;
  }
}
```

### map

返回包含对 `items` 中的每个值调用 `f(value)` 的结果的可迭代项.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { map } from "lit/directives/map.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
map<T>(
  items: Iterable<T> | undefined,
  f: (value: T, index: number) => unknown
)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

任意

</td>
</tr>
</tbody>
</table>

`map()` 是[for/of循环](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for...of)的简单包装器这使得在表达式中使用可迭代项变得更加容易 `map()` 始终更新在本地创建的任何DOM-它不执行任何diffing或DOM移动. 如果需要, 请参阅[repeat](#repeat), `map()` 比 `repeat()` 小且快, 因此如果您不需要diffing和DOM稳定性, 请选择 `map()` .

```ts
class MyElement extends LitElement {
  render() {
    return html`
      <ul>
        ${map(items, (i) => html`<li>${i}</li>`)}
      </ul>
    `;
  }
}
```

### repeat

使用可选的键控将值从可迭代对象呈现到DOM中, 以实现数据区分和DOM稳定性.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { repeat } from "lit/directives/repeat.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
repeat(items: Iterable<T>, keyfn: KeyFn<T>, template: ItemTemplate<T>)
repeat(items: Iterable<T>, template: ItemTemplate<T>)
type KeyFn<T> = (item: T, index: number) => unknown;
type ItemTemplate<T> = (item: T, index: number) => unknown;
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

子表达式

</td>
</tr>
</tbody>
</table>

重复从可迭代项生成的一系列值(通常是 `TemplateResults` )
并在可迭代项更改时有效地更新这些项 When
当提供 `keyFn` 时, 通过在需要时移动生成的DOM来维护更新之间的DOM键关联, 这通常是使用 `repeat` 的最有效方式, 因为它对插入和删除执行的不必要工作最少

如果你没有使用键函数, 你应该考虑使用[ `map()` ](#map).

```ts
@customElement("my-element")
class MyElement extends LitElement {
  @property()
  items: Array<{ id: number; name: string }> = [];

  render() {
    return html`
      <ul>
        ${
      repeat(this.items, (item) => item.id, (item, index) =>
        html`
          <li>${index}: ${item.name}</li>`)
    }
      </ul>
    `;
  }
}
```

```js
class MyElement extends LitElement {
    static properties = {
        items: {},
    };

    constructor() {
        super();
        this.items = [];
    }

    render() {
        return html`
      <ul>
        ${
      repeat(this.items, (item) => item.id, (item, index) =>
        html`
          <li>${index}: ${item.name}</li>`)
    }
      </ul>
    `;
    }
}
customElements.define("my-element", MyElement);
```

如果未提供 `keyFn` , `repeat` 将执行类似于 项转换为值, 并且DOM将针对可能不同的项重用.

参阅[何时使用map和repeat](/docs/templates/lists/#何时使用map和repeat) 进行讨论
何时使用 `repeat` 以及何时使用标准JavaScript流控制

参阅更多 `repeat`

[playground](https://lit.dev/playground/#sample=examples/directive-repeat).

### join

返回包含与 `joiner` 值交错的 `items` 中的值的可迭代项.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { join } from "lit/directives/join.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
join<I, J>(
  items: Iterable<I> | undefined,
  joiner: J
): Iterable<I | J>;

join<I, J>(
  items: Iterable<I> | undefined,
  joiner: (index: number) => J
): Iterable<I | J>;
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

任意

</td>
</tr>
</tbody>
</table>

```ts
class MyElement extends LitElement {
  render() {
    return html`
      ${
      join(
        map(menuItems, (i) => html`<a href=${i.href}>${i.label}</a>`),
        html`<span class="separator">|</span>`,
      )
    }
    `;
  }
}
```

### range

返回从 `start` 到 `end` (互斥)按 `step` 递增的整数的可迭代值.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { range } from "lit/directives/range.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
range(end: number): Iterable<number>;

range(
  start: number,
  end: number,
  step?: number
): Iterable<number>;
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

任意

</td>
</tr>
</tbody>
</table>

```ts
class MyElement extends LitElement {
  render() {
    return html`
      ${map(range(8), (i) => html`${i + 1}`)}
    `;
  }
}
```

### ifDefined

如果值已定义, 则设置属性, 如果未定义, 则删除属性.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { ifDefined } from "lit/directives/if-defined.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
ifDefined(value: unknown)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

attribute 表达式

</td>
</tr>
</tbody>
</table>

对于AttributePart, 如果值已定义, 则设置属性, 如果值未定义( `undefined` 或 `null` ), 则删除属性. 对于其他零件类型, 此指令是禁止的.
当单个属性值中存在多个表达式时, 如果*_any_*表达式使用 `ifDefined` 并计算结果为 `undefined` / `null` , 则将删除该属性. 这对于设置URL属性尤其有用, 如果未定义URL的所需部分, 则不应设置该属性, 以防止404.

```ts
@customElement("my-element")
class MyElement extends LitElement {
  @property()
  filename: string | undefined = undefined;

  @property()
  size: string | undefined = undefined;

  render() {
    // src attribute not rendered if either size or filename are undefined
    return html`<img src="/images/${ifDefined(this.size)}/${
      ifDefined(this.filename)
    }">`;
  }
}
```

```js
class MyElement extends LitElement {
    static properties = {
        filename: {},
        size: {},
    };

    constructor() {
        super();
        this.filename = undefined;
        this.size = undefined;
    }

    render() {
        // src attribute not rendered if either size or filename are undefined
        return html`<img src="/images/${ifDefined(this.size)}/${
      ifDefined(this.filename)
    }">`;
    }
}
customElements.define("my-element", MyEleent);
```

参阅更多 `ifDefined`

[playground](https://lit.dev/playground/#sample=examples/directive-if-defined).

### cache

在更改模板时缓存渲染的DOM, 而不是丢弃DOM. 你 可以经常使用此指令来优化渲染性能
在大型模板之间切换.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { cache } from "lit/directives/cache.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
cache(value: TemplateResult|unknown)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

子表达式

</td>
</tr>
</tbody>
</table>

当传递给 `缓存` 的值在一个或多个 `TemplateResult` 之间发生变化时, 给定模板的渲染DOM节点在不使用时被存. 当模板更改时, 该指令会在切换到新值, 并在切换回时从缓存中恢复它们而不是重新创建DOM节点.

```ts
const detailView = (data) => html`<div>...</div>`;
const summaryView = (data) => html`<div>...</div>`;

@customElement("my-element")
class MyElement extends LitElement {
  @property()
  data = { showDetails: true /*...*/ };

  render() {
    return html`${
      cache(
        this.data.showDetails ? detailView(this.data) : summaryView(this.data),
      )
    }`;
  }
}
```

```js
const detailView = (data) => html`<div>...</div>`;
const summaryView = (data) => html`<div>...</div>`;

class MyElement extends LitElement {
    static properties = {
        data: {},
    };

    constructor() {
        super();
        this.data = {
            showDetails: true /*...*/
        };
    }

    render() {
        return html`${
      cache(
        this.data.showDetails ? detailView(this.data) : summaryView(this.data),
      )
    }`;
    }
}
customElements.define("my-element", MyElement);
```

当Lit重新渲染模板时, 它只更新修改过的部分：它不会创建或删除更多的DOM. 但是当您从一个模板切换到另一个模板时, Lit会删除旧的DOM并呈现新的DOM树.
`cache` 指令为给定的表达式和输入模板缓存生成的DOM. 在上面的示例中, 它为 `summaryView` 和 `detailView` 模板缓存DOM. 当您从一个视图切换到另一个视图时, Lit会交换新视图的缓存版本, 并使用最新数据更新它. 这可以在频繁切换这些视图时提高渲染性能.

参阅更多 `cache`

[playground](https://lit.dev/playground/#sample=examples/directive-cache).

### keyed

将可渲染值与唯一键相关联. 当键更改时, 即使模板等值相同, 也会在呈现下一个值之前删除并释放上一个DOM.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { keyed } from "lit/directives/keyed.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
keyed(key: unknown, value: unknown)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

任何表达式

</td>
</tr>
</tbody>
</table>

 `keyed`

在渲染有状态元素时非常有用, 并且需要确保在某些关键数据更改时清除元素的所有状态. 它本质上选择了Lit默认的DOM重用策略

`keyed` 在某些动画场景, 如果需要为 `enter` 或 `exit` 动画强制添加新元素, 也很有用.

`keyed` 在呈现有状态元素时非常有用, 并且需要确保在某些关键数据更改时清除元素的所有状态. 它本质上选择了Lit默认的DOM重用策略.

如果您需要为"enter"或"exit"动画强制添加新元素, 则 `keyed` 在某些动画场景中也很有用.

```ts
@customElement("my-element")
class MyElement extends LitElement {
  @property()
  userId: string = "";

  render() {
    return html`
      <div>
        ${
      keyed(this.userId, html`<user-card .userId=${this.userId}></user-card>`)
    }
      </div>`;
  }
}
```

```js
class MyElement extends LitElement {
    static properties = {
        userId: {},
    };

    constructor() {
        super();
        this.userId = "";
    }

    render() {
        return html`
      <div>
        ${
      keyed(this.userId, html`<user-card .userId=${this.userId}></user-card>`)
    }
      </div>`;
    }
}
customElements.define("my-element", MyElement);
```

### guard

仅当模板的一个依赖项更改时重新评估模板, 以优化通过防止不必要的工作来渲染性能.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { guard } from "lit/directives/guard.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
guard(dependencies: unknown[], valueFn: () => unknown)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

任何表达式

</td>
</tr>
</tbody>
</table>

呈现 `valueFn` 返回的值, 并且仅在其中一个依赖项更改标识时重新计算 `valueFn` .

当:

* `dependencies` 是要监视更改的值数组.
* `valueFn` 是一个返回可渲染值的函数.

`guard` 通过在数据更新之前防止昂贵的工作, 对于不可变的数据模式非常有用

```ts
@customElement("my-element")
class MyElement extends LitElement {
  @property()
  value: string = "";

  render() {
    return html`
      <div>
        ${guard([this.value], () => calculateSHA(this.value))}
      </div>`;
  }
}
```

```js
class MyElement extends LitElement {
    static properties = {
        value: {},
    };

    constructor() {
        super();
        this.value = "";
    }

    render() {
        return html`
      <div>
        ${guard([this.value], () => calculateSHA(this.value))}
      </div>`;
    }
}
customElements.define("my-element", MyElement);
```

在这种情况下, 昂贵的 `calculateSHA` 函数仅在 `value` 属性更改时运行.

参阅更多 `guard`

[playground](https://lit.dev/playground/#sample=examples/directive-guard).

### live

Sets an attribute or property if it differs from the live DOM value rather than
the last-rendered value.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { live } from "lit/directives/live.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
live(value: unknown)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

Attribute 或 property 属性表达式

</td>
</tr>
</tbody>
</table>

确定是否更新值时, 检查表达式值而不是Lit的默认检查行为与上一个设定值比较. 这对于DOM值可能从Lit外更改的情况非常有用. 对于例如, 当使用表达式设置 `<input>` 元素的 `value` 时属性、内容可编辑元素的文本更改的自定义元素它自己的属性或属性. 在这些情况下, 如果DOM值发生变化, 但通过Lit设置的值表达式没Lit将不知道更新DOM值并将其保留单独地如果这不是您想要的, 如果您想用绑定值, 无论使用什么 `live()` 令.

```ts
@customElement("my-element")
class MyElement extends LitElement {
  @property()
  data = { value: "test" };

  render() {
    return html`<input .value=${live(this.data.value)}>`;
  }
}
```

```js
class MyElement extends LitElement {
    static properties = {
        data: {},
    };

    constructor() {
        super();
        this.data = {
            value: "test"
        };
    }

    render() {
        return html`<input .value=${live(this.data.value)}>`;
    }
}
customElements.define("my-element", MyElement);
```

`live()` 对实时DOM值执行严格的相等检查, 如果新值等于有效值, 不起作用. 这意味着当表达式将导致类型转换时, 不应使用 `live()` . 如果如果在属性表达式中使用 `live()` , 请确保只有字符串否则表达式将更新每个渲染.

参阅更多 `live`

[playground](https://lit.dev/playground/#sample=examples/directive-live).

## 呈现特殊值

### 模板内容

呈现 `<template>` 元素的内容

<table>
<tbody>
<tr>
<td>引入</td>
<td>

```js
import { templateContent } from "lit/directives/template-content.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
templateContent(templateElement: HTMLTemplateElement)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

子表达式

</td>
</tr>
</tbody>
</table>

Lit模板是用Javascript编码的, 因此它们可以嵌入Javascript使它们成为动态的表达式. 如果您有一个静态HTML `<template>` 您需要在Lit模板中包含, 可以使用 `templateContent` 指令克隆模板内容并将其包含在Lit模板中. 像只要模板元素引用在渲染之间不改变, 后续渲染将不可用.

:::danger

注意, 模板内容应由开发人员控制, 不得使用不受信任的字符串创建. 不受信任内容的示例包括查询来自用户输入的字符串参数和值. 使用渲染的不受信任的模板该指令可能导致
[XSS](https://en.wikipedia.org/wiki/Cross-site_scripting) 漏洞.

:::

```ts
const templateEl = document.querySelector(
  "template#myContent",
) as HTMLTemplateElement;

@customElement("my-element")
class MyElement extends LitElement {
  render() {
    return html`
      Here's some content from a template element:
      ${templateContent(templateEl)}`;
  }
}
```

```js
const templateEl = document.querySelector("template#myContent");

class MyElement extends LitElement {
    render() {
        return html`
      Here's some content from a template element:
      ${templateContent(templateEl)}`;
    }
}
customElements.define("my-element", MyElement);
```

参阅更多 `templateContent`

[playground](https://lit.dev/playground/#sample=examples/directive-template-content).

### unsafeHTML

Renders a string as HTML rather than text.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { unsafeHTML } from "lit/directives/unsafe-html.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
unsafeHTML(value: string | typeof nothing | typeof noChange)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

子表达式

</td>
</tr>
</tbody>
</table>

Lit模板语法的一个关键特性是模板文本被解析为HTML. 因为模板文本只能是在受信任的脚本文件中编写, 这是对XSS的自然保护攻击注入不受信任的HTML. 然而, 在某些情况下, HTML不是例如, 源于脚本文件的需要在Lit模板中呈现从数据库中获取的可信HTML内容. `unsafeHTML` 指令将解析HTML这样的字符串并将其呈现在Lit模板中.

:::danger

注意, 传递给 `unsafeHTML` 的字符串必须由开发人员控制, 而不是包括不受信任的内容. 不受信任内容的示例包括查询字符串来自用户输入的参数和值. 使用此渲染的不受信任的内容指令可能导致
[XSS](https://en.wikipedia.org/wiki/Cross-site_scripting) 漏洞.

:::

```ts
const markup = "<h3>Some HTML to render.</h3>";

@customElement("my-element")
class MyElement extends LitElement {
  render() {
    return html`
      Look out, potentially unsafe HTML ahead:
      ${unsafeHTML(markup)}
    `;
  }
}
```

```js
const markup = "<h3>Some HTML to render.</h3>";

class MyElement extends LitElement {
    render() {
        return html`
      Look out, potentially unsafe HTML ahead:
      ${unsafeHTML(markup)}
    `;
    }
}
customElements.define("my-element", MyElement);
```

参阅更多 `unsafeHTML`

[playground](https://lit.dev/playground/#sample=examples/directive-unsafe-html).

### unsafeSVG

将字符串呈现为SVG而不是文本.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { unsafeSVG } from "lit/directives/unsafe-svg.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
unsafeSVG(value: string | typeof nothing | typeof noChange)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

子表达式

</td>
</tr>
</tbody>
</table>

与[ `unsafeHTML` ](#unsafehtml)类似, 可能会出现SVG内容不是源于脚本文件的需要在Lit模板中呈现, 对于从数据库获取的受信任SVG内容示例. `unsafeSVG` 指令将解析SVG这样的字符串, 并将其呈现在Lit模板中

:::danger

注意, 传递给 `unsafeSVG` 的字符串必须由开发人员控制, 而不是包括不受信任的内容. 不受信任内容的示例括查询字符串来自用户输入的参数和值. 使用此渲染的不受信任的内容指令可能导致
[XSS](https://en.wikipedia.org/wiki/Cross-site_scripting) 漏洞.

:::

```ts
const svg = '<circle cx="50" cy="50" r="40" fill="red" />';

@customElement("my-element")
class MyElement extends LitElement {
  render() {
    return html`
      Look out, potentially unsafe SVG ahead:
      <svg width="40" height="40" viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg" version="1.1">
        ${unsafeSVG(svg)}
      </svg> `;
  }
}
```

```js
const svg = '<circle cx="50" cy="50" r="40" fill="red" />';

class MyElement extends LitElement {
    render() {
        return html`
      Look out, potentially unsafe SVG ahead:
      <svg width="40" height="40" viewBox="0 0 100 100"
        xmlns="http://www.w3.org/2000/svg" version="1.1">
        ${unsafeSVG(svg)}
      </svg> `;
    }
}
customElements.define("my-element", MyElement);
```

参阅更多 `unsafeSVG`

[playground](https://lit.dev/playground/#sample=examples/directive-unsafe-svg).

## 引用呈现的DOM

### ref

检索对呈现到DOM中的元素的引用.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { ref } from "lit/directives/ref.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
ref(refOrCallback: RefOrCallback)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

元素表达式

</td>
</tr>
</tbody>
</table>

尽管Lit中的大多数DOM操作都可以使用模板, 高级情况下可能需要获取元素的引用在模板中呈现并强制操作它. 常见示例当这可能有用时, 包括聚焦表单控件调用命令容器元素上的DOM操作库.

当放置在模板中的元素上时, `ref` 指令将检索对该元素的引用. 可以检索元素用通过两种方式之一：传递 `Ref` 对象或传递回调. `Ref` 对象充当元素引用的容器, 可以是使用 `ref` 模块中的 `createRef` 助手方法创建. 之后呈现时, `Ref` 的 `value` 属性将设置为元素，可以在渲染后生命周期(如 `updated` )中访问该元素.

```ts
@customElement("my-element")
class MyElement extends LitElement {
  inputRef: Ref<HTMLInputElement> = createRef();

  render() {
    // Passing ref directive a Ref object that will hold the element in .value
    return html`<input ${ref(this.inputRef)}>`;
  }

  firstUpdated() {
    const input = this.inputRef.value!;
    input.focus();
  }
}
```

```js
class MyElement extends LitElement {

    inputRef = createRef();

    render() {
        // Passing ref directive a Ref object that will hold the element in .value
        return html`<input ${ref(this.inputRef)}>`;
    }

    firstUpdated() {
        const input = this.inputRef.value!;
        input.focus();
    }
}
customElements.define('my-element', MyElement);
```

ref回调也可以传递给 `ref` 指令. 回调将是每次引用元素更改时调用. 如果ref回调为渲染到不同的元素位置或在随后的渲染中被移除, 它将首先用 `undefined` 调用, 然后用新元素(如果有). 注意, 在 `LitElement` 中, 回调将自动调用绑定到宿主元素.

```ts
@customElement("my-element")
class MyElement extends LitElement {
  render() {
    // Passing ref directive a change callback
    return html`<input ${ref(this.inputChanged)}>`;
  }

  inputChanged(input?: HTMLInputElement) {
    input?.focus();
  }
}
```

```js
class MyElement extends LitElement {
    render() {
        // Passing ref directive a change callback
        return html`<input ${ref(this.inputChanged)}>`;
    }

    inputChanged(input) {
        input?.focus();
    }
}
customElements.define("my-element", MyElement);
```

参阅更多 `ref`

[playground](https://lit.dev/playground/#sample=examples/directive-ref).

## 异步渲染

### until

呈现占位符内容, 直到一个或多个Promise得到解决.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { until } from "lit/directives/until.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
until(...values: unknown[])
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

任何表达式

</td>
</tr>
</tbody>
</table>

采用一系列价值观, 包括承诺. 值按优先级顺序呈现, 第一个参数具有最高优先级, 最后一个参数具有最低优先级. 如果某个值是Promise, 则将呈现一个较低优先级的值, 直到其解析.

值的优先级可用于为异步创建占位符内容数据例如, 带有待定内容的Promise可以是第一个(最高优先级)参数, 非承诺加载指符模板可以用作第二个(较低优先级)参数. 装载指示器立即呈现, 当Promise解析.

```ts
@customElement("my-element")
class MyElement extends LitElement {
  @state()
  private content = fetch("./content.txt").then((r) => r.text());

  render() {
    return html`${until(this.content, html`<span>Loading...</span>`)}`;
  }
}
```

```js
class MyElement extends LitElement {
    static properties = {
        content: {
            state: true
        },
    };

    constructor() {
        super();
        this.content = fetch("./content.txt").then((r) => r.text());
    }

    render() {
        return html`${until(this.content, html`<span>Loading...</span>`)}`;
    }
}
customElements.define("my-element", MyElement);
```

参阅更多 `until`

[playground](https://lit.dev/playground/#sample=examples/directive-until).

### asyncAppend

在生成值时将值从 `AsyncIterable` 追加到DOM中.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { asyncAppend } from "lit/directives/async-append.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
asyncAppend(iterable: AsyncIterable)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

子表达式

</td>
</tr>
</tbody>
</table>

`asyncAppend` 呈现[async可迭代](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)的值, 在前一个值之后附加每个新值. 注意, 异步生成器还实现了异步可迭代协议, 因此可以由 `asyncAppend` 使用.

```ts
async function* tossCoins(count: number) {
  for (let i = 0; i < count; i++) {
    yield Math.random() > 0.5 ? "Heads" : "Tails";
    await new Promise((r) => setTimeout(r, 1000));
  }
}

@customElement("my-element")
class MyElement extends LitElement {
  @state()
  private tosses = tossCoins(10);

  render() {
    return html`
      <ul>${asyncAppend(this.tosses, (v: string) => html`<li>${v}</li>`)}</ul>`;
  }
}
```

```js
async function* tossCoins(count) {
    for (let i = 0; i < count; i++) {
        yield Math.random() > 0.5 ? "Heads" : "Tails";
        await new Promise((r) => setTimeout(r, 1000));
    }
}

class MyElement extends LitElement {
    static properties = {
        tosses: {
            state: true
        },
    };

    constructor() {
        super();
        this.tosses = tossCoins(10);
    }

    render() {
        return html`
      <ul>${asyncAppend(this.tosses, (v) => html`<li>${v}</li>`)}</ul>`;
    }
}
customElements.define("my-element", MyElement);
```

参阅更多 `asyncAppend`

[playground](https://lit.dev/playground/#sample=examples/directive-async-append).

### asyncReplace

Renders the latest value from an `AsyncIterable` into the DOM as it is yielded.

<table>

<tbody>
<tr>
<td>引入</td>
<td>

```js
import { asyncReplace } from "lit/directives/async-replace.js";
```

</td>
</tr>
<tr>
<td>特征</td>
<td>

```ts
asyncReplace(iterable: AsyncIterable)
```

</td>
</tr>
<tr>
<td>使用地点</td>
<td>

子表达式

</td>
</tr>
</tbody>
</table>

与[ `asyncAppend` ](#asyncappend)相似, 
`asyncReplace` 呈现[async iterable](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Statements/for-await...of)的值, 
用每个新值替换先前的值.

```ts
async function* countDown(count: number) {
  while (count > 0) {
    yield count--;
    await new Promise((r) => setTimeout(r, 1000));
  }
}

@customElement("my-element")
class MyElement extends LitElement {
  @state()
  private timer = countDown(10);

  render() {
    return html`Timer: <span>${asyncReplace(this.timer)}</span>.`;
  }
}
```

```js
async function* countDown(count) {
    while (count > 0) {
        yield count--;
        await new Promise((r) => setTimeout(r, 1000));
    }
}

class MyElement extends LitElement {
    static properties = {
        timer: {
            state: true
        },
    };

    constructor() {
        super();
        this.timer = countDown(10);
    }

    render() {
        return html`Timer: <span>${asyncReplace(this.timer)}</span>.`;
    }
}
customElements.define("my-element", MyElement);
```

参阅更多 `asyncReplace`

[playground](https://lit.dev/playground/#sample=examples/directive-async-replace).
