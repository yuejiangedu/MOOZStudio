const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const nib = require('nib');
const stylusLoader = require('stylus-loader');
const webpack = require('webpack');
const tsImportPluginFactory = require('ts-import-plugin');
const CopyPlugin = require('copy-webpack-plugin');
const buildConfig = require('./build.config');
const pkg = require('./package.json');

const buildVersion = pkg.version;

module.exports = {
  mode: 'development',
  cache: true,
  target: 'web',
  context: path.resolve(__dirname, 'src'),
  devtool: 'cheap-module-eval-source-map',
  entry: {
    app: [
      path.resolve(__dirname, 'src/index.tsx')
    ]
  },
  output: {
    path: path.resolve(__dirname, 'output'),
    globalObject: 'this'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components|opencv|fonts)/,
        loader: 'babel-loader'
      },
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        exclude: /node_modules/
      },
      {
        test: /\.tsx?$/,
        loader: 'ts-loader',
        options: {
          transpileOnly: true,
          getCustomTransformers: () => ({
            before: [tsImportPluginFactory({
              libraryName: 'antd',
              libraryDirectory: 'lib',
              style: 'css'
            })]
          }),
          compilerOptions: {
            module: 'esnext'
          }
        }
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: true,
              localIdentName: '[path][name]__[local]--[hash:base64:5]',
              camelCase: true,
              importLoaders: 1
            }
          },
          'stylus-loader'
        ],
        exclude: [
          path.resolve(__dirname, 'src/styles')
        ]
      },
      {
        test: /\.styl$/,
        use: [
          'style-loader',
          {
            loader: 'css-loader',
            options: {
              modules: false,
              camelCase: true,
            }
          },
          'stylus-loader'
        ],
        include: [
          path.resolve(__dirname, 'src/styles')
        ]
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader'
        ]
      },
      {
        test: /\.(png|jpg|svg|gif)$/,
        loader: 'url-loader',
        options: {
          limit: 4096
        }
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/font-woff'
        }
      },
      {
        test: [/\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/, /\.stl$/],
        loader: 'file-loader'
      },
      {
        test: require.resolve('snapsvg/dist/snap.svg.js'),
        use: 'imports-loader?this=>window,fix=>module.exports=0',
      },
    ]
  },
  node: {
    fs: 'empty',
    net: 'empty',
    tls: 'empty'
  },
  plugins: [
    new webpack.HotModuleReplacementPlugin(),
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: JSON.stringify('development'),
        BUILD_VERSION: JSON.stringify(buildVersion),
        LANGUAGES: JSON.stringify(buildConfig.languages)
      }
    }),
    new stylusLoader.OptionsPlugin({
      default: {
        // nib - CSS3 extensions for Stylus
        use: [nib()],
        // no need to have a '@import "nib"' in the stylesheet
        import: ['~nib/lib/nib/index.styl']
      }
    }),
    // new webpack.ContextReplacementPlugin(
    //   /moment[\/\\]locale$/,
    //   new RegExp('^\./(' + without(buildConfig.languages, 'en').join('|') + ')$')
    // ),
    new HtmlWebpackPlugin({
      template: path.resolve(__dirname, 'index.html'),
      favicon: './favicon.ico'
    }),
    new CopyPlugin([
      {
        from: './i18n',
        to: 'i18n'
      },
      {
        from: './assets',
        to: 'assets'
      }
    ])],
  resolve: {
    alias: {
      snapsvg: 'snapsvg/dist/snap.svg.js',
    },
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules'
    ],
    extensions: ['.js', '.jsx', '.tsx', '.ts', '.styl']
  },
  devServer: {
    hot: true,
    port: 8080
  }
};
