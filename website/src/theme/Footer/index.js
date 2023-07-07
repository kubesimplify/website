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
          <h2 className={styles.title}>Help us do more</h2>
          <p className={styles.sponsors_content}>{content.sponsorsContent}</p>
        </div>
        <div className={styles.sponsors_card}>
          <p className={styles.sponsors_card_title}>Sponsor us on Hashnode</p>

          <a href="https://blog.kubesimplify.com/sponsor">
            <button className={styles.sponsor_hashnode}>
              <logo.hashnode.Svg className={styles.logo} role="img" /> Sponsor
            </button>
          </a>
        </div>
      </div>
      <hr className={styles.hr}></hr>
      <div className={styles.footer_lower}>
        <div className={styles.end_first}>© 2023 Kubesimplify</div>
        <div className={styles.footer_mail}>
          <IoMdMail className={styles.mail_logo} row="img" />
          <a className={styles.mail_title} href="mailto:kubesimplify@gmail.com">
            kubesimplify@gmail.com
          </a>
        </div>
        <div className={styles.group_logo}>
          <a target="_blank" href="https://www.youtube.com/c/saiyam911">
            <AiFillYoutube row="img" className={styles.social1} />
          </a>
          <a target="_blank" href="https://discord.gg/26Z384WSPB">
            <FaDiscord row="img" className={styles.social2} />
          </a>
          <a target="_blank" href="https://twitter.com/kubesimplify">
            <AiOutlineTwitter row="img" className={styles.social2} />
          </a>
          <a
            target="_blank"
            href="https://www.linkedin.com/company/kubesimplify/"
          >
            <TiSocialLinkedin row="img" className={styles.social2} />
          </a>
          <a target="_blank" href="https://www.instagram.com/saiyampathak/">
            <AiOutlineInstagram row="img" className={styles.social2} />
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
