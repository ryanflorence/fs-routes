const fs = require('fs');
const path = require('path');

function assignRoutesRecursively(routesDir, routes) {
  fs.readdirSync(routesDir)
    .filter(filePath => !filePath.startsWith('.'))
    .filter(filePath => {
      const fullPath = path.join(routesDir, filePath);
      const isDir = fs.lstatSync(fullPath).isDirectory();
      return !isDir;
    })
    .forEach(filePath => {
      // file stuff
      const fullPath = path.join(routesDir, filePath);
      const filePathName = path.parse(filePath).name;
      const childrenDirectoryPath = path.join(routesDir, filePathName);
      const hasChildren =
        filePathName !== 'index' &&
        fs.existsSync(childrenDirectoryPath) &&
        fs.lstatSync(childrenDirectoryPath).isDirectory();

      // route stuff
      let routePath = parseRoutePathName(filePathName);

      const route = {
        path: routePath,
        file: fullPath
      };

      routes.push(route);

      if (hasChildren) {
        route.children = [];
        assignRoutesRecursively(childrenDirectoryPath, route.children);
      }
    });
  return routes;
}

function generateRoutesFromFiles(routesDir) {
  return assignRoutesRecursively(routesDir, []);
}

const parseRoutePathName = name =>
  name === 'index' ? '.' : name.replace(/\$/g, ':').replace(/\./g, '/');

exports.generateRoutesFromFiles = generateRoutesFromFiles;
