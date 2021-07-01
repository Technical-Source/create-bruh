import { defineConfig } from "vite"
import bruh from "vite-plugin-bruh"

export default defineConfig({
  plugins: [
    bruh({
      root: new URL("./", import.meta.url).pathname
    })
  ]
})
