import { defineConfig } from "vite"
import fs from "fs/promises"
import path from "path"

const pageRender = ({
  pageRenderFileExtention = /\.page\.render\.(mjs|jsx?|tsx?)$/,
  excludeEntry = (entry, directory) =>
    entry.isDirectory() && entry.name == "node_modules"
} = {}) => {
  const getPageRenderFiles = async (directory, maxDepth = Infinity) => {
    const entries = await fs.readdir(directory, { withFileTypes: true })
    const unflattenedFiles = await Promise.all(
      entries
        .map(async entry => {
          if (excludeEntry(entry, directory))
            return []

          const entryPath = path.join(directory, entry.name)

          if (entry.isDirectory() && maxDepth > 0)
            return getPageRenderFiles(entryPath)
          if (pageRenderFileExtention.test(entry.name))
            return [entryPath]

          return []
        })
    )
    return unflattenedFiles.flat()
  }

  let viteDevServer
  const idToPageRenderFile = {}

  return {
    name: "page-render",
    enforce: "pre",

    configureServer(server) {
      viteDevServer = server
    },

    async resolveId(source) {
      if (source.endsWith(".html")) {
        const directory = path.dirname(source)
        const entries = await fs.readdir(directory, { withFileTypes: true })
        const possibleFiles = entries
          .filter(entry => !entry.isDirectory())
          .map(entry => path.join(directory, entry.name))

        for (const possibleFile of possibleFiles) {
          // An actual html file, resolve but don't load it later
          if (possibleFile == source)
            return source

          // A correspoding page render file
          if (possibleFile.replace(pageRenderFileExtention, ".html") == source) {
            idToPageRenderFile[source] = possibleFile
            return source
          }
        }
      }
    },

    async load(id) {
      if (!idToPageRenderFile[id])
        return

      if (viteDevServer) {
        const { default: render } = await viteDevServer.ssrLoadModule(idToPageRenderFile[id])
        const rendered = await render()
        return {
          code: rendered,
          map: ""
        }
      }
    },

    // Add all page render files to the build inputs
    async config() {
      const root = new URL("./", import.meta.url).pathname

      const pageRenderFiles = await getPageRenderFiles(root)

      const input = Object.fromEntries(
        pageRenderFiles
          .map(pathname => path.relative(root, pathname))
          .map(pathname =>
            [pathname.replace(pageRenderFileExtention, ""), pathname]
          )
      )

      return {
        build: {
          rollupOptions: {
            input
          }
        }
      }
    }
  }
}

const bruhJSX = () => {
  return {
    name: "bruh-jsx",

    config() {
      return {
        esbuild: {
          jsxFactory: "h",
          jsxFragment: "JSXFragment",
          jsxInject: `import { h, JSXFragment } from "bruh/dom/meta-node"`
        }
      }
    }
  }
}

const bruh = ({ pageRenderOptions, bruhJSXOptions } = {}) =>
  [
    pageRender(pageRenderOptions),
    bruhJSX(bruhJSXOptions)
  ]

export default defineConfig({
  plugins: [
    bruh()
  ]
})
