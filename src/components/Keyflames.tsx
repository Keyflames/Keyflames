import { useState } from "react";
import { evalTS } from "../js/lib/utils/bolt";
import { copySVGToClipboard } from "../utils/copySVGToClipboard";
import { Button } from "./Button";
import { previewPlayAndPause } from "../utils/previewPlayAndPause";

const Keyflames = () => {
  const [svg, setSvg] = useState("");

  const handleMotionToSVG = async () => {
    setSvg("");
    const objSvg = await evalTS("goKeyflames");
    setSvg(objSvg);
  };

  const copyCurrentSVG = () => {
    copySVGToClipboard(svg);
  };

  return (
    <div>
      <div style={{ display: "flex", gap: 10 }}>
        <Button label="CONVERT" onClick={handleMotionToSVG} />
        <Button label="COPY" onClick={copyCurrentSVG} disabled={svg === ''} />
      </div>
      {svg && (
        <div
          onClick={previewPlayAndPause}
          style={{
            marginTop: "10px",
            border: "1px solid #ccc",
            cursor: "pointer",
          }}
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      )}
    </div>
  );
};
export default Keyflames;
