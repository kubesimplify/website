import React from "react";
import Styles from "./style.module.css";

const HeroBox = () => {
  return (
    <div className={Styles.hero_box}>
      <div className={Styles.box}>
        <h1>
          Contribute to <span>Kubesimplify</span>
        </h1>
        <p>
          If you want to write a blog and get it published on Kubesimplify, then
          reach out to us!
        </p>
        <div>
          <p className={Styles.handle}>
            Send us a DM at <span>@kubesimplify</span> or{" "}
            <a href="https://twitter.com/kubesimplify">
              <img src="./img/Twitter.svg" />
              Message
            </a>
          </p>
        </div>
        <p className={Styles.guidelines}>
          Blog writing guidelines:{" "}
          <a href="https://hackmd.io/@jjthompson/kubesimplify-contributing">
            kubesimplify.com/blog-writing-guidelines
          </a>
        </p>
      </div>
    </div>
  );
};

export default HeroBox;
