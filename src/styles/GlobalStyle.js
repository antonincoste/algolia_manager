import { createGlobalStyle } from 'styled-components';

const GlobalStyle = createGlobalStyle`
  body {
    font-family: 'Barlow Condensed', sans-serif;
    margin: 0;
    padding: 0;
    background-color: #f0f0f0;
  }

  a {
    color: #61dafb;
    text-decoration: none;
  }

  ul {
    list-style-type: none;
    padding: 0;
  }

  li {
    margin: 10px 0;
  }

  li a {
    color: white;
  }

  li a:hover {
    text-decoration: underline;
  }

  h1 {
    text-transform: uppercase;
    font-weight: 400;
    font-size: 50px;
  }
`;

export default GlobalStyle;
