import React from 'react';
import { Outlet } from 'react-router-next';

export default function App() {
  return (
    <div>
      <h1>App</h1>
      <Outlet />
    </div>
  );
}
