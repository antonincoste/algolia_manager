import React from 'react';
import styled from 'styled-components';
import { Link } from 'react-router-dom';
import PageHeader from '../components/PageHeader';

const WelcomeCard = styled.div`
  background: linear-gradient(135deg, var(--primary-500) 0%, var(--accent-purple) 100%);
  border-radius: var(--radius-xl);
  padding: 40px;
  color: var(--white);
  margin-bottom: 32px;
  max-width: 700px;
`;

const WelcomeTitle = styled.h2`
  font-size: 28px;
  font-weight: 700;
  margin: 0 0 12px 0;
  text-transform: none;
`;

const WelcomeText = styled.p`
  font-size: 16px;
  opacity: 0.9;
  margin: 0;
  line-height: 1.6;
`;

const SectionTitle = styled.h3`
  font-size: 14px;
  font-weight: 700;
  color: var(--gray-400);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin: 0 0 16px 0;
`;

const QuickLinksGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
  gap: 16px;
  max-width: 700px;
`;

const QuickLink = styled(Link)`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 20px;
  background-color: var(--white);
  border: 1px solid var(--gray-200);
  border-radius: var(--radius-lg);
  text-decoration: none;
  transition: all var(--transition-normal);
  
  &:hover {
    border-color: var(--primary-300);
    box-shadow: var(--shadow-md);
    transform: translateY(-2px);
  }
`;

const QuickLinkIcon = styled.span`
  font-size: 24px;
`;

const QuickLinkText = styled.div`
  flex: 1;
`;

const QuickLinkTitle = styled.div`
  font-size: 14px;
  font-weight: 600;
  color: var(--gray-900);
`;

const QuickLinkDesc = styled.div`
  font-size: 12px;
  color: var(--gray-500);
  margin-top: 2px;
`;

const Section = styled.section`
  margin-bottom: 32px;
`;

const Home = () => {
  const quickLinks = [
    { 
      path: '/export-by-attribute', 
      icon: '🎯', 
      title: 'Export by Attribute',
      desc: 'Export records by ID or distinct'
    },
    { 
      path: '/clone-index', 
      icon: '🧬', 
      title: 'Clone Index',
      desc: 'Duplicate an entire index'
    },
    { 
      path: '/compare-configs', 
      icon: '📊', 
      title: 'Compare Configs',
      desc: 'Diff index configurations'
    },
    { 
      path: '/delete-objects', 
      icon: '🗑️', 
      title: 'Delete Objects',
      desc: 'Bulk delete records'
    },
  ];

  return (
    <div>
      <PageHeader 
        title="Welcome to Algolyze"
        subtitle="Your toolkit for managing Algolia indexes"
      />

      <WelcomeCard>
        <WelcomeTitle>👋 Getting Started</WelcomeTitle>
        <WelcomeText>
          Algolyze helps you manage your Algolia indexes with powerful tools for exporting, 
          updating, and monitoring your data. Start by adding your credentials in the sidebar, 
          then explore the available tools.
        </WelcomeText>
      </WelcomeCard>

      <Section>
        <SectionTitle>Quick Actions</SectionTitle>
        <QuickLinksGrid>
          {quickLinks.map(link => (
            <QuickLink key={link.path} to={link.path}>
              <QuickLinkIcon>{link.icon}</QuickLinkIcon>
              <QuickLinkText>
                <QuickLinkTitle>{link.title}</QuickLinkTitle>
                <QuickLinkDesc>{link.desc}</QuickLinkDesc>
              </QuickLinkText>
            </QuickLink>
          ))}
        </QuickLinksGrid>
      </Section>
    </div>
  );
};

export default Home;