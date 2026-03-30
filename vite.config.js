import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    publicDir: 'public',
    build: {
        outDir: 'dist',
        assetsDir: '',
        cssCodeSplit: false,
        sourcemap: false,
        minify: 'oxc',
        cssMinify: true,
        reportCompressedSize: true,
        rolldownOptions: {
            input: 'src/index.js',
            external: ['vue', 'moment-mini'],
            output: {
                entryFileNames: 'vue-hawksearch.js',
                chunkFileNames: 'chunks/vue-hawksearch.[hash].js',
                assetFileNames: 'vue-hawksearch.[ext]',
            },
        },
        copyPublicDir: false,
        lib: {
            entry: 'src/index.js',
            name: 'VueHawksearch',
            fileName: 'vue-hawksearch',
            formats: ['es'],
        },
        watch: {
            include: 'src/**',
        }
    },
    css: {
        preprocessorOptions: {
            scss: {
                additionalData: `@use "sass:color";`,
                includePaths: [path.resolve(__dirname, 'src/styles')],
            }
        }
    },
    resolve: {
        alias: {
            '@': path.resolve(__dirname, './src'),
            'vue': path.resolve(__dirname, './node_modules/vue/dist/vue.esm-bundler.js'),
        }
    },
    server: {
        index: 'index.html',
        host: "0.0.0.0",
        port: 3333,
        watch: {
            usePolling: true
        }
    }
})
