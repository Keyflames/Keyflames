export const previewPlayAndPause = () => {
  const parentElement = document.getElementById("keyflames");
  if (parentElement === null) return;
  const animations = parentElement.querySelectorAll("*");
  animations.forEach((animation) => {
    const htmlAnimation = animation as HTMLElement;
    const running = htmlAnimation.style.animationPlayState || "running";
    htmlAnimation.style.animationPlayState =
      running === "running" ? "paused" : "running";
  });
};
