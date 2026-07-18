import { useMemo, useState } from "react";
import {
  AlertTriangle,
  BarChart3,
  Bell,
  Clock,
  Database,
  FileText,
  Flame,
  HelpCircle,
  History,
  Map,
  Play,
  RadioTower,
  Rocket,
  Satellite,
  Settings,
  Share2,
  Signal,
  X,
} from "lucide-react";
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CircleMarker, MapContainer, TileLayer } from "react-leaflet";
import type { BoundingBox, Filters, FirePoint, FirmsSource } from "./types";
import { formatNumber, getFireVisual } from "./utils";

type Page = "map" | "dashboard" | "statistics";

const SOURCES: FirmsSource[] = [
  "VIIRS_SNPP_NRT",
  "VIIRS_NOAA20_NRT",
  "VIIRS_NOAA21_NRT",
  "MODIS_NRT",
  "VIIRS_SNPP_SP",
  "MODIS_SP",
  "LANDSAT_NRT",
];

const sidebarItems = [
  { label: "Live Map", icon: Map, page: "map" as Page, active: true },
  { label: "Thermal Data", icon: Database },
  { label: "Historical Analysis", icon: History, page: "dashboard" as Page },
  { label: "Risk Assessment", icon: AlertTriangle, page: "statistics" as Page },
];

