import path from 'node:path'
import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import vue from '@vitejs/plugin-vue'
import VueRouter from 'unplugin-vue-router/vite'
import basicSsl from '@vitejs/plugin-basic-ssl'
import { VitePWA } from 'vite-plugin-pwa'

const pwaConfig = {
    strategies: 'injectManifest',
    srcDir: 'src',
    filename: 'sw.js',
    registerType: 'autoUpdate',
    manifest: {
        name: 'Talangin',
        short_name: 'Talangin',
        theme_color: '#92dcb7',
        icons: [
            {
                    src: 'android-chrome-192x192.png',
                    sizes: '192x192',
                    type: 'image/png'
            },
                {
                    src: 'android-chrome-512x512.png',
                    sizes: '512x512',
                    type: 'image/png'
            }
        ]
    }
}

// https://vite.dev/config/
export default defineConfig({
    plugins: [VueRouter(), vue(), tailwindcss(), VitePWA(pwaConfig), basicSsl()], 
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
        },
    },
    server: {
        host: '0.0.0.0',
        https: true,
    }
})
