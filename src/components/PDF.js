import React from "react";
import styles from "../components/HomepageFeatures/styles.module.css";

export default function PDF() {
  return (
    <>
      <div className={styles.hp_cont_3_h1}>
        <h1>Collaborate with Us</h1>
      </div>
      <iframe
        src="https://drive.google.com/file/d/1ux5xvSdEaLIdbJFCx4a63RE9u1Bpp37U/preview"
        width="100%"
        height="700vh"
        allow="autoplay"
      ></iframe>
    </>
  );
}
