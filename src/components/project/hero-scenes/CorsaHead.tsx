"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { mergeVertices } from "three/examples/jsm/utils/BufferGeometryUtils.js";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { UnrealBloomPass } from "three/examples/jsm/postprocessing/UnrealBloomPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";

/**
 * Corsa hero: a glossy, faceless mannequin bust on violet, with an iridescent
 * streak of light sliding across it as it slowly turns.
 *
 * Framing matches `object-fit: cover` of a 3:4 poster, so the live scene lines
 * up exactly with the still cover it fades in over (which is a render of frame 0).
 */

const FRAME_ASPECT = 3 / 4;
const FOV_V = 34; // vertical field of view of the 3:4 poster
const CAMERA = new THREE.Vector3(0, 0.22, 6.3);
const LOOK = new THREE.Vector3(0, 0.22, 0);

// Side profile of the bust (radius, height), turned on a lathe and then shaped.
const PROFILE: [number, number][] = [
  [0.001, 1.38],
  [0.36, 1.3],
  [0.56, 1.08],
  [0.63, 0.75],
  [0.6, 0.4],
  [0.52, 0.1],
  [0.41, -0.15],
  [0.35, -0.32],
  [0.35, -0.52],
  [0.46, -0.68],
  [0.92, -0.87],
  [1.5, -1.07],
  [1.86, -1.4],
  [1.98, -1.95],
  [2.0, -3.2],
];

const smooth = (a: number, b: number, x: number) => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};

function bustGeometry() {
  const curve = new THREE.CatmullRomCurve3(PROFILE.map(([r, y]) => new THREE.Vector3(r, y, 0)));
  const pts = curve.getPoints(160).map((p) => new THREE.Vector2(Math.max(p.x, 0.001), p.y)).reverse();
  let g: THREE.BufferGeometry = new THREE.LatheGeometry(pts, 128);
  const pos = g.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const head = smooth(-0.3, 0.1, v.y);
    const torso = 1 - smooth(-0.9, -0.55, v.y);
    // Heads are deeper than wide; torsos are flat.
    v.z *= 1 + 0.12 * head - 0.5 * torso;
    // A soft jaw and chin at the front, a slightly flatter face.
    const front = Math.max(0, v.z) / 0.7;
    v.z += 0.06 * front * smooth(-0.35, -0.05, v.y) * (1 - smooth(0.0, 0.45, v.y));
    // Shoulders slope down and forward a touch.
    v.y -= 0.18 * torso * Math.pow(Math.abs(v.x) / 1.9, 2);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  g.deleteAttribute("normal");
  g.deleteAttribute("uv");
  g = mergeVertices(g);
  g.computeVertexNormals();
  return g;
}

