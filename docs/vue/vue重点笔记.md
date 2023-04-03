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

### Class 与 Style 绑定

因此，Vue 专门为 class 和 style 的 v-bind 用法提供了特殊的功能增强。除了字符串外，表达式的值也可以是**对象**或**数组**。

```html
<div :class="{ active: isActive }"></div>
<!-- 上面的语法表示 active 是否存在取决于数据属性 isActive 的真假值。-->
```

```html
<div class="static" :class="{ active: isActive, 'text-danger': hasError }" ></div>
<!-- 可以用obj处理多个class-->

<!-- 也可以用数组来处理多个class-->
<div :class="[{ active: isActive }, errorClass]"></div>
<!-- errorClass 会一直存在，但 active 只会在 isActive 为真时才存在。>
```

绑定的对象并不一定需要写成内联字面量的形式，也可以直接绑定一个对象，也可以是计算属性：

```vue
<script>
const classObject = reactive({
  active: true,
  'text-danger': false
})
</script>

<template>
<div :class="classObject"></div>
</template>
```

------



### 条件渲染 v-if

`v-if` 指令用于条件性地渲染一块内容。这块内容只会在指令的表达式返回真值时才被渲染。

#### template 上的 v-if
因为 v-if 是一个指令，他必须依附于某个元素。但如果我们想要切换不止一个元素呢？在这种情况下我们可以在一个 `<template>` 元素上使用 v-if，这只是一个不可见的包装器元素，最后渲染的结果并不会包含这个 `<template>` 元素。

```vue
<template v-if="ok">
  <h1>Title</h1>
  <p>Paragraph 1</p>
  <p>Paragraph 2</p>
</template>
```
#### v-show
另一个可以用来按条件显示一个元素的指令是 `v-show`。其用法基本一样：
不同之处在于 `v-show` 会在 DOM 渲染中保留该元素；v-show 仅切换了该元素上名为 `display` 的 CSS 属性。
**v-show 不支持在 `<template>` 元素上使用**，也不能和 `v-else` 搭配使用。

总的来说，`v-if` 有更高的切换开销，而 `v-show` 有更高的初始渲染开销。

------



### 列表渲染 v-for

我们可以使用 `v-for` 指令基于一个数组来渲染一个列表。`v-for` 指令的值需要使用 `item in items` 形式的特殊语法，其中 `items` 是源数据的数组，而 `item` 是迭代项的**别名**，`v-for` 也支持使用*可选*的第二个参数表示当前项的位置索引。：

```vue
<li v-for="(item,index) in items">
  {{ item.message }}
</li>
```

#### `v-for` 与对象

你也可以使用 `v-for` 来遍历一个对象的所有属性。遍历的顺序会基于对该对象调用 `Object.keys()` 的返回值来决定。

可以通过提供第二个参数表示属性名 (例如 key)，第三个参数表示位置索引：

```vue
<script>
const myObject = reactive({
  title: 'How to do lists in Vue',
  author: 'Jane Doe',
  publishedAt: '2016-04-10'
})
</script>
<template>
<ul>
    <li v-for="(value, key, index) in myObject">
      {{ index }}. {{ key }}: {{ value }}
    </li>
</ul>
</template>
```



#### 在 `v-for` 里使用范围值

`v-for` 可以直接接受一个整数值。在这种用例中，会将该模板基于 `1...n` 的取值范围重复多次。

```vue
<span v-for="n in 10">{{ n }}</span>
```

**注意此处 `n` 的初值是从 `1` 开始而非 `0`。**



#### 通过 :key 管理状态

Vue 默认按照“就地更新”的策略来更新通过 `v-for` 渲染的元素列表。当数据项的顺序改变时，Vue 不会随之移动 DOM 元素的顺序，而是就地更新每个元素，确保它们在原本指定的索引位置上渲染。

默认模式是高效的，但**只适用于列表渲染输出的结果不依赖子组件状态或者临时 DOM 状态 (例如表单输入值) 的情况**。

为了给 Vue 一个提示，以便它可以跟踪每个节点的标识，从而重用和重新排序现有的元素，你需要为每个元素对应的块提供一个唯一的 `key` attribute：

```vue
<template v-for="todo in todos" :key="todo.name">
  <li>{{ todo.name }}</li>
</template>
```



