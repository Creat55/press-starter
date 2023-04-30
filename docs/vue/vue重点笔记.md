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

Props 是一种特别的 attributes，一个组件需要显式声明它所接受的 props，这样 Vue 才能知道外部传入的哪些是 props，哪些是透传 attribute。

在使用 `<script setup>` 的单文件组件中，props 可以使用 `defineProps()` 宏来声明：

```vue
<!-- Child Components -->
<script setup>
const props = defineProps(['foo'])

console.log(props.foo)
</script>
```

除了使用字符串数组来声明 prop 外，还可以使用对象的形式：

```js
defineProps({
  title: String,
  likes: Number
})
```

#### Prop 校验
Vue 组件可以更细致地声明对传入的 props 的校验要求。比如我们上面已经看到过的类型声明，如果传入的值不满足类型要求，Vue 会在浏览器控制台中抛出警告来提醒使用者。这在开发给其他开发者使用的组件时非常有用。

要声明对 props 的校验，你可以向 defineProps() 宏提供一个带有 props 校验选项的对象，例如：

```js
defineProps({
  // 基础类型检查
  // （给出 `null` 和 `undefined` 值则会跳过任何类型检查）
  propA: Number,
  // 多种可能的类型
  propB: [String, Number],
  // 必传，且为 String 类型
  propC: {
    type: String,
    required: true
  },
  // Number 类型的默认值
  propD: {
    type: Number,
    default: 100
  },
  // 对象类型的默认值
  propE: {
    type: Object,
    // 对象或数组的默认值
    // 必须从一个工厂函数返回。
    // 该函数接收组件所接收到的原始 prop 作为参数。
    default(rawProps) {
      return { message: 'hello' }
    }
  },
  // 自定义类型校验函数
  propF: {
    validator(value) {
      // The value must match one of these strings
      return ['success', 'warning', 'danger'].includes(value)
    }
  },
  // 函数类型的默认值
  propG: {
    type: Function,
    // 不像对象或数组的默认，这不是一个
    // 工厂函数。这会是一个用来作为默认值的函数
    default() {
      return 'Default function'
    }
  }

```

#### 在ts中声明props并标注类型

如果你正在搭配 TypeScript 使用 `<script setup>`，也可以使用类型标注来声明 props：

```vue
<script setup lang="ts">
defineProps<{
  title?: string
  likes?: number
}>()
</script>
```

##### 复杂的 prop 类型

通过基于类型的声明，一个 prop 可以像使用其他任何类型一样使用一个复杂类型：

```vue
<script setup lang="ts">
interface Book {
  title: string
  author: string
  year: number
}

const props = defineProps<{
  book: Book
}>()
</script>
```

#### Props 名字格式
如果一个 prop 的名字很长，应使用 camelCase 形式，因为它们是合法的 JavaScript 标识符，可以直接在模板的表达式中使用，也可以避免在作为属性 key 名时必须加上引号。

#### props 传递不同的值类型
任何类型的值都可以作为 props 的值被传递。

###### Vue 中，如何将函数作为 props 传递给组件

父子组件之间尽量避免直接修改对方的 props 或 data，因为这会破坏响应式数据的流动，导致不可预知的行为。因此，Vue 鼓励使用事件来实现父子组件之间的通信。

