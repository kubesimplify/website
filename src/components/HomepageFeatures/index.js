//The naming convention used in this file is mentioned below :
// 1. hp refers to Homepage
// 2. cont refers to Container
// 3. p refers to Paragraph
// (hp_cont_3_btn2_content) refers to "Content present in Button number 2  of Container number 3 on Homepage"

import React from 'react';
import styles from './styles.module.css';
import comments from './assests/Comments.png'
import reactions from './assests/Reactions.png'
import computer from './assests/Computer.png'
import githubActions from './assests/github-actions.png'
import vidIcon from './assests/Video-Icon.png'
import blogIcon from './assests/Blog-Icon.png'
import Link from './assests/Link.png'

export default function HomepageFeatures() {

  return (
    
    <section className={styles.features}>

      <div className={styles.hp}>

        {/* first portion(container) of the homepage */}
        <div className={styles.hp_cont_1}>

          <p className={styles.hp_cont_1_p1}>
            On a mission to <br />
            teach <span className={styles.hp_cont_1_cloud}>cloud native</span> <br />
            to everyone.
          </p>

          <p className={styles.hp_cont_1_p2}>
            We breakdown complicated concepts of <br />
            cloud native into an easy to understand <br />
            manner through our blogs and video content.
          </p>

          <button className={styles.hp_cont_1_btn}>

            <p className={styles.hp_cont_1_btn_content}> 
              Start learning
            </p>

          </button>
      
          <img className={styles.hp_cont_1_img1} src={githubActions} alt="github_actions" />
          <img className={styles.hp_cont_1_img3} src={comments} alt="comments" />
          <img className={styles.hp_cont_1_img2} src={computer} alt="computer" />
          <img className={styles.hp_cont_1_img4} src={reactions} alt="reactions" />

         </div>

        {/* second portion(container) of the homepage */}
        <div className={styles.hp_cont_2}>

           <div className={styles.hp_cont_2_1}>

           <p className={styles.hp_cont_2_p1}>
            Newsletter
           </p>

            <p className={styles.hp_cont_2_p2}>
              Subscribe to our <span className={styles.hp_cont_1_cloud}> newsletter </span>
              and never miss any <br/>
              upcoming article about <span className={styles.hp_cont_1_cloud}> cloud native </span>
            </p>

          </div>

           <div className={styles.hp_cont_2_2}>
           
             <div className={styles.hp_cont_2a}>

                <p className={styles.hp_cont_2a_p}>
                  Join the mailing list :
                </p>

                <input className={styles.hp_cont_2a_input} type="email" placeholder="Email Address"/>

                <button className={styles.hp_cont_2a_btn}>

                  <p className={styles.hp_cont_2a_btn_content}>
                    Subscribe 📨
                  </p>

                </button>

               </div>

             </div>

          </div>

        {/* third portion(container) of the homepage */}
        <div className={styles.hp_cont_3}>

         <div className={styles.hp_cont_3_vid}>

            <p className={styles.hp_cont_3_vid_p1}>
              Youtube
            </p>

            <p className={styles.hp_cont_3_vid_p2}>
              Video Content 
              <img className={styles.hp_cont_3_vidIcon} src={vidIcon} alt="Video_Icon" />
            </p>

            <p className={styles.hp_cont_3_vid_p3}>
              Learn cloud native technology through our videos - <br/>
              CNCFMinutes, series, walkthroughs, livestreams and <br/>
              many more!
            </p>

            <a href="https://www.youtube.com/c/saiyam911" target="_blank">

              <button className={styles.hp_cont_3_btn1}>

                <p className={styles.hp_cont_3_btn1_content}> 
                  View Videos
                  <img className={styles.hp_cont_3_linkIcon} src={Link} alt="link" />
                </p>

              </button>
            </a>
          </div>

          <div className={styles.hp_cont_3_blog}>
            <p className={styles.hp_cont_3_blog_p1}>
              Hashnode
            </p>

            <p className={styles.hp_cont_3_blog_p2}>
              Blog Content 
            <img className={styles.hp_cont_3_blogIcon} src={blogIcon} alt="Blog_Icon" />
            </p>

            <p className={styles.hp_cont_3_blog_p3}>
              Learn cloud native technology through our easy to <br/>
              understand articles where we explain everything in a <br/> 
              simplified way!
            </p>

            <a href="https://kubesimplify.com/?t=1651944375419" target="_blank">

              <button  className={styles.hp_cont_3_btn2}>
                <p className={styles.hp_cont_3_btn2_content}> 
                   View Blogs 
                  <img className={styles.hp_cont_3_linkIcon} src={Link} alt="link" />
                </p>

              </button>

            </a>

          </div>

        </div>

       </div>

    </section>

  );

}
