import {
  AlertTriangle,
  Bell,
  Calendar,
  Database,
  Download,
  FileText,
  Flame,
  Gauge,
  Globe2,
  HelpCircle,
  History,
  Map,
  MoreVertical,
  Play,
  RadioTower,
  Rocket,
  Satellite,
  Settings,
  ShieldAlert,
  Twitter,
  Linkedin,
  Zap,
} from "lucide-react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { frequencyTrends, highRiskRegions, kpis, radiativePower } from "./mockData";

type ResearchPage = "map" | "dashboard" | "statistics";

const sidebarItems = [
  { label: "Live Map", icon: Map, page: "map" as ResearchPage },
  { label: "Thermal Data", icon: Database },
  { label: "Historical Analysis", icon: History },
  { label: "Risk Assessment", icon: ShieldAlert, active: true },
  { label: "Agency Reports", icon: FileText },
];

const toneClasses = {
  orange: {
    border: "border-l-[#ff6b3d]",
    icon: "text-[#ff6b3d]",
    value: "text-[#ffb19a]",
  },
  blue: {
    border: "border-l-[#5cc8ff]",
    icon: "text-[#5cc8ff]",
    value: "text-[#70cdf9]",
  },
  neutral: {
    border: "border-l-[#a0a8ba]",
    icon: "text-[#f0a18a]",
    value: "text-[#ffb19a]",
  },
  red: {
    border: "border-l-[#ff3f32]",
    icon: "text-[#ff9c84]",
    value: "text-[#ff9c84]",
  },
};

