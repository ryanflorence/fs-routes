import { createRouteResource } from "react-router/resource";
export default createRouteResource(() => fetchJSON(`${FUNCTIONS_URL}/courses`));
