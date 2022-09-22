import React from 'react';
import Mission from '@site/src/components/Aboutpage/Mission';
import Reach from '@site/src/components/Aboutpage/Reach';
import Founder from '@site/src/components/Aboutpage/Founder';
import Layout from '@theme/Layout';
import Team from '../components/team/Team';
import { teamData } from '../data/data';

export default function Home() {
  return (
    <Layout>
      <Mission/>
      <Reach />
      <Founder />
      <Team data={teamData} heading={"Kubesimplify Ambassadors"} slider={true} />
    </Layout>
  );
}