const fs = require("fs");
const path = require("path");

function assignRoutesRecursively(routesDir, routes, dest) {
  fs.readdirSync(routesDir)
    .filter(filePath => !filePath.startsWith("."))
    .filter(filePath => {
      let fullPath = path.join(routesDir, filePath);
      let isDir = fs.lstatSync(fullPath).isDirectory();
      return !isDir;
    })
    .forEach(filePath => {
      // file stuff
      let fullPath = path.join(routesDir, filePath);
      let filePathName = path.parse(filePath).name;
      let childrenDirectoryPath = path.join(routesDir, filePathName);
      let hasChildren =
        filePathName !== "index" &&
        fs.existsSync(childrenDirectoryPath) &&
        fs.lstatSync(childrenDirectoryPath).isDirectory();

      // route stuff
      let routePath = parseRoutePathName(filePathName);

      let route = {
        path: routePath,
        file: fullPath,
        importPath: path.relative(dest, fullPath)
      };

      routes.push(route);

      if (hasChildren) {
        route.children = [];
        assignRoutesRecursively(childrenDirectoryPath, route.children, dest);
      }
    });
  return routes;
}

function generateRoutesFromFiles(routesDir, dest="src") {
  return assignRoutesRecursively(routesDir, [], dest);
}

function getImports(routes, imports = []) {
  routes.forEach(route => {
    let { importPath, compName, children } = route;
    imports.push(`import ${compName} from "./${importPath}"`);
    if (children) {
      getImports(children, imports);
    }
  });
  return imports;
}

function getClientRoutes(fileConfig) {
  let routes = [];
  fileConfig.forEach(route => {
    let { path, importPath, children } = route;
    if (path === ".") path = "/"
    let compName = importPath
      .replace(/\.js$/, "")
      .replace(/\//g, "_")
      .replace(/\./g, "_")
      .toUpperCase();
    let clientRoute = {
      path,
      compName,
      importPath
    };
    routes.push(clientRoute);
    if (children) {
      clientRoute.children = getClientRoutes(children);
    }
  });
  return routes;
}

function getRoutesCode(config, code = "[\n") {
  config.forEach(route => {
    let { path, compName, children } = route;
    let routeCode = `{
  path: "${path}",
  element: <${compName}/>,`;

    if (children) {
      routeCode += `
  children: ${getRoutesCode(children)}
},
`;
    } else {
      routeCode += `},`;
    }

    code += routeCode;
  });
  return code + "\n]";
}

function generateClientCode(fileConfig) {
  let config = getClientRoutes(fileConfig);
  let imports = getImports(config);
  let script = `/* eslint-disable react/jsx-pascal-case */
// This file is auto generated
import React from 'react'
import { useRoutes } from 'react-router-dom'
${imports.join("\n")}

const routes = ${getRoutesCode(config)}

export default function AppRoutes() {
  return useRoutes(routes)
}
  `;
  console.log(script);
}

let parseRoutePathName = name =>
  name === "index" ? "." : name.replace(/\$/g, ":").replace(/\./g, "/");

exports.generateRoutesFromFiles = generateRoutesFromFiles;
exports.generateClientCode = generateClientCode;
