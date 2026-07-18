import type { FirePoint } from "./types";

export function formatLocalDateTime(value: string): string {
  return new Intl.DateTimeFormat(undefined, {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function formatNumber(value: number, digits = 1): string {
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: digits,
  }).format(value);
}

export function getFireVisual(frp: number): { radius: number; color: string } {
  if (frp >= 100) {
    return { radius: 13, color: "#ff2f20" };
  }

  if (frp >= 50) {
    return { radius: 10, color: "#ff7849" };
  }

  if (frp >= 20) {
    return { radius: 8, color: "#ffb347" };
  }

  return { radius: 6, color: "#ffd166" };
}

export function averageFrp(fires: FirePoint[]): number {
  if (!fires.length) {
    return 0;
  }

  return fires.reduce((sum, fire) => sum + fire.frp, 0) / fires.length;
}

export function getDetectionDay(value: string): string {
  return new Date(value).toISOString().slice(0, 10);
}

export function buildDailyCounts(fires: FirePoint[]) {
  const grouped = new Map<string, { date: string; VIIRS: number; MODIS: number }>();

  fires.forEach((fire) => {
    const date = getDetectionDay(fire.acquiredAt);
    const row = grouped.get(date) ?? { date, VIIRS: 0, MODIS: 0 };
    const instrument = fire.instrument.toUpperCase();

    if (instrument.includes("MODIS")) {
      row.MODIS += 1;
    } else {
      row.VIIRS += 1;
    }

    grouped.set(date, row);
  });

  return [...grouped.values()].sort((a, b) => a.date.localeCompare(b.date));
}

export function buildAverageFrpSeries(fires: FirePoint[]) {
  const grouped = new Map<string, { date: string; total: number; count: number }>();

  fires.forEach((fire) => {
    const date = getDetectionDay(fire.acquiredAt);
    const row = grouped.get(date) ?? { date, total: 0, count: 0 };
    row.total += fire.frp;
    row.count += 1;
    grouped.set(date, row);
  });

  return [...grouped.values()]
    .map((row) => ({ date: row.date, avgFrp: Number((row.total / row.count).toFixed(2)) }))
    .sort((a, b) => a.date.localeCompare(b.date));
}
