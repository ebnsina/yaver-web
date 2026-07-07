import adapter from '@sveltejs/adapter-auto';
import { sveltekit } from '@sveltejs/kit/vite';
import tailwindcss from '@tailwindcss/vite';
import { defineConfig } from 'vite';

export default defineConfig({
	plugins: [
		tailwindcss(),
		sveltekit({
			compilerOptions: {
				// Force runes mode for the project, except for libraries. Can be removed in svelte 6.
				runes: ({ filename }) =>
					filename.split(/[/\\]/).includes('node_modules') ? undefined : true
			},
			adapter: adapter()
		})
	],
	server: {
		// Proxy the API in dev so the browser talks to one origin (no CORS) and the
		// httpOnly session cookie is scoped to the web origin. A reverse proxy does
		// the same in prod. Override the target with VITE_API_TARGET.
		proxy: {
			'/v1': {
				target: process.env.VITE_API_TARGET ?? 'http://localhost:8080',
				changeOrigin: true
			}
		}
	}
});
