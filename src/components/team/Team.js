import React, { useRef } from "react";
import styles from "./styles.module.css";
import { teamData } from "../../data/data";
import dummyProfile from '../team/defaultImage.png'

import { BsFillArrowLeftCircleFill } from "react-icons/bs";
import { BsFillArrowRightCircleFill } from "react-icons/bs";
import { TiSocialLinkedin } from "react-icons/ti";
import { AiFillGithub } from "react-icons/ai";
import { AiOutlineTwitter } from "react-icons/ai";

const Team = ({heading, slider }) => {
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
      <h2 className={styles.heading}>{heading}</h2>
      <div className={styles.slider}>
        {slider ? (<span className={styles.previous_btn} onClick={() => prevCard()}>
          <BsFillArrowLeftCircleFill size={25} />
        </span>) : ""}
        <div ref={card} className={slider ? styles.cards_slider : styles.cards}>
          {teamData.map((user, index) => (
            <div key={index} className={styles.card}>
              <img
                className={styles.coverPhoto}
                src={user.coverPhoto || dummyProfile}
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = dummyProfile
                }}
                draggable="false"
              />
              <div className={styles.info}>
                <h3 className={styles.name}>{user.name}</h3>
                <div className={styles.socials}>
                  <span>
                    <a href={user.twitterLink} target="_blank">
                      <AiOutlineTwitter className={styles.social} />
                    </a>
                  </span>
                  <span>
                    <a href={user.linkedinLink} target="_blank">
                      <TiSocialLinkedin className={styles.social} />
                    </a>
                  </span>
                  <span>
                    <a href={user.githubLink} target="_blank">
                      <AiFillGithub className={styles.social} />
                    </a>
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
        { slider ? (<span className={styles.next_btn} onClick={() => nextCard()}>
          <BsFillArrowRightCircleFill size={25} />
        </span>) : ""}
      </div>
    </div>
  );
};

export default Team;
