import React, { forwardRef, useImperativeHandle, useState } from "react";

const createAlphabeticCaptcha = () => {
  const letters = "ABCDEFGHJKMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz";
  let value = "";

  for (let index = 0; index < 5; index += 1) {
    value += letters[Math.floor(Math.random() * letters.length)];
  }

  return value;
};

const LetterCaptchaField = forwardRef(function LetterCaptchaField(
  {
    label = "Enter the letters shown below",
    placeholder = "Type captcha letters",
    wrapperClassName = "",
  },
  ref
) {
  const [captcha, setCaptcha] = useState(() => createAlphabeticCaptcha());
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState("");

  const refreshCaptcha = () => {
    setCaptcha(createAlphabeticCaptcha());
    setAnswer("");
    setError("");
  };

  useImperativeHandle(ref, () => ({
    validate() {
      if (answer.trim() !== captcha) {
        setError("Wrong captcha. Please enter it exactly as shown.");
        setCaptcha(createAlphabeticCaptcha());
        setAnswer("");
        return false;
      }

      setError("");
      return true;
    },
    reset() {
      refreshCaptcha();
    },
  }));

  return (
    <div className={wrapperClassName}>
      <label className="captcha-label">{label}</label>
      <div
        className="captcha-display-row"
        style={{ display: "flex", alignItems: "center", gap: "10px" }}
      >
        <span className="captcha-display">{captcha}</span>
        <button
          type="button"
          className="captcha-refresh-btn"
          title="Refresh captcha"
          aria-label="Refresh captcha"
          onClick={refreshCaptcha}
        >
          <i className="fas fa-sync-alt" aria-hidden="true" />
        </button>
      </div>
      <input
        name="captcha"
        type="text"
        required
        className="auth-input"
        placeholder={placeholder}
        value={answer}
        onChange={(event) => {
          setAnswer(event.target.value);
          if (error) {
            setError("");
          }
        }}
      />
      {error && <small className="captcha-error">{error}</small>}
    </div>
  );
});

export default LetterCaptchaField;
