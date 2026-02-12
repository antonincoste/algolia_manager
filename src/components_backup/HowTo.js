import React from 'react';
import styled from 'styled-components';

const HowToContainer = styled.div`
  background-color: #f9f9f9;
  padding: 20px;
  margin-bottom: 20px;
`;

const HowTo = ({ title, description }) => {
  return (
    <HowToContainer>
      <h2>{title}</h2>
      <p>{description}</p>
    </HowToContainer>
  );
};

export default HowTo;
