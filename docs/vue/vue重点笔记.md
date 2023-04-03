# vue重点笔记

## 入口解析

### 创建app应用

```ts
// main.ts
import { createApp } from "vue"  // 每个 Vue 应用都是通过 createApp 函数创建一个新的实例
import App from "./App.vue"   // .vue文件被导入时，被视为一个vue组件，这里App一个“根组件”

const app = createApp(App)   // 创建主实例

app.mount("#app")     // 被index.html导入时 挂载应用。 对应html中<div id="app"></div>
         // vue应用实例必须在调用了 .mount() 方法后才会渲染出来。
         // 该方法接收一个“容器”参数，可以是一个实际的 DOM 元素或是一个 CSS 选择器字符串
```

### app应用配置

#### .config配置

应用实例会暴露一个 `.config` 对象允许我们配置一些应用级的选项，例如定义一个应用级的错误处理器，用来捕获所有子组件上的错误：

```js
app.config.errorHandler = (err) => {
  /* 处理错误 */
}
```

[常用的config](https://cn.vuejs.org/api/application.html#app-config)

#### 全局组件注册

应用实例还提供了一些方法来注册应用范围内可用的资源，例如注册一个组件：

```js
app.component('TodoDeleteButton', TodoDeleteButton)
```

这使得 `TodoDeleteButton` 在应用的任何地方都是可用的。你也可以在 [API 参考](https://cn.vuejs.org/api/application.html)中浏览应用实例 API 的完整列表。  
**确保在挂载应用`app.mount("#app")`实例之前完成所有应用配置！**

### 多个应用实例

应用实例并不只限于一个。`createApp` API 允许你在同一个页面中创建多个共存的`Vue` 应用，而且每个应用都拥有自己的用于配置和全局资源的作用域。

## template中的要点

### 文本插值

最基本的数据绑定形式是文本插值，它使用的是“Mustache”语法 (即双大括号)：

:::tip Mustache模板语法

Mustache语法"是一种模板引擎的语法，用于将数据和HTML模板结合生成最终的HTML文档。它使用双大括号{{}}来包含变量或表达式，并通过预定义的规则进行解析和替换。例如，{{name}}会被替换为相应数据对象中名为"name"属性的值。

:::

```html
<span>Message: {{ msg }}</span>
```

双大括号标签会被替换为相应组件实例中 `msg` 属性的值。同时每次 `msg` 属性更改时它也会同步更新。

### Attribute绑定
在
:::tip HTML attributes

HTML属性指的是在HTML标签中使用的特性，用于提供有关元素的额外信息。例如，在`<img>`标签中，可以使用`src`属性来指定图像文件的URL地址。

:::

**双大括号不能在 HTML attributes 中使用**。想要响应式地绑定一个 attribute，应该使用 [`v-bind` 指令](https://cn.vuejs.org/api/built-in-directives.html#v-bind)：

```html
<div :id="dynamicId"></div>
<!--因为 v-bind 非常常用，我们提供了特定的简写语法，使用：（冒号）-->
```

#### 特殊情况boolean型

当绑定的值为boolean(true/false)时，若值为false，则根本不会传入此`HTML attribute`，而是直接删除这个属性

#### 一次性绑定多个attr

通过**不带参数**的 `v-bind`，你可以将它们绑定到单个元素上：

```vue
<template>
 <div v-bind="objectOfAttrs"></div>
</template>

<script>
const objectOfAttrs = {
  id: 'container',
  class: 'wrapper'
}
</script>
```

这个`div`渲染出来应该是

```html
<div id="container" class="wrapper"></div>
```

### 使用JS

在 Vue 模板内，JavaScript 表达式可以被使用在如下场景上：

- 在文本插值中 (双大括号)
- 在任何 Vue 指令 (以 `v-` 开头的特殊 attribute) attribute 的值中

#### 调用函数

可以在绑定的表达式中使用一个组件暴露的方法：

```html
<span :title="toTitleDate(date)">
  {{ formatDate(date) }}
</span>
```

也可以访问[JS标准库对象（部分)](https://github.com/vuejs/core/blob/main/packages/shared/src/globalsWhitelist.ts#L3)，比如 `Math` 和 `Date`等。
~~没有显式包含在列表中的全局对象将不能在模板内表达式中访问，例如用户附加在 `window` 上的属性。然而，你也可以自行在 [`app.config.globalProperties`](https://cn.vuejs.org/api/application.html#app-config-globalproperties) 上显式地添加它们，供所有的 Vue 表达式使用(尽量不要用到)。~~

### 模板指令扩展

指令是带有 `v-` 前缀的特殊 attribute。

#### 带参数的指令

某些指令会需要一个“参数”，在指令名后通过一个冒号隔开做标识。例如用 `v-bind` 指令来响应式地更新一个 HTML attribute：

```html
<a v-bind:href="url"> ... </a>
<!-- 简写为 -->
<a :href="url"> ... </a>
```

另一个例子是 `v-on` 指令，用于监听 DOM 事件：

```html
<a v-on:click="doSomething"> ... </a>
<!-- 简写为 -->
<a @click="doSomething"> ... </a>
```

##### 带动态参数

在指令参数上也可以使用一个 JavaScript 表达式[即可以为一个值，也可以为一个带返回值的函数(值应当是一个字符串，或者是 `null`。特殊值 `null` 意为显式移除该绑定。其他非字符串的值会触发警告。)]做为动态参数，需要包含在**一对方括号**内：

:::details 动态参数汇总

- v-text
- v-html
- v-show
- v-if
- v-else
- v-else-if
- v-for
- v-on
- v-bind
- v-model
- v-slot
- v-pre
- v-once
- v-memo
- v-cloak
:::

```html
<a v-bind:[attributeName]="url"> ... </a>

<!-- 简写为 -->
<a :[attributeName]="url"> ... </a>
```

##### .修饰符

修饰符是以点开头的特殊后缀，表明指令需要以一些特殊的方式被绑定。例如 .prevent 修饰符会告知 v-on 指令对触发的事件调用 event.preventDefault()：

:::details 修饰符汇总

- `.stop` *单击事件将停止传递*

- `.prevent`*提交事件将不再重新加载页面*

- `.self`*仅当 event.target 是元素本身时才会触发事件处理器*

- `.capture`*添加事件监听器时，使用 `capture` 捕获模式*

- `.once`*点击事件最多被触发一次*

- `.passive`*滚动事件的默认行为 (scrolling) 将立即发生而非等待 `onScroll` 完成*

:::
![img](https://cn.vuejs.org/assets/directive.69c37117.png)

### 计算属性

模板中的JS表达式虽然方便，但也只能用来做简单的操作。如果在模板中写太多逻辑，会让模板变得臃肿，难以维护。推荐使用计算属性来描述依赖响应式状态的复杂逻辑。`computed()` 方法期望接收一个 getter 函数，返回值为一个**计算属性 ref**。

```vue
<script setup>
import { reactive, computed } from 'vue'

const author = reactive({
  name: 'John Doe',
  books: [
    'Vue 2 - Advanced Guide',
    'Vue 3 - Basic Guide',
    'Vue 4 - The Mystery'
  ]
})

// 一个计算属性 ref
const publishedBooksMessage = computed(() => {
  return author.books.length > 0 ? 'Yes' : 'No'
})
</script>

<template>
  <p>Has published books:</p>
  <span>{{ publishedBooksMessage }}</span>
</template>
```




## script中的要点

### vue中API的三种写法

- 选项式
:::details
Vue.js 2.x 中主要采用的是选项式 API 的编程方式，它将一个组件的数据、计算和方法等各种配置以一个对象的形式传递给 Vue 实例，然后通过 Vue 组件内置的生命周期钩子函数来进行组件的生命周期管理。选项式 API 是一种简单易学的编程方式，但是对于大型组件，它的可维护性和复用性可能会受到影响。

```js
export default {
  data() {
    return {
      message: 'hello world'
    }
  },
  methods: {
    greet() {
      console.log(this.message);
    }
  },
  mounted() {
    this.greet();
  }
}
```

:::

- 组合式
:::details
Vue 3 中新增了组合式 API，它是一种更为灵活的 API 设计，能够更好地支持大型组件的开发。组合式 API 将一个组件拆分为若干个功能单一的模块，并提供一些函数来处理组件中的各种配置，包括 props、data、计算方法和生命周期钩子等。通过这种方式可以更好地重用和封装某些逻辑的代码，使组件代码更具可读性和可维护性。
```js
import { reactive } from 'vue'

export default {
  setup() {
    const state = reactive({ count: 0 })

    function increment() {
      state.count++
    }

    // 不要忘记同时暴露 increment 函数
    return {
      state,
      increment
    }
  }
}
```
:::

- 组合式+setup语法糖

:::details
在 `setup()` 函数中手动暴露大量的状态和方法非常繁琐。幸运的是，我们可以通过使用构建工具来简化该操作。当使用单文件组件（SFC）时，我们可以使用 `<script setup>` 来大幅度地简化代码。

`<script setup>` 中的顶层的导入和变量声明可在同一组件的模板中直接使用。你可以理解为模板中的表达式和 `<script setup>` 中的代码处在同一个作用域中。

```js
<script setup>
import { reactive } from 'vue'

const state = reactive({ count: 0 })

function increment() {
  state.count++
}
</script>
```
:::

### 响应式基础

- 响应式对象是指在 Vue 中使用的一种特殊对象，它可以跟踪对其属性的访问和修改操作，并触发相应的响应式更新。响应式对象其实是 [JavaScript Proxy](https://developer.mozilla.org/zh-CN/docs/Web/JavaScript/Reference/Global_Objects/Proxy)，其行为表现与一般对象相似。不同之处在于 Vue 能够跟踪对响应式对象属性的访问与更改操作。
- [JavaScript Proxy](https://es6.ruanyifeng.com/#docs/proxy) 是一个内置的 JavaScript 对象，允许你在访问另一个对象之前拦截并定制这个操作。可以通过 Proxy 来实现响应式对象的功能，因为它可以拦截对响应式对象属性的访问和修改操作，并对其进行处理。

#### 用 reactive / ref 声明响应式对象
- 我们可以使用 reactive() 函数创建一个响应式对象或数组
- 也使用ref()函数将任何值类型创建为响应式对象
对比：
- reactive()的缺点：reactive底层是建立在原生 JavaScript 对象 Proxy 上的createReactiveObject 函数实现的，种种限制归根结底是因为 JavaScript 没有可以作用于所有值类型的 “引用” 机制。
- ref()的缺点：ref是vue包装了普通数据类型的特殊对象，需要通过.value来获取它的值 。
- 当 ref 在模板中作为顶层属性被访问时，它们会被自动“解包”，所以不需要使用 .value。
- **同时，当值为对象类型时，ref()会用 reactive() 自动转换它的 .value。**





#### 在ts中为响应式对象标注类型

- 要显式地标注一个 `reactive` 变量的类型，我们可以使用接口：

```typescript
import { reactive } from 'vue'

interface Book {
  title: string
  year?: number
}

const book: Book = reactive({ title: 'Vue 3 指引' })
<!--不建议使用以下泛型参数的方式，因为处理了深层次 ref 解包的返回值与泛型参数的类型不同。-->
const book = reactive<Book>({title: 'Vue 3 指引'})
```

:::details 

在 Vue.js 3 中，我们可以使用 `reactive` 函数将一个 JavaScript 对象转换为响应式对象。`reactive` 返回的对象中，其所有响应式属性都被包装在了一个或多个 `Ref` 对象中，以便在属性被修改时触发相应的响应式更新。`Ref` 对象提供了 `.value` 属性，用于获取或修改包装值的值。

当我们访问响应式对象的属性时，实际上是在访问 `Ref` 对象的 `.value` 属性，而不是实际的属性值。在实际开发中，有可能会对响应式对象进行较深层次的属性访问，需要使用多次 `.value` 属性进行解包，例如：

```
📎const obj = reactive({
  a: {
    b: {
      c: 1,
    },
  },
});

// 获取嵌套属性 c 的值
const value = obj.a.b.c.value;
这种情况下，就会有一个潜在的风险：解包后的值类型可能与我们指定的泛型类型不一致。例如，在上面的代码中，`value` 的类型是 `number`，而不是 `Ref<number>`，这样就可能在编写代码时出现类型推断失效的问题。
```
因此，在使用 `reactive` 函数时，不建议使用泛型参数来为对象指定类型。尽管可以通过在代码中使用类型守卫（Type Guard）等技术来进行类型推断，但这种方式可能会使代码变得更为复杂，且不如避免出现类型推断错误来得简单明了。
:::

- 可以通过使用 `Ref` 这个类型 标注（不常用）

  ```js
  import { ref } from 'vue'
  import type { Ref } from 'vue'
  const year: Ref<string | number> = ref('2020')
  year.value = 2020 // 成功！
  ```

- 或者，在调用 `ref()` 时传入一个泛型参数，来覆盖默认的推导行为(常用)

  ```js
  const year = ref<string | number>('2020')
  
  year.value = 2020 // 成功！
  ```

  
