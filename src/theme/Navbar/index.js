import React  from 'react';
import styles from './styles.module.css';

//  Dynamic Content as it makes refactoring very easy .

const navbarLogo = {
logo: {
  Svg: require('@site/static/img/navbarLogo.svg').default
},
arrow: {
  Svg: require('@site/static/img/Arrow.svg').default
},
}

const navbarContent={
 learn: (
  <>
      <div className={styles.navbar_dropdown}>
          <button className={styles.navbar_dropbtn}>
          Learn <navbarLogo.arrow.Svg className={styles.navbar_arrow_trying} role="img" />
          </button>
            <div className={styles.navbar_dropdown_content}>
              <a href="https://www.youtube.com/c/saiyam911/videos" target="blank">Video Content</a>
              <a className={styles.navbar_blog_design} href="https://kubesimplify.com/" target="blank">Blog Content</a>
            </div>
       </div>
  </>
  ),
communityContent: (
    <>
    <div className={styles.navbar_dropdown}>
          <button className={styles.navbar_dropbtn}>
          Community <navbarLogo.arrow.Svg className={styles.navbar_arrow_trying} role="img" />
          </button>
               <div className={styles.navbar_dropdown_content} >
               {/* Links for respective webpage will add when new webpages are formed */}
                  <a  href="#">Student Ambassador</a>                                                                   
                  <a className={styles.navbar_workshops_designs} href="#">Workshops</a>
                  <a  className={styles.navbar_contri_designs} href="#">Contributors</a>
              </div>
     </div>
    </>
  ),
aboutContent: (
    <>
      <a className={styles.navbar_contact_word} href="/website/about">About</a>
      {/* <a className={styles.navbar_contact_word} href="/website/about" target="blank">About</a> */}
    </>
    ),
}
 function Navbar() {
  
  return (
    <>
      <section className={styles.navbar}>
          <div className={styles.navbar_positioning} >
              <div className={styles.navbar_logo}>
                   <navbarLogo.logo.Svg className={styles.logo} role="img" />
               </div>
               <div className={styles.navbar_about}>
                {navbarContent.aboutContent}
                </div>
                <div className={styles.navbar_learn}>
                 {navbarContent.learn}
                </div>
               <div className={styles.navbar_community}>
                 {navbarContent.communityContent}
                </div>
                <div className={styles.navbar_contact}>
                    <p className={styles.navbar_contact_word}> Contact </p>
               </div>
               <button className={styles.navbar_button}><span className={styles.navbar_text}>Newsletter</span></button>
           </div>
       </section>
    </>
  );
}
export default React.memo(Navbar);