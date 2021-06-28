import path from "path"
import { stat } from "fs/promises"

import fastify from "fastify"
const app = fastify()
import middie from "middie"
await app.register(middie)

import sirv from "sirv"
import vite from "vite"

const isProduction = process.env.NODE_ENV === "production"
const root = new URL("../", import.meta.url).pathname

const isFile = async filePath => {
  try {
    const result = await stat(path.join(root, filePath))
    if (result.isFile())
      return true
  }
  catch {}
}

const getPageRenderFile = async url => {
  // If the path is /a/b/c
  // we need to check /a/b/c.render.jsx and /a/b/c/index.render.jsx
  const { dir, base } = path.parse(url.pathname)

  if (base) {
    const basePath = path.join(dir, `${base}.page.render.jsx`)
    if (await isFile(basePath))
      return basePath
  }

  const indexPath = path.join(dir, base, "index.page.render.jsx")
  if (await isFile(indexPath))
    return indexPath
}

if (isProduction) {
  app.use(sirv(path.join(root, "./dist/")))
}
else {
  const viteDevServer = await vite.createServer({
    root,
    server: { middlewareMode: "ssr" }
  })
  app.use(viteDevServer.middlewares)

  app.get("*", async (request, reply) => {
    try {
      const url = new URL(request.url, `${request.protocol}://${request.hostname}`)
      const pageRenderFile = await getPageRenderFile(url)
      if (pageRenderFile) {
        const { default: render } = await viteDevServer.ssrLoadModule(pageRenderFile)
        const rendered = await render()
        const transformedHTML = await viteDevServer.transformIndexHtml(url.pathname, rendered.toString())

        reply
          .status(200)
          .type("text/html")
          .send(transformedHTML)
      }
    }
    catch (error) {
      viteDevServer.ssrFixStacktrace(error)
      console.error(error)

      reply
        .status(500)
        .send(error.message)
    }
  })
}

await app.listen(3000)
const address = app.server.address()
console.log(`Server running at http://${address.address}:${address.port}`)
