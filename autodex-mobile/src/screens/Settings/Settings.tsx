import { UiCol, UiRow } from "@/components";
import { SafeScreen } from "@/components/template";
import UiDivider from "@/components/UiDivider";
import { useTheme } from "@/theme";
import { SHARED_STYLES } from "@/theme/shared";
import { Text, TouchableWithoutFeedback } from "react-native";
import { useDisconnect } from "wagmi";

function SettingsScreen() {
  const { colors, fonts, gutters, components } = useTheme();
  const { disconnect } = useDisconnect()

  const handleDisconnectWallet = () => {
    disconnect()
  };

  return (
    <SafeScreen>
      <UiCol style={[SHARED_STYLES.screenPadding, gutters.marginTop_20]}>
        <UiRow.LR>
          <Text style={[fonts.size_16, { color: colors.white }]}>Language</Text>
          <Text style={[fonts.size_16, { color: colors.white }]}>English</Text>
        </UiRow.LR>
        <UiDivider color="#7886A090" marginVertical={20} />
        <UiRow.LR>
          <Text style={[fonts.size_16, { color: colors.white }]}>Version</Text>
          <Text style={[fonts.size_16, { color: colors.white }]}>0.0.1</Text>
        </UiRow.LR>
        <UiDivider color="#7886A090" marginVertical={20} />
        <TouchableWithoutFeedback onPress={handleDisconnectWallet}>
          <UiRow.C
            style={[
              components.primaryBtn,
              gutters.paddingVertical_10,
              gutters.marginTop_32,
            ]}
          >
            <Text style={[{ color: colors.white }, fonts.bold]}>
              Disconnect Wallet
            </Text>
          </UiRow.C>
        </TouchableWithoutFeedback>
      </UiCol>
    </SafeScreen>
  );
}

export default SettingsScreen;
