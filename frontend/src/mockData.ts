export const kpis = [
  {
    label: "TOTAL FIRES",
    value: "12,842",
    detail: "+12% from last cycle",
    tone: "orange",
  },
  {
    label: "AVG FRP",
    value: "342.5 MW",
    detail: "Fire Radiative Power",
    tone: "blue",
  },
  {
    label: "ACTIVE SATELLITES",
    value: "24 / 24",
    detail: "Full Constellation Health",
    tone: "neutral",
  },
  {
    label: "RISK LEVEL",
    value: "Critical",
    detail: "14 High-threat Zones",
    tone: "red",
  },
] as const;

export const frequencyTrends = [
  { month: "JAN", MODIS: 42, VIIRS: 24 },
  { month: "FEB", MODIS: 58, VIIRS: 34 },
  { month: "MAR", MODIS: 43, VIIRS: 49 },
  { month: "APR", MODIS: 79, VIIRS: 31 },
  { month: "MAY", MODIS: 113, VIIRS: 7 },
  { month: "JUN", MODIS: 141, VIIRS: 0 },
  { month: "JUL", MODIS: 108, VIIRS: 14 },
];

export const radiativePower = [
  { month: "JAN", frp: 110 },
  { month: "FEB", frp: 104 },
  { month: "MAR", frp: 132 },
  { month: "APR", frp: 238 },
  { month: "MAY", frp: 296 },
  { month: "JUN", frp: 435 },
  { month: "JUL", frp: 357 },
  { month: "AUG", frp: 410 },
];

export const highRiskRegions = [
  { name: "Amazonia West (BR)", riskIndex: 92, activeHubs: 412, trend: 12 },
  { name: "Congo Basin North", riskIndex: 76, activeHubs: 388, trend: 5 },
  { name: "New South Wales (AU)", riskIndex: 65, activeHubs: 245, trend: -8 },
  { name: "California Central", riskIndex: 88, activeHubs: 112, trend: 24 },
  { name: "Siberian Shield South", riskIndex: 41, activeHubs: 89, trend: 0 },
];
