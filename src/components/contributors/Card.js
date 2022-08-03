import React from "react";
import Styles from "./style.module.css";

const Card = ({ name, twitter, linkedin, github, img }) => {
  return (
    <div className={Styles.card}>
      <img className={Styles.profile} src={"./img/Saiyam.png"} />
      <div>
        <h2 className={Styles.name}>{name}</h2>
        <div className={Styles.socials}>
          <a href={twitter}>
            <img src="./img/Twitter.svg"></img>
          </a>
          <a href={linkedin}>
            <img src="./img/LinkedIn.svg"></img>
          </a>
          <a href={github}>
            <img src="./img/GitHub.svg"></img>
          </a>
        </div>
      </div>
    </div>
  );
};

export default Card;
