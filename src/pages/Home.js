// src/pages/Home.js
import React from 'react';
import styled from 'styled-components';

const HomeContainer = styled.div`
  max-width: 900px;
`;

const WelcomeCard = styled.div`
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  border-radius: 16px;
  padding: 40px;
  color: white;
  margin-bottom: 32px;
  box-shadow: 0 10px 40px -10px rgba(99, 102, 241, 0.5);

  h1 {
    font-size: 32px;
    font-weight: 700;
    margin: 0 0 12px 0;
    color: white;
  }

  p {
    font-size: 18px;
    opacity: 0.95;
    margin: 0;
    line-height: 1.6;
    color: white;
  }
`;

const Section = styled.section`
  background: var(--white);
  border-radius: var(--radius-lg);
  padding: 28px;
  margin-bottom: 24px;
  box-shadow: var(--shadow-sm);
  border: 1px solid var(--gray-100);
`;

const SectionTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: var(--gray-900);
  margin: 0 0 16px 0;
  display: flex;
  align-items: center;
  gap: 10px;
`;

const SectionContent = styled.div`
  color: var(--gray-600);
  font-size: 15px;
  line-height: 1.7;

  p {
    margin: 0 0 12px 0;
  }

  p:last-child {
    margin-bottom: 0;
  }

  ul {
    margin: 12px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 8px;
  }

  strong {
    color: var(--gray-800);
  }
`;

const FeatureGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
  margin-top: 16px;
`;

const FeatureItem = styled.div`
  background: var(--gray-50);
  border-radius: var(--radius-md);
  padding: 16px;
  
  .icon {
    font-size: 24px;
    margin-bottom: 8px;
  }

  .title {
    font-weight: 600;
    color: var(--gray-800);
    font-size: 14px;
    margin-bottom: 4px;
  }

  .desc {
    font-size: 13px;
    color: var(--gray-500);
  }
`;

const DisclaimerCard = styled(Section)`
  background: var(--gray-50);
  border: 1px solid var(--gray-200);
`;

const ContactCard = styled(Section)`
  background: linear-gradient(135deg, var(--gray-900) 0%, var(--gray-800) 100%);
  color: white;

  ${SectionTitle} {
    color: white;
  }

  ${SectionContent} {
    color: var(--gray-300);

    strong {
      color: white;
    }

    a {
      color: var(--primary-300);
      text-decoration: none;
      
      &:hover {
        text-decoration: underline;
      }
    }
  }
`;

const ServicesList = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 16px;
`;

const ServiceTag = styled.span`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  padding: 8px 16px;
  border-radius: 20px;
  font-size: 13px;
  color: white;
`;

const ContactInfo = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);

  .name {
    font-weight: 600;
    font-size: 16px;
    color: white;
    margin-bottom: 4px;
  }

  .email {
    font-size: 15px;
  }
`;

const Home = () => {
  return (
    <HomeContainer>
      <WelcomeCard>
        <h1>Welcome to Algolyze 👋</h1>
        <p>
          Your all-in-one toolkit for managing Algolia indexes. Export data, clone indexes, 
          compare configurations, and much more — all from a single, intuitive interface.
        </p>
      </WelcomeCard>

      <Section>
        <SectionTitle>
          <span>🛠️</span> What can you do with Algolyze?
        </SectionTitle>
        <SectionContent>
          <p>
            Algolyze provides a suite of powerful tools to help you manage your Algolia indexes 
            more efficiently, without writing a single line of code.
          </p>
          <FeatureGrid>
            <FeatureItem>
              <div className="icon">📤</div>
              <div className="title">Export Data</div>
              <div className="desc">Export records by filters or attributes to CSV</div>
            </FeatureItem>
            <FeatureItem>
              <div className="icon">🧬</div>
              <div className="title">Clone Indexes</div>
              <div className="desc">Duplicate indexes with all settings & rules</div>
            </FeatureItem>
            <FeatureItem>
              <div className="icon">📊</div>
              <div className="title">Compare Configs</div>
              <div className="desc">Diff searchable attributes, facets & rules</div>
            </FeatureItem>
            <FeatureItem>
              <div className="icon">✏️</div>
              <div className="title">Bulk Updates</div>
              <div className="desc">Update records in batch via CSV upload</div>
            </FeatureItem>
            <FeatureItem>
              <div className="icon">🔍</div>
              <div className="title">Analytics</div>
              <div className="desc">Find searches with no results</div>
            </FeatureItem>
            <FeatureItem>
              <div className="icon">👍</div>
              <div className="title">Recommend Tester</div>
              <div className="desc">Test your recommendation models</div>
            </FeatureItem>
          </FeatureGrid>
        </SectionContent>
      </Section>

      <Section>
        <SectionTitle>
          <span>🔒</span> Security & Privacy
        </SectionTitle>
        <SectionContent>
          <p>
            <strong>Your data stays on your machine.</strong> Algolyze runs entirely in your browser. 
            Your API keys and data are never sent to our servers — all operations are performed 
            locally using direct calls to the Algolia API.
          </p>
          <p>
            We do not store, log, or have access to any of your credentials or index data. 
            When you close your browser tab, everything is cleared.
          </p>
        </SectionContent>
      </Section>

      <DisclaimerCard>
        <SectionTitle>
          <span>⚠️</span> Disclaimer
        </SectionTitle>
        <SectionContent>
          <p>
            <strong>Use at your own risk.</strong> Algolyze is provided "as is" without warranty of any kind. 
            We are not responsible for any data loss, corruption, or unintended modifications 
            to your Algolia indexes resulting from the use of this tool.
          </p>
          <p>
            Always double-check your actions, especially when using destructive features like 
            "Delete Objects" or "Clone Index" (which overwrites the target).
          </p>
          <p>
            <strong>Not affiliated with Algolia.</strong> This tool is an independent project and is not 
            endorsed by, affiliated with, or supported by Algolia, Inc.
          </p>
        </SectionContent>
      </DisclaimerCard>

      <ContactCard>
        <SectionTitle>
          <span>🚀</span> Need Custom Solutions?
        </SectionTitle>
        <SectionContent>
          <p>
            Algolyze is <strong>free to use</strong>, but if you need more advanced solutions, 
            we offer custom development and consulting services tailored to your needs:
          </p>
          <ServicesList>
            <ServiceTag>Automated Export Jobs</ServiceTag>
            <ServiceTag>Custom Dashboards</ServiceTag>
            <ServiceTag>Data Pipelines</ServiceTag>
            <ServiceTag>Index Automation</ServiceTag>
            <ServiceTag>Algolia Implementation</ServiceTag>
            <ServiceTag>Search Optimization</ServiceTag>
          </ServicesList>
          <ContactInfo>
            <div className="name">Antonin Coste</div>
            <div className="email">
              <a href="mailto:antonin@internetcompany.fr">antonin@internetcompany.fr</a>
            </div>
          </ContactInfo>
        </SectionContent>
      </ContactCard>
    </HomeContainer>
  );
};

export default Home;