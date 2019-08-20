const path = require('path');
const { generateRoutesFromFiles } = require('./index');

const test = (name, fn) => {
  console.log(`> ${name}`);
  fn();
};

const assert = (cond, desc) => {
  if (cond) {
    console.log(`✓`, desc);
  } else {
    console.assert(cond, desc);
  }
};

test('generateRoutesFromFiles', () => {
  const routesDir = path.join('app', 'routes');
  const routes = generateRoutesFromFiles(routesDir);
  assert(Array.isArray(routes), 'routes is an array');

  // const root = routes[0]
  // assert(root.path === '.', 'root path')
  // assert(root.component === 'example/app/layout.js', 'root component')
  // assert(Array.isArray(root.children), 'root children is array')

  // const admin = routes[1]
  // assert(admin.path === 'admin', 'admin path')
  // assert(admin.component === 'example/app/routes/admin.layout.js', 'admin component')
  // assert(Array.isArray(admin.children), 'admin children is an array')

  // const sales = admin.children.find(child => child.path === 'sales')
  // assert(sales.path === "sales", "sales path")
  // assert(sales.component === "example/app/routes/admin/sales.js", "sales component")

  // const courses = root.children.find(route => route.path === 'courses')
  // assert(courses.path === 'courses', 'courses path')
  // assert(courses.component === 'example/app/routes/courses.js', 'courses children is array')
  // assert(Array.isArray(courses.children), 'courses children is array')

  // const course = courses.children[0]
  // assert(course.path === ':courseId', 'course path')
  // assert(course.component === 'example/app/routes/courses/$courseId.js', 'courses children is array')
});




