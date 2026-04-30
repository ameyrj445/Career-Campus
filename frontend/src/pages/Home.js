import { Link } from 'react-router-dom';

function Home() {
  return (
    <div className="home">
      <h1 className="welcome">WELCOME</h1>
      <p className="subtitle">I'm looking for</p>
      
      <div className="options">
        <Link to="/jobs" className="option-card">
          <div className="icon">
            <img src="/briefcase.png" alt="Jobs" className="icon-image" />
          </div>
          <h2>JOBS</h2>
        </Link>
        
        <Link to="/internships" className="option-card">
          <div className="icon">
            <img src="/internship.png" alt="Internships" className="icon-image" />
          </div>
          <h2>INTERNSHIPS</h2>
        </Link>
      </div>
      
      <p className="description">
        Find the perfect opportunity tailored to your preferences.
      </p>
      
      <footer>
        © Developed By Amey Raj Jain (ARJOIDIFY)
      </footer>
      
    </div>
  );
}
export default Home; 