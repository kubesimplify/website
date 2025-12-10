/**
 * Docusaurus plugin to fix CSS minification issues with Tailwind CSS v4
 * Completely disables CSS minification to prevent breaking Tailwind's output
 */
function fixCssMinification(context, options) {
  return {
    name: 'fix-css-minification',
    configureWebpack(config, isServer, utils) {
      if (isServer) {
        return {};
      }

      // Remove CSS minimizer entirely to prevent breaking Tailwind CSS v4
      if (config.optimization && config.optimization.minimizer) {
        config.optimization.minimizer = config.optimization.minimizer.filter((plugin) => {
          const pluginName = plugin?.constructor?.name || '';
          const isCssMinimizer = pluginName === 'CssMinimizerPlugin' || 
                                pluginName.includes('CssMinimizer') ||
                                (plugin.constructor && plugin.constructor.toString().includes('CssMinimizer'));
          
          // Remove CSS minimizer - we'll let PostCSS handle optimization
          return !isCssMinimizer;
        });
      }

      return {};
    },
  };
}

module.exports = fixCssMinification;

