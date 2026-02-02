import type { Config } from "tailwindcss";
import animate from "tailwindcss-animate";
import scrollbar from "tailwind-scrollbar";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
         dmSans: "var(--font-dm-sans)",
       },
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
        destructive: "var(--destructive)",
        "dark-background": "var(--dark-background)",
        "dark-card": "var(--dark-card)",
        border: "var(--border)",
        "dark-text": "var(--dark-text)",
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      maxHeight: {
        "90vh": "90vh",
      },
    },
  },
  plugins: [animate, scrollbar({ nocompatible: true })],
};
export default config;
