---
description: "Composable refactor plan for HawksearchVue, written for humans and AI agents"
---

# HawksearchVue Composable Refactor Plan

Goal: refactor the current HawksearchVue architecture around composables while preserving public widget behavior and the existing static API during migration.

## What this plan is trying to achieve

The current design puts too much responsibility in one class. HawksearchVue owns widget creation, API calls, URL parsing, redirects, search lifecycle, event fan-out, and several pure transformation utilities. That makes the code harder to test and makes small changes ripple across components and store actions.

The refactor should extract composables for the behavior clusters that already repeat across the codebase, while keeping HawksearchVue as an adapter layer until the migration is complete.

## Important constraints

- Preserve the public API for external consumers.
- Keep behavior parity for search submit, suggestion fetch, redirects, pagination, back/forward navigation, facet updates, and tracking.
- Prefer pure composables first, then component interaction composables.
- Do not replace Vuex or rewrite the whole widget architecture in one pass.

## Current anchors worth extracting

Use these exact symbols as the migration starting points:

- static createWidget(el, { config, store, dataLayer, components })
- static createStore(storeOverrides)
- static fetchResults(searchParams, store, callback)
- static fetchSuggestions(searchParams, store, callback)
- static fetchRecommendations(store, widgetParams, callback)
- static handleRedirectRules(searchOutput, config)
- static redirectSearch(keyword, widget, searchPageUrl, ignoreRedirectRules)
- static handleAdditionalParameters(widget)
- static handleLanguageParameters(widget)
- static initialSearch(widget)
- static extendSearchData(searchOutput, pendingSearch, searchParams, callback)
- static applyFacets(facet, pendingSearchFacets, callback)
- static getFacetParamName(facet)
- static getFacetFieldNames(store)
- static getIndexName(config)
- static getClientData(store)
- static getFullSearchUrl(store)
- static getFullAutocompleteUrl(store)
- static getAbsoluteUrl(path, store)
- static emitToAll(eventType, ...args)
- static scrollToBeginning(widget)
- static getHawksearchHeaders(config)
- static mergeConfig(configA, configB)
- static requestConditionsMet(store)
- static trackPageLoad()
- static collapseAllFacets()
- static isWhitelistedParam(key)
- static addWhitelistParams(params)
- static paramWhitelist

Also include the URL helpers:

- getParamName(paramName, widget, reverse)
- parseURLparams(widget)
- updateUrl(widget)
- addToRangeFacets(facetName)

## Recommended composables

### 1. useHawksearchApi
Owns the request layer and request-shaping helpers.

Move here:
- static fetchResults(searchParams, store, callback)
- static fetchSuggestions(searchParams, store, callback)
- static fetchRecommendations(store, widgetParams, callback)
- static getHawksearchHeaders(config)
- static getFullSearchUrl(store)
- static getFullAutocompleteUrl(store)
- static getClientData(store)
- static getIndexName(config)
- static requestConditionsMet(store)

Why this belongs together:
- These functions all deal with API request setup, cancellation, and headers.
- They can be tested without Vue rendering.

### 2. useSearchNavigation
Owns redirecting and absolute URL resolution.

Move here:
- static redirectSearch(keyword, widget, searchPageUrl, ignoreRedirectRules)
- static handleRedirectRules(searchOutput, config)
- static getAbsoluteUrl(path, store)

Why this belongs together:
- These are navigation concerns, not search state concerns.
- SearchBox, SearchBoxSmart, AutocorrectSuggestions, and ResultItem all depend on them.

### 3. useHawksearchParams
Owns query-string mapping and additional parameter ingestion.

Move here:
- static handleAdditionalParameters(widget)
- static isWhitelistedParam(key)
- static addWhitelistParams(params)
- static paramWhitelist
- getParamName(paramName, widget, reverse)
- parseURLparams(widget)
- updateUrl(widget)

Why this belongs together:
- This is the cleanest boundary for URL state, config overrides, and parameter translation.
- It also reduces the amount of ad hoc query logic spread through the widget.

### 4. useSearchDispatcher
Owns the root-level dispatch flow and side effects.

Move here:
- dispatchToStore(action, params, isBack)
- the action lists used for tracking and page loading
- the urlUpdated fan-out after URL writes

