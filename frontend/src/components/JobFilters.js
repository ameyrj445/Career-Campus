import React, { useState, useEffect } from 'react';
import { useJobContext } from '../context/JobContext';
import SearchableDropdown from './FilterComponents/SearchableDropdown';
import './Filters.css';

const remoteOptions = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: 'Hybrid', label: 'Hybrid' }
];

const educationOptions = [
  { value: "Bachelor's Degree", label: "Bachelor's" },
  { value: "Master's/PhD", label: "Master's/PhD" },
  { value: "Bachelor's in CS/IT", label: "Bachelor's in CS/IT" },
  { value: "Bachelor's in CS or related", label: "Bachelor's in CS or related" }
];

function JobFilters() {
  const {
    updateFilters,
    clearFilters,
    jobs,
    tags,
    filters: contextFilters
  } = useJobContext();

  // State for job-specific filters
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Initialize local filters from context
  const [localFilters, setLocalFilters] = useState({
    companies: new Set(contextFilters.companies || []),
    locations: new Set(contextFilters.locations || []),
    categories: new Set(contextFilters.categories || []),
    remote: new Set(contextFilters.remote || []),
    education: new Set(contextFilters.education || []),
    experience: contextFilters.experience || '',
    minSalary: contextFilters.minSalary || '',
    tags: contextFilters.tags || []
  });

  // Update local filters when context filters change
  useEffect(() => {
    setLocalFilters({
      companies: new Set(contextFilters.companies || []),
      locations: new Set(contextFilters.locations || []),
      categories: new Set(contextFilters.categories || []),
      remote: new Set(contextFilters.remote || []),
      education: new Set(contextFilters.education || []),
      experience: contextFilters.experience || '',
      minSalary: contextFilters.minSalary || '',
      tags: contextFilters.tags || []
    });
  }, [contextFilters]);

  // Fetch all available filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch('http://localhost:5001/api/job-filter-options');
        const data = await response.json();

        if (data.categories) {
          setCategories(data.categories.map(cat => ({ value: cat, label: cat })));
        }

        if (data.locations) {
          setLocations(data.locations.map(loc => ({
            value: loc,
            label: loc.replace(/,\s*India$/i, '').trim()
          })));
        }

        if (data.companies) {
          setCompanies(data.companies.map(comp => ({ value: comp, label: comp })));
        }
      } catch (error) {
        console.error('Error fetching filter options:', error);
        // Fallback to extracting from jobs if API fails
        extractFiltersFromJobs();
      }
    };

    const extractFiltersFromJobs = () => {
      if (jobs && jobs.length > 0) {
        const uniqueCategories = [...new Set(jobs.map(job => job.category))].filter(Boolean);
        // Keep the full location string for filtering but display without India suffix
        const uniqueLocations = [...new Set(jobs.map(job => job.location))].filter(Boolean);
        const uniqueCompanies = [...new Set(jobs.map(job => job.company_name))].filter(Boolean);

        setCategories(uniqueCategories.map(cat => ({ value: cat, label: cat })));
        setLocations(uniqueLocations.map(loc => ({ value: loc, label: loc })));
        setCompanies(uniqueCompanies.map(comp => ({ value: comp, label: comp })));
      }
    };

    fetchFilterOptions();
  }, [jobs]);

  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState({
    companies: true,
    locations: true,
    remote: true,
    categories: true,
    education: true
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleChange = (name, value, isCheckbox = false) => {
    if (isCheckbox) {
      setLocalFilters(prev => {
        const newSet = new Set(prev[name]);
        if (newSet.has(value)) {
          newSet.delete(value);
        } else {
          newSet.add(value);
        }
        return { ...prev, [name]: newSet };
      });
    } else {
      setLocalFilters(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const filtersToApply = {
      companies: Array.from(localFilters.companies),
      locations: Array.from(localFilters.locations),
      categories: Array.from(localFilters.categories),
      remote: Array.from(localFilters.remote),
      education: Array.from(localFilters.education),
      experience: localFilters.experience,
      minSalary: localFilters.minSalary,
      tags: localFilters.tags
    };
    console.log('Applying filters:', filtersToApply);
    updateFilters(filtersToApply);
  };

  const handleClear = () => {
    setLocalFilters({
      companies: new Set(),
      locations: new Set(),
      categories: new Set(),
      remote: new Set(),
      education: new Set(),
      experience: '',
      minSalary: '',
      tags: []
    });
    clearFilters();
  };

  const CheckboxGroup = ({ options, name, value, label }) => {
    const isExpanded = expandedSections[name];

    return (
      <div className="checkbox-group">
        <div className="checkbox-header" onClick={() => toggleSection(name)}>
          <label>{label} {value.size > 0 && `(${value.size} selected)`}</label>
          <button type="button" className="toggle-button">
            {isExpanded ? '▼' : '▶'}
          </button>
        </div>
        <div className={`checkbox-options ${isExpanded ? 'expanded' : ''}`}>
          {options && isExpanded && options.map(option => {
            const isChecked = value.has(option.value);
            return (
              <label key={option.value} className={`checkbox-label ${isChecked ? 'selected' : ''}`}>
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => handleChange(name, option.value, true)}
                />
                {option.label}
              </label>
            );
          })}

          {/* Always show selected items even when collapsed */}
          {!isExpanded && Array.from(value).map(selectedValue => {
            const option = options.find(opt => opt.value === selectedValue);
            if (!option) return null;
            return (
              <label key={option.value} className="checkbox-label selected">
                <input
                  type="checkbox"
                  checked={true}
                  onChange={() => handleChange(name, option.value, true)}
                />
                {option.label}
              </label>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="filters sticky-filters">
      <h3>Job Filters</h3>
      <form onSubmit={handleSubmit}>
        <CheckboxGroup
          label="Companies"
          options={companies}
          value={localFilters.companies}
          name="companies"
        />

        <CheckboxGroup
          label="Locations"
          options={locations}
          value={localFilters.locations}
          name="locations"
        />

        <CheckboxGroup
          label="Remote"
          options={remoteOptions}
          value={localFilters.remote}
          name="remote"
        />

        <CheckboxGroup
          label="Categories"
          options={categories}
          value={localFilters.categories}
          name="categories"
        />

        <CheckboxGroup
          label="Education Level"
          options={educationOptions}
          value={localFilters.education}
          name="education"
        />

        <div className="filter-section">
          <label>Minimum Experience (Years)</label>
          <input
            type="number"
            min="0"
            value={localFilters.experience}
            onChange={(e) => handleChange('experience', e.target.value)}
            className="number-input"
            placeholder="Enter years"
          />
          {localFilters.experience && (
            <div className="selected-value">
              <span>Selected: {localFilters.experience} years</span>
              <button
                type="button"
                className="clear-value"
                onClick={() => handleChange('experience', '')}
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="filter-section">
          <label>Minimum Salary (LPA)</label>
          <input
            type="number"
            min="0"
            value={localFilters.minSalary}
            onChange={(e) => handleChange('minSalary', e.target.value)}
            className="number-input"
            placeholder="Enter amount"
          />
          {localFilters.minSalary && (
            <div className="selected-value">
              <span>Selected: {localFilters.minSalary} LPA</span>
              <button
                type="button"
                className="clear-value"
                onClick={() => handleChange('minSalary', '')}
              >
                ×
              </button>
            </div>
          )}
        </div>

        <div className="filter-section">
          <label>Tags</label>
          <SearchableDropdown
            options={tags || []}
            selectedItems={localFilters.tags}
            onChange={(value) => handleChange('tags', value)}
            onRemoveItem={(tag) => {
              const newTags = localFilters.tags.filter(t => t !== tag);
              handleChange('tags', newTags);
            }}
            placeholder="Search tags"
            multiple={true}
          />
        </div>

        <div className="filter-buttons">
          <button type="submit" className="apply-filters">
            Apply Filters
          </button>
          <button type="button" onClick={handleClear} className="clear-filters">
            Clear Filters
          </button>
        </div>
      </form>
    </div>
  );
}

export default JobFilters;