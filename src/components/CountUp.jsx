"use client";

import { useEffect, useRef, useState } from "react";
import { useInView, animate } from "framer-motion";

export default function CountUp({ value, suffix = "", duration = 1.4, decimals = 0 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: "-40px" });
  const [display, setDisplay] = useState(0);

  useEffect(() => {
    if (!inView) return;
    const factor = 10 ** decimals;
    const controls = animate(0, value, {
      duration,
      ease: "easeOut",
      onUpdate: (v) => setDisplay(Math.round(v * factor) / factor),
    });
    return () => controls.stop();
  }, [inView, value, duration, decimals]);

  return (
    <span ref={ref}>
      {decimals ? display.toFixed(decimals) : display}
      {suffix}
    </span>
  );
}
