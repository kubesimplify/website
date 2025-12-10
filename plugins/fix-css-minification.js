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
      
      minimizerPlugins.forEach((plugin, index) => {
        // Check if this is the CSS minimizer plugin
        // It could be CssMinimizerPlugin or an instance
        const pluginName = plugin?.constructor?.name || '';
        const isCssMinimizer = pluginName === 'CssMinimizerPlugin' || 
                              pluginName.includes('CssMinimizer') ||
                              (plugin.constructor && plugin.constructor.toString().includes('CssMinimizer'));
        
        if (isCssMinimizer) {
          // Replace with a safer configuration
          try {
            // Try to configure the minimizer to be less aggressive
            if (plugin.options) {
              plugin.options.minimizerOptions = {
                preset: [
                  'default',
                  {
                    // Critical: Disable features that break Tailwind CSS v4
                    discardComments: { removeAll: false },
                    normalizeWhitespace: false,
                    reduceIdents: false, // Don't rename keyframes
                    mergeRules: false, // Don't merge rules
                    reduceTransforms: false,
                    discardUnused: false,
                    // Only safe minifications
                    minifySelectors: true,
                    minifyParams: true,
                    minifyFontValues: true,
                    minifyGradients: true,
                    minifyTimingFunctions: true,
                  },
                ],
              };
            }
            
            // Also try to set parallel to false to avoid race conditions
            if (plugin.options && typeof plugin.options.parallel !== 'undefined') {
              plugin.options.parallel = false;
            }
          } catch (e) {
            // If configuration fails, try to replace the plugin entirely
            console.warn('Could not configure CSS minimizer, trying alternative approach');
          }
        }
      });

      return {};
    },
  };
}

module.exports = fixCssMinification;

