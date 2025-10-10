import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      colors: {
        'dark-green': {
          DEFAULT: '#041b15',
          100: '#010504',
          200: '#020b08',
          300: '#02100c',
          400: '#031510',
          500: '#041b15',
          600: '#106e55',
          700: '#1dc196',
          800: '#58e6c0',
          900: '#acf3e0',
        },
        'pine-green': {
          DEFAULT: '#136f63',
          100: '#041613',
          200: '#072c27',
          300: '#0b413a',
          400: '#0f574e',
          500: '#136f63',
          600: '#1eae9b',
          700: '#3bdec8',
          800: '#7ce9da',
          900: '#bef4ed',
        },
        'light-sea-green': {
          DEFAULT: '#22aaa1',
          100: '#072220',
          200: '#0d4440',
          300: '#146661',
          400: '#1b8881',
          500: '#22aaa1',
          600: '#33d7cc',
          700: '#66e1d9',
          800: '#99ebe5',
          900: '#ccf5f2',
        },
        'turquoise': {
          DEFAULT: '#4ce0d2',
          100: '#09332f',
          200: '#12665e',
          300: '#1b998d',
          400: '#24cdbc',
          500: '#4ce0d2',
          600: '#71e6da',
          700: '#94ece3',
          800: '#b8f2ed',
          900: '#dbf9f6',
        },
        'sky-blue': {
          DEFAULT: '#84cae7',
          100: '#0c2e3c',
          200: '#185c79',
          300: '#248ab5',
          400: '#47aedb',
          500: '#84cae7',
          600: '#9cd4eb',
          700: '#b5dff0',
          800: '#cee9f5',
          900: '#e6f4fa',
        },
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;

