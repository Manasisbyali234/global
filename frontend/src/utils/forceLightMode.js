// Keeps the app in light mode without writing layout-affecting inline styles.
export const forceLightMode = () => {
  if (typeof document === "undefined") {
    return () => {};
  }

  const ensureMeta = (name, content) => {
    let meta = document.querySelector(`meta[name="${name}"]`);

    if (!meta) {
      meta = document.createElement("meta");
      meta.name = name;
      document.head.appendChild(meta);
    }

    meta.content = content;
  };

  ensureMeta("color-scheme", "light only");
  ensureMeta("supported-color-schemes", "light");

  document.documentElement.classList.add("light-mode-forced");
  document.body?.classList.add("light-mode-forced");

  return () => {
    document.documentElement.classList.remove("light-mode-forced");
    document.body?.classList.remove("light-mode-forced");
  };
};

export default forceLightMode;
