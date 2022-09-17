import React from "react";
import Styles from "./style.module.css";

import ambassador_logo from "./img/ambassador-logo.png";

const Hero = () => {
  return (
    <div className={Styles.hero_containner}>
      <div className={Styles.box}>
        <img src={ambassador_logo} alt="logo" className={Styles.logo} />
        <span>Kubesimplify Ambassadors</span>
      </div>

      <p className={Styles.hero_para}>
        Kubesimplify Ambassador Program is one of the many initiatives of
        Kubesimplify community that aims to form a{" "}
        <b>fraternity of individuals</b> who wants to support us in our{" "}
        <b> mission</b> of providing cloud native education to everyone.
      </p>
    </div>
  );
};

export default Hero;
