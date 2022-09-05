import React from "react";
import styles from "./styles.module.css";
import { teamData } from "../../data/data";

import { TiSocialLinkedin } from "react-icons/ti";
import { AiFillGithub } from "react-icons/ai";
import { AiOutlineTwitter } from "react-icons/ai";

const Team = () => {
  console.log(teamData);
  return (
    <div className={styles.team}>
      <h1 className={styles.heading}>Team</h1>

      <div className={styles.cards}>
        {teamData.map((user, index) => (
          <div key={index} className={styles.card}>
            <img className={styles.coverPhoto} src={user.coverPhoto} />
            <div className={styles.info}>
              <h3 className={styles.name}>{user.name}</h3>
              <h4 className={styles.role}>{user.role}</h4>
              <div className={styles.socials}>
                <span>
                  <a href={user.twitterLink}>
                    <AiOutlineTwitter className={styles.social} />
                  </a>
                </span>
                <span>
                  <a href={user.linkedinLink}>
                    <TiSocialLinkedin className={styles.social} />
                  </a>
                </span>
                <span>
                  <a href={user.githubLink}>
                    <AiFillGithub className={styles.social} />
                  </a>
                </span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Team;
