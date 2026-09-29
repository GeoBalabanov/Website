/**
 * WebGL "velocity bend" for the homepage slider.
 *
 * While the slider moves between projects, the covers are drawn as one
 * vertical strip on a canvas. Each cover is a finely subdivided plane whose
 * vertices are pushed out (scrolling down: bulge) or pulled in (scrolling
 * up: pinch) with the scroll speed, so the edges curve in soft arcs. At rest the canvas is hidden and the normal DOM cover
 * (with its living animation) shows instead.
 *
 * Plain WebGL, no library: one shader, one grid mesh, one texture per cover.
 */

const VERT = `
attribute vec2 aPos;          // 0..1 over the cover, y down
uniform vec2 uCanvas;         // canvas size (CSS px)
uniform vec2 uSize;           // cover size (CSS px)
uniform float uOffsetY;       // cover centre relative to the frame centre (px, y down)
uniform float uBend;          // -1..1: + bulge (scrolling down), - pinch (scrolling up)
varying vec2 vUv;
const float HALF_PI = 1.5707963;
void main() {
  vUv = aPos;
  vec2 p = vec2((aPos.x - 0.5) * uSize.x, (aPos.y - 0.5) * uSize.y + uOffsetY);
  // Both factors depend only on the screen position, so neighbouring covers stay seamless.
  float nx = (aPos.x - 0.5) * 2.0;                       // -1..1 across the frame
  float ny = clamp(p.y / (uCanvas.y * 0.5), -1.0, 1.0);  // -1..1 over the visible frame
  // Sides: widest (or narrowest) across the middle, easing smoothly to the top and bottom.
  p.x *= 1.0 + uBend * 0.08 * cos(ny * HALF_PI);
  // Top and bottom edges bow outwards (or inwards) in a soft arc.
  p.y *= 1.0 + uBend * 0.035 * cos(nx * HALF_PI);
  gl_Position = vec4(p.x / (uCanvas.x * 0.5), -p.y / (uCanvas.y * 0.5), 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform vec2 uCover;          // object-fit: cover scale for the texture
varying vec2 vUv;
void main() {
  vec2 uv = (vUv - 0.5) * uCover + 0.5;
  gl_FragColor = texture2D(uTex, uv);
}`;

const GRID = 32;
const COVER_ASPECT = 3 / 4;

type Tex = { tex: WebGLTexture; aspect: number } | null;

export class SliderStrip {
  private gl: WebGLRenderingContext;
  private prog: WebGLProgram;
  private count: number;
  private textures: Tex[] = [];
  private loc: Record<string, WebGLUniformLocation | null> = {};
  private cssW = 0;
  private cssH = 0;

  /** Returns null when WebGL is unavailable (callers fall back to the CSS transition). */
  static create(canvas: HTMLCanvasElement) {
    const gl = canvas.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true });
    if (!gl) return null;
    try {
      return new SliderStrip(canvas, gl);
    } catch {
      return null;
    }
  }

  private constructor(
    private canvas: HTMLCanvasElement,
    gl: WebGLRenderingContext,
  ) {
    this.gl = gl;
    const sh = (type: number, src: string) => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? "shader");
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error("link");
    this.prog = prog;
    gl.useProgram(prog);

    // A GRID×GRID triangle mesh over the unit square, so the bend is smooth.
    const verts: number[] = [];
    for (let y = 0; y < GRID; y++) {
      for (let x = 0; x < GRID; x++) {
        const [x0, x1, y0, y1] = [x / GRID, (x + 1) / GRID, y / GRID, (y + 1) / GRID];
        verts.push(x0, y0, x1, y0, x0, y1, x0, y1, x1, y0, x1, y1);
      }
    }
    this.count = verts.length / 2;
    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(verts), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

    for (const u of ["uCanvas", "uSize", "uOffsetY", "uBend", "uTex", "uCover"]) this.loc[u] = gl.getUniformLocation(prog, u);
    gl.enable(gl.BLEND);
    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
  }

  /** Load cover images into textures (in slide order). Resolves when all are ready. */
  load(srcs: string[]) {
    const gl = this.gl;
    return Promise.all(
      srcs.map(
        (src, i) =>
          new Promise<void>((resolve) => {
            const img = new Image();
            img.decoding = "async";
            img.onload = () => {
              // Rasterise at a fixed size so SVG covers (with filters) upload reliably.
              const c = document.createElement("canvas");
              c.width = 900;
              c.height = Math.round(900 * (img.naturalHeight / img.naturalWidth || 4 / 3));
              c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
              const tex = gl.createTexture()!;
              gl.bindTexture(gl.TEXTURE_2D, tex);
              gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, true);
              gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
              gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
              this.textures[i] = { tex, aspect: c.width / c.height };
              resolve();
            };
            img.onerror = () => {
              this.textures[i] = null;
              resolve();
            };
            img.src = src;
          }),
      ),
    ).then(() => this.textures.every(Boolean));
  }

  /** Match the canvas backing store to its CSS size. */
  resize() {
    const r = this.canvas.getBoundingClientRect();
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    this.cssW = r.width;
    this.cssH = r.height;
    this.canvas.width = Math.round(r.width * dpr);
    this.canvas.height = Math.round(r.height * dpr);
    this.gl.viewport(0, 0, this.canvas.width, this.canvas.height);
  }

  /**
   * Draw the strip. `pos` is the (fractional) slide index at the frame centre,
   * `bend` the deformation (-1..1, from the scroll speed), `frameW` the cover width in CSS px.
   */
  render(pos: number, bend: number, frameW: number) {
    const gl = this.gl;
    if (!this.cssW) this.resize();
    gl.clearColor(0, 0, 0, 0);
    gl.clear(gl.COLOR_BUFFER_BIT);
    const frameH = this.cssH;
    gl.uniform2f(this.loc.uCanvas, this.cssW, this.cssH);
    gl.uniform2f(this.loc.uSize, frameW, frameH);
    gl.uniform1f(this.loc.uBend, Math.max(-1, Math.min(1, bend)));
    const first = Math.max(0, Math.floor(pos) - 1);
    const last = Math.min(this.textures.length - 1, Math.ceil(pos) + 1);
    for (let i = first; i <= last; i++) {
      const t = this.textures[i];
      if (!t) continue;
      gl.bindTexture(gl.TEXTURE_2D, t.tex);
      gl.uniform1i(this.loc.uTex, 0);
      // Cover-fit a non-3:4 image by cropping the longer side.
      const k = t.aspect / COVER_ASPECT;
      gl.uniform2f(this.loc.uCover, k > 1 ? 1 / k : 1, k > 1 ? 1 : k);
      gl.uniform1f(this.loc.uOffsetY, (i - pos) * frameH);
      gl.drawArrays(gl.TRIANGLES, 0, this.count);
    }
  }

  clear() {
    this.gl.clearColor(0, 0, 0, 0);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
  }

  destroy() {
    this.gl.getExtension("WEBGL_lose_context")?.loseContext();
  }
}
