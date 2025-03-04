# Hawksearch Vue SDK

The Hawksearch Vue SDK provides search components and integration tools for building
Hawksearch experiences with **Vue 3** and **Vuex 4**.


## Requirements

- Node.js `^20.19.0` or `>=22.12.0`
- npm `>=10.8.0`

## Installation

Install the 1.0.0 release from GitHub:

```bash
npm install git+https://github.com/hawksearch/vue-hawksearch.git#v1.0.0
```

The SDK requires Vue 3 and Vuex 4. Vue 2 and Vuex 3 are not supported.

## Usage

Add the SDK's components to the page:

```html
<div id="hawk-vue-app">
  <div class="hawk">
    <div class="hawk__header">
      <search-box-smart></search-box-smart>
    </div>
    <div class="hawk__body">
      <facet-list></facet-list>
      <results></results>
    </div>
  </div>
</div>
```

Import the SDK and its stylesheet in your application, then initialize the widget:

```js
import HawksearchVue from '@hawksearch/vue';
import '@hawksearch/vue/dist/vue-hawksearch.css';

const config = {
  clientGuid: 'your-client-guid',
  apiUrl: 'https://searchapi.hawksearch.net'
};

HawksearchVue.createWidget(document.getElementById('hawk-vue-app'), { config });
```

`<search-box-smart>` provides Smart Search, including image search and smart
suggestions. Use `<search-box>` for the standard search box. The SDK's Vite library
build externalizes Vue and Vuex, so the application must provide compatible Vue 3
and Vuex 4 dependencies.

### Store API migration

In version 1.0.0, `generateStoreInstance()` was replaced with `createStore()`. Update
existing integrations that create a store directly:

```js
const store = HawksearchVue.createStore();
HawksearchVue.createWidget(document.getElementById('hawk-vue-app'), { config, store });
```

Negated facet selections now use the `@` prefix instead of `-`. Review integrations
that construct negated selections themselves.

## Environment Files (.env)

For the example app, add the environment file for the mode you want to run in the
repository root. Vite loads `.env.development` for `npm run dev`, `.env.production`
for `npm run dev:prod`, and `.env.staging` for `npm run dev:stg`. The example falls
back to the SDK's default configuration when values are not supplied.

Example `.env.development`:

```ini
VITE_CLIENT_GUID=your-client-guid
VITE_API_URL=https://searchapi-dev.hawksearch.net
```

## Development and Build

Install the repository's dependencies and build the distributable library:

```bash
npm install
npm run build
```

The Vite library build writes files to `dist/`, including the ES and UMD bundles,
the backward-compatible `vue-hawksearch.js` ES bundle name, and the combined CSS
file `vue-hawksearch.css`.

Start the development server to view the examples:

```bash
npm run dev
```

Open [http://localhost:3333](http://localhost:3333) to choose between the standard
search and Smart Search examples. The server redirects its root URL to the examples
index. `npm run dev:prod` and `npm run dev:stg` start the development server using
the production and staging environment modes. To rebuild the library automatically
while developing, run `npm run dev:all` instead; it starts the Vite server alongside
the library build watcher.

## Docker

### Using Docker Compose

#### Start Containers
```bash
docker compose up --build -d
```

#### View Logs
```bash
docker logs -f <container_name>
```

#### Stop and Clean Up
```bash
docker compose down --rmi all --volumes --remove-orphans
```

### Alternative Without Docker Compose

#### Build and Run the Container Manually
```bash
docker build -t vue-hawk-tst .
docker run -d -p 3003:3003 -p 5005:5005 --name vue-hawk-tst vue-hawk-tst
```

#### View Logs
```bash
docker logs -f vue-hawk-tst
```

#### Access Container Shell
```bash
docker exec -it vue-hawk-tst sh
```

#### Stop and Remove Container
```bash
docker stop vue-hawk-tst
docker rm vue-hawk-tst
```

#### Remove Image if Not Used
```bash
docker rmi vue-hawk-tst
```

### Checking Correct IP Address

The correct **IP address** for accessing the service may vary depending on your Docker network settings. To find the correct IP, check your **Docker configuration files** or use the following command:
```bash
docker network inspect bridge | grep "Gateway"
```
Alternatively, you can check the **Docker Compose configuration files** where network settings are defined.

### Additional Resources

- [Hawksearch Documentation](https://www.hawksearch.com/)
- [Docker Guide](https://docs.docker.com/get-started/)
- [Vue.js](https://vuejs.org/)
- [Vite Documentation](https://vitejs.dev/)
