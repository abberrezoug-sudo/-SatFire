import { useCallback, useEffect, useMemo, useState } from "react";
import { Activity, BarChart3, Flame, Map, RefreshCw, Satellite, WifiOff } from "lucide-react";
import { Area, AreaChart, Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { CircleMarker, MapContainer, Popup, TileLayer, useMapEvents } from "react-leaflet";
import type { LatLngBounds } from "leaflet";
import { fetchFiresByArea } from "./api";
import StatisticsPage from "./StatisticsPage";
import type { BoundingBox, Filters, FirePoint, FirmsSource } from "./types";
import {
  averageFrp,
  buildAverageFrpSeries,
  buildDailyCounts,
  formatLocalDateTime,
  formatNumber,
  getFireVisual,
} from "./utils";

const ALGERIA_BBOX: BoundingBox = {
  west: -8.7,
  south: 18.9,
  east: 12.0,
  north: 37.1,
};

const SOURCES: FirmsSource[] = [
  "VIIRS_SNPP_NRT",
  "VIIRS_NOAA20_NRT",
  "VIIRS_NOAA21_NRT",
  "MODIS_NRT",
  "VIIRS_SNPP_SP",
  "MODIS_SP",
  "LANDSAT_NRT",
];

type Page = "map" | "dashboard" | "statistics";

function bboxFromBounds(bounds: LatLngBounds): BoundingBox {
  return {
    west: bounds.getWest(),
    south: bounds.getSouth(),
    east: bounds.getEast(),
    north: bounds.getNorth(),
  };
}

function AreaWatcher({ onChange }: { onChange: (bbox: BoundingBox) => void }) {
  useMapEvents({
    moveend(event) {
      onChange(bboxFromBounds(event.target.getBounds()));
    },
    zoomend(event) {
      onChange(bboxFromBounds(event.target.getBounds()));
    },
  });

  return null;
}

function Navigation({ page, onPageChange }: { page: Page; onPageChange: (page: Page) => void }) {
  const items = [
    { id: "map" as const, label: "Live Map", icon: Map },
    { id: "dashboard" as const, label: "Dashboard", icon: BarChart3 },
    { id: "statistics" as const, label: "Statistics", icon: Activity },
  ];

  return (
    <aside className="z-30 flex w-full items-center justify-between border-t border-white/10 bg-[#0b1220]/95 px-4 py-3 backdrop-blur lg:h-screen lg:w-64 lg:flex-col lg:items-stretch lg:border-r lg:border-t-0 lg:px-5 lg:py-6">
      <div className="flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-ember/15 text-ember shadow-glow">
          <Flame size={22} />
        </div>
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.18em] text-ember">SatFire</p>
          <p className="hidden text-xs text-smoke lg:block">NASA FIRMS realtime</p>
        </div>
      </div>

      <nav className="flex gap-2 lg:mt-8 lg:flex-col">
        {items.map((item) => {
          const Icon = item.icon;
          const active = page === item.id;

          return (
            <button
              key={item.id}
              type="button"
              onClick={() => onPageChange(item.id)}
              className={`flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active ? "bg-ember text-night" : "text-slate-300 hover:bg-white/[0.08] hover:text-white"
              }`}
            >
              <Icon size={18} />
              <span className="hidden sm:inline">{item.label}</span>
            </button>
          );
        })}
      </nav>

      <div className="hidden rounded-lg border border-white/10 bg-white/[0.03] p-4 text-xs text-slate-400 lg:block">
        <p className="font-medium text-slate-200">Zone par defaut</p>
        <p className="mt-1">Algerie: -8.7, 18.9, 12.0, 37.1</p>
      </div>
    </aside>
  );
}

