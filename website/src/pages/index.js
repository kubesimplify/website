import React from 'react';
import Layout from '@theme/Layout';
import HomepageFeatures from '@site/src/components/HomepageFeatures';


export default function Home() {
  return (
    <Layout
      title={`Kubesimplify`}  
      description="On a mission to simplify cloud-native">
      {/* <HomepageHeader /> */}
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
