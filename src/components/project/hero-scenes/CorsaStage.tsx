"use client";

import dynamic from "next/dynamic";

const CorsaHead = dynamic(() => import("./CorsaHead"), { ssr: false });

/** The 3D bust with its violet studio, filling its (positioned) parent. */
export function CorsaStage({ paused, still, onReady }: { paused?: boolean; still?: boolean; onReady?: () => void }) {
  return (
    <div className="absolute inset-0 bg-[#1a0c44]">
      <CorsaHead paused={paused} still={still} onReady={onReady} />
    </div>
  );
}
