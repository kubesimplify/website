//The naming convention used in this file is mentioned below :
// 1. hp refers to Homepage
// 2. cont refers to Container
// 3. p refers to Paragraph
// (hp_cont_3_btn2_content) refers to "Content present in Button number 2  of Container number 3 on Homepage"

import React from "react";
import styles from "./styles.module.css";
import comments from "./assests/Comments.png";
import reactions from "./assests/Reactions.png";
import github from "./assests/github.webp";
import Newsletter from '../newsletter/Newsletter';
import lego from "./assests/lego.webp";
import vidIcon from "./assests/Video-Icon.png";
import blogIcon from "./assests/Blog-Icon.png";
import Link from "./assests/Link.png";
import BlogsContribute from "./assests/BlogsContribute.png";
import Ambassador from "./assests/Ambassadors.png";
import workshop from "./assests/workshop.png";

export default function HomepageFeatures() {
  return (
    <section className={styles.features}>
      <div className={styles.hp}>
        {/* first portion(container) of the homepage */}
        <div className={styles.hp_cont_1}>
          <div className={styles.cont_1_content}>
            <p className={styles.hp_cont_1_p1}>
              On a mission to <br />
              teach <span className={styles.hp_cont_1_cloud}>
                cloud native
              </span>{" "}
              <br />
              to everyone.
            </p>

            <p className={styles.hp_cont_1_p2}>
              We breakdown complicated concepts of <br />
              cloud native into an easy to understand <br />
              manner through our blogs and video content.
            </p>

            <a href="https://discord.gg/26Z384WSPB" target="_blank">
              <button className={styles.hp_cont_1_btn}>
                Start learning
              </button>
            </a>
          </div>
          <div className={styles.cont_1_img}>
            <p>Checkout our Blogs</p>

            <div className={styles.hp_cont_1_img3}>
              <img
                src={comments}
                alt="comments"
              />
            </div>

            <div className={styles.hp_cont_1_img1}>
              <a href="https://blog.kubesimplify.com/get-good-at-git" target="_blank">
                <img
                  src={github}
                  alt="github"
                />
                  <p>Get Good at Git </p>
              </a>
            </div>

            <div className={styles.hp_cont_1_img2}>
              <a href="https://blog.kubesimplify.com/getting-started-with-ko-a-fast-container-image-builder-for-your-go-applications" target="_blank">
                <img
                  src={lego}
                  alt="lego"
                />
                  <p>Getting started with Ko</p>
              </a>
            </div>

            <div className={styles.hp_cont_1_img4} >
              <img
                src={reactions}
                alt="reactions"
              />
            </div>
          </div>
        </div>

        {/* second portion(container) of the homepage */}
        <div className={styles.hp_cont_3}>
          <div className={styles.hp_cont_3_h1}>
          <h1>Learn cloud native</h1>
          </div>
          <div className={styles.hp_cont_3_section}>

          <div className={styles.hp_cont_3_vid}>
            <p className={styles.hp_cont_3_vid_p1}>Youtube</p>

            <h2 className={styles.hp_cont_3_vid_h2}>
              Video Content
              <img
                className={styles.hp_cont_3_vidIcon}
                src={vidIcon}
                alt="Video_Icon"
              />
            </h2>

            <p className={styles.hp_cont_3_vid_p3}>
              Learn cloud native technology through our videos - 
              CNCFMinutes, series, walkthroughs, livestreams and 
              many more!
            </p>

            <a href="https://www.youtube.com/c/saiyam911" target="_blank">
              <button className={styles.hp_cont_3_btn1}>
                <p className={styles.hp_cont_3_btn1_content}>
                  View Videos
                  <img
                    className={styles.hp_cont_3_linkIcon}
                    src={Link}
                    alt="link"
                  />
                </p>
              </button>
            </a>
          </div>

          <div className={styles.hp_cont_3_blog}>
            <p className={styles.hp_cont_3_blog_p1}>Hashnode</p>

            <h2 className={styles.hp_cont_3_blog_h2}>
              Blog Content
              <img
                className={styles.hp_cont_3_blogIcon}
                src={blogIcon}
                alt="Blog_Icon"
              />
            </h2>

            <p className={styles.hp_cont_3_blog_p3}>
              Learn cloud native technology through our easy to 
              understand articles where we explain everything in a 
              simplified way!
            </p>

            <a href="https://blog.kubesimplify.com/" target="_blank">
              <button className={styles.hp_cont_3_btn2}>
                <p className={styles.hp_cont_3_btn2_content}>
                  View Blogs
                  <img
                    className={styles.hp_cont_3_linkIcon}
                    src={Link}
                    alt="link"
                  />
                </p>
              </button>
            </a>
          </div>
          </div>

        </div>
        
        {/* Workshop container start */}
        <div className={styles.hp_cont_4}>
          <div className={styles.hp_cont_4_content}>

          <div className={styles.hp_cont_4_workshop}>
            <span className={styles.hp_cont_4_p1}>Workshops <span>FREE</span></span>
            <p className={styles.hp_cont_4_p2}>
              We regularly organize workshops on various topics like{" "}
              <span className={styles.hp_cont_4_kubernetes}>
                {" "}
                kubernetes and cloud native.{" "}
              </span>
              These workshops give you insights into the best{" "}
              <span className={styles.hp_cont_4_projects}>
                {" "}
                projects and technologies{" "}
              </span>{" "}
              that are useful in the field of cloud native.
            </p>
            <button className={styles.hp_cont_4_btn1}>
              <a href="/workshops">
                <p className={styles.hp_cont_4_btn1_content}>Learn more</p>
              </a>
            </button>
          </div>
          <div className={styles.hp_cont_4_img}>
            <img
              src={workshop}
              alt="workshop"
            />
          </div>
          </div>

        </div>
        {/* Workshop container end */}        

        {/*   Wanna contribute to Blog , container start  */}
        <div className={styles.hp_cont_5}>
          <div className={styles.hp_cont_5_blog_contributor}>
            <p className={styles.hp_cont_5_blog_p1}>
              Want to write a blog for Kubesimplify? Become a
            </p>
              <span className={styles.hp_cont_5_blog_kube}>
                {" "}
                Kubesimplify Blog Contributor{" "}
              </span>

            <p className={styles.hp_cont_5_blog_p2}>
              If you have an idea for a blog and want to get it published on
              Kubesimplify, then reach out to us. We will publish the blog with
              your name! ✍🏻
            </p>
            <div className={styles.cont_5_btn}>
              <button className={styles.hp_cont_5_btn1}>
                <a href="https://discord.gg/26Z384WSPB" target="_blank">
                  <p className={styles.hp_cont_5_btn1_content}>Contribute</p>
                </a>
              </button>
            </div>
          </div>
          <div className={styles.hp_cont_5_img}>
            <img
              className={styles.hp_cont_5_blog_image}
              src={BlogsContribute}
              alt="Blog"
            />
          </div>
        </div>
        {/*   Wanna contribute to Blog , container end  */}

        {/* Want to apply, container start */}
        <div className={styles.hp_cont_6}>
          <div className={styles.hp_cont_6_img}>
            <img
              className={styles.hp_cont_6_ambassador_image}
              src={Ambassador}
              alt="Blog"
            />
          </div>
          <div className={styles.hp_cont_6_ambassadors}>
            <p className={styles.hp_cont_6_ambassador_p1}>
              Want to be a part of this mission? Join us as a
            </p>
              <span className={styles.hp_cont_6_ambassador_kube}>
                {" "}
                Kubesimplify Ambassador{" "}
              </span>

            <p className={styles.hp_cont_6_ambassador_p2}>
              There are some requirements that you have to meet in order to
              apply for our Ambassador Program (there are perks too 🎉)
            </p>
            <div className={styles.cont_5_btn}>
              <button className={styles.hp_cont_6_btn1}>
                <a href="https://forms.gle/JNMWzSaLYGBVEp6W7">
                  <p className={styles.hp_cont_6_btn1_content}>Apply now</p>
                </a>
              </button>
            </div>
          </div>
        </div>
        {/* Want to apply, container end*/}

        {/* third portion(container) of the homepage */}
        
        <Newsletter />
      </div>
    </section>
  );
}
