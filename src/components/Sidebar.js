import React from 'react';
import { Link, useLocation } from 'react-router-dom';  // Import du hook useLocation
import styled from 'styled-components';
import ApiKeyManager from './ApiKeyManager';

const SidebarContainer = styled.div`
  width: 250px;
  height: 100vh;
  background-color: #f8f9fa;
  padding: 20px;
  box-sizing: border-box;
  position: fixed;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  border-right: 1px solid #e0e0e0;
`;

const ProfileSection = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding-bottom: 20px;
  border-bottom: 1px solid #e0e0e0;
  margin-bottom: 20px;
`;

const ProfileImage = styled.div`
  width: 50px;
  height: 50px;
  background-color: #007bff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  color: #fff;
  margin-bottom: 10px;
`;

const ProfileName = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: #333;
`;

const ProfileEmail = styled.div`
  font-size: 14px;
  color: #777;
`;

const ProfileLinkedin = styled.a`
  font-size: 14px;
  color: #0077b5;
  text-decoration: none;
  margin-top: 1px;

  &:hover {
    text-decoration: underline;
  }
`;

const Menu = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
`;

const MenuItem = styled.li`
  margin: 15px 0;
  font-size: 16px;
  font-weight:400;
`;

const MenuLink = styled(Link)`
  text-decoration: none;
  color: #333;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 8px;
  text-transform: uppercase;
  font-size: 14px;
  font-weight:400;
  
  &:hover {
    background-color: #e9ecef;
    text-decoration: none;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
  }

  &.active {
    background-color: lightblue;
    color: #darkslategrey;;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
    font-weight:600;
  }
`;

const Icon = styled.span`
  margin-right: 10px;
  font-size: 20px;
`;

const Sidebar = () => {
  const location = useLocation();  // Utilisation de useLocation pour obtenir l'URL active

  return (
    <SidebarContainer>
      <div>
        <ProfileSection>
          <ProfileImage>AC</ProfileImage> {/* Initiales ou image de profil */}
          <ProfileName>Antonin Coste</ProfileName>
          <ProfileEmail>antonin@internetcompany.fr</ProfileEmail>
          <ProfileLinkedin
          href="https://www.linkedin.com/in/antonin-coste-4b9b6749/"
          target="_blank"
          rel="noopener noreferrer"
        >
          LinkedIn
        </ProfileLinkedin>
        </ProfileSection>

        <Menu>
          <MenuItem>
            <MenuLink to="/" className={location.pathname === '/' ? 'active' : ''}>
              <Icon>🏠</Icon>
              Home
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink to="/exportbyfilters" className={location.pathname === '/exportbyfilters' ? 'active' : ''}>
              <Icon>⤴️</Icon>
              Export products by filters
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink to="/exportbyids" className={location.pathname === '/exportbyids' ? 'active' : ''}>
              <Icon>⤴️</Icon>
              Export products by ids
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink to="/exportbydistinct" className={location.pathname === '/exportbydistinct' ? 'active' : ''}>
              <Icon>⤴️</Icon>
              Export products by distinct attribute
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink to="/update" className={location.pathname === '/update' ? 'active' : ''}>
              <Icon>⤵️</Icon>
              Update product attributes
            </MenuLink>
          </MenuItem>
          <MenuItem>
            <MenuLink to="/updatebydistinct" className={location.pathname === '/updatebydistinct' ? 'active' : ''}>
              <Icon>⤵️</Icon>
              Update by distinct
            </MenuLink>
          </MenuItem>
        </Menu>
      </div>
      <div style={{ marginTop: 'auto' }}>
      <div style={{ fontSize: '12px', color: '#888', padding: '10px 0', textAlign: 'left' }}>
        <p style={{ margin: 0 }}>
          This tool is not affiliated with or endorsed by Algolia.
        </p>
      </div>
      <ApiKeyManager />
    </div>
    </SidebarContainer>
  );
};

export default Sidebar;
