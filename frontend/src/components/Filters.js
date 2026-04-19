import React, { useState, useEffect } from 'react';
import { useJobContext } from '../context/JobContext';
import './Filters.css';

const Filters = () => {
  const {
    activeView,
    filters,
    updateFilters,
    clearFilters,
    categories,
    locations,
    companies
  } = useJobContext();

  const [expandedSections, setExpandedSections] = useState({
    location: true,
    company: true,
    category: true,
    remote: true,
    education: true,
    experience: true,
    salary: activeView === 'jobs',
    stipend: activeView === 'internships',
    duration: activeView === 'internships'
  });

  const [localFilters, setLocalFilters] = useState({
    locations: new Set(filters.locations || []),
    companies: new Set(filters.companies || []),
    categories: new Set(filters.categories || []),
    remote: new Set(filters.remote || []),
    education: new Set(filters.education || []),
    experience: filters.experience || '',
    salary: filters.salary || '',
    stipend: filters.stipend || '',
    duration: filters.duration || ''
  });

  const remoteOptions = ['Remote', 'On-site', 'Hybrid', 'Remote (Contract)'];
  const educationOptions = ['Bachelor\'s', 'Master\'s', 'Ph.D.', 'High School', 'Diploma'];
  const experienceRanges = ['0-1 years', '1-3 years', '3-5 years', '5+ years'];
  const salaryRanges = ['0-3 LPA', '3-6 LPA', '6-10 LPA', '10-15 LPA', '15+ LPA'];
  const stipendRanges = ['0-10k', '10k-20k', '20k-30k', '30k-40k', '40k+'];
  const durationOptions = ['1-3 months', '3-6 months', '6+ months'];

  useEffect(() => {
    setLocalFilters(prev => ({
      ...prev,
      locations: new Set(filters.locations || []),
      companies: new Set(filters.companies || []),
      categories: new Set(filters.categories || []),
      remote: new Set(filters.remote || []),
      education: new Set(filters.education || []),
      experience: filters.experience || '',
      salary: filters.salary || '',
      stipend: filters.stipend || '',
      duration: filters.duration || ''
    }));
  }, [filters]);

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleCheckboxChange = (type, value) => {
    const newSet = new Set(localFilters[type]);
    if (newSet.has(value)) {
      newSet.delete(value);
    } else {
      newSet.add(value);
    }

    const newFilters = {
      ...localFilters,
      [type]: newSet
    };
    setLocalFilters(newFilters);
    updateFilters({
      ...filters,
      [type]: Array.from(newSet)
    });
  };

  const handleSelectChange = (type, value) => {
    const newFilters = {
      ...localFilters,
      [type]: value
    };
    setLocalFilters(newFilters);
    updateFilters({
      ...filters,
      [type]: value
    });
  };

  const CheckboxGroup = ({ title, options, type, expanded }) => (
    <div className="checkbox-group">
      <div className="checkbox-header" onClick={() => toggleSection(type)}>
        <label>{title}</label>
        <button className="toggle-button">
          {expandedSections[type] ? '−' : '+'}
        </button>
      </div>
      <div className={`checkbox-options ${expandedSections[type] ? 'expanded' : ''}`}>
        {options && options.map(option => {
          const optionValue = typeof option === 'object' ? option.value : option;
          const optionLabel = typeof option === 'object' ? option.label : option;
          // For locations, display without India suffix but keep the full value for filtering
          let displayOption = optionLabel || '';
          if (type === 'locations' && displayOption) {
            // Make sure we're displaying just the city name without the India suffix
            displayOption = displayOption.replace(/,\s*India$/i, '').trim();
          }
          return (
            <label
              key={optionValue || ''}
              className={`checkbox-label ${localFilters[type].has(optionValue) ? 'selected' : ''}`}
            >
              <input
                type="checkbox"
                checked={localFilters[type].has(optionValue)}
                onChange={() => handleCheckboxChange(type, optionValue)}
              />
              {displayOption}
            </label>
          );
        })}
      </div>
    </div>
  );

  const SelectGroup = ({ title, options, type, expanded }) => (
    <div className="filter-group">
      <label>{title}</label>
      <select
        value={localFilters[type]}
        onChange={(e) => handleSelectChange(type, e.target.value)}
      >
        <option value="">Any</option>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="filters">
      <h3>Filters</h3>

      <CheckboxGroup
        title="Location"
        options={locations}
        type="locations"
        expanded={expandedSections.location}
      />

      <CheckboxGroup
        title="Company"
        options={companies}
        type="companies"
        expanded={expandedSections.company}
      />

      <CheckboxGroup
        title="Category"
        options={categories}
        type="categories"
        expanded={expandedSections.category}
      />

      <CheckboxGroup
        title="Work Type"
        options={remoteOptions}
        type="remote"
        expanded={expandedSections.remote}
      />

      <CheckboxGroup
        title="Education"
        options={educationOptions}
        type="education"
        expanded={expandedSections.education}
      />

      <SelectGroup
        title="Experience"
        options={experienceRanges}
        type="experience"
        expanded={expandedSections.experience}
      />

      {activeView === 'jobs' && (
        <SelectGroup
          title="Salary"
          options={salaryRanges}
          type="salary"
          expanded={expandedSections.salary}
        />
      )}

      {activeView === 'internships' && (
        <>
          <SelectGroup
            title="Stipend"
            options={stipendRanges}
            type="stipend"
            expanded={expandedSections.stipend}
          />
          <SelectGroup
            title="Duration"
            options={durationOptions}
            type="duration"
            expanded={expandedSections.duration}
          />
        </>
      )}

      <div className="filter-actions">
        <button onClick={clearFilters}>Clear Filters</button>
      </div>
    </div>
  );
};

export default Filters;