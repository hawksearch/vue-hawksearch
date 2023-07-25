# Hawksearch Vue SDK

This package provides components and integration processes to Hawksearch using Vue.js.

Please contact Hawksearch personnel for additional information on service settup https://www.hawksearch.com/

## Installation

Install the latest package version usnig npm

```sh
$ npm install git+https://github.com/hawksearch/vue-hawksearch.git#master
```

In some cases you may need a specific version

```sh
$ npm install git+https://github.com/hawksearch/vue-hawksearch.git#v0.9.94
```

## Getting started
Add the widget layout to the markup file - in this case, an SPA widget with all components

```html
<div id="hawk-vue-app">
    <div class="hawk">
        <div class="hawk__header">
            <search-box></search-box>
        </div>

        <div class="hawk__body">
            <facet-list></facet-list>

            <results></results>
        </div>
    </div>
</div>
```

Create a dedicated .js file for the widget and include the library's main class and styles

```javascript
import HawksearchVue from '@hawksearch/vue';
import '@hawksearch/vue/dist/vue-hawksearch.css'
```

Then set the necessary configurations. The values for these should be provided by a Hawksearch representative
```javascript
const config = {
    clientGuid: '1234567890',
    apiUrl: 'https://searchapi.hawksearch.net/api/v2/search/'
}
```

Create the widget after all resources are loaded
```javascript
window.addEventListener('load', () => {
    HawksearchVue.createWidget(document.getElementById('hawk-vue-app'), { config });
});
```