function ResearchSidebar({ onNavigate }: { onNavigate: (page: ResearchPage) => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-40 hidden w-[280px] flex-col border-r border-white/[0.08] bg-[#090f1d] px-5 py-6 xl:flex">
      <div>
        <p className="text-xl font-black text-[#ff8a66]">SatFire</p>
        <div className="mt-8">
          <p className="text-lg font-bold text-white">SatFire GIS</p>
          <p className="text-xs font-medium text-[#7d879b]">Vigilance System</p>
        </div>
      </div>

      <nav className="mt-10 space-y-2">
        {sidebarItems.map((item) => {
          const Icon = item.icon;
          return (
            <button
              key={item.label}
              type="button"
              onClick={() => item.page && onNavigate(item.page)}
              className={`flex w-full items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold transition ${
                item.active ? "bg-[#ff6b3d] text-white shadow-glow" : "text-[#b4bdd0] hover:bg-white/[0.06] hover:text-white"
              }`}
            >
              <Icon size={18} />
              {item.label}
            </button>
          );
        })}
      </nav>

      <div className="mt-auto space-y-5">
        <button className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#ff6b3d] px-4 py-3 text-sm font-bold text-white shadow-glow">
          <Rocket size={17} />
          Deploy Response
        </button>
        <div className="space-y-3 text-sm font-medium text-[#a5afc3]">
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

function ResearchTopbar({ onNavigate }: { onNavigate: (page: ResearchPage) => void }) {
  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-white/[0.07] bg-[#0a0e1a]/92 px-4 backdrop-blur md:px-8 xl:ml-[280px]">
      <nav className="flex items-center gap-6 text-sm font-semibold text-[#909aae]">
        <button onClick={() => onNavigate("dashboard")} className="hover:text-white">
          Dashboard
        </button>
        <button className="border-b-2 border-[#ff6b3d] py-5 text-white">Statistics</button>
        <button className="hover:text-white">Archival Map</button>
      </nav>
      <div className="flex items-center gap-4 text-[#b6bfd1]">
        <Bell size={18} />
        <Settings size={18} />
        <div className="h-9 w-9 rounded-full border border-[#ff8a66]/50 bg-[radial-gradient(circle_at_35%_28%,#ffb08d,#2b1820_55%,#101827)]" />
      </div>
    </header>
  );
}

function KpiCard({ item, index }: { item: (typeof kpis)[number]; index: number }) {
  const classes = toneClasses[item.tone];
  const icons = [Flame, Zap, Satellite, AlertTriangle];
  const Icon = icons[index];

  return (
    <div className={`rounded-xl border border-white/[0.08] border-l-4 ${classes.border} bg-[#11192a]/86 p-5 shadow-[0_20px_70px_rgba(0,0,0,0.2)]`}>
      <div className="flex items-start justify-between">
        <p className="text-[11px] font-black uppercase tracking-[0.18em] text-[#8e98ab]">{item.label}</p>
        <Icon size={18} className={classes.icon} />
      </div>
      <p className={`mt-7 text-3xl font-black ${classes.value}`}>{item.value}</p>
      <p className="mt-2 flex items-center gap-1 text-xs font-bold text-[#ff7849]">
        {index === 2 ? <span className="h-2 w-2 rounded-full bg-emerald-400" /> : null}
        {index === 3 ? "Warning " : null}
        {item.detail}
      </p>
    </div>
  );
}

function WorldHotspots() {
  return (
    <div className="relative h-48 overflow-hidden rounded-lg border border-white/[0.07] bg-[#0c1322]">
      <div className="absolute inset-0 opacity-70 [background:radial-gradient(ellipse_at_center,rgba(255,255,255,0.18),transparent_38%),linear-gradient(140deg,transparent_18%,rgba(255,255,255,0.1)_19%,transparent_20%),linear-gradient(30deg,transparent_28%,rgba(255,255,255,0.08)_29%,transparent_30%)]" />
      <div className="absolute left-[24%] top-[45%] h-4 w-4 rounded-full bg-[#ffb19a] shadow-[0_0_22px_rgba(255,177,154,0.7)]" />
      <div className="absolute right-[25%] top-[24%] h-3 w-3 rounded-full bg-[#ff6b3d] shadow-[0_0_24px_rgba(255,107,61,0.85)]" />
      <div className="absolute inset-x-7 bottom-5 h-px bg-white/10" />
      <div className="absolute left-7 top-8 h-28 w-28 rounded-full border border-white/15" />
      <div className="absolute right-8 top-6 h-32 w-32 rounded-full border border-white/10" />
    </div>
  );
}

function StatisticsPage({ onNavigate }: { onNavigate: (page: ResearchPage) => void }) {
  return (
    <div className="min-h-screen bg-[#0a0e1a] text-white">
      <ResearchSidebar onNavigate={onNavigate} />
      <ResearchTopbar onNavigate={onNavigate} />

      <main className="relative overflow-hidden px-4 pb-0 pt-6 md:px-8 xl:ml-[280px]">
        <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,120,73,0.05)_1px,transparent_1px),linear-gradient(90deg,rgba(255,120,73,0.04)_1px,transparent_1px)] bg-[size:64px_64px] opacity-35" />
        <div className="pointer-events-none absolute inset-x-0 top-0 h-96 bg-[radial-gradient(circle_at_72%_4%,rgba(255,107,61,0.16),transparent_34%)]" />

        <div className="relative mx-auto max-w-7xl">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <h1 className="text-3xl font-black md:text-4xl">Research Analytics</h1>
              <p className="mt-1 text-sm text-[#9ba5b8]">Comprehensive telemetry for global wildfire observation</p>
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button className="flex items-center justify-center gap-2 rounded-xl border border-white/10 bg-[#11192a]/90 px-5 py-3 text-sm font-semibold text-[#d2d8e5]">
                <Calendar size={16} />
                Oct 24, 2023 - Oct 24, 2024
              </button>
              <button className="flex items-center justify-center gap-2 rounded-xl bg-[#ff9a7a] px-5 py-3 text-sm font-black text-[#221018]">
                <Download size={16} />
                Export Report
              </button>
            </div>
          </div>

          <section className="mt-8 grid gap-5 md:grid-cols-2 2xl:grid-cols-4">
            {kpis.map((item, index) => (
              <KpiCard key={item.label} item={item} index={index} />
            ))}
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[1.35fr_1fr]">
            <div className="rounded-xl border border-white/[0.08] bg-[#11192a]/88 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
              <div className="flex items-center justify-between gap-3">
                <h2 className="text-2xl font-bold">Fire Frequency Trends</h2>
                <div className="flex gap-2">
                  <button className="rounded-full bg-[#ff6b3d]/18 px-3 py-1 text-[11px] font-black text-[#ff8a66]">MODIS</button>
                  <button className="rounded-full bg-[#295c7a] px-3 py-1 text-[11px] font-black text-[#8ed7ff]">VIIRS</button>
                </div>
              </div>
              <div className="mt-6 h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={frequencyTrends} barCategoryGap="28%">
                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: "#c7d0df", fontSize: 12, fontWeight: 700 }} />
                    <YAxis hide />
                    <Tooltip cursor={{ fill: "rgba(255,255,255,0.04)" }} contentStyle={{ background: "#101827", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
                    <Bar dataKey="MODIS" stackId="a" fill="#ff6b3d" radius={[8, 8, 0, 0]} />
                    <Bar dataKey="VIIRS" stackId="a" fill="#4e4a61" radius={[8, 8, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#11192a]/88 p-6 shadow-[0_20px_70px_rgba(0,0,0,0.24)]">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Radiative Power (FRP)</h2>
                <MoreVertical size={20} className="text-[#8791a4]" />
              </div>
              <div className="mt-6 h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={radiativePower}>
                    <defs>
                      <linearGradient id="researchFrp" x1="0" x2="0" y1="0" y2="1">
                        <stop offset="5%" stopColor="#ff9a7a" stopOpacity={0.58} />
                        <stop offset="95%" stopColor="#ff6b3d" stopOpacity={0.03} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" hide />
                    <YAxis hide />
                    <Tooltip contentStyle={{ background: "#101827", border: "1px solid rgba(255,255,255,0.12)", borderRadius: 12 }} />
                    <Area type="monotone" dataKey="frp" stroke="#ff9a7a" fill="url(#researchFrp)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
              <p className="mt-4 text-sm italic leading-relaxed text-[#9ba5b8]">
                FRP measured in Megawatts (MW) via atmospheric radiance detection.
              </p>
            </div>
          </section>

          <section className="mt-6 grid gap-6 xl:grid-cols-[0.8fr_1.6fr]">
            <div className="rounded-xl border border-white/[0.08] bg-[#11192a]/88 p-6">
              <h2 className="text-2xl font-bold">Global Hotspots</h2>
              <div className="mt-5">
                <WorldHotspots />
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-lg bg-[#151f33] p-4">
                  <p className="text-xs font-bold text-[#9ba5b8]">Density Max</p>
                  <p className="mt-2 text-xl font-black text-white">82%</p>
                </div>
                <div className="rounded-lg bg-[#151f33] p-4">
                  <p className="text-xs font-bold text-[#9ba5b8]">Active Clusters</p>
                  <p className="mt-2 text-xl font-black text-white">142</p>
                </div>
              </div>
            </div>

            <div className="rounded-xl border border-white/[0.08] bg-[#11192a]/88 p-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Top 10 High-Risk Regions</h2>
                <button className="text-xs font-black text-[#ff9a7a]">View All Data</button>
              </div>
              <div className="mt-5 overflow-x-auto">
                <table className="min-w-full text-left text-sm">
                  <thead className="text-[11px] uppercase tracking-[0.14em] text-[#8e98ab]">
                    <tr>
                      <th className="py-3">Region Name</th>
                      <th className="py-3">Risk Index</th>
                      <th className="py-3 text-right">Active Hubs</th>
                      <th className="py-3 text-right">Trend</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/[0.07] text-[#cbd4e3]">
                    {highRiskRegions.map((region) => (
                      <tr key={region.name}>
                        <td className="py-4 font-semibold">{region.name}</td>
                        <td className="py-4">
                          <div className="h-2 w-36 overflow-hidden rounded-full bg-[#2a3448]">
                            <div className="h-full rounded-full bg-gradient-to-r from-[#ff9a7a] to-[#ff6b3d]" style={{ width: `${region.riskIndex}%` }} />
                          </div>
                        </td>
                        <td className="py-4 text-right font-semibold">{region.activeHubs}</td>
                        <td className={`py-4 text-right font-black ${region.trend < 0 ? "text-emerald-400" : region.trend > 0 ? "text-[#ff7849]" : "text-[#a3adbf]"}`}>
                          {region.trend < 0 ? "↘" : region.trend > 0 ? "↗" : "—"} {Math.abs(region.trend)}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <section className="mt-6 rounded-xl border border-white/[0.08] bg-[#11192a]/90 px-5 py-5">
            <div className="flex items-center gap-5">
              <button className="flex h-9 w-9 items-center justify-center rounded-full border border-[#ff9a7a]/40 text-[#ff9a7a]">
                <Play size={15} fill="currentColor" />
              </button>
              <div className="flex-1">
                <div className="h-2 overflow-hidden rounded-full bg-[#2a3448]">
                  <div className="h-full w-[70%] rounded-full bg-[#ff6b3d]" />
                </div>
                <div className="mt-3 flex justify-between text-xs font-black text-[#b9c2d3]">
                  <span>2020</span>
                  <span>2021</span>
                  <span>2022</span>
                  <span>2023</span>
                  <span>2024</span>
                </div>
              </div>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-white/[0.08] bg-[#080d18] px-4 py-10 md:px-8 xl:ml-[280px]">
        <div className="mx-auto flex max-w-7xl flex-col gap-8 text-sm text-[#a7b0c3] lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="font-black text-[#ff8a66]">SatFire</p>
            <p className="mt-2 max-w-md">© 2024 SatFire Intelligence. Data provided by NASA FIRMS & NOAA.</p>
          </div>
          <div className="flex flex-wrap items-center gap-6">
            <a>Privacy Policy</a>
            <a>Terms of Service</a>
            <a>Data Attribution</a>
            <a>API Documentation</a>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10">
              <Twitter size={16} />
            </span>
            <span className="flex h-9 w-9 items-center justify-center rounded-full border border-white/10">
              <Linkedin size={16} />
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default StatisticsPage;
