import { addTags, parseTags, splitTags } from './tags.ts'

const TAG_NAME = 'tag-picker'
const DEFAULT_LABEL = 'Tags'
const DEFAULT_HINT = 'Press Enter to add a tag. Backspace removes the last one.'
const DEFAULT_PLACEHOLDER = 'Add a tag'
const LIMIT_PLACEHOLDER = 'Tag limit reached'

export class TagsChangeEvent extends Event {
  static readonly type = 'tags-change'
  readonly tags: string[]

  constructor(tags: string[]) {
    super(TagsChangeEvent.type, { bubbles: true, composed: true })
    this.tags = tags
  }
}

// Colours come from the host page's CSS variables (the shadcn tokens) and fall back to the design's light theme.
const STYLES = `
  :host { display: block; }
  label { display: block; margin-bottom: 6px; font-size: 14px; font-weight: 500; line-height: 1; }
  .box {
    display: flex; flex-wrap: wrap; align-items: center; gap: 6px;
    min-height: 40px; padding: 4px 6px; box-sizing: border-box; cursor: text;
    border: 1px solid var(--input, #c9c9c5); border-radius: var(--radius, 10px);
  }
  .box:focus-within {
    border-color: var(--ring, #3b4fb8);
    box-shadow: 0 0 0 2px color-mix(in oklch, var(--ring, #3b4fb8) 30%, transparent);
  }
  ul { display: contents; margin: 0; padding: 0; list-style: none; }
  ul[hidden] { display: none; }
  li {
    display: inline-flex; align-items: center; gap: 2px; height: 26px; padding: 0 2px 0 10px;
    box-sizing: border-box; border: 1px solid var(--border, #e0e0e0); border-radius: 9999px;
    background: var(--secondary, #f4f4f1); font-size: 13px;
  }
  li button {
    display: inline-flex; align-items: center; justify-content: center;
    width: 22px; height: 22px; padding: 0; border: 0; border-radius: 9999px;
    background: transparent; color: var(--muted-foreground, #595959); cursor: pointer;
  }
  li button:focus-visible { outline: 2px solid var(--ring, #3b4fb8); outline-offset: 1px; }
  input {
    flex: 1 1 120px; min-width: 120px; height: 28px; padding: 0 4px;
    border: 0; outline: none; background: transparent; color: inherit; font: inherit; font-size: 14px;
  }
  input::placeholder { color: var(--muted-foreground, #666666); }
  .hint { margin: 6px 0 0; font-size: 13px; color: var(--muted-foreground, #595959); }
  .live { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; }
`

const TEMPLATE = `
  <style>${STYLES}</style>
  <label for="input"></label>
  <div class="box">
    <ul aria-label="Added tags"></ul>
    <input id="input" type="text" autocomplete="off" aria-describedby="hint" />
  </div>
  <p id="hint" class="hint"></p>
  <p class="live" aria-live="polite"></p>
`

const REMOVE_ICON = `<svg aria-hidden="true" width="12" height="12" viewBox="0 0 24 24" fill="none"
  stroke="currentColor" stroke-width="2.25" stroke-linecap="round"><path d="M6 6l12 12M18 6L6 18"/></svg>`

function requireElement<T extends Element>(root: ParentNode, selector: string, type: new () => T): T {
  const element = root.querySelector(selector)
  if (!(element instanceof type)) throw new Error(`<${TAG_NAME}> template is missing ${selector}`)
  return element
}

function positiveInt(value: string | null): number | undefined {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : undefined
}

/**
 * Attributes in: `label` (default "Tags"), `tags` (comma-separated),
 * `max-tags` and `max-tag-length` (optional limits; none by default).
 * Events out: `tags-change` (a TagsChangeEvent) with the full new list.
 * The host owns the value: it should write the new list back to `tags`.
 */
export class TagPicker extends HTMLElement {
  static observedAttributes = ['label', 'tags', 'max-tags', 'max-tag-length']

  #tags: string[] = []
  #maxTags = Infinity
  #maxTagLength = Infinity
  readonly #label: HTMLLabelElement
  readonly #list: HTMLUListElement
  readonly #input: HTMLInputElement
  readonly #live: HTMLParagraphElement
  readonly #hint: HTMLParagraphElement

