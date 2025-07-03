import React from "react";
import styles from "./DealContent.module.css";

// Import Components
import CardDesign from "./CardDesign/Cards.js";

// Import React Icons
import { IoSearchOutline } from "react-icons/io5";

const DealContent = () => {
  return (
    <div className={styles.cardDeals}>
      <div className={styles.dealsHeading}>
        <div className={styles.left}>
          <h4>
            Deals <span>(3)</span>
          </h4>
        </div>
        <div className={styles.right}>
          <div className={styles.inputBox}>
            <input type="text" placeholder="Search For Dishes" />
            <IoSearchOutline />
          </div>
        </div>
      </div>

      <div className={styles.Cards}>
        <CardDesign />
        <CardDesign />
        <CardDesign />
      </div>
    </div>
  );
};

export default DealContent;
