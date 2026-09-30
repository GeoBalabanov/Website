"use client";

import { useEffect, useRef } from "react";

/**
 * A painted flag waving in the wind (WebGL). The still image is rippled by
 * waves travelling left → right, stronger towards the free edge, with light on
 * the crests and shade in the folds. Eases in from the still, so it can fade in
 * over the image it copies. Renders nothing if WebGL is unavailable.
 */

const VERT = `
attribute vec2 aPos;
varying vec2 vUv;
void main() {
  vUv = aPos * 0.5 + 0.5;
  vUv.y = 1.0 - vUv.y;
  gl_Position = vec4(aPos, 0.0, 1.0);
}`;

const FRAG = `
precision mediump float;
uniform sampler2D uTex;
uniform float uTime;
uniform float uStrength;  // 0 → 1 as the wind picks up
uniform vec2 uCover;      // object-fit: cover scale
varying vec2 vUv;
void main() {
  float x = vUv.x;
  // Two travelling waves (wind from the left), stronger towards the free edge.
  float p1 = x * 6.2 - uTime * 2.3;
  float p2 = x * 11.0 - uTime * 3.4 + 1.3;
  float reach = 0.3 + 0.7 * x;
  float wave = sin(p1) + 0.45 * sin(p2);
  float slope = cos(p1) + 0.8 * cos(p2);
  vec2 uv = vUv;
  uv.y += 0.034 * uStrength * reach * wave;
  uv.x += 0.01 * uStrength * reach * cos(p1 * 0.7 + uTime * 0.5);
  // Sample slightly inside the image so the wave never pulls in empty edges.
  vec2 t = (uv - 0.5) * uCover * 0.93 + 0.5;
  vec3 col = texture2D(uTex, clamp(t, 0.0, 1.0)).rgb;
  // Folds: crests catch the light, troughs fall into shade.
  // Soft-clipped so crests glow a little and troughs shade, never glare.
  float soft = slope / (1.0 + abs(slope));
  float fold = 0.2 * soft + 0.04 * sin(p1 * 2.0 + 0.6);
  col *= 1.0 + uStrength * reach * fold;
  gl_FragColor = vec4(col, 1.0);
}`;

type Props = {
  src: string;
  /** Pause (keep the last frame) when off screen or inactive. */
  running: boolean;
  /** Width the image is rasterised at (SVGs render sharp at any size). */
  rasterWidth?: number;
  className?: string;
};

export function FlagWave({ src, running, rasterWidth = 1200, className = "" }: Props) {
  const canvas = useRef<HTMLCanvasElement>(null);
  const run = useRef(running);
  const kick = useRef<() => void>(() => {});

  useEffect(() => {
    run.current = running;
    if (running) kick.current();
  }, [running]);

  useEffect(() => {
    const cv = canvas.current;
    if (!cv) return;
    const gl = cv.getContext("webgl", { antialias: false, premultipliedAlpha: false, alpha: false });
    if (!gl) return;

    const shader = (type: number, source: string) => {
      const sh = gl.createShader(type)!;
      gl.shaderSource(sh, source);
      gl.compileShader(sh);
      return sh;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, shader(gl.VERTEX_SHADER, VERT));
    gl.attachShader(prog, shader(gl.FRAGMENT_SHADER, FRAG));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) return;
    gl.useProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const aPos = gl.getAttribLocation(prog, "aPos");
    gl.enableVertexAttribArray(aPos);
    gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);
    const uTime = gl.getUniformLocation(prog, "uTime");
    const uStrength = gl.getUniformLocation(prog, "uStrength");
    const uCover = gl.getUniformLocation(prog, "uCover");

    let texAspect = 0;
    let alive = true;
    let raf = 0;
    let t0 = 0;
    let elapsed = 0; // seconds of wind so far (paused time excluded)

    const resize = () => {
      const r = cv.getBoundingClientRect();
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      cv.width = Math.max(1, Math.round(r.width * dpr));
      cv.height = Math.max(1, Math.round(r.height * dpr));
      gl.viewport(0, 0, cv.width, cv.height);
      if (texAspect) {
        const k = cv.width / cv.height / texAspect;
        gl.uniform2f(uCover, k > 1 ? 1 : k, k > 1 ? 1 / k : 1);
      }
    };

    const draw = (t: number) => {
      gl.uniform1f(uTime, t);
      gl.uniform1f(uStrength, Math.min(1, t / 1.6)); // ease in from the still
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    };

    const frame = (now: number) => {
      if (!alive) return;
      if (!run.current) {
        raf = 0;
        return;
      }
      if (!t0) t0 = now - elapsed * 1000;
      elapsed = (now - t0) / 1000;
      draw(elapsed);
      raf = requestAnimationFrame(frame);
    };
    kick.current = () => {
      if (!alive || raf || !texAspect) return;
      t0 = 0;
      raf = requestAnimationFrame(frame);
    };

    const img = new Image();
    img.decoding = "async";
    img.onload = () => {
      if (!alive) return;
      const c = document.createElement("canvas");
      c.width = rasterWidth;
      c.height = Math.round(rasterWidth * (img.naturalHeight / img.naturalWidth || 4 / 3));
      c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
      const tex = gl.createTexture();
      gl.bindTexture(gl.TEXTURE_2D, tex);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, c);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      texAspect = c.width / c.height;
      resize();
      draw(0);
      cv.style.opacity = "1";
      if (run.current) kick.current();
    };
    img.src = src;

    const ro = new ResizeObserver(() => {
      resize();
      if (texAspect) draw(elapsed);
    });
    ro.observe(cv);

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      ro.disconnect();
      kick.current = () => {};
      gl.getExtension("WEBGL_lose_context")?.loseContext();
    };
  }, [src, rasterWidth]);

  return (
    <canvas
      ref={canvas}
      aria-hidden="true"
      className={`absolute inset-0 h-full w-full opacity-0 transition-opacity duration-500 ${className}`}
    />
  );
}
