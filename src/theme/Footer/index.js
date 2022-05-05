/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from 'react';
import styles from './styles.module.css'; // CSS modules 

// This file is generated automatically using the `npm run swizzle @docusaurus/theme-classic Footer` command 
// This is done to modify the default footer 
// For more information look https://docusaurus.io/docs/migration/manual#footer

const content = {
  sponsorsContent: (
    <>
      If you like our work, you can <b>sponsor & support</b> the community!<br></br>
      All the money will be used to continue our mission of <b>providing simplified cloud native education to all</b> and make this community reach more number of people.
    </>
  )
}

const logo = {
  hashnode: { 
    Svg: require('@site/static/img/Vector.svg').default
  },
  coffee : {
    Svg: require('@site/static/img/coffee.svg').default
  },
  mail: {
    Svg: require('@site/static/img/mail.svg').default
  },
  instagram: {
    Svg: require('@site/static/img/Instagram.svg').default
  },
  twitter: {
    Svg: require('@site/static/img/Twitter.svg').default
  },
  github: {
    Svg: require('@site/static/img/GitHub.svg').default
  },
  youtube: {
    Svg: require('@site/static/img/YouTube.svg').default
  },
  discord: {
    Svg: require('@site/static/img/Discord.svg').default
  },
  linkedin: {
    Svg: require('@site/static/img/LinkedIn.svg').default
  }
}

function Footer() {
  return (
    <section className={styles.footer}>
      <div>
        <div className={styles.title}>Help us do more</div>
        <div className={styles.sponsors_content}>{content.sponsorsContent}</div>
        <div className={styles.sponsors_card}>
          <div className={styles.sponsors_card_title}>Sponsor us on Hashnode</div>
          <button className={styles.sponsor_hashnode}>
            <div className={styles.sponsor_hashnode_logo}>
              <logo.hashnode.Svg className={styles.logo} role="img" />
              <div className={styles.button_name}>Sponsor</div>
            </div>
          </button>
          <div className={styles.sponsors_or}>or</div>
          <button className={styles.sponsor_coffee}>
              <logo.coffee.Svg className={styles.coffee} role="img" />  
          </button>
        </div>
      </div>
      <hr className={styles.hr}></hr>
      <div className={styles.end_first}>© 2022 Kubesimplify</div>
      <logo.mail.Svg className={styles.mail_logo} row="img" />
      <div className={styles.mail_title}>example@kubesimplify.com</div>
      <div className={styles.group_logo}>
        <a href="#"><logo.instagram.Svg row="img" className={styles.social}/></a>
        <a href="#"><logo.twitter.Svg row="img" className={styles.social} /></a>
        <a href="#"><logo.github.Svg row="img" className={styles.social} /></a>
        <a href="#"><logo.linkedin.Svg row="img" className={styles.social} /></a>
        <a href="#"><logo.youtube.Svg row="img" className={styles.social} /> </a>
        <a href="#"><logo.discord.Svg row="img" className={styles.social} /></a>        
      </div>   
    </section>
  );
}

export default React.memo(Footer);
