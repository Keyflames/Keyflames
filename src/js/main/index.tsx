import React from "react";
import ReactDOM from "react-dom/client";
import { initBolt } from "../lib/utils/bolt";
import { CssBaseline, CssVarsProvider } from "@mui/joy";
import { extendTheme } from "@mui/joy";

const theme = extendTheme({
  breakpoints: {
    values: {
      xs: 0,
      sm: 200,
      md: 800,
      lg: 1200,
      xl: 1536,
    },
  },
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
        neutral: {
          50: "#fcfcfc",
          100: "#f4f4f4",
          200: "#e5e5e5",
          300: "#d7d7d7",
          400: "#a6a6a6",
          500: "#6b6b6b",
          600: "#5e5e5e",
          700: "#383838",
          800: "#191919",
          900: "#0c0c0c",
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
