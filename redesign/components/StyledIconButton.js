import React from 'react';
import styled from 'styled-components';

const Button = styled.label`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 20px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  background: ${props => props.$color || 'linear-gradient(135deg, var(--primary-500) 0%, var(--accent-purple) 100%)'};
  color: white;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  font-size: 13px;
  transition: all var(--transition-normal);
  box-shadow: ${props => props.$color ? 'none' : 'var(--shadow-primary)'};

  svg {
    width: 18px;
    height: 18px;
    stroke: white;
  }

  &:hover {
    transform: translateY(-1px);
    box-shadow: ${props => props.$color ? 'var(--shadow-md)' : '0 6px 20px rgba(99, 102, 241, 0.5)'};
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const StyledIconButton = ({ icon, label, onClick, htmlFor, color }) => {
  return (
    <Button onClick={onClick} htmlFor={htmlFor} $color={color}>
      {icon}
      {label}
    </Button>
  );
};

export default StyledIconButton;