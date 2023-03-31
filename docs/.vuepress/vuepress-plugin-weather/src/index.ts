export const weatherPlugin = (options) => {
  return {
    name: "vuepress-plugin-foo",
    // ...
    onInitialized: () => {
      console.log("ddd")
    },
  }
}
