import { Outlet } from "react-router";

export default function Courses({ data }) {
  return (
    <div>
      <nav>
        {data.map(course => (
          <Link route="/courses/$courseId" data={course}>
            {course.name}
          </Link>
        ))}
      </nav>
      <Outlet />
    </div>
  );
}

export const query = gql`
  query courses {
    courses(first: 10) {
      name
      rating
      description
      minutes
      modules {
        name
        lessons {
          name
          minutes
          description
        }
      }
    }
  }
`;
