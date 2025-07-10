// src/components/StyledIconButton.js
import React from 'react';
import styled from 'styled-components';

const Button = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-weight: bold;
  text-transform: uppercase;
  background-color: ${(props) => props.color || '#488aec'};
  color: white;
  border: none;
  border-radius: 10px;
  cursor: pointer;
  font-size: 0.8rem;
  box-shadow:
    0 4px 6px -1px ${(props) => props.color || '#488aec'}66,
    0 2px 4px -1px ${(props) => props.color || '#488aec'}33;

  svg {
    width: 16px;
    height: 16px;
    stroke: white;
  }

  &:hover {
    opacity: 0.9;
  }
`;

const StyledIconButton = ({ icon, label, onClick, htmlFor }) => {
  return (
    <Button onClick={onClick} htmlFor={htmlFor}>
      {icon}
      {label}
    </Button>
  );
};

export default StyledIconButton;