/** Glowing panels the glossy surface reflects: the rainbow streak, a blue rim, violet fill and pin-point lights. */
function useStudio() {
  const gl = useThree((s) => s.gl);
  return useMemo(() => {
    const studio = new THREE.Scene();
    studio.background = new THREE.Color("#1a0c44");

    const rainbow = new THREE.ShaderMaterial({
      side: THREE.DoubleSide,
      vertexShader: "varying vec2 vUv; void main(){ vUv = uv; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
      fragmentShader: `
        varying vec2 vUv;
        vec3 band(float x) {
          vec3 c = mix(vec3(0.05,0.15,1.8), vec3(0.0,1.1,1.8), smoothstep(0.0,0.3,x));
          c = mix(c, vec3(2.2,2.1,2.0), smoothstep(0.34,0.44,x));
          c = mix(c, vec3(2.2,0.9,0.1), smoothstep(0.47,0.58,x));
          c = mix(c, vec3(2.0,0.05,0.3), smoothstep(0.6,0.75,x));
          c = mix(c, vec3(1.3,0.05,1.3), smoothstep(0.8,1.0,x));
          return c;
        }
        void main() {
          float edge = smoothstep(0.0,0.2,vUv.y) * smoothstep(1.0,0.75,vUv.y);
          gl_FragColor = vec4(band(vUv.x) * edge * 1.9, 1.0);
        }`,
    });
    const streak = new THREE.Mesh(new THREE.PlaneGeometry(4.5, 9), rainbow);
    streak.position.set(-2.6, 0.8, 4.2);
    streak.lookAt(0, 0.3, 0);
    streak.rotateZ(0.95);
    studio.add(streak);

    const panel = (w: number, h: number, color: THREE.ColorRepresentation, k: number, p: [number, number, number]) => {
      const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ color: new THREE.Color(color).multiplyScalar(k), side: THREE.DoubleSide }));
      m.position.set(...p);
      m.lookAt(0, 0, 0);
      studio.add(m);
    };
    panel(6, 8, "#2a4bff", 1.1, [4.5, 0.5, -3.5]); // blue rim from behind right
    panel(5, 6, "#3a2cff", 0.7, [-4.5, 0, -3]); // blue rim from behind left
    panel(8, 3, "#8a2be2", 0.5, [0, 5, 1]); // violet from above
    panel(10, 3, "#12083a", 1, [0, -5, 2]); // dim floor

    const dot = (r: number, k: number, p: [number, number, number]) => {
      const m = new THREE.Mesh(new THREE.SphereGeometry(r, 16, 16), new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1).multiplyScalar(k) }));
      m.position.set(...p);
      studio.add(m);
    };
    dot(0.12, 30, [1.6, 3.2, 3.5]);
    dot(0.08, 24, [3.5, 1.5, 2.5]);
    dot(0.06, 20, [-1.2, -1.5, 4]);

    const pmrem = new THREE.PMREMGenerator(gl);
    const env = pmrem.fromScene(studio, 0.02).texture;
    pmrem.dispose();
    return env;
  }, [gl]);
}

/** The violet studio wall behind the bust, with a little film grain. Lives in the scene so the bloom sees it. */
function Backdrop() {
  const material = useMemo(
    () =>
      new THREE.ShaderMaterial({
        depthWrite: false,
        vertexShader: "varying vec2 vP; void main(){ vP = position.xy; gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0); }",
        fragmentShader: `
          varying vec2 vP;
          vec3 lin(vec3 c) { return pow(c, vec3(2.2)); }
          float glow(vec2 c, float r) { vec2 d = (vP - c) / r; return exp(-dot(d, d)); }
          float hash(vec2 p) { return fract(sin(dot(p, vec2(12.9898, 78.233))) * 43758.5453); }
          void main() {
            float t = clamp(0.5 + vP.y * 0.16 - vP.x * 0.05, 0.0, 1.0);
            vec3 c = mix(lin(vec3(0.05, 0.05, 0.2)), lin(vec3(0.17, 0.07, 0.36)), t);
            c += lin(vec3(0.62, 0.2, 0.78)) * glow(vec2(2.2, 2.0), 2.4) * 0.5;
            c += lin(vec3(0.3, 0.26, 0.95)) * glow(vec2(-0.1, 0.6), 1.9) * 0.45;
            c = mix(c, lin(vec3(0.02, 0.05, 0.28)), glow(vec2(-2.6, -2.8), 2.2) * 0.8);
            c *= 1.0 + (hash(floor(gl_FragCoord.xy)) - 0.5) * 0.18;
            gl_FragColor = vec4(c, 1.0);
          }`,
      }),
    [],
  );
  return (
    <mesh position={[0, 0.22, -4]} material={material} renderOrder={-1}>
      <planeGeometry args={[40, 40]} />
    </mesh>
  );
}

/** Soft bloom so the streak and rim glow like the reference. */
function Bloom() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const camera = useThree((s) => s.camera);
  const size = useThree((s) => s.size);
  const composer = useMemo(() => {
    const c = new EffectComposer(gl);
    c.addPass(new RenderPass(scene, camera));
    c.addPass(new UnrealBloomPass(new THREE.Vector2(256, 256), 1.1, 0.8, 0.35));
    c.addPass(new OutputPass());
    return c;
  }, [gl, scene, camera]);
  useEffect(() => {
    composer.setPixelRatio(gl.getPixelRatio());
    composer.setSize(size.width, size.height);
  }, [composer, gl, size]);
  useEffect(() => () => composer.dispose(), [composer]);
  useFrame(() => composer.render(), 1);
  return null;
}

