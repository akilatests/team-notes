const TAG_NAME = 'tag-picker';

export class TagPicker extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' }).textContent = 'Tag picker';
  }
}

// Guard against double registration on Vite HMR reloads.
if (!customElements.get(TAG_NAME)) {
  customElements.define(TAG_NAME, TagPicker);
}
