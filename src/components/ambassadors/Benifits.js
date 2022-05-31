import React from 'react'
import Styles from './style.module.css'

import swags from './img/swags.png'
import promotion from './img/promotion.png'
import mentoring from './img/mentoring.png'
import discord from './img/discord.png'
import opportunities from './img/opportunities.png'
import learning from './img/learning.png'


const benifits = [
    {
        'logo': swags,
        'title': 'Swags',
        'para': "You'll get amazing swags and goodies"
    },
    {
        'logo': promotion,
        'title': 'Promotion',
        'para': "Get visibility in the community whenever you contribute"
    },
    {
        'logo': discord,
        'title': 'Private Discord',
        'para': "Get access to private discord channel with other team members"
    },
    {
        'logo': mentoring,
        'title': 'Mentoring',
        'para': "Monthly coaching/mentorship session with Saiyam Pathak"
    },
    {
        'logo': opportunities,
        'title': 'Opportunities',
        'para': "Get notified if there are any internships or job opportunities"
    },
    {
        'logo': learning,
        'title': 'Learning',
        'para': "Lots of mini projects & workshops to get you the real experience"
    }
]


const Benifits = () => {
    return (
        <div className={Styles.benifits_containner}>
            <h2 className={Styles.benifits_title}>Benefits</h2>
            <div className={Styles.benifits_underline}></div>

            <div className={Styles.benifits_flex}>

                {benifits.map(function (benifit) {
                    return (
                        <div className={Styles.benifits_items}>
                            <img className={Styles.benifits_items_img} src={benifit.logo} alt="" />
                            <h2 className={Styles.benifits_items_heading}>{benifit.title}</h2>
                            <p className={Styles.benifits_items_para}>{benifit.para}</p>
                        </div>

                    )
                })};

            </div>
        </div>

    )
}


export default Benifits