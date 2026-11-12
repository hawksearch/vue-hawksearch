## HawkSearch Vue 3 SDK Architecture Redesign Plan

## 1. High-Level Architectural Layers

To guarantee testability and allow developers to consume our logic headlessly, the library is strictly split into three layers:

```unset
┌─────────────────────────────────────────────────────────┐
│                     1. CORE LAYER                       │
│  (Pure TypeScript • 0 Vue Deps • Models • API Clients)  │
└────────────────────────────┬────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────┐
│                  2. COMPOSITION LAYER                   │
│      (Vue 3 Composables • Reactivity • State Mgmt)      │
└────────────────────────────┬────────────────────────────┘
                             ▼
┌─────────────────────────────────────────────────────────┐
│                      3. UI LAYER                        │
│    (Vue 3 Components • Slots • Scoped Base Styles)      │
└─────────────────────────────────────────────────────────┘

```

----------

## 2. Target Directory Structure

Your refactored library structure should mirror this layout to separate pure TS logic from Vue SFCs (Single File Components):

```text
hawksearch-vue-lib/
├── src/
│   ├── core/                  # Pure TypeScript (Zero Vue/UI dependencies)
│   │   ├── clients/           # HTTP/REST wrappers handling HawkSearch endpoints
│   │   ├── models/            # Request/Response payloads & DTO mapping
│   │   └── services/          # ClientGuid config & shared business orchestrators
│   ├── composables/           # Vue 3 Composition API reactive bridges
│   │   ├── useHawkSearch.ts   # Controls keyword state, pagination, and execution
│   │   └── useFacets.ts       # Manages state for multi-select facet filters
│   ├── components/            # Vue 3 UI Elements (Distributed with library)
│   │   ├── SearchBox.vue      # Smart component for search input
│   │   ├── FacetFilters.vue   # Component for dynamic sidebar filters
│   │   └── ResultsGrid.vue    # Flex/Grid container for search item loops
│   └── index.ts               # Main library entry point (exports everything)
├── vite.config.ts             # Library-mode compiler configurations
└── package.json               # Configured for exports, types, and peerDependencies

```

----------

## 3. Core Class Design Patterns

## Configuration & Context (`core/services/HawkConfigService.ts`)

Manages global parameters (like `ClientGuid`) needed for authenticated HawkSearch executions.

```typescript
export interface HawkConfig {
  clientGuid: string;
  apiUrl?: string;
}

export class HawkConfigService {
  private config: HawkConfig | null = null;

  public init(config: HawkConfig): void {
    this.config = {
      apiUrl: 'https://hawksearch.net',
      ...config
    };
  }

  public getConfig(): HawkConfig {
    if (!this.config) throw new Error("HawkSearch SDK is not initialized.");
    return this.config;
  }
}

```

## Data Transfer Models (`core/models/SearchRequest.ts`)

Ensures request payloads sent to HawkSearch APIs match strict data schemas.

```typescript
export class HawkSearchRequest {
  public Keyword: string = '';
  public PageNo: number = 1;
  public MaxResultsPerPage: number = 24;
  public Facets: Record<string, string[]> = {};

  constructor(init?: Partial<HawkSearchRequest>) {
    Object.assign(this, init);
  }
}

```

## Transport Wrapper (`core/clients/HawkApiClient.ts`)

Decoupled network client handles actual POST requests to external endpoints.

```typescript
import { HawkConfigService } from '../services/HawkConfigService';
import { HawkSearchRequest } from '../models/SearchRequest';

export class HawkApiClient {
  constructor(private configService: HawkConfigService) {}

  public async fetchResults(requestPayload: HawkSearchRequest): Promise<any> {
    const config = this.configService.getConfig();
    const response = await fetch(`${config.apiUrl}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ClientGuid: config.clientGuid,
        ...requestPayload
      })
    });
    return response.json();
  }
}

```

----------

## 4. Reactive Composition Layer (`composables/useHawkSearch.ts`)

Bridges the pure TS services with Vue 3 reactive states (`ref`, `computed`). Enables a headless architecture for package consumers.

```typescript
import { ref, readonly } from 'vue';
import { HawkApiClient } from '../core/clients/HawkApiClient';
import { HawkSearchRequest } from '../core/models/SearchRequest';
import { HawkConfigService } from '../core/services/HawkConfigService';

const configService = new HawkConfigService();
const apiClient = new HawkApiClient(configService);

export function useHawkSearch() {
  const results = ref<any[]>([]);
  const loading = ref(false);
  const internalQuery = ref(new HawkSearchRequest());

  const search = async (keyword: string) => {
    loading.value = true;
    internalQuery.value.Keyword = keyword;
    try {
      const response = await apiClient.fetchResults(internalQuery.value);
      results.value = response.Results || [];
    } finally {
      loading.value = false;
    }
  };

  return {
    results: readonly(results),
    loading: readonly(loading),
    search,
    initLibrary: (config: { clientGuid: string }) => configService.init(config)
  };
}

```

----------

## 5. UI Component Strategy (`components/SearchBox.vue`)

Components must be highly flexible. Implement Named Slots to allow package consumers to inject their own input/button markup while keeping our functional search logic intact.

```vue
<script setup lang="ts">
import { ref } from 'vue';
import { useHawkSearch } from '../composables/useHawkSearch';

const { search, loading } = useHawkSearch();
const inputVal = ref('');

const triggerSearch = () => {
  if (inputVal.value.trim()) search(inputVal.value);
};
</script>

<template>
  <div class="hawk-search-box-wrapper">
    <slot name="input" :loading="loading" :search="triggerSearch">
      <input v-model="inputVal" @keyup.enter="triggerSearch" placeholder="Search..." />
      <button :disabled="loading" @click="triggerSearch">Search</button>
    </slot>
  </div>
</template>

<style scoped>
.hawk-search-box-wrapper { display: flex; gap: 8px; }
</style>

```