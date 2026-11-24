import { defineConfig } from "vite";
import { handleHttp, handleUpgrade } from "./server/index.js";

// Serves the game API and socket on the Vite dev port, so no second port is needed.
function gameServerPlugin() {
  return {
    name: "universe-crazy-game-server",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url.startsWith("/api/")) return handleHttp(req, res);
        next();
      });
      server.httpServer?.on("upgrade", (req, socket, head) => {
        handleUpgrade(req, socket, head);
      });
    }
  };
}

export default defineConfig({
  base: "./",
  plugins: [gameServerPlugin()]
});
