"use client";

export default function AuthGlobeHero() {
  return (
    <div className="relative mx-auto mb-6 flex w-full max-w-[340px] flex-col items-center">

      {/* Ambient glow layers */}
      <div className="pointer-events-none absolute top-10 h-52 w-52 rounded-full bg-cyan-400/15 blur-3xl glow-pulse" />
      <div className="pointer-events-none absolute top-16 h-36 w-36 rounded-full bg-blue-600/20 blur-2xl" />

      {/* Perspective wrapper — DEEP perspective for real 3D look */}
      <div
        className="relative flex h-[300px] w-[300px] items-center justify-center"
        style={{ perspective: "600px", perspectiveOrigin: "50% 50%" }}
      >
        {/* Outer orbit ring — thin, slow CW */}
        <div
          className="absolute inset-0 rounded-full orbit-cw pointer-events-none"
          style={{ border: "1px solid rgba(103,232,249,0.15)" }}
        />

        {/* Inner orbit ring — slow CCW */}
        <div
          className="absolute inset-[28px] rounded-full orbit-ccw pointer-events-none"
          style={{ border: "1px solid rgba(59,130,246,0.12)" }}
        />

        {/* Orbiting cyan dot */}
        <div className="absolute inset-0 orbit-cw pointer-events-none">
          <div className="absolute top-2 left-1/2 -translate-x-1/2 h-2.5 w-2.5 rounded-full bg-cyan-300 shadow-[0_0_16px_rgba(103,232,249,0.95)]" />
        </div>

        {/* Orbiting blue dot opposite side */}
        <div className="absolute inset-0 orbit-ccw pointer-events-none">
          <div className="absolute bottom-6 right-6 h-2 w-2 rounded-full bg-blue-400 shadow-[0_0_10px_rgba(59,130,246,0.9)]" />
        </div>

        {/*
          TRUE 3-D GLOBE
          ─────────────
          The key to making it look 3-D (not flat):
            1. perspective on parent = shallow (600px) → more distortion
            2. globe-tilt: permanent rotateX tilt so we look "down" at it
            3. globe-spin: pure rotateY spin inside that tilt
          When you watch a Y-rotation INSIDE an X-tilt the near side
          appears bigger and the far side smaller — that's real 3D depth.
        */}
        <div
          className="relative z-10"
          style={{
            transformStyle: "preserve-3d",
            /* tilt the whole thing so we look slightly down at north pole */
            transform: "rotateX(22deg)",
          }}
        >
          <div
            className="globe-spin"
            style={{ transformStyle: "preserve-3d" }}
          >
            {/* Rear depth shadow — pushed back in Z */}
            <div
              className="absolute inset-0 rounded-full bg-blue-900/30 blur-2xl -z-10"
              style={{ transform: "translateZ(-50px) scale(0.8)" }}
            />

            {/* The globe image */}
            <img
              src="/Logo.png"
              alt="TopDog Globe"
              width={220}
              height={220}
              className="relative z-10 select-none object-contain"
              style={{
                filter:
                  "drop-shadow(0 0 32px rgba(59,130,246,0.4)) drop-shadow(0 0 8px rgba(103,232,249,0.3))",
              }}
              draggable={false}
            />

            {/* Specular highlight — top-left shine, makes it look like a sphere */}
            <div
              className="pointer-events-none absolute inset-0 rounded-full"
              style={{
                background:
                  "linear-gradient(135deg, rgba(255,255,255,0.28) 0%, rgba(255,255,255,0.06) 25%, transparent 50%)",
                filter: "blur(2px)",
              }}
            />

            {/* Bottom shadow to reinforce sphere curvature */}
            <div
              className="pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 w-4/5 h-1/4 rounded-full bg-blue-950/60 blur-xl"
              style={{ transform: "translateY(30%) scaleY(0.4)" }}
            />
          </div>
        </div>
      </div>

      {/* Bottom tagline — plain text, no broken image */}
      <p className="mt-1 text-center text-sm font-black tracking-widest text-white/90 uppercase">
        Top Dog Leads
      </p>
      <p className="mt-1 text-center text-[11px] uppercase tracking-[0.3em] text-blue-300/50">
        Smart Global Lead Intelligence
      </p>
    </div>
  );
}