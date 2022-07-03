import React from 'react'
import Styles from './style.module.css'

import application_illustration from './img/application_illustration.png'
import qr_code from './img/qr_code.png'

const Application = () => {
  return (
    <div className={Styles.application_containner}>
        <div className={Styles.application_containner_mini}>
            <h4 className={Styles.application_containner_mini_title}>Application</h4>
            <p className={Styles.application_containner_mini_para}>Apply for the Kubesimplify Ambassador Program now if you want to be a part of this mission!</p>
            <button className={Styles.application_containner_mini_button}>Apply Now</button>
            <img className={Styles.application_qr_code} src={qr_code} alt="qr code"/>
        </div>

        <img className={Styles.application_containner_img} src={application_illustration} alt="img not found" />
            

    </div>
  )
}

export default Application