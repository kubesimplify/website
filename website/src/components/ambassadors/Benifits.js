import React from "react";
import styles from "./style.module.css";

import swags from "./img/swags.png";
import promotion from "./img/promotion.png";
import mentoring from "./img/mentoring.png";
import discord from "./img/discord.png";
import opportunities from "./img/opportunities.png";
import qrcode from "./img/qr_code.png";
import learning from "./img/learning.png";
import ambassdors from "../HomepageFeatures/assests/Ambassadors.png";

const benifits = [
  {
    logo: swags,
    title: "Swags",
    para: "You'll get amazing swags and goodies",
  },
  {
    logo: promotion,
    title: "Promotion",
    para: "Get visibility in the community whenever you contribute",
  },
  {
    logo: discord,
    title: "Private Discord",
    para: "Get access to private discord channel with other team members",
  },
  {
    logo: mentoring,
    title: "Mentoring",
    para: "Monthly coaching/mentorship session with Saiyam Pathak",
  },
  {
    logo: opportunities,
    title: "Opportunities",
    para: "Get notified if there are any internships or job opportunities",
  },
  {
    logo: learning,
    title: "Learning",
    para: "Lots of mini projects & workshops to get you the real experience",
  },
];

const Benifits = () => {
  return (
    <div className={styles.benifits_containner}>
      <h2 className={styles.benifits_title}>Benefits</h2>
      {/* <div className={styles.benifits_underline}></div> */}

      <div className={styles.benifits_flex}>
        {benifits.map((benifit, index) => (
          <div className={styles.benifits_items} key={index} >
            <img
              className={styles.benifits_items_img}
              src={benifit.logo}
              alt="img not found"
            />
            <h2 className={styles.benifits_items_heading}>{benifit.title}</h2>
            <p className={styles.benifits_items_para}>{benifit.para}</p>
          </div>
        ))}
      </div>

      <div className={styles.ambassador}>
        <div className={styles.application}>
          <div>
            <h1>Application</h1>
            <p>
              Apply for the Kubesimplify Ambassador Program now if you want to
              be a part of the mission!
            </p>
            <button className={styles.application_btn}>
              <a href="https://docs.google.com/forms/d/e/1FAIpQLSfsiMZoKAC4eulEDNVnTOaujoortij2e9goZv355N_nTdjCjA/viewform" target="_blank">Apply Now</a>
            </button>
          </div>
          <img src={qrcode} alt="image" height={175} width={175} />
        </div>
        <div className={styles.benefits_img}>
          <img className={styles.ambassador_img} src={ambassdors} alt="Blog" />
        </div>
      </div>
    </div>
  );
};

export default Benifits;
