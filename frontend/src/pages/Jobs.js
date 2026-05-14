import React, { useEffect } from 'react';
import JobFilters from '../components/JobFilters';
import JobCard from '../components/JobCard';
import Navbar from '../components/Navbar';
import { useJobContext } from '../context/JobContext';
import './Jobs.css';

function Jobs() {
  const { jobs, loading, error, switchView, activeView } = useJobContext();
  
  // Switch to jobs view when component mounts, but only if not already on that view
  useEffect(() => {
    if (activeView !== 'jobs') {
      switchView('jobs');
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
      <div className="jobs-container">
        <JobFilters />
        <div className="jobs-list">
          {jobs.length === 0 ? (
            <div className="no-results">No jobs found matching your criteria.</div>
          ) : (
            jobs.map(job => (
              <JobCard
                key={job.id}
                item={job}
                type="job"
              />
            ))
          )}
        </div>
      </div>
    </>
  );
}

export default Jobs; 
