// Sources de satellites disponibles chez NASA FIRMS
export type FirmsSource =
  | "MODIS_NRT"
  | "MODIS_SP"
  | "VIIRS_SNPP_NRT"
  | "VIIRS_SNPP_SP"
  | "VIIRS_NOAA20_NRT"
  | "VIIRS_NOAA21_NRT"
  | "LANDSAT_NRT";

// Une ligne brute telle que renvoyée par le CSV FIRMS
export interface RawFirmsRecord {
  latitude: string;
  longitude: string;
  bright_ti4?: string;
  brightness?: string; // MODIS utilise "brightness" au lieu de bright_ti4
  scan: string;
  track: string;
  acq_date: string;
  acq_time: string;
  satellite: string;
  instrument: string;
  confidence: string;
  version: string;
  bright_ti5?: string;
  bright_t31?: string; // MODIS
  frp: string; // Fire Radiative Power (MW)
  daynight: string;
}

// Format normalisé qu'on renvoie côté API SatFire
export interface FirePoint {
  latitude: number;
  longitude: number;
  brightness: number; // température apparente du foyer (Kelvin)
  confidence: string | number; // "low"|"nominal"|"high" (VIIRS) ou 0-100 (MODIS)
  acquiredAt: string; // ISO 8601, combinaison acq_date + acq_time
  satellite: string;
  instrument: string;
  frp: number; // intensité du feu, en mégawatts
  dayNight: "D" | "N";
}

export interface AreaQueryParams {
  west: number;
  south: number;
  east: number;
  north: number;
  source?: FirmsSource | undefined;
  dayRange?: number | undefined; // 1 à 10
  date?: string | undefined; // yyyy-mm-dd
}

export interface CountryQueryParams {
  countryCode: string; // ISO 3166-1 alpha-3, ex: "DZA"
  source?: FirmsSource | undefined;
  dayRange?: number | undefined;
  date?: string | undefined;
}