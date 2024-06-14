import { useState } from "react";
import { evalTS } from "../js/lib/utils/bolt";
import { copySVGToClipboard } from "../utils/copySVGToClipboard";
import { Button } from "./Button";

const Keyflames = () => {
  const [svg, setSvg] = useState("");

  const handleMotionToSVG = async () => {
    cleanSVG();
    const objSvg = await evalTS("goKeyflames");
    setSvg(objSvg);
    copySVGToClipboard(objSvg);
  };

  const copyCurrentSVG = () => {
    copySVGToClipboard(svg);
  };

  const cleanSVG = () => {
    setSvg("");
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 4 }}>
        <Button label="CONVERT & COPY" onClick={handleMotionToSVG} />
        {/* <button onClick={cleanSVG}>CLEAN</button>
        <button onClick={copyCurrentSVG} disabled={svg === ""}>
          COPY
        </button> */}
      </div>
      {svg && (
        <div
          style={{
            marginTop: "10px",
            border: "1px solid #ccc",
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
};
export default Keyflames;
