module.exports = function(api) {
	api.cache.using(() => process.env.NODE_ENV);
	api.cache.using(() => process.env.BUILD_ENV);

	let presets = [];
	let plugins = [];

	if (process.env.BUILD_ENV === 'min') {
		// minified JS bundle build

		presets = [
			[
				'@babel/preset-env',
				{
					targets: {
						browsers: ['last 2 versions'],
					},
					useBuiltIns: 'entry',
					corejs: 2,
				},
			]
		];

		plugins = [
			'@babel/plugin-syntax-dynamic-import',
			'@babel/plugin-proposal-class-properties',
			'@babel/plugin-proposal-object-rest-spread',
		];

	} else if (process.env.BUILD_ENV === 'esm') {
		// es6 module build

		//presets = [
		//	[
		//		'@babel/preset-env',
		//		{
		//			"targets": {
		//				"esmodules": true,
		//				"browsers": ['last 2 versions']
		//			},
		//			"modules": false
		//		}
		//	]
		//];

		presets = [
			["@babel/env", { "modules": false }]
		];

		plugins = [
			// in the ES6 module, we need to utilize @babel/plugin-transform-runtime instead of
			// @babel/polyfill - as the polyfill is only meant for applications not libraries.
			// the minified JS version _does_ use @babel/polyfill as that is built as an application
			// and not a library
			['@babel/plugin-transform-runtime', { useESModules: true }],
			'@babel/plugin-syntax-dynamic-import',
			'@babel/plugin-proposal-class-properties',
			'@babel/plugin-proposal-object-rest-spread',
		];
	} else {
		console.error(
			`UNRECOGNIZED BUILD ENVIRONMENT '${process.env.BUILD_ENV}'! Please ensure the BUILD_ENV env var is set`
		);
	}

	return {
		presets,
		plugins,
	};
};
