const preload = `try{const e=localStorage.getItem("theme"),t=window.matchMedia("(prefers-color-scheme: dark)").matches;"dark"===e||!e&&t?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");const o=!window.CSS||!CSS.supports||!CSS.supports("color","oklch(1 0 0)")||!CSS.supports("color","color-mix(in srgb, white, black)")||!CSS.supports("backdrop-filter","blur(1px)");o&&document.documentElement.classList.add("old-browser")}catch(e){}`;

export { preload };
