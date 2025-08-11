import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
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

const Menu = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  width: 100%;
`;

const MenuGroup = styled.li`
  margin: 5px 0;
`;

const MenuGroupTitle = styled.div`
  font-size: 14px;
  font-weight: 700;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  padding: 12px 15px;
  margin-top: 15px;
  cursor: pointer;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-radius: 8px;

  &:hover {
    background-color: #e9ecef;
  }
`;

const AccordionIcon = styled.span`
  transform: ${props => (props.isOpen ? 'rotate(180deg)' : 'rotate(0deg)')};
  transition: transform 0.3s ease;
`;

const SubMenu = styled.ul`
  list-style-type: none;
  padding: 0;
  margin: 0;
  overflow: hidden;
  max-height: ${props => (props.isOpen ? '500px' : '0')};
  transition: max-height 0.4s ease-in-out;
`;

const MenuItem = styled.li`
  font-size: 16px;
  font-weight:400;
  padding-left: 15px;
`;

const MenuLink = styled(Link)`
  text-decoration: none;
  color: #333;
  display: flex;
  align-items: center;
  padding: 10px 15px;
  border-radius: 8px;
  font-size: 15px;
  font-weight:400;
  
  &:hover {
    background-color: #e9ecef;
    text-decoration: none;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
  }

  &.active {
    background-color: lightblue;
    color: #darkslategrey;
    box-shadow: rgba(0, 0, 0, 0.12) 0px 1px 3px, rgba(0, 0, 0, 0.24) 0px 1px 2px;
    font-weight:600;
  }
`;

const Icon = styled.span`
  margin-right: 12px;
  font-size: 18px;
  width: 20px;
  text-align: center;
`;

const sectionMapping = {
  '/exportbyfilters': 'dataManagement',
  '/exportbyids': 'dataManagement',
  '/exportbydistinct': 'dataManagement',
  '/update': 'dataManagement',
  '/updatebydistinct': 'dataManagement',
  '/offline': 'dataManagement',
  '/copy': 'dataManagement',
  '/generate-events': 'devMode',
  '/copy-data': 'devMode',
  '/delete-objects': 'dataManagement',
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
      <div>
        <ProfileSection>
          <ProfileImage>AC</ProfileImage>
          <ProfileName>Antonin C.</ProfileName>
          <ProfileEmail>antonin@internetcompany.fr</ProfileEmail>
        </ProfileSection>

        <Menu>
          <MenuItem>
            <MenuLink to="/" className={location.pathname === '/' ? 'active' : ''}>
              <Icon>🏠</Icon>
              Home
            </MenuLink>
          </MenuItem>

          <MenuGroup>
            <MenuGroupTitle onClick={() => handleSectionClick('devMode')}>
              <span>Dev Mode</span>
              <AccordionIcon isOpen={openSection === 'devMode'}>▼</AccordionIcon>
            </MenuGroupTitle>
            <SubMenu isOpen={openSection === 'devMode'}>
                    <MenuItem>
                        <MenuLink to="/copy-data" className={location.pathname === '/copy-data' ? 'active' : ''}>
                            <Icon>🔄</Icon>
                            Copy Data
                        </MenuLink>
                    </MenuItem>
                    <MenuItem>
                        <MenuLink to="/generate-events" className={location.pathname === '/generate-events' ? 'active' : ''}>
                            <Icon>🆕</Icon>
                             Generate fake events
                        </MenuLink>
                    </MenuItem>
            </SubMenu>
          </MenuGroup>

          <MenuGroup>
            <MenuGroupTitle onClick={() => handleSectionClick('dataManagement')}>
              <span>Data Management</span>
              <AccordionIcon isOpen={openSection === 'dataManagement'}>▼</AccordionIcon>
            </MenuGroupTitle>
            <SubMenu isOpen={openSection === 'dataManagement'}>
              <MenuItem>
                <MenuLink to="/exportbyfilters" className={location.pathname === '/exportbyfilters' ? 'active' : ''}>
                  <Icon>⤵️</Icon>
                  Export by Filters
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink to="/exportbyids" className={location.pathname === '/exportbyids' ? 'active' : ''}>
                  <Icon>⤵️</Icon>
                  Export by ObjectsID
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink to="/exportbydistinct" className={location.pathname === '/exportbydistinct' ? 'active' : ''}>
                  <Icon>⤵️</Icon>
                  Export by Distinct attribute
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink to="/update" className={location.pathname === '/update' ? 'active' : ''}>
                  <Icon>⤴️</Icon>
                  Update by ObjectsID
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink to="/updatebydistinct" className={location.pathname === '/updatebydistinct' ? 'active' : ''}>
                  <Icon>⤴️</Icon>
                  Update by Distinct attribute
                </MenuLink>
              </MenuItem>
              <MenuItem>
                <MenuLink to="/delete-objects" className={location.pathname === '/delete-objects' ? 'active' : ''}>
                     <Icon>🚮</Icon>
                    Delete Objects
                </MenuLink>
              </MenuItem>
            </SubMenu>
          </MenuGroup>

          <MenuGroup>
            <MenuGroupTitle onClick={() => handleSectionClick('monitoring')}>
              <span>Monitoring</span>
              <AccordionIcon isOpen={openSection === 'monitoring'}>▼</AccordionIcon>
            </MenuGroupTitle>
            <SubMenu isOpen={openSection === 'monitoring'}>
              {/* Items pour Monitoring ici */}
            </SubMenu>
          </MenuGroup>
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