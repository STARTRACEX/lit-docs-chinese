# mixins

Class
mixins是一种使用标准JavaScript在类之间共享代码的模式.与[反应式控制器](/docs/composition/controllers/)这样的"has-a"组合模式(类可以拥有控制器来添加行为)不同,mixin实现"is-a"组合,其中,mixin使类本身*成为*共享行为的实例.

可以使用mixins通过添加API或重写其生命周期回调来定制Lit组件.

## 基础

Mixin可以被认为是"子类工厂"应用于并返回一个子类,该子类通过mixin中的行为进行扩.由于mixin是使用标准JavaScript类表达式实现的可以使用所有可用于子类化的习惯用法,例如添加新的字段/方法,重写现有的超类方法,并使用`super`.

要定义mixin,请编写一个函数`superClass`,并返回一个新的类来扩展它,根据需要添加字段和方法:

```ts
const MyMixin = (superClass) =>
  class extends superClass {
    /* class fields & methods to extend superClass with */
  };
```

要应用mixin,只需传递一个类来生成带有mixin的子类 应用最常见的情况是,定义新类:

```ts
class MyElement extends MyMixin(LitElement) {
  /* user code */
}
```

Mixin还可以用于创建具体的子类,然后用户可以扩展这些子类
与普通类类似,其中mixin是实现细节:

```ts
export const LitElementWithMixin = MyMixin(LitElement);
```

```ts
import { LitElementWithMixin } from "./lit-element-with-mixin.js";

class MyElement extends LitElementWithMixin {
  /* user code */
}
```

因为类混合是标准的JavaScript模式,而不是Lit特定的,社区中有大量关于利用mixin代码重用.有关mixin的信息,这里有一些参考:

- [MDN上的 Class mixins](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Classes#mix-ins)
- [Real Mixins with JavaScript Classes](https://justinfagnani.com/2015/12/21/real-mixins-with-JavaScript-classes/)
- [TypeScript handbook - Mixins](https://www.TypeScriptlang.org/docs/handbook/mixins.html)
- [Dedupe mixin library by open-wc](https://open-wc.org/docs/development/dedupe-mixin/)
- [Mixin 约定](https://component.kitchen/elix/mixins)

## 为LitElement创建mixins

应用于LitElement的混合可以实现或覆盖任何标准[自定义元素生命周期](/docs/components/lifecycle/#自定义元素生命周期)回调,如`constructor()`或`connectedCallback()`,以及[反应式更新周期](/docs/components/lifecycle/#反应式更新周期)回调,如`render()`或`updated()`.

例如,以下mixin将在创建元素时记录,连接并更新:

```ts
const LoggingMixin = (superClass) =>
  class extends superClass {
    constructor() {
      super();
      console.log(`${this.localName} was created`);
    }
    connectedCallback() {
      super.connectedCallback();
      console.log(`${this.localName} was connected`);
    }
    updated(changedProperties) {
      super.updated?.(changedProperties);
      console.log(`${this.localName} was updated`);
    }
  };
```

注意,mixin应该始终对`LitElement`实现的标准自定义元素生命周期方法进行super调用.当重写反应式更新生命周期回调时,如果super方法已经存在于超类中,那么最好调用它(如上所示,对`super.updated?.()`的可选链接调用).

还请注意,mixin可以选择在标准生命周期回调的基本实现之前或之后执行工作,方法是选择何时执行super调用.

混合物还可以添加[反应性质](/docs/components/properties/),
[styles](/docs/components/styles/)和子类元素的API.

下面示例中的mixin向元素添加了一个`highlight`反应属性,以及一个`renderHighlight()`方法,用户可以调用该方法来包装一些内容.当设置了`highlight`属性/属性时,包装内容的样式为黄色.

[示例](https://lit.dev/playground/#sample=docs/mixins/highlightable)

注意,在上面的示例中,mixin的用户需要从其`render()`方法调用`renderHighlight()`,并注意将mixin定义的`静态样式`添加到子类样式中.mixin和用户之间契约的性质取决于mixin的定义,应由mixin作者记录.

## TypeScript 中的 Mixins

在TypeScript中编写`LitElement`混合时,需要注意一些细节.

### 键入超类

应该将`superClass`参数约束为所需的类类型
要扩展的用户(如果有).这可以使用通用的`构造函数`帮助器类型完成,如下所示:

```ts
import {LitElement} from 'lit';

type Constructor<T = {}> = new (...args: any[]) => T;

export const MyMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class MyMixinClass extends superClass {
    /* ... */
  };
  return MyMixinClass as /* see "typing the subclass" below */;
}
```

上面的示例确保了传递给mixin的类从`LitElement`扩展,这样你的mixin就可以依赖于回调和Lit提供的其他API.

### 键入子类

尽管TypeScript基本上支持推断使用mixin模式生成的子类的返回类型,但它有一个严重的限制,即推断的类不能包含带有`private`或`protected`访问修饰符的成员.

由于`LitElement`本身确实有私有和受保护的成员,默认情况下,当返回扩展`LitElement'的类时,TypeScript将出现`
*导出的类表达式的属性'…'可能不是私有或受保护的*错误.

有两种变通方法都涉及转换返回类型以避免上述错误.

#### 当mixin没有添加新的公共/受保护的API时

如果mixin仅覆盖`LitElement`方法或属性,并且不添加任何新的API,那么您可以简单地将生成的类强制转换为传入的超类类型`T`:

```ts
export const MyMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class MyMixinClass extends superClass {
    connectedCallback() {
      super.connectedCallback();
      this.doSomethingPrivate();
    }
    private doSomethingPrivate() {
      /* does not need to be part of the interface */
    }
  }
  // Cast return type to the superClass type passed in
  return MyMixinClass as T;
};
```

#### 当mixin添加新的公共/受保护的API时

如果您的mixin确实添加了新的受保护的或公共的API,您需要用户能够在其类上使用这些API,那么您需要单独定义mixin的接口和实现,并将返回类型转换为mixin接口和超级类类型的交集:

```ts
// Define the interface for the mixin
export declare class MyMixinInterface {
  highlight: boolean;
  protected renderHighlight(): unknown;
}

export const MyMixin = <T extends Constructor<LitElement>>(superClass: T) => {
  class MyMixinClass extends superClass {
    @property()
    highlight = false;
    protected renderHighlight() {
      /* ... */
    }
  }
  // Cast return type to your mixin's interface intersected with the superClass type
  return MyMixinClass as Constructor<MyMixinInterface> & T;
};
```

### 应用修饰器

由于 TypeScript
类型系统的限制，装饰器(如`@property()`)必须应用于类声明语句而不是类表达式.

TypeScript 中的 mixins
需要声明一个类然后返回它，而不是直接从箭头函数返回类表达式.

支持:

```ts
export const MyMixin = <T extends LitElementConstructor>(superClass: T) => {
  // ✅ Defining a class in a function body, and then returning it
  class MyMixinClass extends superClass {
    @property()
    mode = "on";
    /* ... */
  }
  return MyMixinClass;
};
```

不支持:

```ts
export const MyMixin = <T extends LitElementConstructor>(superClass: T) =>
  // ❌ Returning class expression direcly using arrow-function shorthand
  class extends superClass {
    @property()
    mode = "on";
    /* ... */
  };
```
