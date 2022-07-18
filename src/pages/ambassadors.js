import React from 'react'
import Benifits from '../components/ambassadors/Benifits'
import Criteria from '../components/ambassadors/Criteria'
import Hero from '../components/ambassadors/Hero'
import Application from '../components/ambassadors/Application'
import FAQs from '../components/ambassadors/FAQs'
import Navbar from '../theme/Navbar'
import Footer from '../theme/Footer'

const Ambassdors = () => {
  return (
    <>
      <Navbar />
      <Hero />
      <Criteria />
      <Benifits />
      <Application />
      <FAQs />
      <Footer />
    </>
  )
}

export default Ambassdors
