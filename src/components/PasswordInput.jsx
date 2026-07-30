import React from "react";
import zxcvbn from "zxcvbn";
import styles from "./PasswordInput.module.css";

function PasswordInput(props) {
  const strength = [
    { text: "Weak", color: "#ff4d4f" },
    { text: "Weak", color: "#ff4d4f" },
    { text: "Weak", color: "#ff4d4f" },
    { text: "Medium", color: "#faad14" },
    { text: "Strong", color: "#52c41a" },
  ];

  const result = zxcvbn(props.value || "");

  return (
    <div className={styles.wrapper}>
      <input
        className={styles.input}
        type={props.visibility}
        value={props.value}
        onChange={props.onChange}
        placeholder={props.placeholder}
        name={props.name}
        required
      />

      {props.mainPass && props.value?.length > 0 && (
        <p
          className={styles.strength}
          style={{ color: strength[result.score].color }}
        >
          {strength[result.score].text}
        </p>
      )}
    </div>
  );
}

export default PasswordInput;