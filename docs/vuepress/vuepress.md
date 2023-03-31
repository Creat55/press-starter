---
sidebarDepth: 3
---
# VuePress使用说明
## 安装
```bash
git init
yarn init
yarn add -D vuepress@next
```
在 package.json 中添加一些 scripts
```ts
{
  "scripts": {
    "docs:dev": "vuepress dev docs",
    "docs:build": "vuepress build docs"
  }
}
```
### 新建配置文件
- vuepress.config.ts
- 或vuepress/config.ts

基本配置：
```ts
import { defineUserConfig } from 'vuepress'

export default defineUserConfig({
  lang: 'zh-CN',
  title: '你好， VuePress ！',
  description: '这是我的第一个 VuePress 站点',
})
// VuePress 中config常用的配置如下：
// title：网站的标题
// description：网站的描述
// base：base URL。
// themeConfig：主题配置，包括导航栏、侧边栏、主题颜色等
// plugins：插件配置，包括搜索、阅读进度、多语言支持等
// port：本地预览端口号
// dest：生成的静态网站文件目录
// markdown：Markdown 配置，包括代码块、标题锚点等
// evergreen：是否启用 IE 兼容模式
// head：head 标签中的额外内容，如 icon、meta 标签等
```
[详细配置说明](https://v2.vuepress.vuejs.org/zh/reference/config.html)

## VuePress自带的Markdown扩展
### 链接自动转换
在你使用 Markdown 的 链接语法 时， VuePress 会为你进行一些转换。
- 内部链接会被转换为 `<RouterLink>` 以便进行 SPA 导航。
- 指向 `.md` 文件的内部链接会被转换为目标页面的 路由路径，并且支持绝对路径和相对路径。
- 外部链接会被添加 `target="_blank" rel="noopener noreferrer"` 属性。

### 生成目录
如果你想要把当前页面的目录添加到 Markdown 内容中，你可以使用 `[[toc]]` 语法。
```ts
[[toc]]
```
目录中的标题将会链接到对应的 标题锚点，因此如果你禁用了标题锚点，可能会影响目录的功能。
### 代码块
#### 行高亮
你可以在代码块添加行数范围标记，来为对应代码行进行高亮：

输入 ` ```ts{1,6-8}``` ` 即可为1、6-8行代码高亮显示

```ts{1,6-8}
import { defaultTheme, defineUserConfig } from 'vuepress'

export default defineUserConfig({
  title: '你好， VuePress',

  theme: defaultTheme({
    logo: 'https://vuejs.org/images/logo.png',
  }),
})
```
#### 禁用行号
这个功能是默认启用的，你可以在代码块三点之后添加 `:line-numbers` / `:no-line-numbers` 标记来覆盖配置项中的设置。

#### 添加 v-pre
默认代码块中的代码都是文本（被v-pre），但如果需要vue进行编译，可以在代码块添加 `:v-pre` / `:no-v-pre` 标记来覆盖配置项中的设置。

举例：
```md
<!-- 默认情况下，这里会被保持原样 -->
1 + 2 + 3 = {{ 1 + 2 + 3 }}
```
```md:no-v-pre
<!-- 这里会被 Vue 编译 -->
1 + 2 + 3 = {{ 1 + 2 + 3 }}
```
```js:no-v-pre
// 由于 JS 代码高亮，这里不会被正确编译，写了no-v-pre也没用
// VuePress 的 v-pre 指令只会影响 Markdown 文件中的代码块，并不影响 JavaScript 代码。
const onePlusTwoPlusThree = {{ 1 + 2 + 3 }}
```
#### 导入代码块
看着很高大，但是估计很少用到
```
<!-- 仅导入第 1 行至第 10 行 -->
@[code{1-10}](../foo.js)
```
### 使用自定义容器
VuePress还热心的添加了几个好用的容器
- tip / warning / danger  
   生成醒目的提示块，比md自带的quote（>）好用  
- details  
   生成下拉详情页，省空间  
- code-group + code-group-item  
   生成tab，可以按tab来显示内容  
  
使用格式如下
```md
::: <type> [title]
[content]
:::
```
小试一下
::: tip 试试试
试试就试试
:::

## 在Markdown中使用vue
#### 模板语法
```md
一加一等于： {{ 1 + 1 }}
```
一加一等于： {{ 1 + 1 }}
#### 也可以在vue中直接使用vue的组件
<Badge>测试使用主题内置的Badge组件</Badge>
::: tip 提示
前往 [内置组件](https://v2.vuepress.vuejs.org/zh/reference/components.html) 查看所有内置组件。  
前往 [默认主题 > 内置组件](https://v2.vuepress.vuejs.org/zh/reference/default-theme/components.html) 查看默认主题中的所有内置组件。
:::

## 静态资源
### public目录
你可以把一些静态资源放在 Public 目录中，它们会被复制到最终生成的网站的根目录下。
默认的 Public 目录是 .vuepress/public ，可以通过 public 配置项来修改。

```txt
└─ docs
   ├─ .vuepress
   |  └─ public
   |     └─ images
   |        └─ hero.png  # <- Logo 文件
   └─ guide
      └─ assets.md       # <- 我们在这里
```	

我们可以这样在当前页面引用 Logo ：

Input  
```md
![VuePress Logo](/images/hero.png)
```
## 常用的配置项
### 顶部导航
vuepress是根据md生成静态html，md中的各级标题会做为单页面中的锚点来跳转。  
而跳转html则需要配置navbar。vuepress将这个任务外包给了主题插件来实现。  
需要在主题中配置  
:::details 在config中配置theme
```ts
import { defaultTheme } from 'vuepress'

export default {
  theme: defaultTheme({
    navbar: [
      // 嵌套 Group - 最大深度为 2
      {
        text: 'Group',
        children: [
          {
            text: 'SubGroup',
            children: ['/group/sub/foo.md', '/group/sub/bar.md'],
          },
        ],
      },
      // 控制元素何时被激活
      {
        text: 'Group 2',
        children: [
          {
            text: 'Always active',
            link: '/',
            // 该元素将一直处于激活状态
            activeMatch: '/',
          },
          {
            text: 'Active on /foo/',
            link: '/not-foo/',
            // 该元素在当前路由路径是 /foo/ 开头时激活
            // 支持正则表达式
            activeMatch: '^/foo/',
          },
        ],
      },
    ],
  }),
}
```
:::

## Frontmeta配置
在VuePress中，Frontmatter是指在Markdown文件开头用三个"---"包裹的一段YAML代码块。这些YAML代码块可以为文档添加元数据信息，例如页面标题、作者、标签、日期等。另一方面可以定义一些只应用于此页面的一些配置。  

Frontmatter 中的字段和配置文件中的站点配置十分类似。你可以通过 Frontmatter 来覆盖当前页面的 lang, title, description 等属性。因此，你可以把 Frontmatter 当作页面级作用域的配置。

同样的，VuePress 有一些内置支持的 Frontmatter 字段，而你使用的`主题`也可能有它自己的特殊 Frontmatter 。

### VuePress 的Frontmeta配置

#### title
:::details
类型： `string`  
页面的标题。  
如果你不在 Frontmatter 中设置 title ，那么页面中第一个一级标题（即 # title）的内容会被当作标题使用。
:::
#### description
:::details
类型： `string`
页面的描述。  
它将会覆盖站点配置中的 description 配置项。
:::
#### head
:::details
类型： `HeadConfig[]`  
页面 `<head>` 标签内添加的额外标签。  
示例：
```md
---
head:
  - - meta
    - name: foo
      content: yaml 数组语法
  - [meta, { name: bar , content: 方括号语法 }]
---
```
渲染为：
```html
<head>
  <meta name="foo" content="yaml 数组语法" />
  <meta name="bar" content="方括号语法" />
</head>
```
:::
#### layout
:::details
类型： `string`  
详情：  
页面的布局。  
布局是由主题提供的。如果你不指定该 Frontmatter ，则会使用默认布局。你应该参考主题自身的文档来了解其提供了哪些布局。  
如果主题布局无法满足你的需求，你可以使用自定义布局组件。  
示例：  
在 .vuepress/client.ts 文件中注册一个布局组件：  
```vue
import { defineClientConfig } from '@vuepress/client'
import CustomLayout from './CustomLayout.vue'

export default defineClientConfig({
  layouts: {
    CustomLayout,
  },
})
```
在 Frontmatter 中设置自定义布局：

```md
---
layout: CustomLayout
---
```
:::


___
### 默认主题定制的Frontmeta配置
#### 通用Frontmeta
即每个页面都可以配置的项  
##### pageClass 
为当前页面添加额外的类名。  
```md
---
pageClass: custom-page-class
---
```
##### navbar
类型： `boolean`  
控制navbar是否在此页面中显示  
##### externalLinkIcon
类型： `boolean`
控制 externalLinkIcon插件是否在此页面中生效  
___
#### 首页专用
##### home
类型： `boolean`  
声明此页面是否为主页
##### hero
首页大图的一系列配置
###### heroImage
类型： `string`  
首页大图的 URL 
###### heroImageDark
类型： `string`  
暗黑模式下首页大图的 URL 
###### heroAlt
类型： `string`  
图片的ALT
###### heroHeight
类型： `number`  
默认值： `280`  
详情：  
首页图片 `<img>` 标签的 height 属性。  
当你的首页图片高度小于默认值时，你可能需要减小该属性。  
需要注意的是，首页图片的高度同样受到了 CSS 的约束。设置这个属性主要是为了减少由加载首页图片引起的 `累积布局偏移 (CLS)` 。
###### heroText
类型： `string` | `null`  
详情：  
首页的大标题。  
如果不设置，则默认使用站点 `title` 。  
设置为 null 来禁用首页大标题。  
##### tagline
类型： `string` | `null`  
详情：  
首页的标语。  
如果不设置，则默认使用站点 `description` 。  
设置为 `null` 来禁用首页标语。
###### action
配置首页的大按钮。  
示例：
```md
---
actions:
  - text: 快速上手
    link: /zh/guide/getting-started.html
    type: primary
  - text: 项目简介
    link: /guide/
    type: secondary
---
```
##### features
配置首页特性列表。  
示例：
```md
---
features:
  - title: 简洁至上
    details: 以 Markdown 为中心的项目结构，以最少的配置帮助你专注于写作。
  - title: Vue 驱动
    details: 享受 Vue 的开发体验，可以在 Markdown 中使用 Vue 组件，又可以使用 Vue 来开发自定义主题。
  - title: 高性能
    details: VuePress 会为每个页面预渲染生成静态的 HTML，同时，每个页面被加载的时候，将作为 SPA 运行。
---
```
##### footer
配置首页的Footer
##### footerHtml
类型： `boolean`  
详情：  
是否允许页脚中使用 HTML 。如果设置为 `true` ，那么 `footer` 会被作为 HTML 代码处理。
___
#### 普通页面
以下配置的 `Frontmatter` 只会在普通页面中生效。

