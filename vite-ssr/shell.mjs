import { html, head, title, meta, link, script, body } from "bruh/dom/html"

export default async ({
  title: inTitle = "",
  description = "",
  inHead = "",
  inBody = "",
  css = [],
  js = []
}) =>
  "<!doctype html>" +
  html({ lang: "en-US" },
    head(
      title(inTitle),
      meta({ name: "description", content: description }),

      meta({ charset: "UTF-8" }),
      meta({ name: "viewport", content: "width=device-width, initial-scale=1" }),

      css.map(href =>
        link({
          rel: "stylesheet",
          href
        })
      ),

      js.map(src =>
        script({
          type: "module",
          src
        })
      ),

      inHead
    ),

    body(inBody)
  )
