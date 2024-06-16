import { Container, IconButton, Stack, Tooltip, Typography } from "@mui/joy";
import { Github } from "lucide-react";
import { evalTS } from "../js/lib/utils/bolt";

export const Footer = () => {
  const handleOpenRepo = () => {
    evalTS("openWeb", "https://github.com/Keyflames/Keyflames");
  };

  return (
    <Container
      sx={{
        py: 1,
        bgcolor: "background.level1",
        position: "fixed",
        bottom: 0,
      }}
      disableGutters={true}
      maxWidth={false}
    >
      <Stack
        direction="row"
        justifyContent="center"
        alignItems="center"
        spacing={1}
      >
        <Typography
          level="body-sm"
          textAlign="center"
          sx={{ userSelect: "none" }}
        >
          Beta 0.1.0
        </Typography>
        <Tooltip title='give us a star :)' placement="top" size="md">
          <IconButton onClick={handleOpenRepo} sx={{ outline: "none" }}>
            <Github size={20} absoluteStrokeWidth={true} />
          </IconButton>
        </Tooltip>
      </Stack>
    </Container>
  );
};
