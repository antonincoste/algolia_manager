import React from 'react';
import styled from 'styled-components';

const Card = styled.div`
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-xl);
  padding: 24px;
  margin-bottom: 20px;
  box-shadow: var(--shadow-sm);
  max-width: 700px;
  transition: box-shadow var(--transition-normal);

  &:hover {
    box-shadow: var(--shadow-md);
  }
`;

const CardHeader = styled.div`
  font-size: 14px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gray-900);
  margin-bottom: 16px;
  padding-bottom: 12px;
  border-bottom: 1px solid var(--gray-100);
`;

const CardContent = styled.div`
  font-size: 14px;
  color: var(--gray-600);
  line-height: 1.6;
`;

const SectionBlock = ({ title, children }) => {
  return (
    <Card>
      {title && <CardHeader>{title}</CardHeader>}
      <CardContent>
        {children}
      </CardContent>
    </Card>
  );
};

export default SectionBlock;