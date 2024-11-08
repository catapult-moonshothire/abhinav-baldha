import * as React from "react";

export const useTheme = () => {
  const [isDarkMode, setIsDarkMode] = React.useState<boolean | null>(null); // Initial value null to avoid mismatch

  React.useEffect(() => {
    const darkModeMediaQuery = window.matchMedia(
      "(prefers-color-scheme: dark)"
    );
    setIsDarkMode(darkModeMediaQuery.matches);

    const handleChange = (e: MediaQueryListEvent) => {
      const newDarkMode = e.matches;
      setIsDarkMode(newDarkMode);
    };

    darkModeMediaQuery.addEventListener("change", handleChange);

    return () => {
      darkModeMediaQuery.removeEventListener("change", handleChange);
    };
  }, []); // Empty dependency array ensures this only runs on mount

  return isDarkMode;
};
