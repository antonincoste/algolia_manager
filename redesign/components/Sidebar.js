import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import styled from 'styled-components';
import ApiKeyManager from './ApiKeyManager';

const SidebarContainer = styled.div`
  width: 280px;
  height: 100vh;
  background-color: var(--white);
  box-sizing: border-box;
  position: fixed;
  display: flex;
  flex-direction: column;
  border-right: 1px solid var(--gray-200);
  overflow-y: auto;
`;

const LogoSection = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 24px 20px;
  border-bottom: 1px solid var(--gray-200);
`;

const LogoIcon = styled.div`
  width: 36px;
  height: 36px;
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--accent-purple) 100%);
  border-radius: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
  
  svg {
    width: 20px;
    height: 20px;
  }
`;

const LogoText = styled.span`
  font-size: 22px;
  font-weight: 700;
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--accent-purple) 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
  letter-spacing: -0.5px;
`;

const Nav = styled.nav`
  flex: 1;
  padding: 16px 12px;
  overflow-y: auto;
`;

const MenuItem = styled.div`
  margin-bottom: 4px;
`;

const MenuLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 16px;
  border-radius: var(--radius-md);
  color: var(--gray-600);
  font-size: 14px;
  font-weight: 500;
  text-decoration: none;
  transition: all var(--transition-normal);

  &:hover {
    background-color: var(--gray-100);
    color: var(--gray-900);
  }

  &.active {
    background-color: var(--primary-500);
    color: var(--white);
    box-shadow: var(--shadow-primary);
    font-weight: 600;
  }
`;

const MenuLinkNested = styled(MenuLink)`
  padding-left: 28px;
`;

const Icon = styled.span`
  font-size: 16px;
  width: 24px;
  text-align: center;
  flex-shrink: 0;
`;

const MenuSection = styled.div`
  margin-top: 8px;
`;

const MenuSectionHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  font-size: 12px;
  font-weight: 700;
  color: var(--gray-400);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: background-color var(--transition-fast);

  &:hover {
    background-color: var(--gray-50);
  }
`;

const Chevron = styled.span`
  font-size: 10px;
  transition: transform var(--transition-slow);
  transform: ${props => (props.$isOpen ? 'rotate(180deg)' : 'rotate(0)')};
`;

const SubMenu = styled.div`
  overflow: hidden;
  max-height: ${props => (props.$isOpen ? '500px' : '0')};
  transition: max-height 0.4s ease-in-out;
`;

const SidebarFooter = styled.div`
  padding: 16px;
  border-top: 1px solid var(--gray-200);
  margin-top: auto;
`;

const Disclaimer = styled.div`
  font-size: 11px;
  color: var(--gray-400);
  text-align: center;
  margin-bottom: 16px;
