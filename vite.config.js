import {defineConfig, loadEnv} from 'vite'
import vue from '@vitejs/plugin-vue'
import fs from 'fs'
import path from 'path'

/**
 * Hook to keep backward compatibility with legacy file name vue-hawksearch.js
 * @return {{name: string, closeBundle(): void}}
 */
function legacyEsFormatSupportPlugin() {
    // hook to keep backward compatibility with legacy file name vue-hawksearch.js
    return {
        name: 'copy-es-to-default',
        closeBundle() {
            const src = path.resolve(__dirname, 'dist/vue-hawksearch.es.js');
            const dest = path.resolve(__dirname, 'dist/vue-hawksearch.js');
            if (fs.existsSync(src)) {
                fs.copyFileSync(src, dest);
            } else {
                console.warn(`[copy-es-to-default] Source file not found: ${src}`);
            }
        }
    };
}
function rootRedirectPlugin() {
    return {
        name: 'root-redirect',
        configureServer(server) {
            server.middlewares.use((req, res, next) => {
                if (req.url === '/' || req.url === '/index.html') {
                    res.writeHead(302, { Location: '/examples/index.html' })
                    res.end()
                } else {
                    next()
                }
            })
        }
    };
}

function watchBuildPlugin() {
    return {
        name: 'watch-build-plugin',
        configureServer(server) {
            // 1. Watch the build folder
            server.watcher.add('./dist');

            const triggerReload = (path) => {
                if (path.includes('dist')) {
                    // 2. Clear Vite's module cache for the modified file
                    const moduleNode = server.moduleGraph.getModuleById(path);
                    if (moduleNode) {
                        server.moduleGraph.invalidateModule(moduleNode);
                    } else {
                        // If specific file isn't found, clear the whole graph cache
                        server.moduleGraph.invalidateAll();
                    }

                    // 3. Trigger the browser reload
                    server.hot.send({ type: 'full-reload' });
                }
            };

            server.watcher.on('change', triggerReload);
            server.watcher.on('add', triggerReload);
        },
    };
}
export default defineConfig(async () => {
    // Check if the watch flag is present in the command line arguments
    // @see https://github.com/vitejs/vite/discussions/7565
    // @see https://github.com/vitejs/vite/issues/20657
    const isWatchMode = process.argv.includes('--watch') || process.argv.includes('-w');
    const { default: clean } = await import('@rollup-extras/plugin-clean');

    return {
        plugins: [
            vue(),
            legacyEsFormatSupportPlugin(),
            rootRedirectPlugin(),
            watchBuildPlugin(),
            clean({
                // Clear both the output folder and Vite's local cache on initial watch trigger
                targets: [
                    'dist',
                ],
                // Optional: setting to true provides a clean console log confirming the wipe
                verbose: true,
            })
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
