import React from 'react';
import styled from 'styled-components';

const HeaderContainer = styled.header`
  margin-bottom: 32px;
`;

const HeaderTop = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 24px;
`;

const HeaderContent = styled.div`
  flex: 1;
`;

const Title = styled.h1`
  font-size: 32px;
  font-weight: 700;
  color: var(--gray-900);
  margin: 0 0 8px 0;
  letter-spacing: -0.5px;
`;

const Subtitle = styled.p`
  font-size: 15px;
  color: var(--gray-500);
  margin: 0;
  max-width: 600px;
`;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex-shrink: 0;
`;

const PageHeader = ({ title, subtitle, children }) => {
  return (
    <HeaderContainer>
      <HeaderTop>
        <HeaderContent>
          <Title>{title}</Title>
          {subtitle && <Subtitle>{subtitle}</Subtitle>}
        </HeaderContent>
        {children && <HeaderActions>{children}</HeaderActions>}
      </HeaderTop>
    </HeaderContainer>
  );
};

export default PageHeader;