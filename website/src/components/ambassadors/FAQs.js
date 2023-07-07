import React from "react";
import Styles from "./style.module.css";

const faqs = [
  {
    question: "Q. How do I define being a Kubesimplify Ambassador?",
    answer:
      "You being a Kubesimplify Ambassador should be referred to as “Volunteer Experience” and not as “Employment” or “Work Experience”.",
  },
  {
    question: "Q. Can I be removed as a Kubesimplify Ambassador?",
    answer:
      "Kubesimplify will provide you with the support and other perks but if you are not active in the community or do not participate regularly, you will be removed as an Ambassador.",
  },
  {
    question:
      "Q. Can I use the logo of Kubesimplify to represent myself as an Ambassador?",
    answer:
      "You cannot use the logo as your profile picture but you can use it if you are mentioning yourself as a Kubesimplify Ambassador.",
  },
];

const FAQs = () => {
  return (
    <div className={Styles.FAQs_containner}>
      <div className={Styles.faq_section}>
        <h2 className={Styles.FAQs_title}>FAQs</h2>

        <div className={Styles.FAQs_flex}>
          {faqs.map((faq, index) => (
            <div key={index}>
              <p className={Styles.FAQs_question}>{faq.question} </p>
              <p className={Styles.FAQs_answer}>{faq.answer}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQs;
