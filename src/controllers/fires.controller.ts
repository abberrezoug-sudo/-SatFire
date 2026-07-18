import { Request, Response, NextFunction } from "express";
import { z } from "zod";
import { getFiresByArea, getFiresByCountry, getMapKeyStatus } from "../services/firms.service.js";
import { FirmsSource } from "../types/fire.types.js";

const VALID_SOURCES: [FirmsSource, ...FirmsSource[]] = [
  "MODIS_NRT",
  "MODIS_SP",
  "VIIRS_SNPP_NRT",
  "VIIRS_SNPP_SP",
  "VIIRS_NOAA20_NRT",
  "VIIRS_NOAA21_NRT",
  "LANDSAT_NRT",
];

const areaQuerySchema = z.object({
  bbox: z.string().regex(/^-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?,-?\d+(\.\d+)?$/, {
    message: "bbox doit être au format ouest,sud,est,nord (ex: -1.5,34.5,1.0,36.5)",
  }),
  source: z.enum(VALID_SOURCES).optional(),
  days: z.coerce.number().int().min(1).max(10).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

const countryQuerySchema = z.object({
  code: z.string().length(3, "Code pays ISO3 attendu, ex: DZA"),
  source: z.enum(VALID_SOURCES).optional(),
  days: z.coerce.number().int().min(1).max(10).optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export async function getByArea(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = areaQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const [west, south, east, north] = parsed.data.bbox.split(",").map(Number);
    const fires = await getFiresByArea({
      west: west!,
      south: south!,
      east: east!,
      north: north!,
      source: parsed.data.source,
      dayRange: parsed.data.days,
      date: parsed.data.date,
    });
    res.json({ count: fires.length, fires });
  } catch (err) {
    next(err);
  }
}

export async function getByCountry(req: Request, res: Response, next: NextFunction) {
  try {
    const parsed = countryQuerySchema.safeParse(req.query);
    if (!parsed.success) {
      return res.status(400).json({ error: parsed.error.flatten() });
    }
    const fires = await getFiresByCountry({
      countryCode: parsed.data.code.toUpperCase(),
      source: parsed.data.source,
      dayRange: parsed.data.days,
      date: parsed.data.date,
    });
    res.json({ count: fires.length, fires });
  } catch (err) {
    next(err);
  }
}

export async function getAlgeria(req: Request, res: Response, next: NextFunction) {
  try {
    const days = req.query.days ? Number(req.query.days) : 1;
    const fires = await getFiresByCountry({ countryCode: "DZA", dayRange: days });
    res.json({ count: fires.length, fires });
  } catch (err) {
    next(err);
  }
}

export async function getQuota(_req: Request, res: Response, next: NextFunction) {
  try {
    const status = await getMapKeyStatus();
    res.json(status);
  } catch (err) {
    next(err);
  }
}