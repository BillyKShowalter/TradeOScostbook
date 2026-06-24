import { createServer } from "./api/server";

// Vercel's zero-config Express detection requires an entrypoint at one of a
// fixed set of locations (index.{js,ts,...} at the project root is one) that
// either exports the app as a default export or calls app.listen(). This
// file deliberately does neither side effect beyond the export — no
// app.listen(), no in-process scheduler (see api/start.ts for the long-lived
// process entrypoint used outside Vercel). Vercel wraps the exported Express
// app as a single Fluid Compute Function; it does not need a bound port.
export default createServer();
