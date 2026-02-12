import React from 'react';
import styled, { css } from 'styled-components';

const getVariantStyles = (variant) => {
  switch (variant) {
    case 'primary':
      return css`
        background: linear-gradient(135deg, var(--primary-500) 0%, var(--accent-purple) 100%);
        color: var(--white);
        box-shadow: var(--shadow-primary);
        
        &:hover {
          box-shadow: 0 6px 20px rgba(99, 102, 241, 0.5);
          transform: translateY(-1px);
        }
      `;
    case 'secondary':
      return css`
        background-color: var(--primary-50);
        color: var(--primary-500);
        border: 2px solid var(--primary-200);
        
        &:hover {
          background-color: var(--primary-100);
          border-color: var(--primary-300);
        }
      `;
    case 'success':
      return css`
        background-color: var(--success-500);
        color: var(--white);
        box-shadow: 0 4px 14px rgba(16, 185, 129, 0.4);
        
        &:hover {
          box-shadow: 0 6px 20px rgba(16, 185, 129, 0.5);
          transform: translateY(-1px);
        }
      `;
    case 'danger':
      return css`
        background-color: var(--danger-50);
        color: var(--danger-500);
        border: 1px solid var(--danger-100);
        
        &:hover {
          background-color: var(--danger-100);
        }
      `;
    case 'ghost':
      return css`
        background-color: transparent;
        color: var(--gray-600);
        
        &:hover {
          background-color: var(--gray-100);
          color: var(--gray-900);
        }
      `;
    default:
      return css`
        background-color: var(--gray-800);
        color: var(--white);
        
        &:hover {
          background-color: var(--gray-900);
        }
      `;
  }
};

const getSizeStyles = (size) => {
  switch (size) {
    case 'sm':
      return css`
        padding: 8px 16px;
        font-size: 12px;
        border-radius: var(--radius-sm);
      `;
    case 'lg':
      return css`
        padding: 16px 32px;
        font-size: 15px;
        border-radius: var(--radius-lg);
      `;
    default:
      return css`
        padding: 12px 20px;
        font-size: 13px;
        border-radius: var(--radius-md);
      `;
  }
};

const Button = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  border: none;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all var(--transition-normal);
  white-space: nowrap;
  
  ${props => getVariantStyles(props.$variant)}
  ${props => getSizeStyles(props.$size)}
  
  &:active {
    transform: translateY(0);
  }
  
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  font-size: 1.1em;
`;

const StyledButton = ({ 
  onClick, 
  label, 
  icon, 
  variant = 'default',
  size = 'md',
  disabled = false,
  type = 'button',
  color // Pour rétrocompatibilité
}) => {
  // Mapping des anciennes couleurs vers les nouveaux variants
  let finalVariant = variant;
  if (color) {
    if (color.includes('28a745') || color.includes('1abc9c')) finalVariant = 'success';
    else if (color.includes('e74c3c') || color.includes('dc3545')) finalVariant = 'danger';
    else if (color.includes('007bff') || color.includes('488aec')) finalVariant = 'primary';
  }

  return (
    <Button 
      onClick={onClick} 
      $variant={finalVariant}
      $size={size}
      disabled={disabled}
      type={type}
    >
      {icon && <IconWrapper>{icon}</IconWrapper>}
      {label}
    </Button>
  );
};

export default StyledButton;