const fs = require('fs');
const path = require('path');

function assignRoutesRecursively(
  routesDir,
  routes,
  parentPathName,
  rootRoutes
) {
  const dir = fs
    .readdirSync(routesDir)
    .filter(filePath => !filePath.startsWith('.'))
    .filter(filePath => {
      const fullPath = path.join(routesDir, filePath);
      const isDir = fs.lstatSync(fullPath).isDirectory();
      return !isDir;
    })
    .forEach(filePath => {
      // children
      // index
      // layout
      const fullPath = path.join(routesDir, filePath);
      const filePathName = path.parse(filePath).name;
      const dirFullPath = path.join(routesDir, parseForDirPath(filePathName));
      const hasChildren =
        filePathName !== 'index' &&
        fs.existsSync(dirFullPath) &&
        fs.lstatSync(dirFullPath).isDirectory();

      const isLayoutRoute = isLayout(filePathName);
      const routePath = parseRoutePathName(filePathName);
      const fullRoutePath = path.join(parentPathName, routePath);

      const route = {
        path: routePath,
        absolutePath: fullRoutePath,
        component: fullPath
      };

      if (isLayout(filePathName)) {
        route.path = fullRoutePath;
        rootRoutes.push(route);
      } else {
        routes.push(route);
      }

      if (hasChildren) {
        route.children = [];
        assignRoutesRecursively(
          dirFullPath,
          route.children,
          fullRoutePath,
          rootRoutes
        );
      }
    });
  return routes;
}

function generateRoutesFromFiles(routesDir) {
  const routes = [
    {
      path: '.',
      component: 'example/app/layout.js',
      children: []
    }
  ];
  assignRoutesRecursively(routesDir, routes[0].children, '', routes);
  console.log(JSON.stringify(routes, null, 2));
  return routes;
}

const layoutRegex = /\.layout$/;
const parseRoutePathName = name =>
  name === 'index' ? '.' : (name.replace(/^\$/, ':').replace(layoutRegex, ''));
const isLayout = name => name.match(layoutRegex);
const parseForDirPath = path => path.replace(layoutRegex, '');

// const getPathsRecursively = (routes, paths=[]) => {
//   routes.forEach(route => {
//     paths.push(route.absolutePath)
//     if (route.children) {
//       getPathsRecursively(route.children, paths)
//     }
//   })
//   return paths
// }

exports.generateRoutesFromFiles = generateRoutesFromFiles;
