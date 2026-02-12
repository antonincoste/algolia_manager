// src/components/StyledButton.js
import React from 'react';
import styled from 'styled-components';

const StyledWrapper = styled.div`
  button {
    border: none;
    display: flex;
    padding: 0.75rem 1.5rem;
    background-color: ${props => props.color || '#2c3e50'};
    color: #ffffff;
    font-size: 0.75rem;
    line-height: 1rem;
    font-weight: 700;
    text-align: center;
    cursor: pointer;
    text-transform: uppercase;
    vertical-align: middle;
    align-items: center;
    border-radius: 0.5rem;
    user-select: none;
    gap: 0.75rem;
    box-shadow:
      0 4px 6px -1px rgba(0, 0, 0, 0.2),
      0 2px 4px -1px rgba(0, 0, 0, 0.1);
    transition: all 0.3s ease;
  }

  button:hover {
    box-shadow:
      0 10px 15px -3px rgba(0, 0, 0, 0.3),
      0 4px 6px -2px rgba(0, 0, 0, 0.1);
  }

  button:focus,
  button:active {
    opacity: 0.85;
    box-shadow: none;
  }

  button svg {
    width: 1.25rem;
    height: 1.25rem;
  }
`;

const StyledButton = ({ onClick, label, icon, color }) => {
  return (
    <StyledWrapper color={color}>
      <button onClick={onClick}>
        {icon && <span>{icon}</span>}
        {label}
      </button>
    </StyledWrapper>
  );
};

export default StyledButton;
