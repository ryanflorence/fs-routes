const path = require('path');
const { generateRoutesFromFiles } = require('../index');

const getRouteConfig = () => {
  // const routesDir = path.join('app', 'routes');
  const routesDir = process.argv[2];
  console.log(JSON.stringify(generateRoutesFromFiles(routesDir), null, 2));
};

getRouteConfig();
