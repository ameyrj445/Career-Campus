import React, { useEffect } from 'react';
import InternshipFilters from '../components/InternshipFilters';
import JobCard from '../components/JobCard';
import Navbar from '../components/Navbar';
import { useJobContext } from '../context/JobContext';
import './Internships.css';

function Internships() {
  const { internships, loading, error, switchView, activeView } = useJobContext();

  // Switch to internships view when component mounts, but only if not already on that view
  useEffect(() => {
    if (activeView !== 'internships') {
      switchView('internships');
    }
  }, [switchView, activeView]);

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="loading">Loading...</div>
      </>
    );
  }

  if (error) {
    return (
      <>
        <Navbar />
        <div className="error">Error: {error}</div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="internships-container">
        <InternshipFilters />
        <div className="internships-list">
          {internships.length === 0 ? (
            <div className="no-results">No internships found matching your criteria.</div>
          ) : (
            internships.map(internship => (
              <JobCard
                key={internship.ID}
                item={internship}
                type="internship"
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Internships; 