import { t } from "bruh/dom/meta-node"

const counterNumber = t(0).setTag("counterNumber")

export default () =>
  <button class="counter">
    Click to increment: { counterNumber }
  </button>