function formatUtcDateTime(value: string): string {
  const date = new Date(value);
  const pad = (part: number) => String(part).padStart(2, "0");

  return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(date.getUTCDate())} ${pad(
    date.getUTCHours(),
  )}:${pad(date.getUTCMinutes())}:${pad(date.getUTCSeconds())} UTC`;
}

function getDetectionLevel(frp: number): { label: string; color: string; bg: string } {
  if (frp >= 100) {
    return { label: "CRITICAL DETECTION", color: "#ff3f32", bg: "bg-[#d71920]" };
  }

  if (frp >= 50) {
    return { label: "HIGH DETECTION", color: "#ff6b3d", bg: "bg-[#ff6b3d]" };
  }

  return { label: "ACTIVE DETECTION", color: "#ffb06b", bg: "bg-[#ff9a3d]" };
}

function getConfidenceLabel(confidence: string | number): string {
  if (typeof confidence === "number") {
    if (confidence >= 80) {
      return `HIGH (${confidence}%)`;
    }

    if (confidence >= 40) {
      return `NOMINAL (${confidence}%)`;
    }

    return `LOW (${confidence}%)`;
  }

  return confidence.toUpperCase();
}

function buildApproxIntensityTrend(selectedFire: FirePoint | null, fires: FirePoint[]) {
  if (!selectedFire) {
    return [];
  }

  const selectedTime = new Date(selectedFire.acquiredAt).getTime();

  // TODO: replace this approximation with per-hotspot history when the API exposes it.
  return fires
    .filter((fire) => {
      const sameArea =
        Math.abs(fire.latitude - selectedFire.latitude) <= 1 && Math.abs(fire.longitude - selectedFire.longitude) <= 1;
      const within24h = Math.abs(new Date(fire.acquiredAt).getTime() - selectedTime) <= 24 * 60 * 60 * 1000;
      return sameArea && within24h;
    })
    .sort((a, b) => new Date(a.acquiredAt).getTime() - new Date(b.acquiredAt).getTime())
    .slice(-8)
    .map((fire) => ({
      time: new Intl.DateTimeFormat(undefined, { hour: "2-digit", minute: "2-digit" }).format(new Date(fire.acquiredAt)),
      frp: fire.frp,
    }));
}

function LiveSidebar({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-[700] hidden w-[260px] flex-col border-r border-white/[0.08] bg-[#0a0e1a] px-5 py-6 lg:flex">
      <div>
        <p className="text-xl font-black text-[#ff8a66]">SatFire</p>
        <div className="mt-9">
          <p className="text-lg font-black text-white">SatFire GIS</p>
          <p className="text-xs font-semibold text-[#7f899d]">Vigilance System v4.2</p>
        </div>
      </div>

      <nav className="mt-9 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;

          return (
            <button
              key={item.label}
              type="button"
              onClick={() => item.page && onNavigate(item.page)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-bold transition ${
                item.active ? "bg-[#ff6b3d] text-white shadow-glow" : "text-[#aeb7ca] hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-5">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b3d] px-4 py-3 text-sm font-black text-white shadow-glow">
          <Rocket size={17} />
          Deploy Response
        </button>
        <div className="space-y-3 text-sm font-semibold text-[#a5afc3]">
          <button className="flex items-center gap-3 hover:text-white">
            <HelpCircle size={16} />
            Support
          </button>
          <button className="flex items-center gap-3 hover:text-white">
            <RadioTower size={16} />
            Satellite Status
          </button>
        </div>
      </div>
    </aside>
  );
}

function LiveTopbar({ onNavigate }: { onNavigate: (page: Page) => void }) {
  return (
    <header className="fixed left-0 right-0 top-0 z-[650] flex h-14 items-center justify-between border-b border-white/[0.08] bg-[#0a0e1a]/95 px-4 backdrop-blur lg:left-[260px]">
      <div className="flex items-center gap-5 text-sm font-black text-[#9da7ba]">
        <button className="border-b-2 border-[#ff6b3d] py-4 text-white">Live Map</button>
        <button className="hover:text-white">Thermal Data</button>
        <button onClick={() => onNavigate("statistics")} className="hover:text-white">
          Risk Assessment
        </button>
      </div>
      <div className="flex items-center gap-4 text-[#b6bfd1]">
        <Bell size={18} />
        <Settings size={18} />
        <div className="h-8 w-8 rounded-full border border-[#ff8a66]/50 bg-[radial-gradient(circle_at_35%_28%,#ffb08d,#2b1820_55%,#101827)]" />
      </div>
    </header>
  );
}

function FloatingFilters({
  filters,
  onChange,
  count,
}: {
  filters: Filters;
  onChange: (filters: Filters) => void;
  count: number;
}) {
  return (
    <div className="absolute left-4 right-4 top-20 z-[500] flex flex-col gap-3 rounded-xl border border-white/[0.08] bg-[#101827]/90 p-3 shadow-2xl backdrop-blur md:left-5 md:right-auto md:flex-row md:items-end lg:left-[280px]">
      <label className="flex min-w-52 flex-col gap-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#8894a9]">
        Source
        <select
          value={filters.source}
          onChange={(event) => onChange({ ...filters, source: event.target.value as FirmsSource })}
          className="h-10 rounded-lg border border-white/10 bg-[#151d2f] px-3 text-sm font-semibold normal-case tracking-normal text-white outline-none ring-[#ff6b3d]/50 focus:ring-2"
        >
          {SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-40 flex-col gap-1 text-[11px] font-black uppercase tracking-[0.16em] text-[#8894a9]">
        Days: {filters.days}
        <input
          type="range"
          min="1"
          max="10"
          value={filters.days}
          onChange={(event) => onChange({ ...filters, days: Number(event.target.value) })}
          className="accent-[#ff6b3d]"
        />
      </label>

      <div className="rounded-lg border border-white/[0.08] bg-[#0a0e1a]/65 px-4 py-2">
        <p className="text-[10px] font-black uppercase tracking-[0.16em] text-[#8490a5]">Active Fires</p>
        <p className="text-xl font-black text-white">{count}</p>
      </div>
    </div>
  );
}

function DetailStat({ label, value, strong }: { label: string; value: string; strong?: boolean }) {
  return (
    <div className="rounded-xl bg-[#171f31] p-4">
      <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8c96a8]">{label}</p>
      <p className={`mt-2 text-sm font-black ${strong ? "text-[#ff7849]" : "text-white"}`}>{value}</p>
    </div>
  );
}

function FireDetailPanel({
  fire,
  fires,
  onClose,
}: {
  fire: FirePoint | null;
  fires: FirePoint[];
  onClose: () => void;
}) {
  const level = getDetectionLevel(fire?.frp ?? 0);
  const trendData = useMemo(() => buildApproxIntensityTrend(fire, fires), [fire, fires]);
  const title = fire ? `${fire.latitude.toFixed(2)}, ${fire.longitude.toFixed(2)}` : "Fire Hotspot";
  const hotspotId = fire
    ? Math.abs(Math.round((fire.latitude * 1000 + fire.longitude * 1000 + new Date(fire.acquiredAt).getTime()) % 100000))
    : 0;

  return (
    <aside
      className={`fixed bottom-0 right-0 top-14 z-[720] w-full max-w-[340px] border-l border-white/[0.08] bg-[#0d1424]/98 p-6 shadow-[-24px_0_80px_rgba(0,0,0,0.35)] backdrop-blur transition duration-300 ${
        fire ? "translate-x-0 opacity-100" : "translate-x-full opacity-0"
      }`}
      aria-hidden={!fire}
    >
      {fire ? (
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between">
            <div className={`rounded-sm ${level.bg} px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em] text-white`}>
              ● {level.label}
            </div>
            <button type="button" onClick={onClose} className="rounded-full p-1 text-[#aeb7ca] hover:bg-white/[0.08] hover:text-white">
              <X size={19} />
            </button>
          </div>

          <div className="mt-4">
            {/* TODO: plug a reverse-geocoding service such as Nominatim/OpenStreetMap when enabled. */}
            <h2 className="text-2xl font-black text-white">{title}</h2>
            <p className="mt-1 text-sm font-semibold text-[#9ba6b9]">Active Fire Hotspot #{hotspotId}</p>
          </div>

          <div className="mt-5 rounded-xl bg-[#11192a] p-4">
            <div className="mb-3 flex items-center justify-between">
              <p className="text-[11px] font-black uppercase tracking-[0.14em] text-[#a6b0c3]">24H Intensity Trend</p>
              <p className="text-[10px] font-bold text-[#ff9a7a]">Approx.</p>
            </div>
            {trendData.length > 1 ? (
              <div className="h-28">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={trendData}>
                    <XAxis dataKey="time" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: "#101827", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 10 }} />
                    <Bar dataKey="frp" fill="#ff9a7a" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <p className="rounded-lg border border-white/[0.08] bg-[#0a0e1a]/45 px-3 py-4 text-xs leading-relaxed text-[#9ba6b9]">
                Historique par hotspot non fourni par l'API actuelle.
              </p>
            )}
          </div>

          <div className="mt-4 grid grid-cols-2 gap-3">
            <DetailStat label="Coordinates" value={`${fire.latitude.toFixed(2)}, ${fire.longitude.toFixed(2)}`} />
            <DetailStat label="Brightness" value={`${formatNumber(fire.brightness)} K`} />
            <DetailStat label="FRP (Intensity)" value={`${formatNumber(fire.frp)} MW`} strong />
            <DetailStat label="Confidence" value={getConfidenceLabel(fire.confidence)} />
          </div>

          <div className="mt-5 space-y-4 border-t border-white/[0.08] pt-5">
            <div className="flex gap-3">
              <Clock size={18} className="mt-0.5 text-[#ff9a7a]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8c96a8]">Detection Time</p>
                <p className="mt-1 text-sm font-bold text-white">{formatUtcDateTime(fire.acquiredAt)}</p>
              </div>
            </div>
            <div className="flex gap-3">
              <Satellite size={18} className="mt-0.5 text-[#ff9a7a]" />
              <div>
                <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#8c96a8]">Source Instrument</p>
                <p className="mt-1 text-sm font-bold text-white">
                  {fire.instrument} {fire.satellite} (NASA)
                </p>
              </div>
            </div>
          </div>

          <div className="mt-auto grid grid-cols-2 gap-3 border-t border-white/[0.08] pt-5">
            <button className="flex items-center justify-center gap-2 rounded-xl border border-white/[0.1] bg-[#1a2335] px-4 py-3 text-sm font-black text-[#d3dae7]">
              <Share2 size={16} />
              Share
            </button>
            <button className="flex items-center justify-center gap-2 rounded-xl bg-[#ff9a7a] px-4 py-3 text-sm font-black text-[#241119]">
              <BarChart3 size={16} />
              Analysis
            </button>
          </div>
        </div>
      ) : null}
    </aside>
  );
}

function MapLoadingSkeleton() {
  return (
    <div className="absolute left-4 right-4 top-40 z-[500] rounded-xl border border-white/[0.08] bg-[#101827]/88 p-4 shadow-2xl backdrop-blur md:left-[280px] md:right-auto md:w-96">
      <div className="h-3 w-36 animate-pulse rounded-full bg-white/15" />
      <div className="mt-4 h-2 w-full animate-pulse rounded-full bg-white/10" />
      <div className="mt-2 h-2 w-2/3 animate-pulse rounded-full bg-white/10" />
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="absolute bottom-24 left-4 right-4 z-[540] flex items-center gap-3 rounded-xl border border-red-400/30 bg-red-950/90 px-4 py-3 text-sm font-semibold text-red-100 shadow-xl backdrop-blur md:left-[280px] md:right-auto md:max-w-xl">
      <Signal size={18} />
      <span>{message}</span>
    </div>
  );
}

function TimelineControl() {
  return (
    <div className="absolute bottom-7 left-4 right-4 z-[500] rounded-xl border border-white/[0.08] bg-[#11192a]/92 px-5 py-4 shadow-2xl backdrop-blur md:left-[310px] md:right-[370px]">
      <div className="flex items-center gap-4">
        <button className="flex h-9 w-9 items-center justify-center rounded-full text-[#ff9a7a] hover:bg-white/[0.08]">
          <Play size={16} fill="currentColor" />
        </button>
        <div className="relative h-2 flex-1 rounded-full bg-[#2b3448]">
          <div className="absolute inset-y-0 left-0 w-[72%] rounded-full bg-[#ff6b3d]" />
          <div className="absolute left-[72%] top-1/2 h-4 w-4 -translate-y-1/2 rounded-full border-2 border-[#ffb196] bg-[#ff6b3d]" />
        </div>
      </div>
    </div>
  );
}

export default function LiveMapPage({
  fires,
  count,
  filters,
  loading,
  error,
  onFilterChange,
  onNavigate,
}: {
  fires: FirePoint[];
  count: number;
  filters: Filters;
  loading: boolean;
  error: string | null;
  onBboxChange: (bbox: BoundingBox) => void;
  onFilterChange: (filters: Filters) => void;
  onNavigate: (page: Page) => void;
}) {
  const [selectedFire, setSelectedFire] = useState<FirePoint | null>(null);

  return (
    <div className="min-h-screen overflow-hidden bg-[#0a0e1a] text-white">
      <LiveSidebar onNavigate={onNavigate} />
      <LiveTopbar onNavigate={onNavigate} />

      <main className="relative h-screen pt-14 lg:pl-[260px]">
        <FloatingFilters filters={filters} onChange={onFilterChange} count={count} />
        {loading ? <MapLoadingSkeleton /> : null}
        {error ? <ErrorBanner message={error} /> : null}
        <TimelineControl />

        <MapContainer
          center={[28.2, 2.6]}
          zoom={5}
          minZoom={3}
          maxBounds={[
            [-85, -180],
            [85, 180],
          ]}
          className="h-full w-full"
          scrollWheelZoom
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
            url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          />

          {fires.map((fire, index) => {
            const visual = getFireVisual(fire.frp);
            const intense = fire.frp >= 80;
            const key = `${fire.latitude}-${fire.longitude}-${fire.acquiredAt}-${index}`;

            return (
              <div key={key}>
                {intense ? (
                  <CircleMarker
                    center={[fire.latitude, fire.longitude]}
                    radius={visual.radius + 12}
                    pathOptions={{
                      color: visual.color,
                      fillColor: visual.color,
                      fillOpacity: 0.16,
                      opacity: 0.2,
                      weight: 1,
                    }}
                  />
                ) : null}
                <CircleMarker
                  center={[fire.latitude, fire.longitude]}
                  radius={visual.radius}
                  eventHandlers={{
                    click: () => setSelectedFire(fire),
                  }}
                  pathOptions={{
                    color: "#fff1e8",
                    fillColor: visual.color,
                    fillOpacity: 0.9,
                    opacity: 0.92,
                    weight: intense ? 2 : 1,
                  }}
                />
              </div>
            );
          })}
        </MapContainer>

        <FireDetailPanel fire={selectedFire} fires={fires} onClose={() => setSelectedFire(null)} />
      </main>
    </div>
  );
}
