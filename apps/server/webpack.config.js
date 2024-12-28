const { composePlugins, withNx } = require('@nx/webpack');
const nodeExternals = require('webpack-node-externals');

module.exports = composePlugins(withNx(), (config) => {
  // Update the webpack config as needed here.
  config.target = 'node';
  config.externals = [nodeExternals()];
  
  // Enable source maps for better debugging
  config.devtool = 'source-map';
  
  // Add hot reload support
  config.watchOptions = {
    poll: 1000, // Check for changes every second
    ignored: /node_modules/,
  };
  
  return config;
});
