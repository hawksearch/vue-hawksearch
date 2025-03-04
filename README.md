# Hawksearch Vue SDK

This project provides Vue.js components for integrating Hawksearch.

---

## Build

The project already contains precompiled files in the `dist` folder.

To create a new production build:

```bash
npm run build
```

This generates optimized output in the `dist` folder.

## Installation

The main installation command:

```sh
npm install
```

To install the latest package version from the repository:

```sh
npm install git+https://github.com/hawksearch/vue-hawksearch.git#master
```

In some cases, you may need a specific version:

```sh
npm install git+https://github.com/hawksearch/vue-hawksearch.git#v0.9.94
```

Recommended Node.js versions: 16, 18, 20, or 22 (LTS).

## Environment Files (.env)

Create `.env.development`, `.env.production`, and `.env.staging` in the root directory.
If `.env.development` is missing, the project defaults to a demo configuration.

Example `.env.development`:

```ini
VITE_CLIENT_GUID=3953cf87e0aa4a4eb9496a24d5a0fa84
VITE_API_URL=https://searchapi-dev.hawksearch.net/api/v2/search/
```

## Main Commands

```bash
npm run dev
```

Generates `index.html` in the project root and starts the development server at `localhost:3333`. This file serves as the main entry point for the application.

```bash
npm run preview
```

Creates a build and serves it on a separate port, with files placed in the `preview` folder.

---

## Virtualization and Server

This project uses **Docker** for containerization and **Vite** as the development server.

- **Docker** allows running the application in an isolated containerized environment.
- **Vite** provides fast development and preview builds, generating `index.html` and serving it dynamically.

---

## Example Usage

```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width,initial-scale=1.0">
  <title>Vue Hawksearch Example</title>
  <link rel="stylesheet" href="./dist/vue-hawksearch.css">
</head>
<body>
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

    window.addEventListener('load', () => {
      HawksearchVue.createWidget(document.getElementById('hawk-vue-app'), { config });
    });
  </script>
</body>
</html>
```

---

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