  constructor() {
    super()
    const root = this.attachShadow({ mode: 'open' })
    root.innerHTML = TEMPLATE
    this.#label = requireElement(root, 'label', HTMLLabelElement)
    this.#list = requireElement(root, 'ul', HTMLUListElement)
    this.#input = requireElement(root, 'input', HTMLInputElement)
    this.#live = requireElement(root, '.live', HTMLParagraphElement)
    this.#hint = requireElement(root, '#hint', HTMLParagraphElement)
    this.#label.textContent = DEFAULT_LABEL

    this.#input.addEventListener('keydown', (event) => this.#onKeyDown(event))
    this.#input.addEventListener('input', () => this.#renderHint())
    requireElement(root, '.box', HTMLDivElement).addEventListener('click', (event) => {
      if (event.target === event.currentTarget) this.#input.focus()
    })
    this.#renderTags()
  }

  attributeChangedCallback(name: string, _oldValue: string | null, newValue: string | null) {
    if (name === 'label') this.#label.textContent = newValue ?? DEFAULT_LABEL
    if (name === 'tags') {
      this.#tags = parseTags(newValue)
      this.#renderTags()
    }
    if (name === 'max-tags') {
      this.#maxTags = positiveInt(newValue) ?? Infinity
      this.#renderHint()
    }
    if (name === 'max-tag-length') this.#maxTagLength = positiveInt(newValue) ?? Infinity
  }

  #onKeyDown(event: KeyboardEvent) {
    if (event.key === 'Enter' || event.key === ',') {
      // Enter must not submit the surrounding form.
      event.preventDefault()
      this.#add(this.#input.value)
    } else if (event.key === 'Backspace' && this.#input.value === '' && this.#tags.length > 0) {
      event.preventDefault()
      this.#removeAt(this.#tags.length - 1)
    }
  }

  #add(text: string) {
    // Checked per tag, not with the input's maxlength, which would cut a pasted list mid-tag.
    const tooLong = splitTags(text).find((tag) => tag.length > this.#maxTagLength)
    if (tooLong) {
      // Keep the text so the user can shorten it.
      const message = `“${tooLong}” is longer than ${this.#maxTagLength} characters.`
      this.#hint.textContent = message
      this.#announce(message)
      return
    }
    const next = addTags(this.#tags, text, this.#maxTags)
    const typed = text.trim()
    const hitLimit = addTags(this.#tags, text).length > next.length
    this.#input.value = ''
    if (next.length === this.#tags.length) {
      if (hitLimit) this.#announce(this.#limitMessage())
      else if (typed) this.#announce(`${typed} is already added`)
      return
    }
    const added = `Added ${next.slice(this.#tags.length).join(', ')}`
    this.#commit(next, hitLimit ? `${added}. ${this.#limitMessage()}` : added)
  }

  #limitMessage() {
    return `Maximum of ${this.#maxTags} tags reached. Remove one to add another.`
  }

  #renderHint() {
    const atLimit = this.#tags.length >= this.#maxTags
    this.#hint.textContent = atLimit ? this.#limitMessage() : DEFAULT_HINT
    this.#input.placeholder = atLimit ? LIMIT_PLACEHOLDER : DEFAULT_PLACEHOLDER
    // Read-only, not disabled: the field keeps focus and Backspace can still remove the last tag.
    this.#input.readOnly = atLimit
  }

  #removeAt(index: number) {
    const removed = this.#tags[index]
    this.#commit(
      this.#tags.filter((_, i) => i !== index),
      `Removed ${removed}`,
    )
    // The chip's button is gone, so keep focus in the picker.
    this.#input.focus()
  }

  #commit(tags: string[], announcement: string) {
    this.#tags = tags
    this.#renderTags()
    this.#announce(announcement)
    this.dispatchEvent(new TagsChangeEvent([...tags]))
  }

  #announce(message: string) {
    this.#live.textContent = message
  }

  #renderTags() {
    this.#renderHint()
    this.#list.hidden = this.#tags.length === 0
    this.#list.replaceChildren(
      ...this.#tags.map((tag, index) => {
        const item = document.createElement('li')
        const text = document.createElement('span')
        text.textContent = tag
        const remove = document.createElement('button')
        remove.type = 'button'
        remove.setAttribute('aria-label', `Remove tag ${tag}`)
        remove.innerHTML = REMOVE_ICON
        remove.addEventListener('click', () => this.#removeAt(index))
        item.append(text, remove)
        return item
      }),
    )
  }
}

if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, TagPicker)
}

// A custom element cannot be redefined, so in dev a change to this file needs a full page reload.
import.meta.hot?.accept(() => window.location.reload())
