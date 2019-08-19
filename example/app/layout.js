import React from 'react';
import { Outlet } from 'react-router-next';

export default function App() {
  const authenticated = true;
  return (
    <div>
      <h1>App</h1>
      <nav>
        <Link to="catalog">Catalog</Link>
        {authenticated ? (
          <Fragment>
            <Link href="courses/react-fundamentals">Courses</Link>
            <Link href="courses/advanced-react">Courses</Link>
            <button>Logout</button>
          </Fragment>
        ) : (
          <button>Login</button>
        )}
      </nav>
      <Outlet />
    </div>
  );
}
