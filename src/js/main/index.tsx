import React from "react";
import ReactDOM from "react-dom/client";
import { initBolt } from "../lib/utils/bolt";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { extendTheme } from "@mui/joy";

const theme = extendTheme({
  colorSchemes: {
    dark: {
      palette: {
        primary: {
          50: "#fb001f",
          100: "#ffbfc0",
          200: "#ffa2a3",
          300: "#ff6e70",
          400: "#ff1518",
          500: "#c70004",
          600: "#b00003",
          700: "#840001",
          800: "#480001",
          900: "#260001",
        },
        background: {
          body: "#232323",
          level1: "#3d3d3d",
          level2: "#575757",
          level3: "#707070",
          popup: "#232323",
          surface: "#3d3d3d",
          tooltip: "#707070",
        },
      },
    },
  },
});

export default theme;

import Main from "./main";

initBolt();

ReactDOM.createRoot(document.getElementById("root") as HTMLElement).render(
  <React.StrictMode>
    <CssVarsProvider defaultMode="dark" theme={theme}>
      <CssBaseline />
      <Main />
    </CssVarsProvider>
  </React.StrictMode>
);
