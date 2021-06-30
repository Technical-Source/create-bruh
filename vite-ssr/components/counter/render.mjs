import { t } from "bruh/dom/meta-node"
import { button } from "bruh/dom/html"

const counterNumber = t(0).setTag("counterNumber")

export default () =>
  button({ class: "counter" },
    "Click to increment: ", counterNumber
  )
