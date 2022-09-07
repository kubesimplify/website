import React, { useEffect, useRef } from "react";
import styles from "./styles.module.css";
import { teamData } from "../../data/data";

import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import { BsFillArrowRightCircleFill } from "react-icons/bs";
import { TiSocialLinkedin } from "react-icons/ti";
import { AiFillGithub } from "react-icons/ai";
import { AiOutlineTwitter } from "react-icons/ai";

const Team = () => {
  const card = useRef();
  const prevCard = () => {
    let width = card.current.clientWidth;
    let change = width > 835 ? 402 : 175;
    card.current.scrollLeft -= change;
  };
  const nextCard = () => {
    let width = card.current.clientWidth;
    let change = width > 835 ? 402 : 175;
    card.current.scrollLeft += change;
  };

  return (
    <div className={styles.team}>
      <h1 className={styles.heading}>Kubesimplify Ambassador</h1>
      <div className={styles.slider}>
        <span className={styles.previous_btn} onClick={() => prevCard()}>
          <BsFillArrowLeftCircleFill size={25} />
        </span>
        <div ref={card} className={styles.cards}>
          {teamData.map((user, index) => (
            <div key={index} className={styles.card}>
              <img
                className={styles.coverPhoto}
                src={user.coverPhoto}
                draggable="false"
              />
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
        <span className={styles.next_btn} onClick={() => nextCard()}>
          <BsFillArrowRightCircleFill size={25} />
        </span>
      </div>
    </div>
  );
};

export default Team;