推荐在任何可行的时候为 `v-for` 提供一个 `key` attribute，除非所迭代的 DOM 内容非常简单 (例如：不包含组件或有状态的 DOM 元素)，或者你想有意采用默认行为来提高性能。在没有 key 的情况下，Vue 只能通过节点的索引进行匹配，而不能准确地找到旧节点中与新节点相对应的位置。这可能会导致一些不必要的 DOM 操作，影响性能。

`key` 绑定的值期望是一个基础类型的值，例如**字符串**或**number** 类型。**不要用对象**作为 `v-for` 的 key。关于 `key` attribute 的更多用途细节，请参阅 [`key` API 文档](https://cn.vuejs.org/api/built-in-special-attributes.html#key)。

### 事件处理 v-on

我们可以使用 `v-on` 指令 (简写为 `@`) 来监听 DOM 事件，并在事件触发时执行对应的 JavaScript。用法：`v-on:click="handler"` 或 `@click="handler"`。

#### 调用方法
除了直接绑定方法名，你还可以在内联事件处理器中调用方法。这允许我们向方法传入自定义参数以代替原生事件：

```vue
<button @click="say('hello')">Say hello</button>
<button @click="say('bye')">Say bye</button>
```

#### 访问事件参数

有时我们需要在内联事件处理器中访问原生 DOM 事件。你可以向该处理器方法传入一个特殊的 `$event` 变量，或者使用内联箭头函数：

```vue
<template>
<!-- 使用特殊的 $event 变量 -->
<button @click="warn('Form cannot be submitted yet.', $event)">
  Submit
</button>

<!-- 使用内联箭头函数 -->
<button @click="(event) => warn('Form cannot be submitted yet.', event)">
  Submit
</button>
</template>

<script>
function warn(message, event) {
  // 这里可以访问原生事件
  if (event) {
    event.preventDefault()
  }
  alert(message)
}
</script>
```

#### 事件修饰符

Vue 为 `v-on` 提供了**事件修饰符**。修饰符是用 `.` 表示的指令后缀，包含以下这些：

- `.stop`
- `.prevent`
- `.self`
- `.capture`
- `.once`
- `.passive`

#### 按键修饰符

在监听键盘事件时，我们经常需要检查特定的按键。Vue 允许在 v-on 或 @ 监听按键事件时添加按键修饰符。
[详细](https://cn.vuejs.org/guide/essentials/event-handling.html#key-modifiers)

### 双向绑定 v-model

使用v-model双向绑定数据

```vue
<input v-model="text">
```

#### 修饰符

##### .lazy

默认情况下，`v-model` 会在每次 `input` 事件后更新数据 (IME 拼字阶段的状态例外)。你可以添加 `lazy` 修饰符来改为在每次 `change` 事件后更新数据

##### .number

如果你想让用户输入自动转换为数字，你可以在 `v-model` 后添加 `.number` 修饰符来管理输入

如果该值无法被 `parseFloat()` 处理，那么将返回原始值。

`number` 修饰符会在输入框有 `type="number"` 时自动启用。

##### .trim

如果你想要默认自动去除用户输入内容中两端的空格，你可以在 `v-model` 后添加 `.trim` 修饰符

### DOM元素的直接引用 特殊的ref

在某些情况下，我们仍然需要直接访问底层 DOM 元素。要实现这一点，我们可以使用特殊的 `ref` attribute：

```vue
<script setup>
import { ref, onMounted } from 'vue'

// 声明一个 ref 来存放该元素的引用
// 必须和模板里的 ref 同名
const input1 = ref(null)

onMounted(() => {
  input1.value.focus() // 使用setup语法糖input1会自动获得template中同名的引用。
})
</script>

<template>
  <input ref="input1" />
</template>
```

如果你需要侦听一个模板引用 ref 的变化，确保考虑到其值为 `null` 的情况：

```js
watchEffect(() => {
  if (input.value) {
    input.value.focus()
  } else {
    // 此时还未挂载，或此元素已经被卸载（例如通过 v-if 控制）
  }
})
```

#### 在ts中为模板ref标注类型

模板引用需要通过一个显式指定的泛型参数和一个初始值 `null` 来创建：

```vue
<script setup lang="ts">
import { ref, onMounted } from 'vue'

const el = ref<HTMLInputElement | null>(null)

onMounted(() => {
  el.value?.focus()
})
</script>

<template>
  <input ref="el" />
</template>
```

注意为了严格的类型安全，有必要在访问 `el.value` 时使用可选链或类型守卫。这是因为直到组件被挂载前，这个 ref 的值都是初始的 `null`，并且在由于 `v-if` 的行为将引用的元素卸载时也可以被设置为 `null`。

------

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

##### 在ts中为响应式对象标注类型

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

``` js
const obj = reactive({
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

#### 计算属性 computed

模板中的JS表达式虽然方便，但也只能用来做简单的操作。如果在模板中写太多逻辑，会让模板变得臃肿，难以维护。推荐使用计算属性来描述依赖响应式状态的复杂逻辑。`computed()` 方法期望接收一个 getter 函数，返回值为一个**计算属性 ref**。和其他一般的 ref 类似，你可以通过 `publishedBooksMessage.value` 访问计算结果。

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

##### 在ts中为计算属性标注类型

`computed()` 会自动从其计算函数的返回值上推导出类型：

```typescript
import { ref, computed } from 'vue'

const count = ref(0)

// 推导得到的类型：ComputedRef<number>
const double = computed(() => count.value * 2)

// => TS Error: Property 'split' does not exist on type 'number'
const result = double.value.split('')
```

你还可以通过泛型参数显式指定类型：

```typescript
const double = computed<number>(() => {
  // 若返回值不是 number 类型则会报错
})
```

##### 计算属性 对比 普通函数方法

函数可以获得和计算属性相同的结果，不同之处在于计算属性值会基于其**响应式依赖**被**缓存**。一个计算属性仅会在其响应式依赖**更新**时才重新计算。

为什么需要缓存呢？想象一下我们有一个非常耗性能的计算属性 `list`，需要循环一个巨大的数组并做许多计算逻辑，并且可能也有其他计算属性依赖于 `list`。没有缓存的话，我们会重复执行非常多次 `list` 的 getter，然而这实际上没有必要！如果你确定不需要缓存，那么也可以使用方法调用。

#### 侦听器 watch

计算属性允许我们声明性地计算衍生值。*然而在有些情况下，我们需要在状态变化时执行一些“副作用”：例如更改 DOM，或是根据异步操作的结果去修改另一处的状态。*(计算属性只能return一个值，而无法在函数中操作dom等。)

在组合式 API 中，我们可以使用`watch` 函数在每次响应式状态发生变化时触发回调函数：

```ts
<!-- question:监听的对象  newquestion:变更后的值   oldquestion：变更前的值 
<!--{ deep 如果不设置deep属性或设置为false，那么只会监听对象本身的变化，而不会递归监听对象内部值的变化。}->
<!--{ immediate 在创建侦听器时，立即执行一遍回调函数 }-->
<!--{ flush:'post' 使侦听器回调中能访问被 Vue 更新之后的 DOM}
watch(question, async (newQuestion, oldQuestion) => {
  if (newQuestion.indexOf('?') > -1) {
    answer.value = 'Thinking...'
    try {
      const res = await fetch('https://yesno.wtf/api')
      answer.value = (await res.json()).answer
    } catch (error) {
      answer.value = 'Error! Could not reach the API. ' + error
    }
  }
},{ deep: true ,immediate: true,  flush: 'post'}
)
```

`question`:watch 的第一个参数可以是不同形式的“数据源”：它可以是一个 ref (包括计算属性)、一个响应式对象、一个 getter 函数、或多个数据源组成的数组：

```ts
const x = ref(0)
const y = ref(0)

// 单个 ref
watch(x, (newX) => {
  console.log(`x is ${newX}`)
})

// getter 函数
watch(
  () => x.value + y.value,
  (sum) => {
    console.log(`sum of x + y is: ${sum}`)
  }
)

// 多个来源组成的数组
watch([x, () => y.value], ([newX, newY]) => {
  console.log(`x is ${newX} and y is ${newY}`)
})
```

##### watchEffect()

`watchEffect()` 允许我们自动跟踪回调的响应式依赖。

```ts
const todoId = ref(1)
const data = ref(null)

watch(todoId, async () => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
  )
  data.value = await response.json()
}, { immediate: true })

