// @ts-check
// `@type` JSDoc annotations allow editor autocompletion and type checking
// (when paired with `@ts-check`).
// There are various equivalent ways to declare your Docusaurus config.
// See: https://docusaurus.io/docs/api/docusaurus-config

import { themes as prismThemes } from "prism-react-renderer";

// This runs in Node.js - Don"t use client-side code here (browser APIs, JSX...)

/** @type {import("@docusaurus/types").Config} */
const config = {
  title: "Agrinet Protocol",
  tagline: "Fruitful App & Agrinet Engine",
  favicon: "img/favicon.ico",

  // Add the Leaflet CSS via CDN so pages that render maps (react-leaflet + leaflet)
  // get the stylesheet without importing 'leaflet/dist/leaflet.css' from JS.
  // If you already have a `stylesheets` array, merge this object into it instead
  // of duplicating the key.
  stylesheets: [
    {
      href: "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css",
      crossorigin: "anonymous",
      // integrity: "sha384-..." // optional: add SRI integrity if desired
    },
  ],

  // Future flags, see https://docusaurus.io/docs/api/docusaurus-config#future
  future: {
    v4: true, // Improve compatibility with the upcoming Docusaurus v4
  },

  // Set the production url of your site here
  url: "https://your-docusaurus-site.example.com",
  // Set the /<baseUrl>/ pathname under which your site is served
  // For GitHub pages deployment, it is often "/<projectName>/"
  baseUrl: "/",

  // GitHub pages deployment config.
  // If you aren"t using GitHub pages, you don"t need these.
  organizationName: "NTARI-RAND", // Usually your GitHub org/user name.
  projectName: "agrinet-docs", // Usually your repo name.

  onBrokenLinks: "throw",
  onBrokenMarkdownLinks: "warn",

  // Even if you don"t use internationalization, you can use this field to set
  // useful metadata like html lang. For example, if your site is Chinese, you
  // may want to replace "en" with "zh-Hans".
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr", "ja", "ko", "zh-Hans", "es", "tr"],
    localeConfigs: {
      en: {
        label: "English",
      },
      fr: {
        label: "Français",
      },
      ja: {
        label: "日本語",
      },
      ko: {
        label: "한국어",
      },
      "zh-Hans": {
        label: "简体中文",
        htmlLang: "zh-Hans",
      },
      es: {
        label: "Español",
      },
      tr: {
        label: "Türkçe",
      },
    },
  },

  presets: [
    [
      "classic",
      /** @type {import("@docusaurus/preset-classic").Options} */
      ({
        docs: {
          sidebarPath: "./sidebars.js",
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
          // routeBasePath: '/',
          editUrl: "https://github.com/NTARI-RAND/agrinet-docs",
        },
        blog: {
          showReadingTime: true,
          feedOptions: {
            type: ["rss", "atom"],
            xslt: true,
          },
          // Please change this to your repo.
          // Remove this to remove the "edit this page" links.
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
    /** @type {import("@docusaurus/preset-classic").ThemeConfig} */
    ({
      // Replace with your project"s social card
      image: "img/docusaurus-social-card.jpg",
      colorMode: {
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "v1.0",
        logo: { alt: "Agrinet Logo", src: "img/logo.svg" },
        items: [
          {
            type: "docSidebar",
            sidebarId: "tutorialSidebar",
            position: "left",
            label: "Tutorial",
          },
          { to: "/blog", label: "Blog", position: "left" },
          {
            to: "/translations",
            label: "Translations",
            position: "left",
            className: "navbar__item--translations",
          },
          { to: "/global-map", label: "Global Map", position: "left" },
          {
            href: "https://github.com/NTARI-RAND/Agrinet/releases",
            label: "GitHub",
            position: "right",
          },
          {
            type: "localeDropdown",
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
              { label: "Tutorial", to: "/docs/intro" },
              { label: "Onboarding", to: "/docs/onboarding" },
              { label: "Federation Guide", to: "/docs/federation-guide" },
              { label: "API Testing", to: "/docs/api-testing" },
            ],
          },
          {
            title: "Community",
            items: [
              {
                label: "Stack Overflow",
                href: "https://stackoverflow.com/questions/tagged/docusaurus",
              },
              { label: "Slack", href: "https://ntari.slack.com" },
              { label: "X", href: "https://x.com/ntariorg" },
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
              { label: "Reddit", href: "https://www.reddit.com/r/NTARIorg/" },
              {
                label: "LinkedIn",
                href: "https://www.linkedin.com/company/ntari",
              },
            ],
          },
          {
            title: "More",
            items: [
              // keep Blog only if blog plugin is enabled
              // { label: 'Blog', to: '/blog' },
              { label: "Privacy", to: "/privacy" },
              { label: "Terms", to: "/terms" },
              {
                label: "GitHub",
                href: "https://github.com/NTARI-RAND/Agrinet",
              },
            ],
          },
        ],
        copyright: `© ${new Date().getFullYear()} NTARI – Network Theory Applied Research Institute.`,
      },
      prism: {
        theme: prismThemes.github,
        darkTheme: prismThemes.dracula,
      },
    }),
};

export default config;
