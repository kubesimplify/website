import React from 'react'
import Styles from './style.module.css'

import ambassador_logo from './img/ambassador-logo.png'

const Hero = () => {
    const hero_para="Kubesimplify Ambassador Program is one of the many initiatives of Kubesimplify community that aims to form a fraternity of individuals who wants to support us in our mission of providing cloud native education to everyone";

    return (
        <div className={Styles.hero_containner}>
            <div className={Styles.box}>
                <img src={ambassador_logo} alt="" className={Styles.logo} />
                <span>Kubesimplify Ambassadors</span>
            </div>
            
            <p className={Styles.hero_para}>{hero_para}</p>
        </div>
    )
}

export default Hero