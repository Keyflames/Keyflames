export const copySVGToClipboard = (svgString: string) => {
  const tempInput = document.createElement("textarea");
  tempInput.style.position = "absolute";
  tempInput.style.left = "-9999px";
  tempInput.value = svgString;
  document.body.appendChild(tempInput);
  tempInput.select();
  document.execCommand("copy");
  document.body.removeChild(tempInput);
};
