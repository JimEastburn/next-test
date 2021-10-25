// This file sets a custom webpack configuration to use your Next.js app
// with Sentry.
// https://nextjs.org/docs/api-reference/next.config.js/introduction
// https://docs.sentry.io/platforms/javascript/guides/nextjs/
/** @type {import('next').NextConfig} */
const { withSentryConfig } = require('@sentry/nextjs');
const withTM = require('next-transpile-modules')([
  '@maxmind/geoip2-node',
  'amp-html',
  'lodash-es',
]); // pass the modules you would like to see transpiled
const withImages = require('next-images');
const webpack = require('webpack');
const makeWithbundleAnalyzer = require('@next/bundle-analyzer');
const withPlugins = require('next-compose-plugins');
const withSourceMaps = require('@zeit/next-source-maps');

const withBundleAnalyzer = makeWithbundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
});

module.exports = withPlugins(
  [withBundleAnalyzer, withImages, withSourceMaps, withTM],
  {
    

    images: {
      disableStaticImages: true,
    },

    i18n: {
      locales: ['en', 'es'],
      defaultLocale: 'en',
    },


    async redirects() {
      return [
        {
          source: '/consumer-guides/:path*',
          destination: '/guides/:path*',
          permanent: true,
        },
      ];
    },

    // Customize webpack config for next.js
    // _config is the default next.js webpack configuration
    webpack(_config, { isServer }) {
      // Reassign to allow changes and appease linter
      const config = _config;


      config.resolve.fallback =  {
        "fs": false,
        "tls": false,
        "net": false,
        "os": false,
        "path": false,
        "domain": false,
        "http": false,
        "https": false,
        "tty": false,
        "stream": false,
        "child_process": false,
        "url": false,
      };

      

      

      // It seems like there should be some way to get the next
      // static folder, but I can't find anywhere it's configured
      // by next, seems to just be hardcoded.
      config.output.publicPath = `${this.assetPrefix}/_next/`;

      // Add new rules to previous rules
      config.module.rules.push(
        // Allow us to import markdown files
        {
          test: /\.md$/,
          loader: 'raw-loader',
        },
        {
          resolve: { mainFields: ['module', 'main'] },
        },
        // temporary fix for when process is undefined with react-markdown: https://github.com/vfile/vfile/issues/38#issuecomment-683198538
        // perm fix, see: https://www.pivotaltracker.com/story/show/178868237
        {
          test: /node_modules\/vfile\/core\.js/,
          use: [
            {
              loader: 'imports-loader',
              options: {
                type: 'commonjs',
                imports: ['single process/browser process'],
              },
            },
          ],
        }
      );

      

      return config;
    },
  }
);

const SentryWebpackPluginOptions = {
  // Additional config options for the Sentry Webpack plugin. Keep in mind that
  // the following options are set automatically, and overriding them is not
  // recommended:
  //   release, url, org, project, authToken, configFile, stripPrefix,
  //   urlPrefix, include, ignore

  silent: true, // Suppresses all logs
  // For all available options, see:
  // https://github.com/getsentry/sentry-webpack-plugin#options.
};

// Make sure adding Sentry options is the last code to run before exporting, to
// ensure that your source maps include changes from all other Webpack plugins
module.exports = withSentryConfig(module.exports, SentryWebpackPluginOptions);