`;

const sectionMapping = {
  '/generate-events': 'devMode',
  '/copy-data': 'devMode',
  '/query-decoder': 'devMode',
  '/clone-index': 'devMode',
  '/recommend-tester': 'devMode',
  '/exportbyfilters': 'dataManagement',
  '/export-by-attribute': 'dataManagement',
  '/update-by-attribute': 'dataManagement',
  '/offline': 'dataManagement',
  '/copy': 'dataManagement',
  '/delete-objects': 'dataManagement',
  '/compare-configs': 'monitoring',
  '/no-result-searches': 'monitoring',
};

const Sidebar = () => {
  const location = useLocation();

  const [openSection, setOpenSection] = useState(() => {
    return sectionMapping[location.pathname] || null;
  });

  const handleSectionClick = (sectionName) => {
    setOpenSection(openSection === sectionName ? null : sectionName);
  };

  return (
    <SidebarContainer>
      <LogoSection>
        <LogoIcon>
          <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M9 12L11 14L15 10" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            <path d="M21 12C21 16.9706 16.9706 21 12 21C7.02944 21 3 16.9706 3 12C3 7.02944 7.02944 3 12 3C16.9706 3 21 7.02944 21 12Z" stroke="white" strokeWidth="2"/>
          </svg>
        </LogoIcon>
        <LogoText>Algolyze</LogoText>
      </LogoSection>

      <Nav>
        <MenuItem>
          <MenuLink to="/" className={location.pathname === '/' ? 'active' : ''}>
            <Icon>🏠</Icon>
            Home
          </MenuLink>
        </MenuItem>

        {/* Dev Mode */}
        <MenuSection>
          <MenuSectionHeader onClick={() => handleSectionClick('devMode')}>
            <span>Dev Mode</span>
            <Chevron $isOpen={openSection === 'devMode'}>▾</Chevron>
          </MenuSectionHeader>
          <SubMenu $isOpen={openSection === 'devMode'}>
            <MenuItem>
              <MenuLinkNested to="/clone-index" className={location.pathname === '/clone-index' ? 'active' : ''}>
                <Icon>🧬</Icon>
                Clone Index
              </MenuLinkNested>
            </MenuItem>
            <MenuItem>
              <MenuLinkNested to="/copy-data" className={location.pathname === '/copy-data' ? 'active' : ''}>
                <Icon>📋</Icon>
                Copy Data
              </MenuLinkNested>
            </MenuItem>
            <MenuItem>
              <MenuLinkNested to="/generate-events" className={location.pathname === '/generate-events' ? 'active' : ''}>
                <Icon>⚡</Icon>
                Generate Events
              </MenuLinkNested>
            </MenuItem>
            <MenuItem>
              <MenuLinkNested to="/query-decoder" className={location.pathname === '/query-decoder' ? 'active' : ''}>
                <Icon>{ }</Icon>
                Query Decoder
              </MenuLinkNested>
            </MenuItem>
            <MenuItem>
              <MenuLinkNested to="/recommend-tester" className={location.pathname === '/recommend-tester' ? 'active' : ''}>
                <Icon>👍</Icon>
                Recommend Tester
              </MenuLinkNested>
            </MenuItem>
          </SubMenu>
        </MenuSection>

        {/* Data Management */}
        <MenuSection>
          <MenuSectionHeader onClick={() => handleSectionClick('dataManagement')}>
            <span>Data Management</span>
            <Chevron $isOpen={openSection === 'dataManagement'}>▾</Chevron>
          </MenuSectionHeader>
          <SubMenu $isOpen={openSection === 'dataManagement'}>
            <MenuItem>
              <MenuLinkNested to="/exportbyfilters" className={location.pathname === '/exportbyfilters' ? 'active' : ''}>
                <Icon>📤</Icon>
                Export by Filters
              </MenuLinkNested>
            </MenuItem>
            <MenuItem>
              <MenuLinkNested to="/export-by-attribute" className={location.pathname === '/export-by-attribute' ? 'active' : ''}>
                <Icon>🎯</Icon>
                Export by Attribute
              </MenuLinkNested>
            </MenuItem>
            <MenuItem>
              <MenuLinkNested to="/update-by-attribute" className={location.pathname === '/update-by-attribute' ? 'active' : ''}>
                <Icon>✏️</Icon>
                Update by Attribute
              </MenuLinkNested>
            </MenuItem>
            <MenuItem>
              <MenuLinkNested to="/delete-objects" className={location.pathname === '/delete-objects' ? 'active' : ''}>
                <Icon>🗑️</Icon>
                Delete Objects
              </MenuLinkNested>
            </MenuItem>
          </SubMenu>
        </MenuSection>

        {/* Monitoring */}
        <MenuSection>
          <MenuSectionHeader onClick={() => handleSectionClick('monitoring')}>
            <span>Monitoring</span>
            <Chevron $isOpen={openSection === 'monitoring'}>▾</Chevron>
          </MenuSectionHeader>
          <SubMenu $isOpen={openSection === 'monitoring'}>
            <MenuItem>
              <MenuLinkNested to="/compare-configs" className={location.pathname === '/compare-configs' ? 'active' : ''}>
                <Icon>📊</Icon>
                Compare Configs
              </MenuLinkNested>
            </MenuItem>
          </SubMenu>
        </MenuSection>
      </Nav>

      <SidebarFooter>
        <Disclaimer>
          Not affiliated with Algolia
        </Disclaimer>
        <ApiKeyManager />
      </SidebarFooter>
    </SidebarContainer>
  );
};

export default Sidebar;