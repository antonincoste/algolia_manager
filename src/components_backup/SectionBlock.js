import React from 'react';
import styled from 'styled-components';

const BlockContainer = styled.div`
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 12px; /* Bordures plus arrondies */
  padding: 25px; /* Plus d'espace intérieur */
  margin-bottom: 25px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05); /* Ajout d'une ombre légère */
  max-width: 60%;
  margin: 0 0 25px 0;
`;

const BlockHeader = styled.div`
  font-size: 20px; /* Plus grand et moderne */
  font-weight: 400;
  text-transform: uppercase;
  color: #333;
  margin-bottom: 20px;
`;

const BlockContent = styled.div`
  font-size: 16px;
  color: #555;
  line-height: 1.6;
`;

const SectionBlock = ({ title, children }) => {
  return (
    <BlockContainer>
      <BlockHeader>{title}</BlockHeader>
      <BlockContent>
        {children}
      </BlockContent>
    </BlockContainer>
  );
};

export default SectionBlock;
