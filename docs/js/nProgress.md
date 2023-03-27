# 加载进度条nProgress

nprogress.js是一款用于显示网页加载进度的JavaScript库， 非常方便使用。

### 1.安装nprogress.js

```bash
npm install nprogress --save 
```

### 2.导入nprogress.js

接下来，在TypeScript文件中导入nprogress.js库。
```typescript
import NProgress from 'nprogress'

// 按需导入样式
import "nprogress/nprogress.css"
```

### 3.开始、更新和结束进度条显示

通常情况下，在页面的请求中，我们会需要在开始请求时显示进度条，在请求返回数据时更新进度条进度，在请求完成后结束进度条显示。可以使用下列代码实现。

```typescript
// 显示进度条
NProgress.start()

// 关闭进度条
NProgress.done()
```

### 4.可以在任何时候调用`NProgress.set(n)`函数来改变进度条的进度，其中`n`为0.0到1.0之间的数字，表示进度的百分比。

```typescript
NProgress.set(0.5);
```

### 5.设置nprogress.js的样式和配置信息

nprogress.js提供了一些可配置的参数，如进度条递增的速度、是否显示旋转图标、进度条最小百分比和进度条动画效果等。开发者可以根据自己的需求灵活配置。

```typescript
NProgress.configure({
  ease: 'ease',
  speed: 500,
  showSpinner: false, // 是否显示旋转图标
  minimum: 0.1, // 初始化进度条的最小值
  template: '<div class="bar" role="bar"><div class="peg"></div></div><div class="spinner" role="spinner"><div class="spinner-icon"></div></div>', // 自定义HTML模板
  trickleSpeed: 200, // 自动增长的速度
  parent: "body", // 进度条要添加到的元素
  // 设置进度条颜色
  barColor: '#29d',
  // 设置背景进度条颜色
  backgroundColor: '#eee',
  // 设置显示位置
  positionUsing: '',
  // 覆盖默认的启动动画
  showSpinner: false,
})
```
