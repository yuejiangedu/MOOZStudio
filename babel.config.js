module.exports = {
  presets: [
    ['@babel/preset-env', {
      modules: 'commonjs',
    }],
    '@babel/preset-react'
  ],
  plugins: [
    'react-hot-loader/babel',
    'lodash',
    ['import', {
      'libraryName': 'antd',
      'libraryDirectory': 'es',
      'style': 'css'
    }],
    '@babel/plugin-proposal-class-properties',
    '@babel/plugin-proposal-export-default-from',
    ['@babel/plugin-transform-runtime', {
      'regenerator': true,
    }]
  ]
};
