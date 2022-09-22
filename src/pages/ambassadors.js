import React, { useState } from 'react'
import Benifits from '../components/ambassadors/Benifits'
import Criteria from '../components/ambassadors/Criteria'
import Hero from '../components/ambassadors/Hero'
import Application from '../components/ambassadors/Application'
import FAQs from '../components/ambassadors/FAQs'
import Team from '../components/team/Team'
import Layout from '@theme/Layout';
import { teamData } from '../data/data'

const Ambassdors = () => {
  const slider = false;
  return (
    <Layout>
      <Hero />
      <Criteria />
      <Benifits />
      <Team data={teamData} heading={"Current Ambassadors"} slider={false} />
      <FAQs />
    </Layout>
  )
}

export default Ambassdors