<!-- 对todoID既要进行监听，又要在回调中用到这个响应式的变量值，可以直接使用watchEffect()-->
watchEffect(async () => {
  const response = await fetch(
    `https://jsonplaceholder.typicode.com/todos/${todoId.value}`
  )
  data.value = await response.json()
})
<!--每当 todoId.value 变化时，回调会再次执行。有了 watchEffect()，我们不再需要明确传递 todoId 作为源值。-->
```

watchEffect的回调函数会在初始化时立即执行，并自动追踪其所依赖的所有状态，比较常用于监听多个变量时，可以将多个变量放在watchEffect中，进行全局依赖追踪。不再需要指定 `immediate: true`

##### 停止侦听器

在大多数情况下，你无需关心怎么停止一个侦听器。

------

### 生命周期

![生命周期](https://img-blog.csdnimg.cn/20200815191941397.png?x-oss-process=image/watermark,type_ZmFuZ3poZW5naGVpdGk,shadow_10,text_aHR0cHM6Ly9ibG9nLmNzZG4ubmV0L3FxXzQ0NzUyOTc4,size_16,color_FFFFFF,t_70)

- 创建期间生命周期方法      beforeCreate:     created:      beforeMount      mounted

- 运行期间生命周期方法      beforeUpdate      updated

- 销毁期间的生命周期方法    beforeDestroy     destroyed

最常用的是 [`onMounted`](https://cn.vuejs.org/api/composition-api-lifecycle.html#onmounted)、[`onUpdated`](https://cn.vuejs.org/api/composition-api-lifecycle.html#onupdated) 和 [`onUnmounted`](https://cn.vuejs.org/api/composition-api-lifecycle.html#onunmounted)

## 组件

组件允许我们将 UI 划分为独立的、可重用的部分，并且可以对每个部分进行单独的思考。在实际应用中，组件常常被组织成层层嵌套的树状结构：

![img](https://cn.vuejs.org/assets/components.7fbb3771.png)

### 定义一个组件

当使用构建步骤时，我们一般会将 Vue 组件定义在一个单独的 `.vue` 文件中，这被叫做[单文件组件](https://cn.vuejs.org/guide/scaling-up/sfc.html) (简称 SFC)

组件可以被重用任意多次，但每一个组件都维护着自己的状态。这是因为每当你使用一个组件，就创建了一个新的**实例**。

### 使用一个组件

#### 局部注册组件

要使用一个子组件，我们需要在父组件中导入它。假设我们把计数器组件放在了一个叫做 `ButtonCounter.vue` 的文件中，这个组件将会以**默认导出**的形式被暴露给外部。

```vue
<!--父组件中导入子组件-->
<script setup>
import ButtonCounter from './ButtonCounter.vue'
</script>
```

#### 全局注册组件

当然，你也可以全局地注册一个组件，使得它在当前应用中的任何组件上都可以使用，而不需要额外再导入。

我们可以使用 Vue 应用实例的 app.component() 方法，让组件在当前 Vue 应用中全局可用。

```js
import { createApp } from 'vue'

const app = createApp({})

app.component('ComponentA', ComponentA)
  .component('ComponentB', ComponentB)
  .component('ComponentC', ComponentC)
```

```js
<!-- 这在当前应用的任意组件中都可用 -->
<ComponentA/>
<ComponentB/>
<ComponentC/>
```

#### 局部注册VS全局注册

全局注册虽然很方便，但有以下几个问题：

全局注册，但并没有被使用的组件无法在生产打包时被自动移除 (也叫“tree-shaking”)。如果你全局注册了一个组件，即使它并没有被实际使用，它仍然会出现在打包后的 JS 文件中。

全局注册在大型项目中使项目的依赖关系变得不那么明确。在父组件中使用子组件时，不太容易定位子组件的实现。和使用过多的全局变量一样，这可能会影响应用长期的可维护性。

相比之下，局部注册的组件需要在使用它的父组件中显式导入，并且只能在该父组件中使用。它的优点是使组件之间的依赖关系更加明确，并且对 tree-shaking 更加友好。

#### 组件名格式

都使用 PascalCase （大驼峰命名）作为组件名的注册格式

### 传递props
