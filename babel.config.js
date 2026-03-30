module.exports = {
  presets: [
    [
      "@babel/preset-env",
      {
        targets: {
          edge: "17",
          firefox: "60",
          chrome: "67",
          safari: "11.1",
          ie: "11"
        }
      }
    ]
  ],
  plugins: [
    "@babel/plugin-transform-class-properties",
    "@babel/plugin-transform-object-rest-spread",
    "@babel/plugin-transform-arrow-functions",
    "@babel/plugin-transform-destructuring",
    "@babel/plugin-syntax-dynamic-import",
    ["@babel/plugin-proposal-decorators", { "decoratorsBeforeExport": true }]
  ]
};
