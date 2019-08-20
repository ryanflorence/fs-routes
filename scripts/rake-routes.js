const path = require('path');
const Table = require('cli-table');
const { generateRoutesFromFiles } = require('../index');

const getRowsRecursively = (routes, rows = [], parent) => {
  routes.forEach(route => {
    const path = parent ? [parent, route.path].join('/') : route.path;
    rows.push(['/'+path, route.file]);
    if (route.children) {
      getRowsRecursively(route.children, rows, path);
    }
  });
  return rows;
};

const rakeRoutes = () => {
  const routesDir = path.join('app', 'routes');
  const routes = generateRoutesFromFiles(routesDir);
  const table = new Table();
  const rows = getRowsRecursively(routes).sort((a, b) =>
    a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0
  )

  rows.forEach(row => {
    table.push(row)
  })

  console.log(table.toString());
};

rakeRoutes()

