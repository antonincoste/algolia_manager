import React from 'react';
import styled from 'styled-components';

const HowToContainer = styled.div`
  background-color: var(--gray-50);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  padding: 24px;
  margin-bottom: 24px;
  max-width: 700px;
`;

const HowToTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 12px 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const HowToText = styled.p`
  font-size: 14px;
  color: var(--gray-600);
  margin: 0;
  line-height: 1.6;
`;

const HowTo = ({ title, description }) => {
  return (
    <HowToContainer>
      <HowToTitle>{title}</HowToTitle>
      <HowToText>{description}</HowToText>
    </HowToContainer>
  );
};

export default HowTo;