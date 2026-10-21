# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog], and this project adheres to [Semantic Versioning].

See tasks currently in development on [Unreleased] changes page.

## [1.0.0] - 2026-10-21

### FEATURES

* migrate to Vue 3 ([#188](https://github.com/hawksearch/vue-hawksearch/pull/188))
* add SearchBoxSmart component with image search and smart suggestions ([#184](https://github.com/hawksearch/vue-hawksearch/pull/184))
* add headers to all API calls ([#194](https://github.com/hawksearch/vue-hawksearch/pull/194))
* add canonical selections snapshot state sync ([#199](https://github.com/hawksearch/vue-hawksearch/pull/199))

### FIXES

* Vue 3 migration fixes ([#192](https://github.com/hawksearch/vue-hawksearch/pull/192))
* change negation facet prefix from `-` to `@` ([#198](https://github.com/hawksearch/vue-hawksearch/pull/198))

### BREAKING CHANGES

* replace `generateStoreInstance()` function with `createStore()` ([2a18a5a](https://github.com/hawksearch/vue-hawksearch/commit/2a18a5a01b83cf3e19d9b9d015d2a3a6232ae18c))

  The `generateStoreInstance()` method has been replaced with `createStore()`.

### CHANGES

* upgrade Vite and all dependencies ([#193](https://github.com/hawksearch/vue-hawksearch/pull/193))


[Unreleased]: https://github.com/hawksearch/vue-hawksearch/compare/v1.0.0...HEAD
[1.0.0]: https://github.com/hawksearch/vue-hawksearch/compare/v0.9.107...v1.0.0
[Keep a Changelog]: https://keepachangelog.com/en/1.0.0/
[Semantic Versioning]: https://semver.org/spec/v2.0.0.html
