import { UiCol } from "@/components";
import { useTheme } from "@/theme";
import { Text } from "react-native";

const BasketDCAScreen = () => {
  const { colors } = useTheme();

  return (
    <UiCol.C.X>
      <Text style={[{ color: colors.white }]}>Coming soon!</Text>
    </UiCol.C.X>
  );
};

export default BasketDCAScreen;
