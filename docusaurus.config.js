// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Kubesimplify",
  tagline: "Simplifying Cloud Native for All",
  url: "https://kubesimplify.com",
  baseUrl: "/",
  onBrokenLinks: "ignore", //  We will change this to "throw" when proper setup is done
  onBrokenMarkdownLinks: "warn",
  favicon: "img/favicon.ico",
  organizationName: "kubesimplify", // Usually your GitHub org/user name.
  projectName: "website", // Usually your repo name.
  deploymentBranch: "gh-pages",

  presets: [
    [
      "classic",
      /** @type {import('@docusaurus/preset-classic').Options} */
      ({
        docs: false, // Disabled - not using docs
        blog: false, // Disabled - blog is external
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  // Search disabled - not using docs
  // themes: [
  //   [
  //     require.resolve("@easyops-cn/docusaurus-search-local"),
  //     {
  //       hashed: true,
  //     },
  //   ],
  // ],

  /* i18n support
  i18n: {
    defaultLocale: "en",
    locales: ["en", "fr", "fa"],
    localeConfigs: {
      en: {
        label: "English",
        direction: "ltr",
        htmlLang: "en-US",
      },
      fr: {
        label: "Français",
        direction: "ltr",
        htmlLang: "fr-FR",
      },
    },
  },
*/
  themeConfig:
    /** @type {import('@docusaurus/preset-classic').ThemeConfig} */

    ({
      colorMode: {
        defaultMode: 'dark',
        disableSwitch: false,
        respectPrefersColorScheme: true,
      },
      navbar: {
        title: "Kubesimplify",
        logo: {
          alt: "Kubesimplify Logo",
          src: "img/color.svg",
        },
        items: [
          {
            to: "/about",
            label: "About",
            position: "right",
          },
          {
            href: "https://blog.kubesimplify.com",
            label: "Blog",
            position: "right",
          },
          {
            href: "https://www.youtube.com/@kubesimplify",
            label: "YouTube",
            position: "right",
          },
          {
            href: "https://saiyampathak.substack.com/",
            label: "Newsletter",
            position: "right",
            className: "button button--primary button--sm navbar-button",
          },
        ],
      },
      // Footer is handled by custom component in src/theme/Footer/index.js
      footer: {
        style: "dark",
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
