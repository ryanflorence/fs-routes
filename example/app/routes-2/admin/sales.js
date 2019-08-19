import React from "react";
import { Outlet, useParams, useRouteData } from "react-router/unstable";

export default function $CourseId() {
  const { courseId } = useParams();
  const course = RouteResource.read(courseId);
  return (
    <div>
      <h3>Course: {courseId}</h3>
      <Outlet />
    </div>
  );
}

export function load(params, location) {
  return loadCourse(params);
}
