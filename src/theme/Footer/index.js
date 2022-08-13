/**
 * Copyright (c) Facebook, Inc. and its affiliates.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 */
import React from "react";
import styles from "./styles.module.css"; // CSS modules
import { AiOutlineTwitter } from "react-icons/ai";
import { AiFillYoutube } from "react-icons/ai";
import { FaDiscord } from "react-icons/fa";
import { TiSocialLinkedin } from "react-icons/ti";
import { AiOutlineInstagram } from "react-icons/ai";
import { AiFillGithub } from "react-icons/ai";
import { IoMdMail } from "react-icons/io";

// This file is generated automatically using the `npm run swizzle @docusaurus/theme-classic Footer` command
// This is done to modify the default footer
// For more information look https://docusaurus.io/docs/migration/manual#footer

const content = {
  sponsorsContent: (
    <>
      If you like our work, you can <b>sponsor & support</b> the community!
      <br></br>
      All the money will be used to continue our mission of{" "}
      <b>providing simplified cloud native education to all</b> and make this
      community reach more number of people.
    </>
  ),
};

const logo = {
  hashnode: {
    Svg: require("@site/static/img/Vector.svg").default,
  },
  coffee: {
    Svg: require("@site/static/img/coffee.svg").default,
  },
};

function Footer() {
  return (
    <section className={styles.footer}>
      <div className={styles.footer_upper}>
        <div className={styles.content}>
          <div className={styles.title}>Help us do more</div>
          <div className={styles.sponsors_content}>
            {content.sponsorsContent}
          </div>
        </div>
        <div className={styles.sponsors_card}>
          <div className={styles.sponsors_card_title}>
            Sponsor us on Hashnode
          </div>
          <button className={styles.sponsor_hashnode}>
            <div>
              <div className={styles.sponsor_hashnode_logo}>
                <logo.hashnode.Svg className={styles.logo} role="img" />
                <a
                  className={styles.button_name}
                  href="https://kubesimplify.com/sponsor"
                >
                  Sponsor
                </a>
              </div>
            </div>
          </button>
        </div>
      </div>
      <hr className={styles.hr}></hr>
      <div className={styles.footer_lower}>
        <div className={styles.end_first}>© 2022 Kubesimplify</div>
        <div className={styles.footer_mail}>
          <IoMdMail className={styles.mail_logo} row="img" />
          <a className={styles.mail_title} href="kubesimplify@gmail.com">
            kubesimplify@gmail.com
          </a>
        </div>
        <div className={styles.group_logo}>
          <a target="_blank" href="https://www.youtube.com/c/saiyam911">
            <AiFillYoutube row="img" className={styles.social1} style={{backgroundColor:'#FF0000'}} />
          </a>
          <a target="_blank" href="https://discord.gg/eEEFPVMr">
            <FaDiscord row="img" className={styles.social2} style={{backgroundColor:'#7289da'}} />
          </a>
          <a target="_blank" href="https://twitter.com/kubesimplify">
            <AiOutlineTwitter row="img" className={styles.social2} style={{backgroundColor:'#00acee'}}
  />
          </a>
          <a
            target="_blank"
            href="https://www.linkedin.com/company/kubesimplify/"
          >
            <TiSocialLinkedin row="img" className={styles.social2} style={{backgroundColor:"#0072b1"}} />
          </a>
          <a target="_blank" href="https://www.instagram.com/saiyampathak/">
            <AiOutlineInstagram row="img" className={styles.social2} style={{background:"linear-gradient(to bottom right ,#8a3ab9,#e95950,#bc2a8d,#fccc63,#fbad50,#cd486b,#4c68d7 )"}}  />
          </a>
          <a target="_blank" href="https://github.com/kubesimplify">
            <AiFillGithub row="img" className={styles.social3} />
          </a>
        </div>
      </div>
    </section>
  );
}

export default React.memo(Footer);
