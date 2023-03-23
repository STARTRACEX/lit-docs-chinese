# 反应性特征

lit组件接收输入并将其状态存储为 JavaScript
类字段或属性.反应式属性是在更改时可以触发反应式更新周期、重新呈现组件以及选择性地读取或写入属性的属性

```js
class MyElement extends LitElement {
  static properties = {
    name: {},
  };
}
```

```ts
class MyElement extends LitElement {
  @property()
  name: string;
}
```

lit管理反应属性及其相应的属性如下

- 反应性更新.点亮为每个反应属性生成一个吸气剂/二传手对.当反应属性更改时,组件会计划更新.
- 属性处理.默认情况下,Lit
  会设置与该属性对应的观测属性,并在属性更改时更新该属性.还可以选择将属性值反映回属性.
- 超类属性.Lit
  会自动应用超类声明的属性选项.除非要更改选项,否则不需要重新声明属性.
- 元素升级.如果 Lit 组件是在元素已在 DOM 中之后定义的,则 Lit
  将处理升级逻辑,确保在升级元素之前在元素上设置的任何属性在元素升级时触发正确的反应性副作用.

## 公共属性和内部状态

公共属性是组件的公共 API
的一部分.通常,公共属性(尤其是公共反应性属性)应被视为输入.

组件不应更改其自己的公共属性,除非响应用户输入.例如,菜单组件可能具有一个公共属性,该属性可由元素的所有者初始化为给定值,但在用户选择项时由组件本身更新.在这些情况下,组件应调度一个事件,以向组件的所有者指示属性已更改.有关更多详细信息,请参阅调度事件.selectedselected

点亮还支持内部无功状态.内部反应状态是指不属于组件 API
的反应性属性.这些属性没有相应的属性,通常在 TypeScript 中标记为受保护或私有.

## 公共反应属性

使用`properties`修饰器或静态字段声明元素的公共反应式属性.

在任意情况下,都可以传递选项对象来配置属性的功能

### 使用修饰器声明属性

```ts
class MyElement extends LitElement {
  @property({ type: String })
  mode: string;

  @property({ attribute: false })
  data = {};
}
```

`@property`修饰器的参数是一个选项对象.省略参数等效于为所有选项指定默认值

### 在静态属性类字段中声明属性

在静态类字段中声明`properties`属性

```ts
class MyElement extends LitElement {
  static properties = {
    mode: { type: String },
    data: { attribute: false },
  };

  constructor() {
    super();
    this.data = {};
  }
}
```

空选项对象等效于为所有选项指定默认值

```js
static properties = {
  name: {},
};
```

```ts
@property() name?: string;
```

### 声明属性时避免类字段问题

在 JavaScript
中,在声明反应式属性时不得使用类字段.相反,必须在元素构造函数中初始化属性

```js
constructor() {
  super();
  this.data = {};
}
```

TypeScript,您可以使用类字段来声明反应式属性,只要您使用以下模式之一

- 将`tsconfig`中的`useDefineForClassFields`设置为`false`,这不是必须的但推荐设置
- 在字段前上添加`declare`关键字,并将字段的初始值设定项放在构造函数中

### 属性选项

选项对象可以具有以下属性

1. type 类型`TypeHint` 默认值`String`
   可选为`String`,`Number`,`Boolean`,`Array`,`Object`
2. attribute 类型`boolean | string` 默认值`true`
   如果为`false`,converter,reflect,type将被忽略
3. converter 类型`boolean`
4. hasChanged 类型`(?unknown, ?unknown) =boolean`
5. noAccessor 类型`boolean` 默认值`false`
6. reflect 类型`boolean` 默认值`false`
7. state 类型`boolean` 默认值`false`

## 内部反应状态

内部反应状态是指不属于组件公共 API
的反应性属性.这些状态属性没有相应的属性,并且不应从组件外部使用.内部反应状态应由组件本身设置

使用`@state`修饰器声明内部反应状态

```ts
@state() protected _active = false;
```

使用静态`properties`类字段,可以使用`state: true`选项声明内部反应状态

```js
static properties = {
  _active: {state: true}
};
constructor() {
  this._active = false;
}
```

内部反应状态的工作方式与公共反应属性类似,只是没有与该属性关联的属性.为内部反应状态指定的唯一选择是`hasChanged`

`@state`修饰符还可以作为代码压缩器的提示,提示在压缩期间可以更改属性名称

属性更改时发生什么

当属性更改时,将发生以下顺序:

1. 该属性的`setter`被调用.

2. `setter`库调用组件的`requestUpdate`方法

3. 将比较该属性的新旧值
   - 默认情况下,Lit 使用严格的不等式检验来确定值是否已更改
     (`newValue !== oldValue`)
   - 如果属性具有函数,则使用该属性的旧值和新值调用该函数.hasChanged

4. 如果检测到属性更改,则会异步计划更新.如果已计划更新,则仅执行单个更新.

