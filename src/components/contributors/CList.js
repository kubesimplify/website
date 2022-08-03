import React from "react";
import Styles from "./style.module.css";
import contributors from "./clist.json";
import Card from "./Card";

const CList = () => {
  return (
    <div className={Styles.list_box}>
      <div className={Styles.heading}>
        <h1>Contributors</h1>
      </div>
      <div>
        {contributors.map((c, k) => (
          <Card
            name={c.name}
            twitter={c.twitter}
            linkedin={c.linkedin}
            github={c.github}
            img={c.img}
          />
        ))}
      </div>
    </div>
  );
};

export default CList;
