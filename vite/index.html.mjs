import shell from "./shell.mjs"
import { main, h1 } from "bruh/dom/html"
import Counter from "./components/counter/render.mjs"

const inBody =
  main(
    h1("Bruh"),
    Counter()
  )

export default () =>
  shell({
    title: "Bruh...",
    description: "Bruh Moment",
    js:  ["./index.mjs"],
    inBody
  })
