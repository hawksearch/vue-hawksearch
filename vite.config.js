import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import path from 'path'
import terser from '@rollup/plugin-terser'

function getNodeMajorVersion() {
  const version = process.version.slice(1);
  return parseInt(version.split('.')[0], 10);
}

const nodeMajorVersion = getNodeMajorVersion();
const isNode16OrHigher = nodeMajorVersion >= 16;

// https://vitejs.dev/config/
export default defineConfig({
    plugins: [vue()],
    build: {
        outDir: 'dist',
        assetsDir: '',
        publicDir: 'public',
        cssCodeSplit: false,
        sourcemap: false,
        minify: isNode16OrHigher ? false : 'esbuild',
        cssMinify: true,
        terserOptions: {
            compress: true,
            mangle: true,
            format: {
                comments: false,
            },
        },
        reportCompressedSize: true,
        rollupOptions: {
            input: 'src/index.js',
            external: ['vue', 'moment-mini'],
            output: {
                entryFileNames: 'vue-hawksearch.js',
                chunkFileNames: 'chunks/vue-hawksearch.[hash].js',
                assetFileNames: 'vue-hawksearch.[ext]',
                // globals: {
                //     vue: 'Vue',
                //     'moment-mini': 'moment',
                // },
                plugins: isNode16OrHigher ? [
                    terser({
                        compress: true,
                        mangle: true,
                    })
                ] : [],
                compact: true,
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
