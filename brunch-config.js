exports.files = {
  javascripts: {
    joinTo: {
      'vendor.js': /^(?!app)/,
      'app.js': /^app/
    }
  },
};

exports.plugins = {
  babel: {
    plugins: [
      "@babel/plugin-proposal-class-properties",
      "@babel/plugin-transform-react-jsx-source",
      "@babel/plugin-transform-runtime"
    ],
    presets: [
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-flow"
    ]
  }
};

