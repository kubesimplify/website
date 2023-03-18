import React from "react";
import styles from "./styles.module.css";

const Newsletter = () => {
  return (
    <div className={styles.newsletter_section} >

      <div className={styles.newsletter_flex}>

        {/* first div */}

        <div className={styles.newsletter_first}>
          <p className={styles.newsletter_p1}>Newsletter</p>

          <p className={styles.newsletter_p2}>
            Subscribe to our{" "}
            <span className={styles.hp_cont_1_cloud}> newsletter </span>
            and never miss any <br />
            upcoming article about{" "}
            <span className={styles.hp_cont_1_cloud}> cloud native </span>
          </p>
        </div>

        {/* second div */}

        <div className={styles.newsletter_second}>
          <div className={styles.newsletter_a}>
            <p className={styles.newsletter_a_p}>Join the mailing list:</p>
            <form
              action="https://saiyampathak.substack.com/subscribe"
              method="get"
              id="revue-form"
              name="revue-form"
              target="_blank"
            >
              <div className={styles.newsletter_a_mail}>
                <button
                  type="submit"
                  name="member[subscribe]"
                  id="member_submit"
                  className={styles.newsletter_a_btn}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Newsletter;
