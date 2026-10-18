import { Link } from 'react-router-dom';

function NotFound() {
  return (
    <div className="notfound">
      <h1>404</h1>
      <p>We couldn't find the page you're looking for.</p>
      <Link to="/" className="btn-primary">Back to Home</Link>
    </div>
  );
}

export default NotFound;