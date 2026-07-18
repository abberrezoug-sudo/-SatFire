export type FirmsSource =
  | "MODIS_NRT"
  | "MODIS_SP"
  | "VIIRS_SNPP_NRT"
  | "VIIRS_SNPP_SP"
  | "VIIRS_NOAA20_NRT"
  | "VIIRS_NOAA21_NRT"
  | "LANDSAT_NRT";

export interface FirePoint {
  latitude: number;
  longitude: number;
  brightness: number;
  confidence: string | number;
  acquiredAt: string;
  satellite: string;
  instrument: string;
  frp: number;
  dayNight: "D" | "N";
}

export interface FiresResponse {
  count: number;
  fires: FirePoint[];
}

export interface BoundingBox {
  west: number;
  south: number;
  east: number;
  north: number;
}

export interface Filters {
  source: FirmsSource;
  days: number;
}

export interface ApiErrorPayload {
  error: string | { fieldErrors?: Record<string, string[]> };
}
