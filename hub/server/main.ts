import { createServer } from "node:http";
import { mkdirSync } from "node:fs";
import { join } from "node:path";
import { createApp } from "./app";
import { loadConfig } from "./config";
import { openStore } from "./store";

const config = loadConfig(process.env);
mkdirSync(config.dataDir, { recursive: true });
const store = openStore(join(config.dataDir, "reports.json"));
const app = createApp({ config, store });

createServer(app.handle).listen(config.port, () => {
  console.log(`feedback: listening on ${config.port}`);
});

if (!config.webhookUrl) console.log("feedback: Discord delivery disabled");
void app.deliverPending();
setInterval(() => void app.deliverPending(), 5 * 60 * 1000);
