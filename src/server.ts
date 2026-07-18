import { env } from "./config/env.js";
import app from "./app.js";

app.listen(env.port, () => {
  console.log(`🔥 SatFire API démarrée sur http://localhost:${env.port}`);
  console.log(`   Health check : http://localhost:${env.port}/api/health`);
});