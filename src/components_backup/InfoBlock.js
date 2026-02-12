import React from 'react';
import styled from 'styled-components';

const InfoContainer = styled.div`
  background-color: #f1f3f5;
  border-left: 5px solid #007BFF;
  padding: 20px;
  border-radius: 8px;
  margin: 0 0 25px 0;
  color: #333;
  font-size: 16px;
  max-width: 60%;
  line-height: 1.6;
`;

const InfoTitle = styled.h2`
  margin: 0;
  font-size: 20px;
  text-transform: uppercase;
  color: #007BFF;
  font-weight: 600;

`;

const InfoContent = styled.div`
  margin-top: 15px;
  font-size: 16px;
`;

const InfoBlock = ({ title, children }) => {
  return (
    <InfoContainer>
      <InfoTitle>{title}</InfoTitle>
      <InfoContent>{children}</InfoContent>
    </InfoContainer>
  );
};

export default InfoBlock;
