import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const pulse = keyframes`
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
`;

const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(4px);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  animation: ${fadeIn} 0.2s ease;
`;

const SpinnerContainer = styled.div`
  position: relative;
  width: 64px;
  height: 64px;
`;

const Spinner = styled.div`
  width: 64px;
  height: 64px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-top: 4px solid var(--primary-400);
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const InnerSpinner = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  width: 40px;
  height: 40px;
  border: 4px solid rgba(255, 255, 255, 0.1);
  border-bottom: 4px solid var(--accent-purple);
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite reverse;
`;

const LoadingText = styled.p`
  color: var(--white);
  margin-top: 24px;
  font-size: 15px;
  font-weight: 500;
  animation: ${pulse} 2s ease-in-out infinite;
`;

const FullPageLoader = ({ isLoading, message = "Processing, please wait..." }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <Overlay>
      <SpinnerContainer>
        <Spinner />
        <InnerSpinner />
      </SpinnerContainer>
      <LoadingText>{message}</LoadingText>
    </Overlay>
  );
};

export default FullPageLoader;