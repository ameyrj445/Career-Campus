import React, { useState, useEffect } from 'react';
import { useJobContext } from '../context/JobContext';
import { useApi } from '../context/ApiContext';
import SearchableDropdown from './FilterComponents/SearchableDropdown';
import './Filters.css';

const remoteOptions = [
  { value: 'Yes', label: 'Yes' },
  { value: 'No', label: 'No' },
  { value: 'Hybrid', label: 'Hybrid' }
];

const durationOptions = [
  { value: '2', label: '2 Months' },
  { value: '3', label: '3 Months' },
  { value: '4', label: '4 Months' },
  { value: '5', label: '5 Months' },
  { value: '6', label: '6 Months' }
];

function InternshipFilters() {
  const {
    updateFilters,
    clearFilters,
    internships,
    tags,
    filters: contextFilters
  } = useJobContext();
  const { baseURL } = useApi();

  // State for internship-specific filters
  const [categories, setCategories] = useState([]);
  const [locations, setLocations] = useState([]);
  const [companies, setCompanies] = useState([]);

  // Initialize local filters from context
  const [localFilters, setLocalFilters] = useState({
    companies: new Set(contextFilters.companies || []),
    locations: new Set(contextFilters.locations || []),
    categories: new Set(contextFilters.categories || []),
    remote: new Set(contextFilters.remote || []),
    duration: new Set(contextFilters.duration || []),
    minStipend: contextFilters.minStipend || '',
    tags: contextFilters.tags || []
  });

  // Update local filters when context filters change
  useEffect(() => {
    setLocalFilters({
      companies: new Set(contextFilters.companies || []),
      locations: new Set(contextFilters.locations || []),
      categories: new Set(contextFilters.categories || []),
      remote: new Set(contextFilters.remote || []),
      duration: new Set(contextFilters.duration || []),
      minStipend: contextFilters.minStipend || '',
      tags: contextFilters.tags || []
    });
  }, [contextFilters]);

  // Fetch all available filter options from API
  useEffect(() => {
    const fetchFilterOptions = async () => {
      try {
        const response = await fetch(`${baseURL}/internship-filter-options`);
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
        // Fallback to extracting from internships if API fails
        extractFiltersFromInternships();
      }
    };

    const extractFiltersFromInternships = () => {
      if (internships && internships.length > 0) {
        const uniqueCategories = [...new Set(internships.map(intern => intern.Category))].filter(Boolean);
        // Keep the full location string for filtering but display without India suffix
        const uniqueLocations = [...new Set(internships.map(intern => intern.Location))].filter(Boolean);
        const uniqueCompanies = [...new Set(internships.map(intern => intern.CompanyName))].filter(Boolean);

        setCategories(uniqueCategories.map(cat => ({ value: cat, label: cat })));
        setLocations(uniqueLocations.map(loc => ({ value: loc, label: loc })));
        setCompanies(uniqueCompanies.map(comp => ({ value: comp, label: comp })));
      }
    };

    fetchFilterOptions();
  }, [internships]);

  // State to track expanded sections
  const [expandedSections, setExpandedSections] = useState({
    companies: true,
    locations: true,
    remote: true,
    categories: true,
    duration: true
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
      duration: Array.from(localFilters.duration),
      minStipend: localFilters.minStipend,
      tags: localFilters.tags
    };
    console.log('Applying internship filters:', filtersToApply);
    updateFilters(filtersToApply);
  };

  const handleClear = () => {
    setLocalFilters({
      companies: new Set(),
      locations: new Set(),
      categories: new Set(),
      remote: new Set(),
      duration: new Set(),
      minStipend: '',
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
      <h3>Internship Filters</h3>
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
          label="Duration (Months)"
          options={durationOptions}
          value={localFilters.duration}
          name="duration"
        />

        <div className="filter-section">
          <label>Minimum Stipend</label>
          <input
            type="number"
            min="0"
            value={localFilters.minStipend}
            onChange={(e) => handleChange('minStipend', e.target.value)}
            className="number-input"
            placeholder="Enter amount"
          />
          {localFilters.minStipend && (
            <div className="selected-value">
              <span>Selected: ₹{localFilters.minStipend}</span>
              <button
                type="button"
                className="clear-value"
                onClick={() => handleChange('minStipend', '')}
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

export default InternshipFilters;