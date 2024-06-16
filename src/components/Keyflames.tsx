import { useState } from "react";
import { evalTS } from "../js/lib/utils/bolt";
import { copySVGToClipboard } from "../utils/copySVGToClipboard";
import { previewPlayAndPause } from "../utils/previewPlayAndPause";
import { Button, Stack, Box, IconButton, Container } from "@mui/joy";
import { Play, Pause, Flame, Copy } from "lucide-react";

const Keyflames = () => {
  const [svg, setSvg] = useState("");
  const [isHoveringSvg, setIsHoveringSvg] = useState(false);
  const [isPlayingSvg, setIsPlayingSvg] = useState(true);

  const handleMotionToSVG = async () => {
    setSvg("");
    const objSvg = await evalTS("goKeyflames");
    setSvg(objSvg);
    setIsPlayingSvg(true);
  };

  const copyCurrentSVG = () => {
    copySVGToClipboard(svg);
  };

  const handlePlayPause = () => {
    setIsPlayingSvg((prevState) => !prevState);
    previewPlayAndPause();
  };

  return (
    <Container disableGutters sx={{ px: 1 }}>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        justifyContent="center"
      >
        <Button
          size="sm"
          onClick={handleMotionToSVG}
          sx={{ outline: "none" }}
          startDecorator={<Flame size={16} absoluteStrokeWidth={true} />}
        >
          CONVERT
        </Button>
        <Button
          size="sm"
          onClick={copyCurrentSVG}
          disabled={svg === ""}
          sx={{ outline: "none" }}
          color="neutral"
          startDecorator={<Copy size={16} absoluteStrokeWidth={true} />}
        >
          COPY
        </Button>
      </Stack>
      {svg && (
        <Box
          sx={{
            position: "relative",
            mt: 1,
            border: "0px solid #cccccc00",
            transition: "all 120ms ease",
            borderRadius: 10,
            ":hover": { bgcolor: "#181818" },
          }}
          onMouseEnter={() => setIsHoveringSvg(true)}
          onMouseLeave={() => setIsHoveringSvg(false)}
        >
          <Box
            onClick={handlePlayPause}
            sx={{
              cursor: "pointer",
              position: "relative",
            }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
          <Box
            onClick={handlePlayPause}
            sx={{
              m: 1,
              position: "absolute",
              top: "0%",
              left: "0%",
              cursor: "pointer",
              transition: "all 120ms ease",
              opacity: isHoveringSvg ? 1 : 0,
            }}
          >
            {isPlayingSvg ? <Pause /> : <Play />}
          </Box>
        </Box>
      )}
    </Container>
  );
};
export default Keyflames;
