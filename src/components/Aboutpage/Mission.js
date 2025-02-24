import React from 'react'
import styles from './styles.module.css';
import Opportunity from './images/Opportunity.png'
 // Function for Mission start
const AboutpageFeatures = () => {

  return (
  // About Page starts
  <section className={styles.about_features}>

  {/* Heading Starts */}
    <div className={styles.ap_cont_1}>
        <h2 className={styles.ap_cont_1_heading}> About Us </h2>
    </div>

{/* Mission starts */}

    <div className={styles.ap_cont_1_mission}>
      <h1 className={styles.ap_cont_1_mission_content}> On a mission to teach  
      <span className={styles.ap_cont_1_cloud}> cloud native</span> to everyone </h1>
      <h3 className={styles.ap_cont_1_mission_content_para}> Simplifying cloud native for all so that more people<br /> 
      can learn, get good jobs and earn more! </h3>
    </div>
   
{/* Our Objective summarize in image */}

      <div className={styles.ap_cont_2}>
        <div className={styles.ap_cont_2_box}>
          <img className={styles.ap_cont_2_picture} src={Opportunity} alt="Opportunities" />
        </div>
      </div>

    </section>
    
)
}
export default AboutpageFeatures