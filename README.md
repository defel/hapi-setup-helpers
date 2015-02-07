hapi-setup-helpers
==================

hapi helpers for app setup. work with hapi 8.x

installation
============

`npm install --save hapi-setup-helpers`

usage
=====

```js
var helper = require('hapi-setup-helpers')(server);
```


loadPlugin()
--------------

a helper method to allow loading plugins in application start synchronous with `async.series` for example.

Usage:

```js
async.series([
  // load hapi-auth-cookie plugin
  helper.loadPlugin(server, 'hapi-auth-cookie', {}, function(next) {
    server.auth.strategy('session', 'cookie', {
      password: 'i wear no pants',
      cookie: 'tbsid',
      redirectTo: '/login',
      isSecure: false
    });
    next();
  }),

  // .. load more plugins
])
```

pluginErrorAsyncCallback()
--------------------------

Small helper to print error message on failures, or ok on success, print out colors.

loadRouteTable()
----------------

Helper to load Routes as a table. 

One line has the following fields:

- Method(s)
- Path
- Handler
- Target for handler
- Is this route protected?

Usage:
```js
helper.loadRouteTable(server, [
    // file handler
    ["GET",           "/",                     "file",      "index.html",      true],
    // javascript handler, supports with multiple methods
    [["GET","POST"],  "/login",                "handler",   "login",           "login"],
    // last parameter indicates that this resource is protected 
    ["GET",           "/logout",               "handler",   "logout",          true],
    // directory handler
    ["GET",           "/{param*}",             "directory", "./",              false],
    // toothache handler
    ["GET",           "/api/contacts",         "toothache", "Contacts.find",   true]
    // load more routes
]);
```
