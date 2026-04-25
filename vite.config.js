import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

export default defineConfig(({ command }) => {
    // Check if the watch flag is present in the command line arguments
    // @see https://github.com/vitejs/vite/discussions/7565
    // @see https://github.com/vitejs/vite/issues/20657
    const isWatchMode = process.argv.includes('--watch') || process.argv.includes('-w');

    return {
        plugins: [
            vue(),
            // hook to keep backward compatibility with legacy file name vue-hawksearch.js
            {
                name: 'copy-es-to-default',
                buildEnd() {
                    const src = path.resolve(__dirname, 'dist/vue-hawksearch.es.js');
                    const dest = path.resolve(__dirname, 'dist/vue-hawksearch.js');
                    fs.copyFileSync(src, dest);
                }
            }
        ],
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
                external: ['vue', 'vuex'],
                output: {
                    globals: {
                        vue: 'Vue',
                        vuex: 'Vuex',
                    },
                    chunkFileNames: 'chunks/vue-hawksearch.[hash].js',
                    assetFileNames: 'vue-hawksearch.[ext]',
                },
            },
            copyPublicDir: false,
            lib: {
                entry: 'src/index.js',
                name: 'VueHawksearch',
                fileName: (format) => `vue-hawksearch.${format}.js`,
                formats: ['es', 'umd'],
            },
            watch: isWatchMode ? {
                include: 'src/**',
            } : null,
            target: ['esnext'],
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
    };
})
