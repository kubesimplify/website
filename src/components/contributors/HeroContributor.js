import React from "react";
import styles from "./styles.module.css";
import { AiOutlineTwitter } from "react-icons/ai";
import Team from "../team/Team";
import { contributorsData, teamData } from "../../data/data";

const HeroContributer = () => {
  return (
    <section className={styles.hero_section}>
      {/* Heading Starts */}

      <div className={styles.hero_heading}>
        <h2 className={styles.Hero_heading_h2}> Contributors</h2>
      </div>

      <div className={styles.contribute_section}>
        <div className={styles.contribute}>
          <h1>
            Contribute to{" "}
            <span className={styles.theme_text}>Kubesimplify</span>
          </h1>
          <h3>
            If you want to write a blog and get it published on Kubesimplify,
            then reach out to us!
          </h3>
          <div className={styles.dm}>
            <h3>
              Send us a DM at <span>@kubesimplify</span> or
            </h3>
            <a href="https://twitter.com/kubesimplify">
              <button className={styles.hero_btn}>
                <AiOutlineTwitter /> Message
              </button>
            </a>
          </div>
          <p className={styles.guidelines}>
            Blog writing guidelines:{" "}
            <a
              target="_blank"
              href="https://hackmd.io/@jjthompson/kubesimplify-contributing"
            >
              kubesimplify.com/blog-writing-guidelines
            </a>
          </p>
        </div>
      </div>

      <Team data={contributorsData} heading="Contributors" />
    </section>
  );
};

export default HeroContributer;
