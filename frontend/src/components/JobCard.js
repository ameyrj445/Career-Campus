import React, { useState, useEffect, useRef } from 'react';
import './JobCard.css';

function JobCard({ item, type }) {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isHovering, setIsHovering] = useState(false);
  const timerRef = useRef(null);
  const cardRef = useRef(null);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, []);

  if (!item) {
    return null; // Return null if item is undefined
  }

  const handleCardClick = () => {
    setIsFlipped(!isFlipped);

    // Clear any existing timer
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }

    // If flipping to back, set timer to flip back after 5 seconds
    if (!isFlipped) {
      timerRef.current = setTimeout(() => {
        if (!isHovering) {
          setIsFlipped(false);
        }
      }, 5000);
    }
  };

  const handleMouseEnter = () => {
    setIsHovering(true);
  };

  const handleMouseLeave = () => {
    setIsHovering(false);

    // If card is flipped and mouse leaves, start timer to flip back
    if (isFlipped) {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
      timerRef.current = setTimeout(() => {
        setIsFlipped(false);
      }, 5000);
    }
  };

  const formatCompensation = (amount, type) => {
    if (!amount) return '';
    if (type === 'job') {
      return `₹${amount} LPA`;
    } else {
      return `₹${amount}/month`;
    }
  };

  const getTags = (tagsString) => {
    if (!tagsString) return [];
    return typeof tagsString === 'string' ? tagsString.split(', ') : [];
  };

  const cleanLocation = (location) => {
    if (!location) return '';
    return typeof location === 'string' ? location.replace(/, India$/, '') : '';
  };

  const isJob = type === 'job';
  const title = isJob ? (item.title_and_role || '') : (item.TitleAndRole || '');
  const company = isJob ? (item.company_name || '') : (item.CompanyName || '');
  const location = isJob ? (item.location || '') : (item.Location || '');
  const category = isJob ? (item.category || '') : (item.Category || '');
  const compensation = isJob ? item.salary_LPA : item.Stipend;
  const tags = isJob ? item.tags : item.Tags;
  const applicationUrl = isJob ? item.application_url : item.ApplicationURL;

  // New additional info for the back of the card
  const description = isJob ? (item.description_responsibilities || '') : (item.DescriptionResponsibilities || '');
  const requirements = isJob ? (item.requirements_qualifications || '') : (item.RequirementsQualifications || '');
  const experience = isJob ? (item.years_experience || '') : (item.Duration || '');
  const education = isJob ? (item.education_level || '') : '';
  const benefits = isJob ? (item.benefits || '') : (item.Benefits || '');

  return (
    <div className="job-card-container">
      <div
        ref={cardRef}
        className={`job-card ${isFlipped ? 'flipped' : ''}`}
        onClick={handleCardClick}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {/* Front of the card */}
        <div className="job-card-front">
          <div className="card-content">
            {/* Top section - Job title and company */}
            <div className="job-header">
              <h3>{title}</h3>
              <p className="company">{company}</p>
            </div>

            {/* Middle section - Job details */}
            <div className="job-details">
              {location && <div className="location">📍 {cleanLocation(location)}</div>}
              {category && <div className="category">🏢 {category}</div>}
              {compensation && <div className="compensation">💰 {formatCompensation(compensation, type)}</div>}
            </div>

            {/* Bottom section - Tags */}
            {tags && getTags(tags).length > 0 && (
              <div
                className="tags-container"
                onClick={(e) => e.stopPropagation()} // Prevent card from flipping when clicking on tags area
                onWheel={(e) => e.stopPropagation()} // Prevent card from flipping when scrolling
              >
                <div className="tags sharp-scrollbar">
                  {getTags(tags).map((tag, index) => (
                    <span key={index} className="tag">{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Back of the card */}
        <div className="job-card-back">
          <div className="card-content">
            <div className="job-header">
              <h3>{title}</h3>
              <p className="company">{company}</p>
            </div>

            {description && (
              <div className="job-description">
                <strong>Description:</strong>
                <p>{description}</p>
              </div>
            )}

            <div className="job-requirements">
              {requirements && (
                <>
                  <strong>Requirements:</strong>
                  <p>{requirements}</p>
                </>
              )}
            </div>
            {isJob && experience && (
              <p><strong>Experience:</strong> {experience} years</p>
            )}

            {!isJob && experience && (
              <p><strong>Duration:</strong> {experience} months</p>
            )}

            {education && (
              <p><strong>Education:</strong> {education}</p>
            )}

            {benefits && (
              <p><strong>Benefits:</strong> {benefits}</p>
            )}

            {applicationUrl && (
              <a
                href={applicationUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="apply-button"
                onClick={(e) => e.stopPropagation()} // Prevent card from flipping when clicking the button
              >
                Apply Now
              </a>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default JobCard;