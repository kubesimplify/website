// import React from 'react';
// import clsx from 'clsx';
// import Layout from '@theme/Layout';
// import Link from '@docusaurus/Link';
// import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
// import styles from './index.module.css';
// import styles1 from '@site/src/components/HomepageFeatures/styles.module.css';
// import HomepageFeatures from '@site/src/components/HomepageFeatures';

// export default function Home() {
//   const {siteConfig} = useDocusaurusContext();
//   return (
//     <Layout
//       title={`Kubesimplify`}
//       description="Description will go into a meta tag in <head />">
//       <main>
//         <h1 className={styles1.hp_cont_1_cloud}>About us</h1> <br />
//         <p className={styles1.hp_cont_1_p2}>
//         An amazing community <b>KubeSimplify</b> 
//         Where we are committed to new-comers in DevOps to help them understand difficult concepts in the easiest way possible
//         Important Links<br />
//         <p className={styles1.hp_cont_1_cloud}>Blogging Site</p> https://kubesimplify.com/ <br />
//         <p className={styles1.hp_cont_1_cloud}>LinkedIn</p> https://www.linkedin.com/company/kubesimplify/ <br />
//         <p className={styles1.hp_cont_1_cloud}>Twitter</p> https://twitter.com/kubesimplify <br />
//         </p>
//       </main>
//     </Layout>
//   );
// }
import React from 'react';
import Mission from '@site/src/components/Aboutpage/Mission';
import Reach from '@site/src/components/Aboutpage/Reach';
import Founder from '@site/src/components/Aboutpage/Founder';
import Newsletter from '@site/src/components/Aboutpage/Newsletter';
import Navbar from '@site/src/theme/Navbar';
import Footer from '@site/src/theme/Footer';
import index from './index.module.css'
export default function Home() {
  return (
    <>
    <Navbar />
    <Mission/>
    <Reach />
    <Founder />
    <Footer />
  </>
  );
}