function Bust({ still }: { still: boolean }) {
  const group = useRef<THREE.Group>(null);
  // Scene and camera are three.js objects we drive imperatively, so read them through get().
  const get = useThree((s) => s.get);
  const size = useThree((s) => s.size);
  const pointer = useRef({ x: 0, y: 0, sx: 0, sy: 0 });
  const env = useStudio();
  const geometry = useMemo(() => bustGeometry(), []);
  const ear = useMemo(() => new THREE.SphereGeometry(1, 32, 24), []);
  const material = useMemo(
    () =>
      new THREE.MeshPhysicalMaterial({
        color: "#070817",
        metalness: 0.15,
        roughness: 0.38,
        clearcoat: 1,
        clearcoatRoughness: 0.06,
        iridescence: 0.9,
        iridescenceIOR: 1.5,
        iridescenceThicknessRange: [250, 700],
        envMapIntensity: 1.5,
      }),
    [],
  );

  useEffect(() => {
    const scene = get().scene;
    scene.environment = env;
    return () => {
      scene.environment = null;
      env.dispose();
    };
  }, [get, env]);

  // Cover-fit a 3:4 poster: wide screens keep its width, tall screens keep its height.
  useEffect(() => {
    const camera = get().camera as THREE.PerspectiveCamera;
    const aspect = size.width / size.height;
    const tanV = Math.tan(THREE.MathUtils.degToRad(FOV_V / 2));
    const t = aspect >= FRAME_ASPECT ? (tanV * FRAME_ASPECT) / aspect : tanV;
    camera.fov = THREE.MathUtils.radToDeg(2 * Math.atan(t));
    camera.position.copy(CAMERA);
    camera.lookAt(LOOK);
    camera.updateProjectionMatrix();
  }, [get, size]);

  useEffect(() => {
    if (still) return;
    const onMove = (e: PointerEvent) => {
      pointer.current.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.current.y = (e.clientY / window.innerHeight) * 2 - 1;
    };
    window.addEventListener("pointermove", onMove, { passive: true });
    return () => window.removeEventListener("pointermove", onMove);
  }, [still]);

  useFrame((state, delta) => {
    const g = group.current;
    if (!g) return;
    const t = still ? 0 : state.clock.elapsedTime;
    const p = pointer.current;
    p.sx += (p.x - p.sx) * Math.min(1, delta * 2);
    p.sy += (p.y - p.sy) * Math.min(1, delta * 2);
    // A slow turn carries the streak across the face; the light itself drifts too.
    g.rotation.y = -0.45 + Math.sin(t * 0.22) * 0.32 + p.sx * 0.12;
    g.rotation.x = Math.sin(t * 0.17) * 0.04 + p.sy * 0.05;
    g.position.y = Math.sin(t * 0.5) * 0.03;
    state.scene.environmentRotation.y = Math.sin(t * 0.13) * 0.35;
    state.scene.environmentRotation.x = Math.sin(t * 0.09) * 0.12;
  });

  return (
    <group ref={group} position={[-0.1, 0, 0]}>
      <mesh geometry={geometry} material={material} />
      {[-1, 1].map((side) => (
        <mesh key={side} geometry={ear} material={material} position={[0.57 * side, 0.47, -0.04]} scale={[0.07, 0.16, 0.11]} />
      ))}
    </group>
  );
}

export default function CorsaHead({ paused = false, still = false, onReady }: { paused?: boolean; still?: boolean; onReady?: () => void }) {
  return (
    <Canvas
      dpr={[1, 1.75]}
      frameloop={paused ? "never" : "always"}
      camera={{ fov: FOV_V, near: 0.1, far: 50, position: CAMERA.toArray() }}
      gl={{ antialias: true, preserveDrawingBuffer: still, toneMapping: THREE.ACESFilmicToneMapping, toneMappingExposure: 1.15 }}
      onCreated={() => requestAnimationFrame(() => requestAnimationFrame(() => onReady?.()))}
    >
      <Backdrop />
      <Bust still={still} />
      <Bloom />
    </Canvas>
  );
}
