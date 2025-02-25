import { defineConfig, envField } from "astro/config";

export default defineConfig({
  env: {
    schema: {
      TURSO_DATABASE_URL: envField.string({ context: "server", access: "secret", optional: false }),
      TURSO_AUTH_TOKEN: envField.string({ context: "server", access: "secret", optional: false }),
    },
  },
});
