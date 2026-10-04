"use client";

import { useEffect, useState } from "react";

export function LocalTime({ timezone, city }: { timezone: string; city: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      hour: "2-digit",
      minute: "2-digit",
      timeZone: timezone || "Asia/Kolkata",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [timezone]);
  return (
    <span className="font-mono text-xs text-fg-subtle">
      {city} · {time || "--:--"}
    </span>
  );
}
