import React from 'react'
import styles from './styles.module.css';
import Saiyam from './images/Saiyam.png';



const Reach = () => {
 return (
  <section className={styles.ap_cont_4_founder_check}>
   <div className={styles.ap_cont_4_founder}>
  <div className={styles.ap_cont_4_founder_description}>
  <p className={styles.ap_cont_4_heading}>
  Founder
  </p>
<p className={styles.ap_cont_4_para}>
Kubesimplify community is founded by <span className={styles.ap_cont_1_cloud}>Saiyam Pathak. </span>
Saiyam is a CNCF, Traefik and Portainer Ambassador, CKA/CKAD/CKS certified, InfluxAce. He regularly contributes to the community by writing blogs and organizing local meetups for K8s, Rancher, Influx, CNCF. He had also written a book <span className={styles.ap_cont_1_cloud}>Let's Learn CKS Scenarios </span> that helps people prepare for CKS certification.
  </p>
  </div>
 <div className={styles.ap_cont_4_image_block}>
  <img className={styles.ap_cont_4_img} src={Saiyam} alt="saiyam" />
</div>
</div>
  </section>

)}
export default Reach