function FiltersBar({
  filters,
  loading,
  onChange,
  onRefresh,
}: {
  filters: Filters;
  loading: boolean;
  onChange: (filters: Filters) => void;
  onRefresh: () => void;
}) {
  return (
    <div className="absolute left-4 right-4 top-4 z-[500] flex flex-col gap-3 rounded-lg border border-white/10 bg-[#0b1220]/90 p-3 shadow-2xl backdrop-blur md:left-6 md:right-auto md:flex-row md:items-center">
      <label className="flex min-w-56 flex-col gap-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
        Source
        <select
          value={filters.source}
          onChange={(event) => onChange({ ...filters, source: event.target.value as FirmsSource })}
          className="h-10 rounded-md border border-white/10 bg-[#141e2e] px-3 text-sm normal-case tracking-normal text-white outline-none ring-ember/50 focus:ring-2"
        >
          {SOURCES.map((source) => (
            <option key={source} value={source}>
              {source}
            </option>
          ))}
        </select>
      </label>

      <label className="flex min-w-40 flex-col gap-1 text-xs font-medium uppercase tracking-[0.12em] text-slate-400">
        Jours: {filters.days}
        <input
          type="range"
          min="1"
          max="10"
          value={filters.days}
          onChange={(event) => onChange({ ...filters, days: Number(event.target.value) })}
          className="accent-ember"
        />
      </label>

      <button
        type="button"
        onClick={onRefresh}
        disabled={loading}
        className="inline-flex h-10 items-center justify-center gap-2 rounded-md bg-ember px-4 text-sm font-semibold text-night transition hover:bg-[#ff946d] disabled:cursor-not-allowed disabled:opacity-60"
      >
        <RefreshCw size={16} className={loading ? "animate-spin" : ""} />
        Rafraichir
      </button>
    </div>
  );
}

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="absolute bottom-24 left-4 right-4 z-[500] flex items-center gap-3 rounded-lg border border-red-400/30 bg-red-950/90 px-4 py-3 text-sm text-red-100 shadow-xl backdrop-blur lg:bottom-6 lg:left-6 lg:right-auto lg:max-w-xl">
      <WifiOff size={18} />
      <span>{message}</span>
    </div>
  );
}

function LoadingOverlay() {
  return (
    <div className="absolute inset-x-4 top-28 z-[450] rounded-lg border border-white/10 bg-[#0b1220]/80 p-4 backdrop-blur md:left-6 md:right-auto md:w-96">
      <div className="h-3 w-28 animate-pulse rounded bg-white/15" />
      <div className="mt-3 h-2 w-full animate-pulse rounded bg-white/10" />
      <div className="mt-2 h-2 w-2/3 animate-pulse rounded bg-white/10" />
    </div>
  );
}

function LiveMap({
  fires,
  count,
  filters,
  loading,
  error,
  onBboxChange,
  onFilterChange,
  onRefresh,
}: {
  fires: FirePoint[];
  count: number;
  filters: Filters;
  loading: boolean;
  error: string | null;
  onBboxChange: (bbox: BoundingBox) => void;
  onFilterChange: (filters: Filters) => void;
  onRefresh: () => void;
}) {
  return (
    <section className="relative h-full min-h-[calc(100vh-72px)] overflow-hidden bg-night lg:min-h-screen">
      <FiltersBar filters={filters} loading={loading} onChange={onFilterChange} onRefresh={onRefresh} />

      <div className="absolute right-4 top-[172px] z-[500] rounded-lg border border-ember/30 bg-[#0b1220]/90 px-4 py-3 text-right shadow-glow backdrop-blur md:right-6 md:top-6">
        <p className="text-xs uppercase tracking-[0.16em] text-slate-400">Foyers actifs</p>
        <p className="text-3xl font-bold text-white">{count}</p>
      </div>

      {loading ? <LoadingOverlay /> : null}
      {error ? <ErrorBanner message={error} /> : null}

      <MapContainer
        center={[28.2, 2.6]}
        zoom={5}
        minZoom={3}
        maxBounds={[
          [-85, -180],
          [85, 180],
        ]}
        className="h-full min-h-[calc(100vh-72px)] w-full lg:min-h-screen"
        scrollWheelZoom
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>'
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
        />
        <AreaWatcher onChange={onBboxChange} />

        {fires.map((fire, index) => {
          const visual = getFireVisual(fire.frp);
          const key = `${fire.latitude}-${fire.longitude}-${fire.acquiredAt}-${index}`;

          return (
            <CircleMarker
              key={key}
              center={[fire.latitude, fire.longitude]}
              radius={visual.radius}
              pathOptions={{
                color: visual.color,
                fillColor: visual.color,
                fillOpacity: 0.76,
                opacity: 0.95,
                weight: 2,
              }}
            >
              <Popup>
                <div className="space-y-1 text-sm">
                  <p className="font-semibold text-slate-950">Detection SatFire</p>
                  <p>Brightness: {formatNumber(fire.brightness)} K</p>
                  <p>Confidence: {fire.confidence}</p>
                  <p>FRP: {formatNumber(fire.frp)} MW</p>
                  <p>Satellite: {fire.satellite}</p>
                  <p>Heure: {formatLocalDateTime(fire.acquiredAt)}</p>
                </div>
              </Popup>
            </CircleMarker>
          );
        })}
      </MapContainer>
    </section>
  );
}