5. 调用组件的`update`方法,将更改的属性反映为属性并重新呈现组件的模板.

请注意,如果更改对象或数组属性,它不会触发更新,因为对象本身没有更改.有关更多信息,请参见[改变对象和数组属性](#改变对象和数组属性).

有许多方法可以挂钩和修改反应式更新周期.有关详细信息,请参阅反应更新周期.

有关属性更改检测的详细信息,请参阅自定义更改检测.

### 改变对象和数组属性

不可变的数据模式.将对象和数组视为不可变.例如,要从`myArray`中删除项目,请构造一个新数组

```js
this.myArray = this.myArray.filter((_, i) => i !== indexToRemove);
```

手动触发更新.改变数据并调用`requestUpdate()`以直接触发更新.例如

```js
this.myArray.splice(indexToRemove, 1);
this.requestUpdate();
```

当在没有参数的情况下调用`requestUpdate()`时,`requestUpdate()`不调用`hasChanged()`调度更新.但请注意,`requestUpdate()`只会导致当前组件更新.如果组件使用上面显示的代码,并且组件将this.myArray传递给子组件,则子组件将检测到数组引用没有更改,因此不会更新.

**通常,对不可变对象使用自上而下的数据流最适合大多数应用程序**,数据树中未更改的部分不会导致依赖它们的组件更新

直接突变数据并调用`requestUpdate()`应被视为高级用例.在这种情况下,您(或其他系统)需要识别使用变异数据的所有组件,并对每个组件调用`requestUpdate()`.当这些组件分布在应用程序中时,这很难管理.不这样做意味着您可能会修改在应用程序的两个部分中呈现的对象,但只有一个部分更新.

在简单的情况下,当您知道一段给定的数据只用于一个组件时,对数据进行变更并调用`requestUpdate()`是安全的.

## 属性

虽然属性非常适合接收 JavaScript 数据作为输入,但属性是 HTML
允许从标记配置元素的标准方式,而无需使用 JavaScript
设置属性.为响应式属性提供属性和属性接口是 Lit
组件在各种环境中使用的关键方式,包括那些在没有客户端模板引擎的情况下呈现的环境,例如
CMS 提供的静态 HTML 页面

默认情况下,Lit
会设置与每个公共反应属性对应的观察属性,并在属性更改时更新该属性.也可以选择反映属性(写回属性)

虽然元素属性可以是任何类型,但属性始终是字符串.这会影响非字符串属性的观察属性和反射属性:

- 若要观察属性(从attribute设置property),必须从字符串转换属性值以匹配属性类型.

- 若要反映属性(从property设置attribute),必须将属性值转换为字符串.

公开属性的布尔属性应必须默认为 false.

### 设置属性名称

默认情况下,Lit
为所有公共反应属性创建相应的观察属性,观察到的属性的名称是小写的属性名称

```js
// 观察的属性是 "myvalue" <my-element myvalue=0 />
static properties = {
  myValue: { type: Number },
};

constructor() {
  super();
  this.myValue = 0;
}
```

```ts
// 观察的属性是 "myvalue" <my-element myvalue=0 />
myValue = 0;
```

<details>

当然也可以使用其他语言(可观察为原文)

```js
// <my-element 我的值=0 />
static properties = {
  myValue: { type: Number },
};

constructor() {
  super();
  this.myValue = 0;
}
```

```ts
// <my-element 我的值=0 />
我的值 = 0;
```

</details>

要创建具有不同名称的观察属性,请设置`attribute`为字符串

```js
// 观察的属性是 "my-name"
static properties = {
  myName: { attribute: 'my-name' },
};

constructor() {
  super();
  this.myName = 'Ogden'
}
```

```ts
// 观察的属性是 "my-name"
myName = "Ogden";
```

要防止为属性创建观察到的属性,请设置`attribute`为`false`
该属性不会从标记中的属性初始化,属性更改不会影响它

```js
// 观察属性不会被获取
static properties = {
  myData: { attribute: false },
};

constructor() {
  super();
  this.myData = {};
}
```

```ts
// 观察属性不会被获取
myData = {};
```

内部反应状态(`@state()`)从不具有关联的属性.

观察到的属性可用于为标记中的属性提供初始值.例如:

```html
<my-element myvalue="99"></my-element>
```

### 使用默认转换器

Lit 有一个默认转换器,用于处理 `String`,`Number`,`Boolean`,`Array`,`Object`
和属性类型.

若要使用默认转换器,请在属性声明中指定`type`选项:

```js
static properties = {
  count: { type: Number },
};

constructor() {
  super();
  this.count = 0;
}
```

```ts
count = 0;
```

如果未为属性指定`type`或使用自定义转换器,则将指定为`String`

下表显示了默认转换器如何处理每种类型的转换

| 类型         | 转换                                                                    |
| ------------ | ----------------------------------------------------------------------- |
| String       | 如果元素具有相应的属性,将`attributeValue`设置为property的值             |
| Number       | 如果元素具有相应的属性,将`Number(attributeValue)`设置为property的值     |
| Boolean      | 如果元素具有相应的属性,设置property的值为true否则为false                |
| Object,Array | 如果元素具有相应的属性,将`JSON.parse(attributeValue)`设置为property的值 |

除Boolean外,如果元素不具有相应的属性,则为其默认值或`undefined`

| 类型          | 转换                                                |
| ------------- | --------------------------------------------------- |
| String,Number | 如果属性已定义且非 null,将属性设置为属性值,否则删除 |
| Boolean       | 如果属性为true,将属性设置为属性值否则删除           |
| Object,Array  | 如果属性已定义且非 null,将属性设置为属性值,否则删除 |

### 使用自定义转换器

要使用自定义转换器,请在属性声明中指定`converter`选项:

```js
myProp: {
  converter: // 自定义转换器
}
```

`converter`可以是object或function

如果是object,具有键`fromAttribute`和`toAttribute`

```js
converter: {
    fromAttribute: (value, type) => {
      // `value` 是字符串
      // 转换为type类型并返回
    },
    toAttribute: (value, type) => {
      // `value` 是 `type` 类型
      // 转换为string并返回
    }
  }
```

如果是function,则是`fromAttribute`

```js
converter:
((value, type) => {
  // `value` 是字符串
  // 转换为`type`类型并返回
});
```

示例

```js
static properties = {
  count: { converter: { fromAttribute: (value) => Number(value) } },
};

constructor() {
  super();
  this.count = 0;
}
```

```ts
count = 0;
```

### 布尔属性

必须默认为`false`

如果不适合使用用例,使用以下方式解决

- 更改属性名称,使其默认为`false`例如`enabled => disablede`

- 请改用string值或number值属性

### 启用属性反射

配置属性`reflect: true`,以便每当它发生更改时,其值都会反映到其相应的属性中,属性对CSS和像`querySelector`这样的DOM
API都是可捕获的

当属性更改时,Lit 将设置相应的属性值

[示例](https://lit.dev/playground/#sample=properties/attributereflect)

不建议反映对象或数组类型的属性.这可能会导致大型对象序列化为 DOM,从而导致性能不佳

## 自定义属性访问器

默认情况下,LitElement为所有反应属性生成getter/setter对.只要设置属性,就会调用setter:

```js
// 声明属性
static properties = {
  greeting: {},
}
constructor() {
  this.super();
  this.greeting = 'Hello';
}
...
// 稍后重设属性
this.greeting = 'Hola'; // 调用greeting生成的属性访问器
```

```ts
// 声明属性
@property() greeting: string = 'Hello';
...
// 稍后重设属性
this.greeting = 'Hola'; // 调用greeting生成的属性访问器
```

生成的访问器自动调用requestUpdate(),如果未开始更新,则开始更新.

### 创建自定义属性访问器

要指定属性的获取和设置方式,可以定义自己的 getter/setter 对,例如

```js
static properties = {
  prop: {},
};
_prop = 0;
set prop(val) {
  let oldVal = this._prop;
  this._prop = Math.floor(val);
  this.requestUpdate('prop', oldVal);
}
get prop() { return this._prop; }
```

```ts
private _prop = 0;
set prop(val: number) {
  let oldVal = this._prop;
  this._prop = Math.floor(val);
  this.requestUpdate('prop', oldVal);
}
//要将自定义属性访问器与@property或@state修饰器一起使用,请将修饰符放在getter上
// highlight-next-line
@property() get prop() {
  return this._prop;
}
```

Lit生成的setter自动调用`requestUpdate()`.如果编写自己的setter,则必须手动调用`requestUpdate()`,并提供属性名及其旧值

在大多数情况下,**不需要创建自定义属性访问器**

### 防止 Lit 生成属性访问器

在极少数情况下,子类可能需要更改或添加其超类上存在的属性的属性选项

若要防止 Lit
生成覆盖超类定义的访问器的属性访问器,请在属性声明中设置`noAccessor`为`true`

```js
static properties = {
  myProp: { type: Number, noAccessor: true }
};
```

定义自己的访问器时无需设置.noAccessor

## 自定义更改检测

所有反应式属性都有`hasChanged()`,在设置属性时调用.

`hasChanged`比较属性的旧值和新值,并评估属性是否已更改.如果返回 `true`,则 Lit
将启动元素更新(如果元素尚未开始更新)

`hasChanged()`的默认实现使用严格的不等式比较:如果`newVal !== oldVal`则返回`true`

若要自定义`hasChanged()`属性,请将其指定为属性选项,如

```js
static properties = {
  myProp: {
    hasChanged(newVal, oldVal) {
      return newVal?.toLowerCase() !== oldVal?.toLowerCase();
    }
  }
};
```

```ts
myProp:
string | undefined;
```

[示例](https://lit.dev/playground/#sample=properties/haschanged)
