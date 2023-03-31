# ts包发布到npm

## 项目准备
:::details 项目目录
```bash
./
	├─src
		├─core
			├─index.ts
		├─types
		├─utils
	├─package.json
	├─tsconfig.json
	├─rollup.config.js
```
:::

```bash
npm init -y # 生成package.json
tsc --init  # 生成tsconfig.json
```
:::tip
 打包NPM模块更多的是使用Rollup，这主要是因为Rollup的设计目标是处理JavaScript库和NPM模块的打包，它具有更好的Tree-shaking能力，在打包库时可以较好地减小打包后的体积，同时对于对外暴露的API的处理也更加灵活。另外，Rollup的配置文件写起来相对简单直观，因此，对于想要快速将JavaScript库打包为可用于发布的NPM模块的开发者来说，Rollup确实是一个比较好的选择。虽然Vite的打包能力也很强大，但是它更适用于构建现代Web应用程序，因此在这一领域可能会比Rollup更具优势。
:::

### 安装依赖包
```bash
pnpm install typescript -D
pnpm install rollup -D
pnpm install rollup-plugin-typescript2 -D # 用于将 TypeScript 文件编译为 JavaScript
pnpm install rollup-plugin-dts -D   # 用于将 TypeScript 类型定义打包为 .d.ts 文件；
```

### 配置rollup.config.js
:::details 
```js
import path from "path"
import ts from "rollup-plugin-typescript2"
import dts from "rollup-plugin-dts"

export default [
	{ // 第一个括号 用于输出打包好的js
		input: "./src/core/index.ts",	// 主入口
		output: [											// 打包出口文件
			{
				file: path.resolve(__dirname, "./dist/index.esm.js"),
				format: "es" // 可同时生成三种格式es/commonjs/amd&cmd(支持浏览器引入)
			},
			{
				file: path.resolve(__dirname, "./dist/index.cjs.js"),
				format: "cjs"
			},
			{
				file: path.resolve(__dirname, "./dist/index.js"),
				format: "umd",
				name: "xm"
			}
		],
		plugin: [
			ts(), 	// 添加ts支持（会去读ts配置）
		]
	},
	{	// 第二个括号 用于输出ts的声明文件
		input: "./src/core/index.ts",	// 主入口
		output: [											// 打包出口文件
			{
				file: path.resolve(__dirname, "./dist/index.d.ts"),
				format: "es" // 一般用于包，所以一个就够
			}
		],
		plugin: [
			dts(), // 用于生成d.ts
		]
	}
]
```
:::

### 配置package.json
使用npm init -y已经初步生成了package.json  
继续添加编译指令
```json
"type": "module"，
"scripts":{
	"build":"rollup -c"
}
```

### 编译
使用`npm run build`编译