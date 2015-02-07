var 
  chalk = require('chalk'),
  appRootPath = require('app-root-path');

module.exports = function(server) {

  function loadPlugin(name, opts, doneHandler) {
    return function(next) {
      server.register({
        register: require(name), 
        options: opts
      }, exports.pluginErrorAsyncCallback(name, doneHandler, next)
      );
    };
  }

  function pluginErrorAsyncCallback(name, cb, next) {
    var name = chalk.white.bgBlack.bold(name);

    console.log( chalk.white.bgYellow.bold('[load] '), name, ' ...');

    return function(err) {
      if(err) {
        console.log( chalk.white.bgRed.bold('[error] '), name, ' ...');
        console.error(err); 
        throw err;
      }
      console.log( chalk.white.bgGreen.bold('[done] '), name, ' ...');
      cb(next);
    }
  }

  var routeTableMap = {
    METHOD:0,
    PATH:1,
    BACKEND: 2,
    ARG: 3,
    AUTH: 4
  };

  function loadRouteTable(routeTable) {
    var routes = [];

    routeTable.forEach(function(routeEntry) {
      var route = {
        config: {}
      };

      console.log(
        chalk.white.bgGreen.bold('[route]'), 
        chalk.white.bgBlack.bold(routeEntry[routeTableMap.METHOD] + " " + routeEntry[routeTableMap.PATH])
      );

      route.method = routeEntry[routeTableMap.METHOD];
      route.path = routeEntry[routeTableMap.PATH];

      switch(typeof routeEntry[routeTableMap.AUTH]) {
        case "string": 
          switch(routeEntry[routeTableMap.AUTH]) {
            case "login":
              route.config.auth = {
                mode: 'try',
                strategy: 'session'
              };
              
              route.config.plugins = route.config.plugins || {};
              route.config.plugins['hapi-auth-cookie'] = {
                redirectTo: false
              };

              break;
          }
          break;
        case "boolean":
          if(routeEntry[routeTableMap.AUTH]) {
            route.config.auth = 'session';
          }
          break;
      }

      switch(routeEntry[routeTableMap.BACKEND]) {
        case 'file': 
          route.config.handler = {
            file: routeEntry[routeTableMap.ARG]
          };
          break;
        case 'directory':
          route.config.handler = {
            directory: {
              path: routeEntry[routeTableMap.ARG]
            }
          }
          break;
        case 'handler':
          console.log(appRootPath);
          var path = appRootPath + '/src/handlers/' + routeEntry[routeTableMap.ARG] + '.js';
          route.config.handler = require(path);

          break;
        case 'toothache':
          var
            argParts = routeEntry[routeTableMap.ARG].split('.'),
            model = argParts[0],
            func = argParts[1],
            path = __dirname + '/../../src/models/' + model.toLowerCase() + '.js',
            Model = require(path);

          route.config.handler = Model(server)[func];

          break;
        default:
          throw new Error('unknown backend: ' + routeEntry[routeTableMap.BACKEND]);
      }

      routes.push(route);
    });

    server.route(routes);
  }

  return {
    loadPlugin: loadPlugin,
    pluginErrorAsyncCallback: pluginErrorAsyncCallback,
    loadRouteTable: loadRouteTable
  };
};