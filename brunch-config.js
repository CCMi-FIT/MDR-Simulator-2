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
    plugins: ["transform-class-properties"],
    presets: [
      "@babel/preset-env",
      "@babel/preset-react",
      "@babel/preset-flow"
    ]
  }
};

