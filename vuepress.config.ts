import { defineUserConfig } from "vuepress"
import { defaultTheme } from "vuepress"
import { searchPlugin } from "@vuepress/plugin-search"

export default defineUserConfig({
  lang: "zh-CN",
  title: "Creat.Wu的使用手册",
  description: "记不住就抄下来",
  plugins: [
    searchPlugin({
      // 配置项
    }),
  ],
  theme: defaultTheme({
    // 默认主题配置
    navbar: [
      {
        text: "首页",
        link: "/",
      },
      {
        text: "VuePress",
        link: "/vuepress",
      },
      {
        text: "js插件",
        children: [
          {
            text: "加载进度条nProgress",
            link: "/js/nProgress",
          },
        ],
      },
    ],
  }),
})
