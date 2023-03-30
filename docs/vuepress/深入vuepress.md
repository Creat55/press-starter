# 深入vuepress
作为开发者，你必须要意识到 VuePress 分为两个主要部分： Node App 和 Client App ，这一点对于开发插件和主题来说都十分重要。
- 插件或者主题的入口文件会在 Node App 中被加载。
- 客户端文件会在 Client App 中被加载，也就是会被 Bundler 处理。比如组件、客户端配置文件等。  
![img](https://v2.vuepress.vuejs.org/images/guide/vuepress-core-process.png)