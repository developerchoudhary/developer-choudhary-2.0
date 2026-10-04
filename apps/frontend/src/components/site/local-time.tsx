"use client";

import { useEffect, useState } from "react";

/** The current time in the given time zone, refreshed every 30 seconds. */
export function LocalTime({ timezone }: { timezone: string }) {
  const [time, setTime] = useState("");
  useEffect(() => {
    const fmt = new Intl.DateTimeFormat("en-IN", {
      hour: "numeric",
      minute: "2-digit",
      timeZone: timezone || "Asia/Kolkata",
    });
    const tick = () => setTime(fmt.format(new Date()));
    tick();
    const id = setInterval(tick, 30_000);
    return () => clearInterval(id);
  }, [timezone]);
  return <span className="tabular">{time || "–"}</span>;
}
