import dotenv from "dotenv";
dotenv.config();

function required(name: string, fallback?: string): string {
  const value = process.env[name] ?? fallback;
  if (!value) {
    console.warn(`⚠️  Variable d'environnement manquante : ${name}`);
    return "";
  }
  return value;
}

export const env = {
  port: Number(process.env.PORT ?? 4000),
  firmsMapKey: required("FIRMS_MAP_KEY"),
  firmsBaseUrl: required("FIRMS_BASE_URL", "https://firms.modaps.eosdis.nasa.gov/api"),
};