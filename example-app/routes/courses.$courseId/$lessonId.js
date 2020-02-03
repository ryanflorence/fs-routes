import React from "react";
import { Outlet } from "react-router/unstable";

export default function App() {
  return (
    <div>
      <h2>Courses</h2>
      <Outlet />
    </div>
  );
}
