import fs from "fs"
import path from "path"
import { promisify } from "util"

interface NavItem {
  text: string
  link: string
  children?: NavItem[]
}

const readDir = promisify(fs.readdir)
const lstat = promisify(fs.lstat)

export async function generateNavItems(dirPath: string, base = ""): Promise<NavItem[]> {
  const files = await readDir(dirPath)
  const promises = files.map(async (file) => {
    if (file.startsWith(".")) {
      // 排除以点开头的目录
      return null
    }

    const fullPath = path.join(dirPath, file)
    const stats = await lstat(fullPath)

    if (stats.isDirectory()) {
      const relativePath = path.relative(base, fullPath)
      const children = await generateNavItems(fullPath, dirPath)

      if (children === null || children.length === 0) {
        // 排除目录内没有 .md 文件的目录
        return null
      }

      return { text: file, link: `/${relativePath}/`, children }
    } else {
      const extname = path.extname(file)
      if (extname === ".md") {
        const basename = path.basename(file, extname)
        if (basename === "index") {
          // 排除根目录下的 index.md 文件
          return null
        }

        const relativePath = path.relative(base, dirPath)
        const link = `/${relativePath}/${file.slice(0, -extname.length)}.html`

        return {
          text: basename,
          link,
        }
      } else {
        return null
      }
    }
  })

  const navItems = await Promise.all(promises)
  return navItems.filter((item) => item !== null) as NavItem[]
}