Why this belongs together:
- It is the coordination layer between Vuex, URL updates, tracking, and scrolling.
- Right now that logic lives inline inside the root widget component creation path.

### 5. useSearchLifecycle
Owns widget startup and first-search behavior.

Move here:
- static initialSearch(widget)
- static handleAdditionalParameters(widget)
- static handleLanguageParameters(widget)
- the history POP listener inside createWidget

Why this belongs together:
- These functions define startup order and first-load semantics.
- They are tightly coupled, and extracting them together avoids split-brain initialization logic.

### 6. useFacetTransforms
Owns pure facet transformation logic.

Move here:
- static extendSearchData(searchOutput, pendingSearch, searchParams, callback)
- static applyFacets(facet, pendingSearchFacets, callback)
- static getFacetParamName(facet)
- static getFacetFieldNames(store)

Why this belongs together:
- These are transformation functions, not UI functions.
- They are ideal for unit tests and small regression coverage.

### 7. useSearchBoxFlow
Owns keyword input, debounce, cancellation, and submit rules.

Move here:
- SearchBox search, onInput, onBlur, cancelSuggestions
- SearchBoxSmart searchFull, onFullSearchInput, onFullSearchBlur, cancelSuggestions
- AutocorrectSuggestions search and selectSuggestion

Why this belongs together:
- These components share the same logic with only small variations.
- A single composable can reduce duplicate branch handling for redirect vs fetch.

### 8. useFacetCollapseState
Owns collapse persistence and rail-level collapse orchestration.

Move here:
- Facet toggleCollapse, setCollapsed, getStorageName, isPersistent
- FacetList collapseAll, collapseAllExceptCurrent, expandAll, collapseFacet, expandFacet

Why this belongs together:
- Collapse behavior is a cross-component state concern.
- The same persistence rules are currently repeated across facet and facet list code.

### 9. useRangeFacetSlider
Owns slider drag state, conversion math, resize handling, and caching.

Move here:
- Slider mouse and touch handlers
- Slider value conversion helpers
- Slider cache and reset logic
- Slider resize handling

Why this belongs together:
- The slider is a self-contained interaction machine.
- It is large enough that extracting it will give immediate readability gains.

### 10. useWidgetEvents
Owns event-bus behavior and event naming discipline.

Build on:
- useEventBus

Improve:
- support safe unsubscribe
- standardize event payload handling
- make multi-arg emits compatible during migration

Events to support explicitly:
- resultsupdate
- searchupdate
- urlUpdated
- toggleFacetMenu
- selectAutocorrectSuggestion

## Suggested migration order

1. Extract useHawksearchApi, useHawksearchParams, and useFacetTransforms first.
2. Extract useSearchDispatcher and useSearchLifecycle next.
3. Extract useSearchBoxFlow and useFacetCollapseState after the shared service layer is in place.
4. Extract useRangeFacetSlider and useWidgetEvents last, because they touch more interactive behavior.
5. Keep HawksearchVue methods as delegating wrappers until the final cleanup pass.

## What should stay in HawksearchVue for now

Keep the class as an adapter layer during migration:

- static createWidget(el, { config, store, dataLayer, components })
- static createStore(storeOverrides)
- static fetchResults(searchParams, store, callback)
- static fetchSuggestions(searchParams, store, callback)
- static redirectSearch(keyword, widget, searchPageUrl, ignoreRedirectRules)
- static handleAdditionalParameters(widget)
- static handleLanguageParameters(widget)
- static initialSearch(widget)

These can delegate to composables while external integrations remain untouched.

## Verification checklist

- Search submit still behaves the same in SearchBox, SearchBoxSmart, and AutocorrectSuggestions.
- AbortController cancellation still works for rapid repeated searches.
- Browser history POP still resets pending search and reloads from parseURLparams(widget).
- Redirect rules still honor redirectOnEmpty and redirectRules.
- Query-string output still handles mapped params, language, indexName, and whitelisted additional parameters.
- Facet apply and clear behavior still matches existing behavior.
- Event bus consumers still receive the same event notifications.
- Slider drag, numeric input, and resize behavior still match current UX.

## Recommended implementation style

- Start with pure functions and service-like composables.
- Keep external behavior stable at every step.
- Add tests around the extracted logic before removing the old static code.
- Only remove the old method bodies after the new composables have proven parity.
