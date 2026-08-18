import { defineConfig, type Plugin } from "vite"
import react from "@vitejs/plugin-react"
import { fileURLToPath, URL } from "node:url"

const imageFilePattern = /\.(?:avif|gif|ico|jpe?g|png|svg|webp)(?:\?.*)?$/i

function cacheDevelopmentImages(): Plugin {
  return {
    name: "cache-development-images",
    configureServer(server) {
      server.middlewares.use((request, response, next) => {
        if (request.url && imageFilePattern.test(request.url)) {
          response.setHeader("Cache-Control", "public, max-age=31536000, immutable")
        }
        next()
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), cacheDevelopmentImages()],
  resolve: {
    alias: {
      "@": fileURLToPath(new URL("./src", import.meta.url)),
    },
  },
})
