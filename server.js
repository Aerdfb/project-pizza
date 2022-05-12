<<<<<<< HEAD
/* global require, process */

const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('dist/db/app.json');
const middlewares = jsonServer.defaults({
  static: 'dist',
  noCors: true
});
const port = process.env.PORT || 3131;

server.use(middlewares);
server.use(router);

server.listen(port);
=======
/* global require, process */

const jsonServer = require('json-server');
const server = jsonServer.create();
const router = jsonServer.router('dist/db/app.json');
const middlewares = jsonServer.defaults({
  static: 'dist',
  noCors: true
});
const port = process.env.PORT || 3131;

server.use(middlewares);
server.use(router);

server.listen(port);
>>>>>>> 88201754df4a87262e83479af0e49b5455236752
