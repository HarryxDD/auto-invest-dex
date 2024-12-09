import { Dimensions, StyleSheet } from "react-native";

export const DEVICE_WIDTH = Dimensions.get("window").width;
export const DEVICE_HEIGHT = Dimensions.get("window").height;

export const LEFT_DRAWER_HIT_SLOP = DEVICE_WIDTH / 2;
export const DRAWER_WIDTH = DEVICE_WIDTH / 1.3;

export const UI_CONSTANT = {
  avatarSmall: 25,
  borderRadius: 10,
  borderWidth: 1,
  inputMinHeight: 48,
  hitSlop: { top: 20, bottom: 20, left: 20, right: 20 },
  smallHitSlop: { top: 10, bottom: 10, left: 10, right: 10 },
  zIndexFloater: 999,
};

export const SHARED_STYLES = StyleSheet.create({
  screenPadding: {
    paddingHorizontal: 20,
  },
  growX: {
    flexGrow: 1,
  },
  flexX: {
    flex: 1,
  },
  bgTransparent: {
    backgroundColor: "transparent",
  },
  opacity80: {
    opacity: 0.8,
  },
  hFull: {
    height: "100%",
  },
  wFull: {
    width: "100%",
  },
  flexWrap: { flexWrap: "wrap" },
  elevation1: { elevation: 1 },
  flexShrink: { flexShrink: 1 },
  width40Percent: {
    width: "40%",
  },
  center: {
    alignItems: "center",
    justifyContent: "center",
  },
  itemCenterJustifyBetween: {
    alignItems: "center",
    justifyContent: "space-between",
  },
  alignItemsCenter: {
    alignItems: "center",
  },
  alignItemsStart: {
    alignItems: "flex-start",
  },
  alignItemsEnd: {
    alignItems: "flex-end",
  },
  alignItemsStretch: {
    alignItems: "stretch",
  },
  justifyContentStart: {
    justifyContent: "flex-start",
  },
  justifyContentCenter: {
    justifyContent: "center",
  },
  justifyContentAround: {
    justifyContent: "space-around",
  },
  justifyContentEvenly: {
    justifyContent: "space-evenly",
  },
  justifyContentBetween: {
    justifyContent: "space-between",
  },
  scrollSpaceAround: {
    flexGrow: 1,
    justifyContent: "space-around",
  },
  scrollSpaceBetween: {
    flexGrow: 1,
    justifyContent: "space-between",
  },
  selfStretch: {
    alignSelf: "stretch",
  },
  selfEnd: {
    alignSelf: "flex-end",
  },
  selfCenter: {
    alignSelf: "center",
  },
  displayNone: {
    display: "none",
  },
  textAlignCenter: {
    textAlign: "center",
  },
});
