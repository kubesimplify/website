/**
 * Docusaurus plugin to fix CSS minification issues with Tailwind CSS v4
 * This prevents the CSS minifier from breaking Tailwind's output
 */
function fixCssMinification(context, options) {
  return {
    name: 'fix-css-minification',
    configureWebpack(config, isServer, utils) {
      if (isServer) {
        return {};
      }

      // Find and configure CSS minimizer
      const minimizerPlugins = config.optimization?.minimizer || [];
      
      minimizerPlugins.forEach((plugin) => {
        // Check if this is the CSS minimizer plugin
        if (plugin && plugin.constructor && plugin.constructor.name === 'CssMinimizerPlugin') {
          // Configure to be less aggressive and preserve Tailwind CSS v4 syntax
          if (plugin.options) {
            plugin.options.minimizerOptions = {
              preset: [
                'default',
                {
                  // Don't break modern CSS features
                  discardComments: { removeAll: false },
                  normalizeWhitespace: false,
                  // Critical: Don't minify keyframes names or break animations
                  reduceIdents: false,
                  // Don't merge rules that might break Tailwind
                  mergeRules: false,
                  // Preserve CSS variables
                  reduceTransforms: false,
                  // Don't break @supports queries
                  discardUnused: false,
                  // Preserve important comments
                  minifySelectors: true,
                  minifyParams: true,
                  minifyFontValues: true,
                  minifyGradients: true,
                  minifyTimingFunctions: true,
                },
              ],
            };
          }
        }
      });

      return {};
    },
  };
}

module.exports = fixCssMinification;

