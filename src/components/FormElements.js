import styled from 'styled-components';

// Base Input
export const Input = styled.input`
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  background-color: var(--gray-50);
  color: var(--gray-900);
  transition: all var(--transition-fast);
  box-sizing: border-box;
  
  &:focus {
    outline: none;
    border-color: var(--primary-500);
    background-color: var(--white);
    box-shadow: 0 0 0 4px var(--primary-100);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
  
  &:disabled {
    background-color: var(--gray-100);
    cursor: not-allowed;
  }
`;

// Select
export const Select = styled.select`
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-family: inherit;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  background-color: var(--gray-50);
  color: var(--gray-900);
  cursor: pointer;
  transition: all var(--transition-fast);
  box-sizing: border-box;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%2364748b' d='M6 8L1 3h10z'/%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 16px center;
  padding-right: 40px;
  
  &:focus {
    outline: none;
    border-color: var(--primary-500);
    background-color: var(--white);
    box-shadow: 0 0 0 4px var(--primary-100);
  }
  
  &:disabled {
    background-color: var(--gray-100);
    cursor: not-allowed;
  }
`;

// Textarea
export const Textarea = styled.textarea`
  width: 100%;
  padding: 14px 16px;
  font-size: 14px;
  font-family: inherit;
  border: 2px solid var(--gray-200);
  border-radius: var(--radius-md);
  background-color: var(--gray-50);
  color: var(--gray-900);
  resize: vertical;
  min-height: 120px;
  transition: all var(--transition-fast);
  box-sizing: border-box;
  line-height: 1.5;
  
  &:focus {
    outline: none;
    border-color: var(--primary-500);
    background-color: var(--white);
    box-shadow: 0 0 0 4px var(--primary-100);
  }
  
  &::placeholder {
    color: var(--gray-400);
  }
  
  &:disabled {
    background-color: var(--gray-100);
    cursor: not-allowed;
  }
`;

// Label
export const Label = styled.label`
  display: block;
  font-size: 13px;
  font-weight: 600;
  color: var(--gray-700);
  margin-bottom: 8px;
`;

// Form Group
export const FormGroup = styled.div`
  margin-bottom: 20px;
`;

// Hint text
export const Hint = styled.p`
  font-size: 12px;
  color: var(--gray-500);
  margin: 6px 0 0 0;
  
  &.success {
    color: var(--success-500);
  }
  
  &.error {
    color: var(--danger-500);
  }
`;

// Input with button
export const InputGroup = styled.div`
  display: flex;
  gap: 12px;
  
  ${Input}, ${Select} {
    flex: 1;
  }
`;

// Toggle Switch
export const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

export const ToggleLabel = styled.span`
  font-size: 14px;
  color: ${props => props.$active ? 'var(--gray-900)' : 'var(--gray-500)'};
  font-weight: ${props => props.$active ? '600' : '500'};
  transition: all var(--transition-fast);
`;

export const ToggleSwitch = styled.div`
  width: 48px;
  height: 26px;
  background-color: ${props => props.$active ? 'var(--primary-500)' : 'var(--gray-300)'};
  border-radius: 13px;
  padding: 3px;
  cursor: pointer;
  transition: background-color var(--transition-normal);
  display: flex;
  align-items: center;
`;

export const ToggleThumb = styled.div`
  width: 20px;
  height: 20px;
  background-color: var(--white);
  border-radius: 50%;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  transition: transform var(--transition-normal);
  transform: ${props => props.$active ? 'translateX(22px)' : 'translateX(0)'};
`;

// Status Badge
export const StatusBadge = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  font-weight: 600;
  
  &.success {
    background-color: var(--success-50);
    color: var(--success-500);
  }
  
  &.error {
    background-color: var(--danger-50);
    color: var(--danger-500);
  }
  
  &.warning {
    background-color: var(--warning-100);
    color: var(--warning-500);
  }
`;

export const StatusDot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background-color: currentColor;
`;