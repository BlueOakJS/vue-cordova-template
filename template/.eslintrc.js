var utils = require('./build/apputils')
var config = require('./config')
var buildConfig = config[utils.getEnv()].build;
var buildBaseWebpackConfig = require('./build/webpack.base.conf');

// http://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // required to lint *.vue files
  plugins: [
    'html',
    'import'
  ],
  // check if imports actually resolve
  settings: {
    'import/resolver': {
      webpack: {
        config: {
          resolve: {
            extensions: [ buildBaseWebpackConfig(buildConfig, config).resolve.extensions ]
          }
        }
      }
    }
  },
  // add your custom rules here
  rules: {
    "camelcase": 2,
    "dot-notation": [
      2,
      {
        allowKeywords: true
      }
    ],
    "new-cap": 2,
    "no-caller": 2,
    "no-cond-assign": [
      2,
      "except-parens"
    ],
    "no-empty": 2,
    "no-eval": 2,
    "no-extend-native": 2,
    "no-irregular-whitespace": 2,
    "no-iterator": 2,
    "no-loop-func": 2,
    "no-multi-str": 2,
    "no-new": 2,
    "no-proto": 2,
    "no-script-url": 2,
    "no-sequences": 2,
    "no-shadow": 2,
    "no-unused-vars": ["error", { "args": "none" }],
    "no-with": 2,
    "quotes": [
      2,
      "single"
    ],
    "semi": [
      1,
      "always"
    ],
    "strict": 2,
    "valid-typeof": 2,
    "wrap-iife": [
      2,
      "any"
    ],

    // don't require .vue extension when importing
    'import/extensions': ['error', 'always', {
      'js': 'never',
      'vue': 'never'
    }],

    // allow optionalDependencies
    'import/no-extraneous-dependencies': ['error', {
      'optionalDependencies': ['test/unit/index.js']
    }],

    // allow debugger during development
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
  }
}
