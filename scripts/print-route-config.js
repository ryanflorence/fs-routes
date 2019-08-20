const path = require('path');
const { generateRoutesFromFiles } = require('../index');

const getRouteConfig = () => {
  const routesDir = path.join('app', 'routes');
  console.log(JSON.stringify(generateRoutesFromFiles(routesDir), null, 2));
};

getRouteConfig();
