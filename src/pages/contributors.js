import React from "react";
import HeroBox from "../components/contributors/HeroBox";
import CList from "../components/contributors/CList";
import Layout from '@theme/Layout';

const Contributors = () => {
  return (
    <Layout>
      <HeroBox />
      <CList />
    </Layout>
  )
}

export default Contributors;
