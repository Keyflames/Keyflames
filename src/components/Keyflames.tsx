import { useState } from "react";
import { evalTS } from "../js/lib/utils/bolt";

const Keyflames = () => {
  const [svg, setSvg] = useState("");

  const handleMotionToSVG = async () => {
    setSvg('loading...');
    const objSvg = await evalTS("example");
    setSvg(objSvg);
  };

  return (
    <div>
      <h1 style={{ color: "#ff5b3b" }}>Hello Keyflames!</h1>
      <button onClick={handleMotionToSVG}>GO</button>
      <textarea value={svg} />
    </div>
  );
};
export default Keyflames;
