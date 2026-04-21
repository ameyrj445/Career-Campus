import React, { useState } from 'react';
import { Link } from 'react-router-dom';

function Navbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const toggleMenu = () => {
    setIsMenuOpen(!isMenuOpen);
  };

  return (
    <nav className="navbar">
      <Link to="/" className="logo">
        CareerCompass
      </Link>
      <div className="nav-links">
        <Link to="/jobs" className="nav-link">
          <span className="icon">
            <img src="/briefcase.png" alt="Jobs" className="nav-icon-image" />
          </span>
          JOBS
        </Link>
        <Link to="/internships" className="nav-link">
          <span className="icon">
            <img src="/internship.png" alt="Internships" className="nav-icon-image" />
          </span>
          INTERNSHIPS
        </Link>
      </div>
      <div className="hamburger" onClick={toggleMenu}>
        <span className="bar"></span>
        <span className="bar"></span>
        <span className="bar"></span>
      </div>
      <div className={`mobile-menu ${isMenuOpen ? 'active' : ''}`}>
        <Link to="/jobs" className="nav-link mobile-link" onClick={toggleMenu}>
          <span className="icon">
            <img src="/briefcase.png" alt="Jobs" className="nav-icon-image" />
          </span>
          JOBS
        </Link>
        <Link to="/internships" className="nav-link mobile-link" onClick={toggleMenu}>
          <span className="icon">
            <img src="/internship.png" alt="Internships" className="nav-icon-image" />
          </span>
          INTERNSHIPS
        </Link>
      </div>
    </nav>
  );
}

export default Navbar; 