[函数](https://blog.csdn.net/qq449245884/article/details/106066381)

#### 使用没有参数的 v-bind 传入一个对象绑定多个 prop

```vue
<script>
const post = {
  id: 1,
  title: 'My Journey with Vue'
}
</script>
<template>
<BlogPost v-bind="post" />
</template>
```

等价于：

```vue
<BlogPost :id="post.id" :title="post.title" />
```

#### 单向数据流

所有的 props 都遵循着**单向绑定**原则，props 因父组件的更新而变化，自然地将新的状态向下流往子组件，而不会逆向传递。这避免了子组件意外修改父组件的状态的情况，不然应用的数据流将很容易变得混乱而难以理解。



### 监听事件

子组件与父组件交互时需要用到监听事件。

父组件可以通过 `v-on` 或 `@` 来选择性地监听子组件上抛的事件，就像监听原生 DOM 事件那样：


```vue
<script>
const posts = ref([
  /* ... */
])

const postFontSize = ref(1)
</script>

<template>
<div :style="{ fontSize: postFontSize + 'em' }">
  <BlogPost  ...  @enlarge-text="postFontSize += 0.1" />
</div>
</template>
```

子组件可以通过调用内置的 [**`$emit`** 方法](https://cn.vuejs.org/api/component-instance.html#emit)，通过传入事件名称来抛出一个事件：

```vue
<!-- BlogPost.vue, 省略了 <script> -->
<template>
  <div class="blog-post">
    <h4>{{ title }}</h4>
    <button @click="$emit('enlarge-text')">Enlarge text</button>
  </div>
</template>
```

在`<script setup>`中，更常用的，我们可以通过 [`defineEmits`](https://cn.vuejs.org/api/sfc-script-setup.html#defineprops-defineemits) 宏来声明需要抛出的事件：

```vue
<!-- BlogPost.vue -->
<script setup>
defineProps(['title'])
defineEmits(['enlarge-text'])
</script>
```

它可以被用于在组件的 `<script setup>` 中抛出事件，因为此处无法直接访问 `$emit`：

```vue
<script setup>
const emit = defineEmits(['enlarge-text'])

emit('enlarge-text')
</script>
```

#### 带参数的事件
有时候我们会需要在触发事件时附带一个特定的值。举例来说，我们想要 `<BlogPost>` 组件来管理文本会缩放得多大。在这个场景下，我们可以给 $emit 提供一个额外的参数：

```vue
<button @click="$emit('increaseBy', 1)">
  Increase by 1
</button>
```


然后我们在父组件中监听事件，此函数会接收到事件附带的参数：

```vue {2}
<template>
<MyButton @increase-by="increaseCount" />
</template>

<script>
function increaseCount(n) {
  count.value += n
}
</script>
```

#### 组件名字格式

组件与 prop 一样，事件的名字也提供了自动的格式转换。注意这里我们触发了一个以 camelCase 形式命名的事件，但在父组件中可以使用 kebab-case 形式来监听。与 [prop 大小写格式](https://cn.vuejs.org/guide/components/props.html#prop-name-casing)一样，在模板中我们也推荐使用 kebab-case 形式来编写监听器。

#### 事件声明是可选的

尽管事件声明是可选的，我们还是推荐你完整地声明所有要触发的事件，以此在代码中作为文档记录组件的用法。同时，事件声明能让 Vue 更好地将事件和[透传 attribute](https://cn.vuejs.org/guide/components/attrs.html#v-on-listener-inheritance) 作出区分，从而避免一些由第三方代码触发的自定义 DOM 事件所导致的边界情况。

### 插槽

一些情况下我们会希望能和 HTML 元素一样向组件中传递内容：

```vue
<AlertBox>
  Something bad happened.
</AlertBox>
```

我们期望能渲染成这样：

:::warning

Something bad happened.

:::



这可以通过 Vue 的自定义 `<slot>` 元素来实现：

在子组件中使用 `<slot>` 作为一个占位符，父组件传递进来的内容就会渲染在这里。

```vue {4}
<template>
  <div class="alert-box">
    <strong>This is an Error for Demo Purposes</strong>
    <slot />
  </div>
</template>

<style scoped>
.alert-box {
  /* ... */
}
</style>
```

`<slot>` 元素是一个**插槽出口** (slot outlet)，标示了父元素提供的**插槽内容** (slot content) 将在哪里被渲染。

![img](https://cn.vuejs.org/assets/slots.dbdaf1e8.png)

插槽内容可以是任意合法的模板内容，不局限于文本。例如我们可以传入多个元素，甚至是组件

```vue {3,4}
<!--parent.vue-->
<FancyButton>
  <span style="color:red">Click me!</span>
  <AwesomeIcon name="plus" />
</FancyButton>
```

#### 默认内容

在外部没有提供任何内容的情况下，可以为插槽指定默认内容。

```vue {3}
<button type="submit">
  <slot>
    Submit <!-- 默认内容 -->
  </slot>
</button>
```



#### 具名插槽
有时在一个组件中包含多个插槽出口是很有用的。`<slot>` 元素可以有一个特殊的 attribute `name`，用来给各个插槽分配唯一的 ID，以确定每一处要渲染的内容：
```vue {3,6,9}
<div class="container">
  <header>
    <slot name="header"></slot>
  </header>
  <main>
    <slot></slot>
  </main>
  <footer>
    <slot name="footer"></slot>
  </footer>
</div>
```

这类带 `name` 的插槽被称为具名插槽 (named slots)。没有提供 `name` 的 `<slot>` 出口会隐式地命名为“default”。

要为具名插槽传入内容，我们需要使用一个含 `v-slot` 指令的 `<template>` 元素，并将目标插槽的名字传给该指令：

```vue
<BaseLayout>
  <template v-slot:header>
    <!-- header 插槽的内容放这里 -->
  </template>
</BaseLayout>
```

`v-slot` 有对应的简写 `#`，因此 `<template v-slot:header>` 可以简写为 `<template #header>`。其意思就是“将这部分模板片段传入子组件的 header 插槽中”。

#### 插槽访问子组件中的数据

在某些场景下插槽的内容可能想要同时使用父组件域内和子组件域内的数据。要做到这一点，我们需要一种方法来让子组件在渲染时将一部分数据提供给插槽。

我们也确实有办法这么做！可以像对组件传递 props 那样，向一个插槽的出口上传递 attributes：

```vue {3}
<!-- <MyComponent> 的模板 -->
<div>
  <slot :text="greetingMessage" :count="1"></slot>
</div>
```

### 组件v-model

当父组件需要把值传给子组件时，可以使用v-bind传入props。但是如果要接收子组件对值的修改，就得考虑双向绑定(v-model)了

所需操作：

```vue
<!--父组件：v-model：传入绑定的值-->
<template>
	<son-component v-model="val"/>
</template>

<script setup>
	import sonComponent from "./sonComponent.vue"
    const val = ref('')
</script>
```

```vue
<!--子组件-->
<script setup>
	//通过props接收
    const props = defineProps({
        modelValue:String		// 注意：父组件通过v-model传入的值在子组件中默认由modelValue接收
    })
    // 通过emits暴露
    const emit = defineEmits([
        'update:modelValue'		// 注意：父组件通过update:modelValue接收子组件暴露的方法
    ])
    
    
    const handelInput = (e)=>{
        emit('update:modelValue',e.target.value)  // 通过.target.value 获取input内的值
    }
</script>

<template>
	<div>
        // 这里通过input举例
        <input :value="modelValue" @input="handleInput">
    </div>
</template>
```



#### 修改默认的prop `modelValue` 

默认情况下，`v-model` 在组件上都是使用 `modelValue` 作为 prop，并以 `update:modelValue` 作为对应的事件。我们可以通过给 `v-model` 指定一个参数来更改这些名字：

```vue
<MyComponent v-model:title="bookTitle" />
```

在这个例子中，子组件应声明一个 `title` prop，并通过触发 `update:title` 事件更新父组件值：

```vue {3,4}
<!-- MyComponent.vue -->
<script setup>
defineProps(['title'])
defineEmits(['update:title'])
</script>

<template>
  <input
    type="text"
    :value="title"
    @input="$emit('update:title', $event.target.value)"
  />
</template>
```

#### 多个 `v-model` 绑定

利用刚才在 v-model `props`小节中学到的指定参数与事件名的技巧，我们可以在单个组件实例上创建多个 `v-model` 双向绑定。

```vue
<!-- 父组件-->
<UserName
  v-model:first-name="first"
  v-model:last-name="last"
/>
```



```vue {4,5,8}
<!-- 子组件 -->
<script setup>
defineProps({
  firstName: String,
  lastName: String
})

defineEmits(['update:firstName', 'update:lastName'])
</script>
```



### 透传Attributes

“透传 attribute”指的是传递给一个组件，却没有被该组件声明为 [props](https://cn.vuejs.org/guide/components/props.html) 或 [emits](https://cn.vuejs.org/guide/components/events.html#defining-custom-events) 的 attribute 或者 `v-on` 事件监听器。最常见的例子就是 `class`、`style` 和 `id`。

**当一个组件以单个元素为根作渲染时，透传的 attribute 会自动被添加到根元素上。举例来说，假如我们有一个 `<MyButton>` 组件，它的模板长这样：**

#### 禁用 Attributes 继承

如果你**不想要**一个组件自动地继承 attribute，你可以在组件选项中设置 `inheritAttrs: false`。

如果你使用了 `<script setup>`，你需要一个额外的 `<script>` 块来书写这个选项声明：

```vue
<script>
// 使用普通的 <script> 来声明选项
export default {
  inheritAttrs: false
}
</script>

<script setup>
// ...setup 部分逻辑
</script>
```





### 子组件暴露方法给父组件 

可以通过 `defineExpose` 编译器宏来显式指定在 `<script setup>` 子组件中要暴露出去的属性：

```vue {7-10}
<script setup>
import { ref } from 'vue'

const a = 1
const b = ref(2)

defineExpose({
  a,
  b
})
</script>
```

父组件可以先用ref获得子组件，然后直接使用.value.a就可以获取子组件的a方法了
