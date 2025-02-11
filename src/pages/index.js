import React from "react";
import Layout from "@theme/Layout";
import HomepageFeatures from "@site/src/components/HomepageFeatures";

export default function Home() {
  return (
    <Layout
      title={`Kubesimplify`}
      description="KubeSimplify: Your Gateway to Cloud Native, AI , WASM & Beyond!"
    >
      {/* <HomepageHeader /> */}
      <main>
        <HomepageFeatures />
      </main>
    </Layout>
  );
}
