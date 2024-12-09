import { useApp } from "@/contexts/app.context";
import { useTheme } from "@/theme";
import { IconAvaxc } from "@/theme/assets/icons/svg";
import NavigationRef from "@/utils/navigation-ref";
import { BottomTabNavigationOptions } from "@react-navigation/bottom-tabs";
import { StyleSheet, Text, TouchableWithoutFeedback, View } from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { SCREEN_SETTINGS } from "./route-names";

// const BottomTabsHeaderLeft = () => {
//   return (
//     <Text>BLACK ROCK</Text>
//   )
// }

const styles = StyleSheet.create({
  container: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: 20,
    gap: 6,
  },
  text: {
    fontWeight: "500",
  },
});

export const BottomTabsHeaderRight = () => {
  const { colors, gutters } = useTheme();
  const { selectChainModalRef } = useApp();

  const handlePressSelectChainModal = () => {
    selectChainModalRef.current?.present();
  };

  return (
    <TouchableWithoutFeedback onPress={handlePressSelectChainModal}>
      <View
        style={[styles.container, { backgroundColor: colors.charlestonGreen }]}
      >
        <IconAvaxc width={18} height={18} style={gutters.marginRight_2} />
        <Text style={[styles.text, { color: colors.grayText }]}>AVAXC</Text>
        <Ionicons
          name="chevron-down-outline"
          color={colors.grayText}
          size={18}
          style={gutters.marginTop_2}
        />
      </View>
    </TouchableWithoutFeedback>
  );
};

export const AppHeaderBackButton = () => {
  const { colors, gutters } = useTheme();

  const handleGoBack = () => {
    NavigationRef.goBack();
  };

  return (
    <TouchableWithoutFeedback onPress={handleGoBack}>
      <Ionicons
        name="arrow-back-outline"
        color={colors.grayText}
        style={gutters.marginLeft_14}
        size={28}
      />
    </TouchableWithoutFeedback>
  );
};

export const AppHeaderSettingButton = () => {
  const { colors, gutters } = useTheme();

  const handleGoBack = () => {
    NavigationRef.navigate(SCREEN_SETTINGS);
  };

  return (
    <TouchableWithoutFeedback onPress={handleGoBack}>
      <Ionicons
        name="settings-outline"
        color={colors.grayText}
        style={gutters.marginRight_24}
        size={28}
      />
    </TouchableWithoutFeedback>
  );
};

export const bottomTabsScreenOptions: BottomTabNavigationOptions = {
  headerShown: true,
  headerTitle: "",
  headerShadowVisible: false,
  // headerLeft: () => <BottomTabsHeaderLeft />,
  headerRight: () => <BottomTabsHeaderRight />,
};
