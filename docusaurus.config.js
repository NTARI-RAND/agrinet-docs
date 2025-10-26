// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don't use client-side code here (browser APIs, JSX...)

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Agrinet Docs",
  tagline: "Fruitful App & Agrinet Engine",
  favicon: "img/favicon.ico",

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://your-docusaurus-site.example.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often '/<projectName>/'
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren't using GitHub pages, you don't need these.
  organizationName: "NTARI-RAND/NetworkTheoryAppliedResearchInstitute", // Usually your GitHub org/user name.
  projectName: "Agrinet", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don't use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace 'en' with 'zh-Hans'.
  i18n: {
    defaultLocale: "en",
    locales: ["en"],
  },

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          // Please change this to your repo.
          // Remove this to remove the 'edit this page' links.
          editUrl: "https://github.com/NTARI-RAND/agrinet-docs",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the 'edit this page' links.
          editUrl: "https://github.com/NTARI-RAND/agrinet-docs",
          // Useful options to enforce blogging best practices
          onInlineTags: "warn",
          onInlineAuthors: "warn",
          onUntruncatedBlogPosts: "warn",
        },
        theme: {
          customCss: "./src/css/custom.css",
        },
      }),
    ],
  ],

  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */
    ({
      // Replace with your project's social card
      image: "img/docusaurus-social-card.jpg",
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "Agrinet Docs",
        logo: {
          alt: "Agrinet Logo",
          src: "img/logo.svg",
        },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Tutorial",
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/NTARI-RAND/agrinet-docs",
            label: "GitHub",
            position: "right",
          },
        ],
      },
      footer: {
        style: "dark",
        links: [
          {
            title: "Docs",
            items: [
              {
                label: "Tutorial",
                to: "/docs/intro",
              },
              {
                label: "Onbaording",
                to: "/docs/onboarding",
              },
              {
                label: "Federation Guide",
                to: "/docs/federation-guide",
              },
              {
                label: "API Testing",
                to: "/docs/api-testing",
              },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Stack Overflow",
                href: "https://stackoverflow.com/questions/tagged/docusaurus",
              },
              {
                label: "Slack",
                href: "https://ntari.slack.com",
              },
              {
                label: "X",
                href: "https://x.com/ntariorg",
              },
              {
                label: "Instagram",
                href: "https://www.instagram.com/ntaricommunity/",
              },
              {
                label: "TikTok",
                href: "https://www.tiktok.com/@networktheory",
              },
              {
                label: "Facebook",
                href: "https://www.facebook.com/networktheory",
              },
              {
                label: "Reddit",
                href: "https://www.reddit.com/r/NTARIorg/",
              },
              {
                label: "LinkedIn",
                href: "https://www.linkedin.com/company/ntari/",
              },
            ],
          },
          {
            title: "More",
            items: [
              {
                label: "Blog",
                to: "/blog",
              },
              {
                laebl: "Privacy", // create /src/pages/privacy.mdx if you keep this
                to: "/privacy",
              },
              {
                label: "Terms", // create /src/pages/terms.mdx if you keep this
                to: "/terms",
              },
              {
                label: "GitHub",
                href: "https://github.com/NTARI-RAND/agrinet-docs",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },

      // Optional: enable Mermaid diagrams if you plan to use them
      // themes: ['@docusaurus/theme-mermaid'],
    }),
};

export default config;
