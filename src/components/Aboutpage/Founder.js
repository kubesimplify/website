import React from "react";
import styles from "./styles.module.css";
import Saiyam from "@site/src/components/Aboutpage/images/Saiyam.png";
import { AiOutlineTwitter } from "react-icons/ai";
import { AiFillYoutube } from "react-icons/ai";
import { TiSocialLinkedin } from "react-icons/ti";
import { AiOutlineInstagram } from "react-icons/ai";
import { AiFillGithub } from "react-icons/ai";

const Founder = () => {
  return (
    <section className={styles.ap_cont_4_founder_check}>
      <div className={styles.ap_cont_4_founder}>
        <div className={styles.ap_cont_4_founder_description}>
          <h1 className={styles.ap_cont_4_heading}>Founder</h1>
          <p className={styles.ap_cont_4_para}>
            Kubesimplify community is founded by
            <span className={styles.ap_cont_1_cloud}> Saiyam Pathak. </span> <br />
            Saiyam is a CNCF, Traefik and Portainer Ambassador, CKA/CKAD/CKS
            certified, InfluxAce. He regularly contributes to the community by
            writing blogs and organizing local meetups for K8s, Rancher, Influx,
            CNCF. He had also written a book {" "}
            <span className={styles.ap_cont_1_cloud}>
              Let's Learn CKS Scenarios {" "}
            </span>
            that helps people prepare for CKS certification.
          </p>
          <div className={styles.founder_logo}>
          <a target="_blank" href="https://www.youtube.com/c/saiyam911">
            <AiFillYoutube row="img" className={styles.social1} />
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
        <div className={styles.ap_cont_4_image_block}>
          <img className={styles.ap_cont_4_img} src={Saiyam} alt="saiyam" />
        </div>
      </div>
    </section>
  );
};
export default Founder;
