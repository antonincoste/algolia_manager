import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700&display=swap');

  :root {
    /* Primary Colors */
    --primary-500: #6366f1;
    --primary-600: #4f46e5;
    --primary-400: #818cf8;
    --primary-100: #e0e7ff;
    --primary-50: #eef2ff;
    
    /* Secondary / Accent */
    --accent-purple: #8b5cf6;
    --accent-teal: #14b8a6;
    
    /* Success */
    --success-500: #10b981;
    --success-100: #d1fae5;
    --success-50: #ecfdf5;
    
    /* Danger */
    --danger-500: #ef4444;
    --danger-100: #fee2e2;
    --danger-50: #fef2f2;
    
    /* Warning */
    --warning-500: #f59e0b;
    --warning-100: #fef3c7;
    
    /* Neutrals */
    --gray-900: #0f172a;
    --gray-800: #1e293b;
    --gray-700: #334155;
    --gray-600: #475569;
    --gray-500: #64748b;
    --gray-400: #94a3b8;
    --gray-300: #cbd5e1;
    --gray-200: #e2e8f0;
    --gray-100: #f1f5f9;
    --gray-50: #f8fafc;
    --white: #ffffff;
    
    /* Shadows */
    --shadow-sm: 0 1px 2px rgba(0, 0, 0, 0.05);
    --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
    --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
    --shadow-primary: 0 4px 14px rgba(99, 102, 241, 0.4);
    
    /* Border Radius */
    --radius-sm: 6px;
    --radius-md: 10px;
    --radius-lg: 12px;
    --radius-xl: 16px;
    
    /* Transitions */
    --transition-fast: 0.15s ease;
    --transition-normal: 0.2s ease;
    --transition-slow: 0.3s ease;
  }

  * {
    box-sizing: border-box;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
    margin: 0;
    padding: 0;
    background-color: var(--gray-100);
    color: var(--gray-700);
    line-height: 1.6;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
  }

  h1, h2, h3, h4, h5, h6 {
    color: var(--gray-900);
    font-weight: 600;
    line-height: 1.3;
    margin: 0;
  }

  h1 {
    font-size: 32px;
    font-weight: 700;
    letter-spacing: -0.5px;
    margin-bottom: 8px;
  }

  h2 {
    font-size: 20px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  h3 {
    font-size: 16px;
    text-transform: uppercase;
    letter-spacing: 0.3px;
  }

  a {
    color: var(--primary-500);
    text-decoration: none;
    transition: color var(--transition-fast);
  }

  a:hover {
    color: var(--primary-600);
  }

  ul {
    list-style-type: none;
    padding: 0;
    margin: 0;
  }

  button {
    font-family: inherit;
    cursor: pointer;
  }

  input, select, textarea {
    font-family: inherit;
  }

  /* Custom Scrollbar */
  ::-webkit-scrollbar {
    width: 8px;
    height: 8px;
  }

  ::-webkit-scrollbar-track {
    background: var(--gray-100);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb {
    background: var(--gray-300);
    border-radius: 4px;
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--gray-400);
  }

  /* Focus States */
  *:focus-visible {
    outline: 2px solid var(--primary-500);
    outline-offset: 2px;
  }

  /* Selection */
  ::selection {
    background-color: var(--primary-100);
    color: var(--primary-600);
  }
`;

export default GlobalStyle;