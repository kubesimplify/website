import React from 'react';
import Mission from '@site/src/components/Aboutpage/Mission';
import Reach from '@site/src/components/Aboutpage/Reach';
import Founder from '@site/src/components/Aboutpage/Founder';
import Layout from '@theme/Layout';
import Newsletter from '../components/newsletter/Newsletter';
import Team from '../components/team/Team';

export default function Home() {
  return (
    <Layout>
      <Mission/>
      <Reach />
      <Founder />
      <Newsletter />
      <Team heading={"Kubesimplify Ambassadors"} slider={true} />
    </Layout>
  );
}