import axios from "axios";
import { parse } from "csv-parse/sync";
import { env } from "../config/env";
import {
  AreaQueryParams,
  CountryQueryParams,
  FirePoint,
  FirmsSource,
  RawFirmsRecord,
} from "../types/fire.types";

const DEFAULT_SOURCE: FirmsSource = "VIIRS_SNPP_NRT";

export class FirmsApiError extends Error {
  constructor(message: string, public statusCode = 502) {
    super(message);
    this.name = "FirmsApiError";
  }
}

function assertMapKey() {
  if (!env.firmsMapKey) {
    throw new FirmsApiError(
      "FIRMS_MAP_KEY manquante. Ajoute ta clé gratuite dans le fichier .env (voir .env.example).",
      500
    );
  }
}

function normalizeRecord(row: RawFirmsRecord): FirePoint {
  const date = row.acq_date;
  const time = row.acq_time.padStart(4, "0");
  const isoDate = `${date}T${time.slice(0, 2)}:${time.slice(2, 4)}:00Z`;

  return {
    latitude: parseFloat(row.latitude),
    longitude: parseFloat(row.longitude),
    brightness: parseFloat(row.bright_ti4 ?? row.brightness ?? "0"),
    confidence: isNaN(Number(row.confidence)) ? row.confidence : Number(row.confidence),
    acquiredAt: isoDate,
    satellite: row.satellite,
    instrument: row.instrument,
    frp: parseFloat(row.frp),
    dayNight: row.daynight === "N" ? "N" : "D",
  };
}

function parseCsvResponse(csvText: string): FirePoint[] {
  if (csvText.trim().length === 0) return [];
  if (csvText.toLowerCase().startsWith("invalid") || csvText.toLowerCase().includes("error")) {
    throw new FirmsApiError(`Réponse FIRMS invalide : ${csvText.slice(0, 200)}`);
  }

  const records: RawFirmsRecord[] = parse(csvText, {
    columns: true,
    skip_empty_lines: true,
  });

  return records.map(normalizeRecord);
}

function handleAxiosError(err: unknown): never {
  if (axios.isAxiosError(err)) {
    const status = err.response?.status;
    if (status === 403) {
      throw new FirmsApiError(
        "Clé FIRMS refusée (403). Vérifie que FIRMS_MAP_KEY dans .env est correcte et active.",
        502
      );
    }
    throw new FirmsApiError(`Erreur réseau vers NASA FIRMS : ${err.message}`, 502);
  }
  throw err;
}

// Récupère les foyers actifs sur une zone rectangulaire (bounding box)
export async function getFiresByArea(params: AreaQueryParams): Promise<FirePoint[]> {
  assertMapKey();
  const { west, south, east, north, source = DEFAULT_SOURCE, dayRange = 1, date } = params;

  const coords = `${west},${south},${east},${north}`;
  const parts = [env.firmsBaseUrl, "area/csv", env.firmsMapKey, source, coords, dayRange];
  if (date) parts.push(date);
  const url = parts.join("/");

  try {
    const { data } = await axios.get<string>(url, { responseType: "text" });
    return parseCsvResponse(data);
  } catch (err) {
    if (err instanceof FirmsApiError) throw err;
    handleAxiosError(err);
  }
}

// Récupère les foyers actifs pour un pays entier (code ISO3, ex: DZA)
export async function getFiresByCountry(params: CountryQueryParams): Promise<FirePoint[]> {
  assertMapKey();

  const boxes: Record<string, string> = {
    DZA: "-8.7,18.9,11.9,37.2",
    MAR: "-13.2,27.6,-0.9,35.9",
    TUN: "7.4,30.2,11.7,37.6",
    FRA: "-5.5,41.3,9.8,51.2",
    ESP: "-9.5,35.9,3.3,43.9",
  };

  const bbox = boxes[params.countryCode.toUpperCase()];

  if (!bbox) {
    throw new FirmsApiError(
      `Pays non supporté : ${params.countryCode}`,
      400
    );
  }

  return getFiresByArea({
    west: Number(bbox.split(",")[0]),
    south: Number(bbox.split(",")[1]),
    east: Number(bbox.split(",")[2]),
    north: Number(bbox.split(",")[3]),
    source: params.source,
    dayRange: params.dayRange,
    date: params.date,
  });
}
// Vérifie le quota restant sur la clé FIRMS (10000 transactions / 10 min)
export async function getMapKeyStatus() {
  assertMapKey();
  const url = `https://firms.modaps.eosdis.nasa.gov/mapserver/mapkey_status/?MAP_KEY=${env.firmsMapKey}`;
  const { data } = await axios.get(url);
  return data;
}