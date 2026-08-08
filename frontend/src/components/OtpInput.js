// components/OtpInput.js — 6-box one-time-code entry
import React, { useRef, useEffect } from "react";

const LENGTH = 6;

/**
 * Controlled OTP field. `value` is the full code string; `onChange` receives the
 * updated string. Handles auto-advance, backspace-to-previous, arrow keys, and
 * pasting a whole code into any box.
 */
const OtpInput = ({ value = "", onChange, onComplete, disabled = false, autoFocus = true }) => {
  const inputs = useRef([]);
  const digits = value.padEnd(LENGTH, " ").slice(0, LENGTH).split("");

  useEffect(() => {
    if (autoFocus) inputs.current[0]?.focus();
  }, [autoFocus]);

  const setDigit = (index, digit) => {
    const next = digits.map((d, i) => (i === index ? digit : d)).join("").replace(/\s/g, " ");
    const cleaned = next.replace(/\s+$/, "");
    onChange(cleaned);
    if (cleaned.replace(/\s/g, "").length === LENGTH && !cleaned.includes(" ")) {
      onComplete?.(cleaned);
    }
  };

  const handleChange = (index, raw) => {
    const digit = raw.replace(/\D/g, "").slice(-1);
    if (!digit) return;
    setDigit(index, digit);
    if (index < LENGTH - 1) inputs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      e.preventDefault();
      if (digits[index] !== " " && digits[index] !== "") {
        setDigit(index, " ");
      } else if (index > 0) {
        setDigit(index - 1, " ");
        inputs.current[index - 1]?.focus();
      }
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < LENGTH - 1) {
      inputs.current[index + 1]?.focus();
    }
  };

  // Let users paste the code straight from their email client.
  const handlePaste = (e) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, LENGTH);
    if (!pasted) return;
    onChange(pasted);
    const focusIndex = Math.min(pasted.length, LENGTH - 1);
    inputs.current[focusIndex]?.focus();
    if (pasted.length === LENGTH) onComplete?.(pasted);
  };

  return (
    <div className="otp-input-row" onPaste={handlePaste}>
      {Array.from({ length: LENGTH }).map((_, i) => (
        <input
          key={i}
          ref={(el) => (inputs.current[i] = el)}
          className={`otp-box ${digits[i] && digits[i] !== " " ? "filled" : ""}`}
          type="text"
          inputMode="numeric"
          autoComplete={i === 0 ? "one-time-code" : "off"}
          maxLength={1}
          disabled={disabled}
          value={digits[i] === " " ? "" : digits[i]}
          onChange={(e) => handleChange(i, e.target.value)}
          onKeyDown={(e) => handleKeyDown(i, e)}
          onFocus={(e) => e.target.select()}
          aria-label={`Digit ${i + 1} of ${LENGTH}`}
        />
      ))}
    </div>
  );
};

export default OtpInput;
