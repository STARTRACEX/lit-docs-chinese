import React from 'react';
import { DocsThemeConfig } from 'nextra-theme-docs';
import Footer from "./components/footer";
const config: DocsThemeConfig = {
  head: () => {
    return <>
      <link rel="shortcut icon" type="images/x-icon" href="./favicon.ico" />
      </>;
  },
  useNextSeoProps() {
    return {
      titleTemplate: '%s - Docs'
    };
  },
  // i18n: [
  //   { locale: 'en', text: 'English' },
  //   { locale: 'zh', text: '简体中文' },
  // ],
  logo: <span>DOCS</span>,
  project: {
    link: 'https://github.com/STARTRACEX',
  },
  docsRepositoryBase: 'https://github.com/STARTRACEX/docs/blob/main',
  footer: {
    component: Footer
  },
};

export default config;
