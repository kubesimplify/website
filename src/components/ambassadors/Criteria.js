import React from 'react'
import Styles from './style.module.css'

import inquisitive from './img/inquisitive.png'
import involvement from './img/involvement.png'
import content_creation from './img/contentcreation.png'


const criterias = [
  {
    'logo': inquisitive,
    'title': "inquisitive",
    'para': "Strong will power to learn cloud native and new things"
  },
  {
    'logo': involvement,
    'title': "involvement",
    'para': "Support & be active in the community, discord, twitter"
  },
  {
    'logo': content_creation,
    'title': "content creation",
    'para': "Produce content for Kubesimplify like videos, blogs, livestreams"
  }
];


const Criteria = () => {
  return (
    <div className={Styles.criteria_containner}>
      <h2 className={Styles.criteria_title}> Criteria </h2>
      <div className={Styles.criteria_underline}></div>

      <div className={Styles.criteria_flex}>

        {criterias.map(function (criteria) {
          return (
            <div className={Styles.criteria_items}>
              <img className={Styles.criteria_items_img} src={criteria.logo} alt="error" />
              <h4 className={Styles.criteria_items_heading}>{criteria.title}</h4>
              <span className={Styles.criteria_items_para}>{criteria.para}</span>
            </div>
          )
        })}
      </div>

    </div>
  )
}


export default Criteria