import { useState } from "react";

interface ButtonProps {
  label: string;
  disabled?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
}
export const Button: React.FC<ButtonProps> = ({
  onClick,
  label,
  disabled = false,
}) => {
  const [fillColor, setFillColor] = useState<string>("#d30024");
  const [textColor, setTextColor] = useState<string>("#eee");

  const setStyleIddle = () => {
    setFillColor("#d30024");
    setTextColor("#eee");
  };

  const setStyleHover = () => {
    setFillColor("#fb001f");
    setTextColor("#121212");
  };

  const setStyleClick = () => {
    setFillColor("#ff3939");
    setTextColor("#121212");
  };

  const buttonStyle: React.CSSProperties = {
    border: "none",
    color: textColor,
    padding: "4px 8px",
    textAlign: "center",
    textDecoration: "none",
    outline: "none",
    display: "inline-block",
    fontSize: "12px",
    borderRadius: "6px",
    fontWeight: 800,
    transition: "all 0.3s ease",
    backgroundColor: fillColor,
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
    userSelect: "none",
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      onMouseEnter={setStyleHover}
      onMouseLeave={setStyleIddle}
      onMouseDown={setStyleClick}
      onMouseUp={setStyleHover}
    >
      {label}
    </button>
  );
};
