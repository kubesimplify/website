import React from "react";
import styles from "./styles.module.css";
import Logo from "./Logo";
import { workshopData } from "../../data/data";
import priceTag from "./assests/price-tag.png";
import { AiFillCalendar, AiFillClockCircle } from "react-icons/ai";

const LiveWorkshop = () => {
  return (
    <div className={styles.liveworkshop}>
      <nav className={styles.navbar}>
        <a className={styles.nav_content} href="/" >
          <Logo />
        </a>
      </nav>
      <main>
        <div className={styles.container}>
          <div className={styles.header}>
            <div className={styles.title}>
              <h1>Welcome to Kubesimplify Workshops</h1>
            </div>
            <p>
              Kubesimplify is on a mission to simplify the cloud-native for
              everyone. <br />
              <br />
              Various initiatives such as Blogs, Twitter Threads, Twitter Spaces
              etc. have been started by us, all to <b>demystify</b> complex
              cloud-native concepts and make them simple for anyone to
              understand. <br />
              <br />
              We welcome you to yet another initiative on that path -{" "}
              <b>"Live Workshops"</b>
              <br />
              <br />
              <b>What are the Live Workshops all about?</b> <br /> <br />
              We firmly believe in the <b>learning-by-doing</b> approach &amp;
              these workshops are a perfect example of this. <br />
              <br /> Kubesimplify is bringing together{" "}
              <b>project maintainers</b> and <b>industry professionals</b> from
              all over the ecosystem under one roof to give everyone the
              best-in-className hands-on cloud-native education possible.
            </p>
            <ul className={styles.bullet_points}>
              <li>
                Each workshop will address a different topic from the
                Cloud-native ecosystem
              </li>
              <li>
                Provide you with the opportunity to connect with industry
                experts and project maintainers
              </li>
              <li>
                <b>Live QnA</b> session with the speakers
              </li>
            </ul>
            <br />
            Don't believe us? Let's hear it straight from our founder -{" "}
            <b>Saiyam Pathak</b> <br />
            <br />
            <center>
              <iframe
                className={styles.video}
                width="560"
                height="315"
                src="https://www.youtube.com/embed/oiBdx7et21w"
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              ></iframe>
            </center>
          </div>
        </div>
        <div className={styles.wrapper_flex}>
          {workshopData?.map((workshop, index) => (
            <div key={index} className={styles.speakerContainer}>
              <img
                className={styles.freeTag}
                src={priceTag}
                alt="price-tag"
                width={80}
              />
              <div className={styles.free}>FREE</div>
              <div className={styles.bannerImg}></div>
              <img
                className={styles.speaker_profile}
                src={workshop.coverPhoto}
                draggable="false"
                alt="profile img"
              />
              <h1 className={styles.name}>{workshop.workshopName}</h1>
              <div className={styles.speakerDescription}>
                <div className={styles.workshopTiming}>
                  <p>
                    <AiFillCalendar />
                    {workshop.date}
                  </p>
                  <p>
                    <AiFillClockCircle />
                    {workshop.time}
                  </p>
                </div>
                <p className={styles.description}>{workshop.workshopDesc}</p>
              </div>
              <a className={styles.workshopLink} href={workshop.workshopLink} target="_blank">
                <button className={styles.workshopBtn} id="work-1">
                  {workshop.workshopStatus}
                </button>
              </a>
            </div>
          ))}
        </div>
      </main>
    </div>
  );
};

export default LiveWorkshop;
