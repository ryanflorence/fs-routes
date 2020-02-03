const { generateRoutesFromFiles, generateClientCode } = require('../index');

let getRouteConfig = () => {
  let routesDir = process.argv[2];
  let routes = generateRoutesFromFiles(routesDir)
  return generateClientCode(routes)
};

getRouteConfig();
