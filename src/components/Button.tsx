import { useState } from "react";

interface ButtonProps {
  label: string;
  disabled?: boolean;
  onClick: React.MouseEventHandler<HTMLButtonElement>;
  variant?: "primary" | "neutral";
}
export const Button: React.FC<ButtonProps> = ({
  onClick,
  label,
  disabled = false,
  variant = "primary",
}) => {
  const [isHover, setIsHover] = useState(false);

  const handleMouseEnter = () => {
    setIsHover(true);
  };
  const handleMouseLeave = () => {
    setIsHover(false);
  };

  const buttonStyle: React.CSSProperties = {
    border: "none",
    color: isHover ? "#121212" : "#eee",
    padding: "8px",
    textAlign: "center",
    textDecoration: "none",
    outline: "none",
    display: "inline-block",
    fontSize: "12px",
    borderRadius: "6px",
    fontWeight: 800,
    transition: "all 0.3s ease",
    backgroundColor: isHover ? "#fb001f" : "#d30024",
    cursor: disabled ? "not-allowed" : "pointer",
    opacity: disabled ? 0.5 : 1,
  };

  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={buttonStyle}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      {label}
    </button>
  );
};
