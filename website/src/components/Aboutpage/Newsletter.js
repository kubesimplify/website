import React from 'react'
import styles from './styles.module.css';
const Newsletter = () => {
return (
 <div className={styles.ap_cont_6}>

<div className={styles.ap_cont_6_1}>

<p className={styles.ap_cont_6_p1}>
 Newsletter
</p>

 <p className={styles.ap_cont_6_p2}>
   Subscribe to our <span className={styles.ap_cont_1_cloud}> newsletter </span>
   and never miss any <br/>
   upcoming article about <span className={styles.ap_cont_1_cloud}> cloud native </span>
 </p>

</div>

<div className={styles.ap_cont_6_2}>

  <div className={styles.ap_cont_6a}>

     <p className={styles.ap_cont_6a_p}>
       Join the mailing list :
     </p>

     <input className={styles.ap_cont_6a_input} type="email" placeholder="Email Address"/>

     <button className={styles.ap_cont_6a_btn}>

       <p className={styles.ap_cont_6a_btn_content}>
         Subscribe 📨
       </p>

     </button>

    </div>

  </div>

</div>
    )
}
export default Newsletter