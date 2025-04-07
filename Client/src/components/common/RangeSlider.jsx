// client/src/components/common/RangeSlider.jsx
import React, { useState, useEffect, useRef } from 'react';

const RangeSlider = ({ min, max, step, value, onChange, formatLabel }) => {
  const [minValue, setMinValue] = useState(value[0]);
  const [maxValue, setMaxValue] = useState(value[1]);
  const rangeRef = useRef(null);
  
  useEffect(() => {
    setMinValue(value[0]);
    setMaxValue(value[1]);
  }, [value]);
  
  useEffect(() => {
    // Update range track fill
    if (rangeRef.current) {
      const minPercent = ((minValue - min) / (max - min)) * 100;
      const maxPercent = ((maxValue - min) / (max - min)) * 100;
      
      rangeRef.current.style.background = `linear-gradient(
        to right,
        #e5e7eb ${minPercent}%,
        #doa189 ${minPercent}%,
        #doa189 ${maxPercent}%,
        #e5e7eb ${maxPercent}%
      )`;
    }
  }, [minValue, maxValue, min, max]);
  
  const handleMinChange = (e) => {
    const newMinVal = Math.min(Number(e.target.value), maxValue - step);
    setMinValue(newMinVal);
    onChange([newMinVal, maxValue]);
  };
  
  const handleMaxChange = (e) => {
    const newMaxVal = Math.max(Number(e.target.value), minValue + step);
    setMaxValue(newMaxVal);
    onChange([minValue, newMaxVal]);
  };
  
  return (
    <div className="relative">
      <div className="flex mb-4">
        <div className="w-1/2 text-left">
          <span className="text-gray-600 text-sm">{formatLabel ? formatLabel(minValue) : minValue}</span>
        </div>
        <div className="w-1/2 text-right">
          <span className="text-gray-600 text-sm">{formatLabel ? formatLabel(maxValue) : maxValue}</span>
        </div>
      </div>
      
      <div className="relative h-1 mb-6" ref={rangeRef}>
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={minValue}
          onChange={handleMinChange}
          className="absolute w-full h-0 cursor-pointer appearance-none bg-transparent pointer-events-none"
          style={{
            zIndex: 2,
            WebkitAppearance: 'none',
            outline: 'none'
          }}
        />
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={maxValue}
          onChange={handleMaxChange}
          className="absolute w-full h-0 cursor-pointer appearance-none bg-transparent pointer-events-none"
          style={{
            zIndex: 2,
            WebkitAppearance: 'none',
            outline: 'none'
          }}
        />
        <div className="absolute w-full h-1 bg-gray-200 rounded"></div>
      </div>
    </div>
  );
};

export default RangeSlider;
