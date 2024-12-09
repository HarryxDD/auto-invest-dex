import { UiCol, UiRow } from "@/components";
import { ImageVariant } from "@/components/atoms";
import { useTheme } from "@/theme";
import OnboardingImg from "@/theme/assets/images/onboarding.png";
import { SHARED_STYLES } from "@/theme/shared";
import { useWeb3Modal } from "@web3modal/wagmi-react-native";
import { StyleSheet, Text, TouchableWithoutFeedback } from "react-native";

const OnboardingScreen = () => {
  const { colors, fonts, components, gutters } = useTheme();
  const { open: openWeb3Modal } = useWeb3Modal();

  const handleConnectWallet = async () => {
    await openWeb3Modal();
  };

  return (
    <UiCol.X style={SHARED_STYLES.screenPadding}>
      <UiCol.X>
        <ImageVariant source={OnboardingImg} style={styles.onboardImg} />
        <Text
          style={[
            fonts.bold,
            fonts.size_32,
            gutters.marginTop_18,
            { color: colors.white },
          ]}
        >
          Get Started
        </Text>
        <Text style={[gutters.marginVertical_12, { color: colors.grayText }]}>
          Please connect your wallet
        </Text>
      </UiCol.X>
      <TouchableWithoutFeedback onPress={handleConnectWallet}>
        <UiRow.C
          style={[
            components.primaryBtn,
            gutters.marginBottom_56,
            gutters.paddingVertical_10,
          ]}
        >
          <Text style={[{ color: colors.white }, fonts.bold]}>
            Connect Wallet
          </Text>
        </UiRow.C>
      </TouchableWithoutFeedback>
    </UiCol.X>
  );
};

const styles = StyleSheet.create({
  onboardImg: {
    width: "100%",
    height: 300,
    marginTop: 80,
    marginBottom: 20,
    borderRadius: 20,
  },
});

export default OnboardingScreen;
