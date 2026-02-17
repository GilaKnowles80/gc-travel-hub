import React from 'react';

// Honeypot field to catch bots
// Hidden from humans but visible to bots
export const HoneypotField = ({ value, onChange }) => {
  return (
    <div style={{ position: 'absolute', left: '-9999px', opacity: 0, pointerEvents: 'none' }} aria-hidden="true">
      <input
        type="text"
        name="website"
        tabIndex="-1"
        autoComplete="off"
        value={value}
        onChange={onChange}
      />
    </div>
  );
};