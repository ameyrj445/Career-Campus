import React from 'react';
import './FilterComponents.css';

const RadioGroup = ({ options, value, onChange, name }) => {
  return (
    <div className="radio-group">
      {options.map(option => (
        <label key={option.value} className="radio-option">
          <input
            type="radio"
            name={name}
            value={option.value}
            checked={value === option.value}
            onChange={(e) => onChange(e.target.value)}
          />
          <span className="radio-label">{option.label}</span>
        </label>
      ))}
    </div>
  );
};

export default RadioGroup; 