function StatCard({ label, value, detail }: { label: string; value: string; detail: string }) {
  return (
    <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-400">{label}</p>
      <p className="mt-3 text-3xl font-bold text-white">{value}</p>
      <p className="mt-2 text-sm text-slate-400">{detail}</p>
    </div>
  );
}

function Dashboard({
  fires,
  count,
  loading,
  error,
  lastUpdated,
}: {
  fires: FirePoint[];
  count: number;
  loading: boolean;
  error: string | null;
  lastUpdated: Date | null;
}) {
  const dailyCounts = useMemo(() => buildDailyCounts(fires), [fires]);
  const frpSeries = useMemo(() => buildAverageFrpSeries(fires), [fires]);
  const strongestFires = useMemo(() => [...fires].sort((a, b) => b.frp - a.frp).slice(0, 12), [fires]);
  const avgFrp = averageFrp(fires);

  return (
    <section className="min-h-screen bg-night px-4 py-5 text-white sm:px-6 lg:px-8 lg:py-8">
      <div className="mx-auto max-w-7xl">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.18em] text-ember">
              <Activity size={16} />
              Dashboard
            </p>
            <h1 className="mt-2 text-3xl font-bold">Statistiques des detections</h1>
          </div>
          {loading ? <p className="text-sm text-slate-400">Actualisation en cours...</p> : null}
        </div>

        {error ? (
          <div className="mt-5 rounded-lg border border-red-400/30 bg-red-950/70 px-4 py-3 text-sm text-red-100">
            {error}
          </div>
        ) : null}

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <StatCard label="Total Fires" value={String(count)} detail="Foyers retournes par la requete active" />
          <StatCard label="Avg FRP" value={`${formatNumber(avgFrp)} MW`} detail="Moyenne calculee cote frontend" />
          <StatCard
            label="Derniere mise a jour"
            value={lastUpdated ? formatLocalDateTime(lastUpdated.toISOString()) : "--"}
            detail="Heure locale de la derniere reponse API"
          />
        </div>

        <div className="mt-6 grid gap-5 xl:grid-cols-2">
          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold">Detections par jour</h2>
            <div className="mt-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={dailyCounts}>
                  <CartesianGrid stroke="#233047" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#9ba9bd" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ba9bd" tick={{ fontSize: 12 }} allowDecimals={false} />
                  <Tooltip contentStyle={{ background: "#101827", border: "1px solid rgba(255,255,255,0.12)" }} />
                  <Bar dataKey="VIIRS" stackId="source" fill="#ff7849" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="MODIS" stackId="source" fill="#7dd3fc" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="rounded-lg border border-white/10 bg-white/[0.04] p-5">
            <h2 className="text-lg font-semibold">FRP moyen dans le temps</h2>
            <div className="mt-5 h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={frpSeries}>
                  <defs>
                    <linearGradient id="frpGradient" x1="0" x2="0" y1="0" y2="1">
                      <stop offset="5%" stopColor="#ff7849" stopOpacity={0.6} />
                      <stop offset="95%" stopColor="#ff7849" stopOpacity={0.03} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#233047" strokeDasharray="3 3" />
                  <XAxis dataKey="date" stroke="#9ba9bd" tick={{ fontSize: 12 }} />
                  <YAxis stroke="#9ba9bd" tick={{ fontSize: 12 }} />
                  <Tooltip contentStyle={{ background: "#101827", border: "1px solid rgba(255,255,255,0.12)" }} />
                  <Area type="monotone" dataKey="avgFrp" stroke="#ff7849" fill="url(#frpGradient)" strokeWidth={2} />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        <div className="mt-6 rounded-lg border border-white/10 bg-white/[0.04]">
          <div className="flex items-center gap-2 border-b border-white/10 px-5 py-4">
            <Satellite size={18} className="text-ember" />
            <h2 className="text-lg font-semibold">Feux les plus intenses</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm">
              <thead className="text-xs uppercase tracking-[0.12em] text-slate-400">
                <tr>
                  <th className="px-5 py-3">FRP</th>
                  <th className="px-5 py-3">Latitude</th>
                  <th className="px-5 py-3">Longitude</th>
                  <th className="px-5 py-3">Satellite</th>
                  <th className="px-5 py-3">Heure</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10 text-slate-200">
                {strongestFires.map((fire, index) => (
                  <tr key={`${fire.latitude}-${fire.longitude}-${fire.acquiredAt}-${index}`}>
                    <td className="px-5 py-4 font-semibold text-ember">{formatNumber(fire.frp)} MW</td>
                    <td className="px-5 py-4">{fire.latitude.toFixed(4)}</td>
                    <td className="px-5 py-4">{fire.longitude.toFixed(4)}</td>
                    <td className="px-5 py-4">{fire.satellite}</td>
                    <td className="px-5 py-4">{formatLocalDateTime(fire.acquiredAt)}</td>
                  </tr>
                ))}
                {!strongestFires.length ? (
                  <tr>
                    <td className="px-5 py-8 text-center text-slate-400" colSpan={5}>
                      Aucune detection disponible pour les filtres actuels.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </section>
  );
}

export default function App() {
  const [page, setPage] = useState<Page>("map");
  const [bbox, setBbox] = useState<BoundingBox>(ALGERIA_BBOX);
  const [filters, setFilters] = useState<Filters>({ source: "VIIRS_SNPP_NRT", days: 1 });
  const [fires, setFires] = useState<FirePoint[]>([]);
  const [count, setCount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);

  const loadFires = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const data = await fetchFiresByArea(bbox, filters);
      setFires(data.fires);
      setCount(data.count);
      setLastUpdated(new Date());
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Erreur inconnue pendant le chargement.");
    } finally {
      setLoading(false);
    }
  }, [bbox, filters]);

  useEffect(() => {
    void loadFires();
  }, [loadFires]);

  return (
    <div className="min-h-screen bg-night text-white lg:flex">
      <div className="fixed bottom-0 left-0 right-0 lg:sticky lg:top-0 lg:h-screen">
        <Navigation page={page} onPageChange={setPage} />
      </div>

      <main className="min-h-screen flex-1 pb-[72px] lg:pb-0">
        {page === "map" ? (
          <LiveMap
            fires={fires}
            count={count}
            filters={filters}
            loading={loading}
            error={error}
            onBboxChange={setBbox}
            onFilterChange={setFilters}
            onRefresh={loadFires}
          />
        ) : page === "dashboard" ? (
          <Dashboard fires={fires} count={count} loading={loading} error={error} lastUpdated={lastUpdated} />
        ) : (
          <StatisticsPage onNavigate={setPage} />
        )}
      </main>
    </div>
  );
}
