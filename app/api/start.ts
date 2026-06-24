import "dotenv/config";
import { createServer } from "./server";
import { startSupplierPriceSyncScheduler } from "../modules/supplier-integration/scheduler";

// Process entrypoint for running this as a long-lived server (npm start /
// npm run dev / the run skill's driver.mjs). Deliberately separate from
// api/server.ts's createServer() export — server.ts must stay free of
// listen()/scheduler side effects so it can be imported as a pure handler
// by index.ts (the Vercel serverless entrypoint), which must never start an
// in-process timer or bind a port itself.
const app = createServer();
const port = process.env.PORT ? Number(process.env.PORT) : 4000;
app.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`TradeOS Cost Book API listening on port ${port}`);
});

// No-ops unless SUPPLIER_PRICE_SYNC_CRON_SCHEDULE and SUPPLIER_PRICE_SYNC_JOBS
// are both set. Operators who prefer external cron/k8s CronJob over an
// in-process timer can ignore this and run scripts/run-supplier-price-sync.ts
// on their own schedule instead. Not started at all in the Vercel deployment.
const supplierPriceSyncTask = startSupplierPriceSyncScheduler({
  onTick: (outcomes) => {
    const failed = outcomes.filter((outcome) => outcome.error);
    // eslint-disable-next-line no-console
    console.log(`[supplier-price-sync] ran ${outcomes.length} job(s), ${failed.length} failed`);
    for (const outcome of failed) {
      // eslint-disable-next-line no-console
      console.error(`[supplier-price-sync] ${outcome.spec.label ?? outcome.spec.supplierId} failed: ${outcome.error}`);
    }
  },
});
if (supplierPriceSyncTask) {
  // eslint-disable-next-line no-console
  console.log(`[supplier-price-sync] scheduler started (${process.env.SUPPLIER_PRICE_SYNC_CRON_SCHEDULE})`);
}
