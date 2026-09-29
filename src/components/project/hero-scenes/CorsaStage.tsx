"use client";

import { useState } from "react";
import dynamic from "next/dynamic";

const CorsaHead = dynamic(() => import("./CorsaHead"), { ssr: false });

/**
 * The live 3D bust, filling its (positioned) parent. It fades in once its first
 * frame is drawn, over the still cover beneath it (a render of that same frame).
 */
export function CorsaStage({ paused, still }: { paused?: boolean; still?: boolean }) {
  const [ready, setReady] = useState(!!still);
  return (
    <div className={`absolute inset-0 transition-opacity duration-700 ${ready ? "opacity-100" : "opacity-0"}`}>
      <CorsaHead paused={paused} still={still} onReady={() => setReady(true)} />
    </div>
  );
}
