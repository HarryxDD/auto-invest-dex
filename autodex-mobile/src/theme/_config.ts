import { DarkTheme } from "@react-navigation/native";

import type { ThemeConfiguration } from "@/types/theme/config";

// Coming soon! Light mode
// const colorsLight = {
// 	red500: '#C13333',
// 	gray800: '#303030',
// 	gray400: '#4D4D4D',
// 	gray200: '#A1A1A1',
// 	gray100: '#DFDFDF',
// 	gray50: '#EFEFEF',
// 	purple500: '#44427D',
// 	purple100: '#E1E1EF',
// 	purple50: '#1B1A23',
// } as const;

const colorsDark = {
  white: "#FFFFFF",
  red500: "#C13333",
  red400: "#f44949",
  gray800: "#E0E0E0",
  gray400: "#969696",
  gray200: "#BABABA",
  gray100: "#000000",
  gray50: "#EFEFEF",
  purple500: "#A6A4F0",
  purple100: "#252732",
  purple50: "#1B1A23",
  richBlack: "#060715",
  charlestonGreen: "#242636",
  secondaryBlack: "#121320",
  ceil: "#99A8C6",
  ufoGreen: "#26C673",

  grayText: "#7886A0",
  main: "#735CF7",
} as const;

const sizes = [2, 4, 8, 10, 12, 14, 16, 18, 20, 24, 32, 40, 56, 80] as const;

export const config = {
  colors: colorsDark,
  fonts: {
    sizes,
    colors: colorsDark,
  },
  gutters: sizes,
  backgrounds: colorsDark,
  borders: {
    widths: [1, 2],
    radius: [4, 16],
    colors: colorsDark,
  },
  navigationColors: {
    ...DarkTheme.colors,
    background: colorsDark.richBlack,
    card: colorsDark.richBlack,
  },
  variants: {
    dark: {
      colors: colorsDark,
      fonts: {
        colors: colorsDark,
      },
      backgrounds: colorsDark,
      navigationColors: {
        ...DarkTheme.colors,
        background: colorsDark.purple50,
        card: colorsDark.purple50,
      },
    },
  },
} as const satisfies ThemeConfiguration;
