/**
 * <image-slot> — viewer-only build.
 *
 * Strips the drop/persistence/reframe behavior from the original component.
 * All slots are read-only: image comes from the `src` attribute, framing
 * (cover scale + pan) from `data-s` / `data-x` / `data-y`.
 *
 * Attributes:
 *   src      Image URL.
 *   shape    'rect' | 'rounded' | 'circle' | 'pill'  (default 'rounded')
 *   radius   Corner radius in px for 'rounded'.        (default 12)
 *   mask     CSS clip-path. Overrides shape.
 *   data-s   Cover-zoom scale (>=1).                    (default 1)
 *   data-x   Horizontal pan in frame-%.                 (default 0)
 *   data-y   Vertical pan in frame-%.                   (default 0)
 */
(() => {
  class ImageSlot extends HTMLElement {
    static get observedAttributes() {
      return ['src', 'shape', 'radius', 'mask', 'data-s', 'data-x', 'data-y'];
    }
    connectedCallback() {
      if (this._init) return;
      this._init = true;
      const root = this.attachShadow({ mode: 'open' });
      root.innerHTML =
        '<style>' +
        ':host{display:inline-block;position:relative;vertical-align:top;width:240px;height:160px}' +
        '.frame{position:absolute;inset:0;overflow:hidden;background:rgba(0,0,0,.04)}' +
        '.frame img{position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);' +
        '  max-width:none;display:block;-webkit-user-drag:none;user-select:none}' +
        '</style>' +
        '<div class="frame" part="frame"><img alt="" draggable="false"></div>';
      this._frame = root.querySelector('.frame');
      this._img = root.querySelector('img');
      this._img.addEventListener('load', () => this._layout());
      this._ro = new ResizeObserver(() => this._layout());
      this._ro.observe(this);
      this._apply();
    }
    disconnectedCallback() {
      if (this._ro) { this._ro.disconnect(); this._ro = null; }
    }
    attributeChangedCallback() { if (this._init) this._apply(); }
    _apply() {
      const src = this.getAttribute('src');
      if (src && this._img.getAttribute('src') !== src) this._img.src = src;
      const mask = this.getAttribute('mask');
      const shape = (this.getAttribute('shape') || 'rounded').toLowerCase();
      let radius = '';
      if (shape === 'circle') radius = '50%';
      else if (shape === 'pill') radius = '9999px';
      else if (shape === 'rounded') {
        const n = parseFloat(this.getAttribute('radius'));
        radius = (Number.isFinite(n) ? n : 12) + 'px';
      }
      this._frame.style.borderRadius = mask ? '' : radius;
      this._frame.style.clipPath = mask || '';
      this._layout();
    }
    _layout() {
      const iw = this._img.naturalWidth, ih = this._img.naturalHeight;
      const fw = this.clientWidth, fh = this.clientHeight;
      if (!iw || !ih || !fw || !fh) {
        this._img.style.width = '100%';
        this._img.style.height = '100%';
        this._img.style.left = '50%';
        this._img.style.top = '50%';
        return;
      }
      const s = parseFloat(this.dataset.s || '1') || 1;
      const x = parseFloat(this.dataset.x || '0') || 0;
      const y = parseFloat(this.dataset.y || '0') || 0;
      const base = Math.max(fw / iw, fh / ih);
      const k = base * s;
      this._img.style.width = (iw * k / fw * 100) + '%';
      this._img.style.height = (ih * k / fh * 100) + '%';
      this._img.style.left = (50 + x) + '%';
      this._img.style.top = (50 + y) + '%';
    }
  }
  if (!customElements.get('image-slot')) customElements.define('image-slot', ImageSlot);
})();
