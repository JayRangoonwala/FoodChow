import React from "react";
// Import Css Files
import styles from "./Cards.module.css";

// Import React Icons
import { FaCircle } from "react-icons/fa";

// import Images
import burgerImg from "@/public/images/deal-burger.png";

import Image from "next/image";
import { Button } from "@mui/material";

const CardDesign = () => {
  return (
    <div className={styles.CardContainer}>
      <div className={styles.cardImg}>
        <Image src={burgerImg} alt="burger-img" />
      </div>
      <div className={styles.CardContent}>
        <h4 className={styles.DealName}>McDelightCombo</h4>
        <p>Lorem ipsum, dolor sit amet..</p>
        <div className={styles.deliveryType}>
          <div className={styles.typesName}>
            <FaCircle className={styles.Icon} />
            <h6>Take Away</h6>
          </div>
          <div className={styles.typesName}>
            <FaCircle className={styles.Icon} />
            <h6>Dine In</h6>
          </div>
          <div className={styles.typesName}>
            <FaCircle className={styles.Icon} />
            <h6>Delivery</h6>
          </div>
        </div>
      </div>
      <div className={styles.CardActions}>
        <h4>Rs 250</h4>
        <Button variant="outlined" className={styles.addBtn}>
          {" "}
          + ADD{" "}
        </Button>
      </div>
    </div>
  );
};

export default CardDesign;
