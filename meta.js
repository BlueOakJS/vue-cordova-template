var cordova = require('./cordova.js');
var procSpawn = require('./bundled/node_modules/superspawn').spawn;

module.exports = {
  "helpers": {
    "if_or": function (v1, v2, options) {
      if (v1 || v2) {
        return options.fn(this);
      }

      return options.inverse(this);
    }
  },
  "prompts": {
    "name": {
      "type": "string",
      "required": true,
      message: 'What is the app name? (should be 1 word)'
    },
    "description": {
      "type": "string",
      "required": false,
      "message": "Project description",
      "default": "A Vue.js project"
    },
    "author": {
      "type": "string",
      "message": "Author"
    },
    "build": {
      "type": "list",
      "message": "Vue build",
      "choices": [
        {
          "name": "Runtime + Compiler: recommended for most users",
          "value": "standalone",
          "short": "standalone"
        },
        {
          "name": "Runtime-only: about 6KB lighter min+gzip, but templates (or any Vue-specific HTML) are ONLY allowed in .vue files - render functions are required elsewhere",
          "value": "runtime",
          "short": "runtime"
        }
      ]
    },
    "lint": {
      "type": "confirm",
      "message": "Use ESLint to lint your code?"
    },
    "unit": {
      "type": "confirm",
      "message": "Setup unit tests with Mocha?"
    },
    cordovaPackageName: {
      message: 'What is the app ID? (reverse-domain-style name: com.company.Name)',
      default: 'com.pointsource.someNewApp'
    },
    isCordovaIOS: {
      type: 'confirm',
      message: 'Should the hybrid app run on iOS?',
    },
    isCordovaAndroid: {
      type: 'confirm',
      message: 'Should the hybrid app run on Android?',
    }
  },
  "filters": {
    ".eslintrc.js": "lint",
    ".eslintignore": "lint",
    "config/test.env.js": "unit",
    "test/unit/**/*": "unit",
    "build/webpack.test.conf.js": "unit"
  },
  complete: complete
};

function complete(data, {chalk, logger, files}) {
  var installPromise = cordova.installCordova(data, {chalk, logger, files});

  installPromise.then(
    function() {
      logger.log(chalk.yellow('Running npm install'));

      return procSpawn('npm', ['install'], {
        printCommand: true,
        stdio: 'inherit'
      });
    }
  ).then(
    function() {
      var msg =
        "To get started:\n\n" +
        (!data.inPlace ? "  cd " + data.destDirName + "\n" : "") +
        "  npm run dev\n\n" +
        "Documentation can be found at https://blueoakjs.github.io/vue-cordova-template";
      logger.log(msg);
    },

    function(err) {
      logger.fatal(chalk.red.bold('npm install error: ' + err));
    }
  );
}
