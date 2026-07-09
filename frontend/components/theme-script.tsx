export function ThemeScript() {
  const script = `
    (function () {
      try {
        var stored = localStorage.getItem("cybercore_theme");
        var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
        var isDark = stored === "dark" || (!stored && prefersDark);
        document.documentElement.classList.toggle("dark", isDark);
      } catch (e) {}
    })();
  `;

  return <script dangerouslySetInnerHTML={{ __html: script }} />;
}
