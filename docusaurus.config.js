// @ts-check
// Note: type annotations allow type checking and IDEs autocompletion

const lightCodeTheme = require("prism-react-renderer/themes/github");
const darkCodeTheme = require("prism-react-renderer/themes/dracula");

/** @type {import('@docusaurus/types').Config} */
const config = {
  title: "Kubesimplify",
  tagline: "Simplifying Cloud Native for All",
  url: "https://github.com",
  baseUrl: "/kubesimplify/",
  onBrokenLinks: "throw",
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
        docs: {
          sidebarPath: require.resolve("./sidebars.js"),
          // Please change this to your repo.
          editUrl:
            "https://github.com/facebook/docusaurus/tree/main/packages/create-docusaurus/templates/shared/",
        },
        blog: {
          showReadingTime: true,
          // Please change this to your repo.
          editUrl:
            "https://github.com/kubesimplify/website",
        },
        theme: {
          customCss: require.resolve("./src/css/custom.css"),
        },
      }),
    ],
  ],

  themes: [
    // Your other themes...
    [
      require.resolve("@easyops-cn/docusaurus-search-local"),
      {
        hashed: true,
      },
    ],
  ],

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
      navbar: {
        title: "Kubesimplify",
        logo: {
          alt: "Kubesimplify Logo",
          src: "img/color.svg",
        },
        items: [
          {
            type: "doc",
            docId: "intro",
            position: "left",
            label: "Notes",
          },
          // { to: "/blog", label: "Blog", position: "left" },
          {
            href: "https://github.com/facebook/docusaurus",
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
                label: "Notes",
                to: "/docs",
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
                label: "Discord",
                href: "https://discordapp.com/invite/docusaurus",
              },
              {
                label: "Twitter",
                href: "https://twitter.com/docusaurus",
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
                label: "GitHub",
                href: "https://github.com/facebook/docusaurus",
              },
            ],
          },
        ],
        copyright: `Copyright © ${new Date().getFullYear()} My Project, Inc. Built with Docusaurus.`,
      },
      prism: {
        theme: lightCodeTheme,
        darkTheme: darkCodeTheme,
      },
    }),
};

module.exports = config;
