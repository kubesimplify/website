import React from 'react'
import styles from './styles.module.css';


//  Using this image in .ap_cont_2_box
// const mission = {
//    box: {
//     Svg: require('/images/opportunity.svg').default
//   }
// };
 // Function for Mission start
const AboutpageFeatures = () => {

  return (

    // About Page starts

    <section className={styles.about_features}>

     {/* Heading Starts */}

        <div className={styles.ap_cont_1}>
        <p className={styles.ap_cont_1_heading}> About us </p>
        <hr className={styles.ap_cont_1_heading_line}/>
        </div>

      {/* Mission starts */}

        <div className={styles.ap_cont_1_mission}>
        <p className={styles.ap_cont_1_mission_content}> On a mission to teach  
        <span className={styles.ap_cont_1_cloud}> cloud native</span> 
        to everyone </p>
        <p className={styles.ap_cont_1_mission_content_para}> Simplifying cloud native for all so that more people</p> 
        <p className={styles.ap_cont_1_mission_content_para_check}> can learn, get good jobs and earn more! </p>
         </div>
   
       {/* Our Objective summarize in image */}

       <div className={styles.ap_cont_2}>
       <div className={styles.ap_cont_2_box}>
       {/* <mission.box.Svg className={styles.ap_cont_2_box_image} role="img" /> */}
      </div>
      </div>

    </section>
    
)
}
export default AboutpageFeatures