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
      "@babel/plugin-transform-react-jsx-source"
    ],
    presets: [
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-flow"
    ]
  }
};

