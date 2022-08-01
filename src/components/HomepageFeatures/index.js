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
import BlogsContribute from './assests/BlogsContribute.png'
import Ambassador from './assests/Ambassadors.png'

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
          <div className={styles.hp_cont_2_flex}>
            <div className={styles.hp_cont_2_1}>

              <p className={styles.hp_cont_2_p1}>
                Newsletter
              </p>

              <p className={styles.hp_cont_2_p2}>
                Subscribe to our <span className={styles.hp_cont_1_cloud}> newsletter </span>
                and never miss any <br />
                upcoming article about <span className={styles.hp_cont_1_cloud}> cloud native </span>
              </p>

            </div>

            <div className={styles.hp_cont_2_2}>

              <div className={styles.hp_cont_2a}>

                <p className={styles.hp_cont_2a_p}>
                  Join the mailing list :
                </p>  
                  <form action="https://www.getrevue.co/profile/saiyampathak/add_subscriber" method="post" id="revue-form" name="revue-form" target="_blank">
                    <div className={styles.hp_cont_2a_mail}>
                      <div className={styles.mail_inp}>
                        <input className={styles.hp_cont_2a_input} type="email" name="member[email]" id="member_email" placeholder="Email Address" />
                      </div>
                      <div className={styles.mail_btn}>
                      <button type="submit" name="member[subscribe]" id="member_submit" className={styles.hp_cont_2a_btn}>

                        <p className={styles.hp_cont_2a_btn_content}>
                          Subscribe 📨
                        </p>

                      </button>
                      </div>
                    </div>
                  </form>  
              </div>

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
              Learn cloud native technology through our videos - <br />
              CNCFMinutes, series, walkthroughs, livestreams and <br />
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
              Learn cloud native technology through our easy to <br />
              understand articles where we explain everything in a <br />
              simplified way!
            </p>

            <a href="https://kubesimplify.com/?t=1651944375419" target="_blank">

              <button className={styles.hp_cont_3_btn2}>
                <p className={styles.hp_cont_3_btn2_content}>
                  View Blogs
                  <img className={styles.hp_cont_3_linkIcon} src={Link} alt="link" />
                </p>
              </button>

            </a>

          </div>

        </div>




        {/* Workshop container start */}
        <div className={styles.hp_cont_4}>
          <div className={styles.hp_cont_4_workshop}>
            <p className={styles.hp_cont_4_p1}>
              Workshops
            </p>
            <p className={styles.hp_cont_4_p2}>
              We regularly organize workshops on various topics like <span className={styles.hp_cont_4_kubernetes}> kubernetes and cloud native. </span>These workshops give you insights into the best <span className={styles.hp_cont_4_projects}> projects and technologies </span> that are useful in the field of cloud native.
            </p>
            <button className={styles.hp_cont_4_btn1}>
              <p className={styles.hp_cont_4_btn1_content}>
                Learn more
              </p>
            </button>
          </div>
        </div>
        {/* Workshop container end */}

        {/*   Wanna contribute to Blog , container start  */}
        <div className={styles.hp_cont_5}>
          <div className={styles.hp_cont_5_blog_contributor}>

            <p className={styles.hp_cont_5_blog_p1}>
              Want to write a blog for Kubesimplify? Become a
              <span className={styles.hp_cont_5_blog_kube}>  Kubesimplify Blog Contributor </span>
            </p>

            <p className={styles.hp_cont_5_blog_p2}>
              If you have an idea for a blog and want to get it published on Kubesimplify, then reach out to us. We will publish the blog with your name! ✍🏻
            </p>
            <div className={styles.cont_5_btn}>
            <button className={styles.hp_cont_5_btn1}>
              <p className={styles.hp_cont_5_btn1_content}>
                Contribute
              </p>
            </button>
            </div>
          </div>
          <div className={styles.img} >
          <img className={styles.hp_cont_5_blog_image} src={BlogsContribute} alt="Blog" />
          </div>
        </div>
        {/*   Wanna contribute to Blog , container end  */}

        {/* Want to apply, container start */}
        <div className={styles.hp_cont_6}>
          <div className={styles.img} >
          <img className={styles.hp_cont_6_ambassador_image} src={Ambassador} alt="Blog" />
          </div>
          <div className={styles.hp_cont_6_ambassadors}>

            <p className={styles.hp_cont_6_ambassador_p1}>
              Want to be a part of this mission? Join us as a
              <span className={styles.hp_cont_6_ambassador_kube}> Kubesimplify Ambassador </span>
            </p>

            <p className={styles.hp_cont_6_ambassador_p2}>
              There are some requirements that you have to meet in order to apply for our Ambassador Program (there are perks too 🎉)
            </p>
            <div className={styles.cont_5_btn}>
              <button className={styles.hp_cont_6_btn1}>
                <p className={styles.hp_cont_6_btn1_content}>
                  Apply now
                </p>
              </button>
            </div>
          </div>
        </div>
        {/* Want to apply, container end*/}
      </div>
    </section>

  );

}
