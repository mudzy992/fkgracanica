export function waitForElementSize(el: HTMLElement, minW = 640, minH = 360): Promise<void> {
  return new Promise((resolve) => {
    const tick = () => {
      if (el.clientWidth >= minW && el.clientHeight >= minH) resolve();
      else requestAnimationFrame(tick);
    };
    tick();
  });
}
