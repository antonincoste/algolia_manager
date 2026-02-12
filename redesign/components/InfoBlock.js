import React from 'react';
import styled from 'styled-components';

const InfoContainer = styled.div`
  display: flex;
  gap: 16px;
  padding: 20px;
  background-color: var(--primary-50);
  border: 1px solid var(--primary-100);
  border-radius: var(--radius-lg);
  margin-bottom: 24px;
  max-width: 700px;
`;

const InfoIcon = styled.div`
  font-size: 24px;
  flex-shrink: 0;
`;

const InfoBody = styled.div`
  flex: 1;
`;

const InfoTitle = styled.h4`
  font-size: 14px;
  font-weight: 700;
  color: var(--primary-600);
  margin: 0 0 8px 0;
  text-transform: uppercase;
  letter-spacing: 0.3px;
`;

const InfoContent = styled.div`
  font-size: 14px;
  color: var(--primary-600);
  line-height: 1.6;
  
  p {
    margin: 0;
  }
  
  code {
    background-color: var(--primary-100);
    padding: 2px 6px;
    border-radius: 4px;
    font-size: 13px;
  }
`;

const InfoBlock = ({ title, children, icon = '💡' }) => {
  return (
    <InfoContainer>
      <InfoIcon>{icon}</InfoIcon>
      <InfoBody>
        {title && <InfoTitle>{title}</InfoTitle>}
        <InfoContent>{children}</InfoContent>
      </InfoBody>
    </InfoContainer>
  );
};

export default InfoBlock;