import React from 'react'
import { Link } from 'react-router-next'

export default () => {
  return (
    <div>
      <h2>Catalog</h2>
      <div>
        <div>
          <h3>React Fundamentals</h3>
          <p>This thing is cool, buy it!</p>
          <Link href="/courses/react-fundamentals/enroll">Enroll!</Link>
        </div>
        <div>
          <h3>Advanced React</h3>
          <p>You're ready for this.</p>
          <Link href="/courses/advanced-react/enroll">Enroll!</Link>
        </div>
      </div>
    </div>
  )
}

export function getQuery(params) {
  return `

  `
}
