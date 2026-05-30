const preload_script = () => {
  const l = localStorage.getItem("theme");
  const p = window.matchMedia("(prefers-color-scheme: dark)").matches;

  if (l === "dark" || (!l && p)) {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
};

const preload = `const e=localStorage.getItem("theme"),t=window.matchMedia("(prefers-color-scheme: dark)").matches;"dark"===e||!e&&t?document.documentElement.classList.add("dark"):document.documentElement.classList.remove("dark");`;

export { preload_script, preload };
