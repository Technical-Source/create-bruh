import { t } from "bruh/dom/meta-node"

let n = 0
const textNode = t(n).toNode()
textNode.bruh = {
  get n() {
    return n
  },

  set n(number) {
    textNode.textContent = n = number
  }
}

export const counter =
  (
    <button class="counter">
      Click to increment: {textNode}
    </button>
  ).toNode()

counter.addEventListener("click", () => textNode.bruh.n++)
