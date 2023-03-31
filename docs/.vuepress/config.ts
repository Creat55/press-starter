import { defineUserConfig } from "vuepress"
import { defaultTheme } from "vuepress"
import { searchProPlugin } from "vuepress-plugin-search-pro"
import vuepressPluginAnchorRight from "./vuepress-plugin-anchor-right"

import path from "path"
import { generateNavItems } from "../../src/utils/navbar"
import { weatherPlugin } from "./vuepress-plugin-weather/src/index"

export default defineUserConfig({
  lang: "zh-CN",
  // head:
  title: "Creat.Wu's Blog",
  description: "记不住就抄下来",
  plugins: [
    // searchPlugin({
    //   // 配置项
    // }),
    vuepressPluginAnchorRight(),
    weatherPlugin({}),
    searchProPlugin({
      // 配置选项
      indexContent: true,
      resultHistoryCount: 15,
      delay: 800,
    }),
  ],
  theme: defaultTheme({
    // 侧边导航深度
    sidebarDepth: 4,
    // 顶部导航栏
    navbar: [{ text: "主页", link: "/" }, ...(await generateNavItems(path.resolve(__dirname, "../")))],
    // navbar: [
    //   {
    //     text: "首页",
    //     link: "/",
    //   },
    //   {
    //     text: "VuePress",
    //     link: "/vuepress",
    //   },
    //   {
    //     text: "js插件",
    //     children: [
    //       {
    //         text: "加载进度条nProgress",
    //         link: "/js/nProgress",
    //       },
    //     ],
    //   },
    //   {
    //     text: "fastapi",
    //     children: [
    //       {
    //         text: "fastapi框架",
    //         link: "/fastapi/fastapi",
    //       },
    //       {
    //         text: "pydantic学习",
    //         link: "/fastapi/pydantic",
    //       },
    //       {
    //         text: "websocket",
    //         link: "/fastapi/websocket",
    //       },
    //     ],
    //   },
    // ],
  }),
  markdown: {
    headers: {
      // 显示 h2 到 h4 标题
      level: [2, 3, 4],
    },
  },
})
