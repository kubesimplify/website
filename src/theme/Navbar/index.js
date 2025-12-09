import React, { useEffect, useState } from "react";
import styles from "./styles.module.css";
import { FaBars, FaTimes } from "react-icons/fa";
import BrowserOnly from "@docusaurus/BrowserOnly";
import { useColorMode } from "@docusaurus/theme-common";

const navbarLogo = {
  logo: {
    Svg: require("@site/static/img/navbarLogo.svg").default,
  },
  arrow: {
    Svg: require("@site/static/img/Arrow.svg").default,
  },
};

const navbarContent = {
  blogContent: (
    <>
      <div className={styles.navbar_about_start}>
        <a className={styles.navbar_about_word} href="https://blog.kubesimplify.com" target="_blank">
          Blog
        </a>
      </div>
    </>
  ),
  youtubeContent: (
    <>
      <div className={styles.navbar_about_start}>
        <a className={styles.navbar_about_word} href="https://www.youtube.com/@kubesimplify" target="_blank">
          YouTube
        </a>
      </div>
    </>
  ),
  aboutContent: (
    <>
      <div className={styles.navbar_about_start}>
        <a className={styles.navbar_about_word} href="/about">
          About
        </a>
      </div>
    </>
  ),
  partnershipsContent: (
    <>
      <div className={styles.navbar_about_start}>
        <a className={styles.navbar_about_word} href="/partnerships">
          Partnerships
        </a>
      </div>
    </>
  ),
  workshopsContent: (
    <>
      <div className={styles.navbar_about_start}>
        <a className={styles.navbar_about_word} href="/workshops">
          Workshops
        </a>
      </div>
    </>
  ),
};

const mobileViewContent = {
  blog: (
    <div className={styles.mobilView_learn}>
      <div>
        <a href="https://blog.kubesimplify.com" target="_blank">
          Blog
        </a>
      </div>
    </div>
  ),
  youtube: (
    <div className={styles.mobileView_community}>
      <div>
        <a href="https://www.youtube.com/@kubesimplify" target="_blank">
          YouTube
        </a>
      </div>
    </div>
  ),
  partnerships: (
    <div className={styles.mobilView_learn}>
      <div>
        <a href="/partnerships">Partnerships</a>
      </div>
    </div>
  ),
  workshops: (
    <div className={styles.mobilView_learn}>
      <div>
        <a href="/workshops">Workshops</a>
      </div>
    </div>
  ),
};

function ThemeToggle() {
  const { colorMode, setColorMode } = useColorMode();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return null;
  }

  const toggleTheme = () => {
    setColorMode(colorMode === 'dark' ? 'light' : 'dark');
  };

  return (
    <button
      onClick={toggleTheme}
      className={styles.themeToggleButton}
      aria-label="Toggle theme"
      title={`Switch to ${colorMode === 'dark' ? 'light' : 'dark'} mode`}
    >
      {colorMode === 'dark' ? (
        <svg className={styles.themeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
        </svg>
      ) : (
        <svg className={styles.themeIcon} fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
        </svg>
      )}
    </button>
  );
}

function Navbar() {
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 680) {
        setIsMobile(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <section className={styles.navbar}>
        <nav className={styles.navbar_positioning}>
          <div className={styles.navbar_logopair}>
            <div className={styles.navbar_logo}>
              <a href="/">
                <navbarLogo.logo.Svg className={styles.logo} role="" />
              </a>
            </div>
            <button
              className={styles.mobile_menu_icon}
              onClick={() => setIsMobile(!isMobile)}
            >
              {isMobile ? <FaTimes className={styles.mobile_icon} /> : <FaBars className={styles.mobile_icon} />}
            </button>
          </div>
          <ul
            className={
              isMobile ? styles.navbar_links_mobile : styles.navbar_links
            }
            onClick={() => setIsMobile(false)}
          >
            <li className={styles.about}>{navbarContent.aboutContent}</li>
            {isMobile ? (
              <>
                <li>{mobileViewContent.workshops}</li>
                <li>{mobileViewContent.partnerships}</li>
                <li>{mobileViewContent.blog}</li>
                <li>{mobileViewContent.youtube}</li>
                <li className={styles.themeToggle}>
                  <BrowserOnly>
                    {() => <ThemeToggle />}
                  </BrowserOnly>
                </li>
              </>
            ) : (
              <>
                <li className={styles.learn}>{navbarContent.workshopsContent}</li>
                <li className={styles.learn}>{navbarContent.partnershipsContent}</li>
                <li className={styles.learn}>{navbarContent.blogContent}</li>
                <li className={styles.community}>
                  {navbarContent.youtubeContent}
                </li>
              </>
            )}

            <li>
              <button className={styles.navbarbutton}>
                <a
                  className={styles.navbar_text}
                  href="https://saiyampathak.substack.com/"
                >
                  Newsletter
                </a>
              </button>
            </li>
            <li className={styles.themeToggle}>
              <BrowserOnly>
                {() => <ThemeToggle />}
              </BrowserOnly>
            </li>
          </ul>
        </nav>
      </section>
    </>
  );
}
export default React.memo(Navbar);
