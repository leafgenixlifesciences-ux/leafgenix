import { defineCloudflareConfig } from "@opennextjs/cloudflare";

export default {
  ...defineCloudflareConfig(),
  // `npm run build` hands over to OpenNext on Cloudflare's Git build, so
  // OpenNext must call Next.js directly or the two would loop.
  buildCommand: "npx next build",
};
