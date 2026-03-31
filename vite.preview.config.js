import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

export default defineConfig({
    plugins: [vue()],
    publicDir: 'preview',
    build: {
        outDir: 'preview',
        assetsDir: '',
        cssCodeSplit: false,
        sourcemap: true,
        cssMinify: false,
        minify: false,
        reportCompressedSize: true,
        rolldownOptions: {
            input: 'index.html',
            output: {
                entryFileNames: 'vue-hawksearch.js',
                chunkFileNames: 'chunks/vue-hawksearch.[hash].js',
                assetFileNames: 'vue-hawksearch.[ext]',
            },
        },
        copyPublicDir: false,
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'vue': path.resolve(__dirname, './node_modules/vue/dist/vue.esm-bundler.js'),
        }
    },
    preview: {
        root: 'preview/',
        publicDir: '',
        index: 'index.html',
        port: 5005,
    },
    server: {
        host: "0.0.0.0",
        port: 3003,
        watch: {
            usePolling: true
        }
    }
})

