const { writeFileSync, mkdirSync } = require('fs')
const path = require('path')

const indexHtmlContent = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Vue Hawksearch Example</title>
    <link rel="stylesheet" href="./dist/vue-hawksearch.css">
</head>
<body>
<div id="hawk-vue-app">
    <div class="hawk">
        <div class="hawk__header">
            <search-box></search-box>
            <search-box-smart></search-box-smart>
        </div>
        <div class="hawk__body">
            <facet-list></facet-list>
            <results></results>
        </div>
    </div>
</div>
<script type="importmap">
    {
        "imports": {
            "vue": "https://cdn.jsdelivr.net/npm/vue@2.6.14/dist/vue.esm.browser.js",
            "vuex": "https://cdn.jsdelivr.net/npm/vuex@3.1.3/dist/vuex.esm.browser.js"
        }
    }
</script>
<script type="module">
    import HawksearchVue from './dist/vue-hawksearch.js';
    import config from './hs.config.js';
    console.log(import.meta.env.MODE);
    window.addEventListener('load', () => {
        var widget = HawksearchVue.createWidget(document.getElementById('hawk-vue-app'), { config });
    });
</script>
</body>
</html>`

function generatePreviewIndex() {
    const previewDir = path.resolve(process.cwd(), 'preview')
    mkdirSync(previewDir, { recursive: true })
    writeFileSync(path.join(previewDir, 'index.html'), indexHtmlContent)
    console.log('✅ preview/index.html created!')
}

function generateRootIndex() {
    writeFileSync(path.join(process.cwd(), 'index.html'), indexHtmlContent)
    console.log('✅ index.html created in root!')
}

//generatePreviewIndex()
generateRootIndex()
