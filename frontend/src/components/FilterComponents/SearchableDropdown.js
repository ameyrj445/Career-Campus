import React, { useState, useEffect, useRef } from 'react';
import './FilterComponents.css';

const SearchableDropdown = ({
  options,
  value,
  onChange,
  placeholder,
  multiple = false,
  selectedItems = [],
  onRemoveItem
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef(null);

  // Filter options based on search term and exclude already selected items
  const filteredOptions = options.filter(option =>
    option.toLowerCase().includes(searchTerm.toLowerCase()) &&
    (multiple ? !selectedItems.includes(option) : true)
  );

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (option) => {
    if (multiple) {
      // Check if the option is already selected to prevent duplicates
      if (!selectedItems.includes(option)) {
        onChange([...selectedItems, option]);
      }
    } else {
      onChange(option);
      setIsOpen(false);
    }
    setSearchTerm('');
  };

  const handleRemoveItem = (item, e) => {
    e.stopPropagation();
    onRemoveItem(item);
  };

  return (
    <div className="searchable-dropdown" ref={dropdownRef}>
      <div className="dropdown-header" onClick={() => setIsOpen(!isOpen)}>
        <div className="selected-items">
          {multiple ? (
            selectedItems.length > 0 ? (
              <>
                {selectedItems.map(item => (
                  <span key={item} className="selected-item">
                    {item}
                    <button onClick={(e) => handleRemoveItem(item, e)}>&times;</button>
                  </span>
                ))}
                {selectedItems.length > 0 && (
                  <button
                    className="clear-all-button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onChange([]);
                    }}
                  >
                    Clear All
                  </button>
                )}
              </>
            ) : (
              placeholder
            )
          ) : (
            value || placeholder
          )}
        </div>
        <span className="dropdown-arrow">{isOpen ? '▲' : '▼'}</span>
      </div>

      {isOpen && (
        <div className="dropdown-content">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search..."
            onClick={(e) => e.stopPropagation()}
          />
          <div className="options-list">
            {filteredOptions.map(option => (
              <div
                key={option}
                className={`option ${multiple && selectedItems.includes(option) ? 'selected' : ''}`}
                onClick={() => handleSelect(option)}
              >
                {multiple && (
                  <input
                    type="checkbox"
                    checked={selectedItems.includes(option)}
                    readOnly
                  />
                )}
                {option}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default SearchableDropdown;