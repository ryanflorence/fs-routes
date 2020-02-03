import { createRouteResource } from "react-router/resource";

export default createRouteResource(params =>
  fetchJSON(`${FUNCTIONS_URL}/course/${params.courseId}`)
);
