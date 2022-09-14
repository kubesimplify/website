import React from 'react'
import Benifits from '../components/ambassadors/Benifits'
import Criteria from '../components/ambassadors/Criteria'
import Hero from '../components/ambassadors/Hero'
import Application from '../components/ambassadors/Application'
import FAQs from '../components/ambassadors/FAQs'
import Layout from '@theme/Layout';

const Ambassdors = () => {
  return (
    <Layout>
      <Hero />
      <Criteria />
      <Benifits />
      <FAQs />
    </Layout>
  )
}

export default Ambassdors
