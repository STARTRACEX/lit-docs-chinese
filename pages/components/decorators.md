# 修饰器

Lit提供了一组修饰符,可以减少定义组件时需要编写的样板代码量.例如,`@customElement`和`@propertydecorator`使基本元素定义更加紧凑:

```ts
@customElement("my-element")
export class MyElement extends LitElement {
  @property()
  greeting = "Welcome";
  @property()
  name = "Sally";
  @property({ type: Boolean })
  emphatic = true;
  //...
}
```

`@customElement`修饰符定义了一个自定义元素,相当于调用:

```js
customElements.define("my-element", MyElement);
```

`@propertydecorator`声明了一个反应性属性.

## 内置修饰器

| 修饰器                | 描述                                                 |
| --------------------- | ---------------------------------------------------- |
| `@customElement`      | 定义一个自定义元素                                   |
| `@eventOptions`       | 添加事件监听器选项                                   |
| `@property`           | 定义公共属性                                         |
| `@state`              | 定义私有状态属性                                     |
| `@query`              | 定义一个属性,该属性返回组件模板中元素的属性          |
| `@queryAll`           | 定义一个属性,该属性返回组件模板中的元素列表          |
| `@queryAsync`         | 定义一个属性,该属性返回解析为组件模板中元素的Promise |
| `@queryAssignedNodes` | 查询分配给插槽的节点                                 |
| `@queryAssignedNodes` | 定义一个属性,该属性返回分配给特定的slot              |

## 导入修饰器

您可以通过`lit/decorators.js`模块导入所有照明装饰器:

```js
import {
  customElement,
  eventOptions,
  property,
  query,
} from "lit/decorators.js";
```

为了减少运行组件所需的代码量,可以将装饰器单独导入到组件代码中.所有装饰器均可在`lit/decorators/<decorator-name>.js`上找到.例如

```js
import { customElement } from "lit/decorators/custom-element.js";
import { eventOptions } from "lit/decorators/event-options.js";
```

## 启用修饰器

### 与 TypeScript 一起使用

与 TypeScript 一起使用,请启用编译器选项`experimentalDecorators`

还应确保`useDefineForClassFields`设置为`false`.注意,只有当`target`设置为`esnext`或更大时才需要此设置,但建议明确确保此设置为`false`.

```json
"experimentalDecorators": true,
"useDefineForClassFields": false,
```

### 与 Babel 一起使用

不需要也不建议启用`emitDecoratorMetadata`

如果你使用 Babel 编译 JavaScript,你可以通过添加以下插件和设置来启用装饰器

- [@babel/plugin-proposal-decorators](https://babeljs.io/docs/en/babel-plugin-proposal-decorators)
- [@babel/plugin-proposal-class-properties](https://babeljs.io/docs/en/babel-plugin-proposal-class-properties)

注意,最新版本的 Babel 可能不需要`@babel/plugin-proposal-class-properties`

要设置插件,请将如下代码添加到您的 Babel 配置中

```json
"assumptions": {
  "setPublicClassFields": true
},
"plugins": [
  ["@babel/plugin-proposal-decorators", {
    "version": "2018-09",
    "decoratorsBeforeExport": true
  }],
  ["@babel/plugin-proposal-class-properties"]
]
```

### 与 TypeScript 和 Babel 一起使用

将 TypeScript 与 Babel 一起使用时,在 Babel 配置中的装饰器转换之前对 TypeScript
转换进行排序很重要,如下所示

```json
{
  "assumptions": {
    "setPublicClassFields": true
  },
  "plugins": [
    ["@babel/plugin-transform-typescript", {
      "allowDeclareFields": true
    }],
    ["@babel/plugin-proposal-decorators", {
      "version": "2018-09",
      "decoratorsBeforeExport": true
    }],
    ["@babel/plugin-proposal-class-properties"]
  ]
}
```

通常不需要`allowDeclareFields`设置,但如果要在不使用修饰器的情况下定义反应式属性,则此设置可能有用.例如

```js
static properties = { foo: {} };
declare foo: string;
constructor() {
  super();
  this.foo = 'bar';
}
```

### 避免类字段和修饰器出现问题

使用装饰器时,必须正确配置 Babel 和 TypeScript 的转译器设置
