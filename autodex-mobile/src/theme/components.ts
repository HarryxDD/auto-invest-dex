import { ImageStyle, TextStyle, ViewStyle } from "react-native";
import type { ComponentTheme } from "@/types/theme/theme";

export default ({ layout, backgrounds, fonts, borders }: ComponentTheme) => {
  return {
    buttonCircle: {
      ...layout.justifyCenter,
      ...layout.itemsCenter,
      ...backgrounds.purple100,
      ...fonts.gray400,
      height: 70,
      width: 70,
      borderRadius: 35,
    },
    circle250: {
      borderRadius: 140,
      height: 250,
      width: 250,
    },
    primaryBtn: {
      ...layout.justifyCenter,
      ...layout.itemsCenter,
      ...backgrounds.main,
      ...fonts.white,
      borderRadius: 30,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    disablePrimaryBtn: {
      ...layout.justifyCenter,
      ...layout.itemsCenter,
      ...backgrounds.main,
      ...fonts.white,
      borderRadius: 30,
      paddingHorizontal: 14,
      paddingVertical: 6,
      opacity: 0.5,
    },
    secondaryBtn: {
      ...layout.justifyCenter,
      ...layout.itemsCenter,
      ...borders.main,
      borderRadius: 30,
      borderWidth: 1,
      paddingHorizontal: 14,
      paddingVertical: 6,
    },
    inputContainer: {
      ...fonts.grayText,
      ...backgrounds.secondaryBlack,
      height: 46,
      borderRadius: 12,
      paddingHorizontal: 12,
    },
  } as const satisfies Record<string, ImageStyle | TextStyle | ViewStyle>;
};
