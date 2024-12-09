import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import { Text, Animated, Easing } from "react-native";
import useTheme from "@/theme/hooks/useTheme";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useRef, useState } from "react";
import { UiRow } from "./elements/ui-grid/UiRow";

export const SyncButton = (props: { syncFn(): Promise<any> }) => {
  const { colors, fonts, gutters, components } = useTheme();


  const spinValue = useRef(new Animated.Value(0)).current;
  const [animation, setAnimation] = useState(null);

  const startSpin = () => {
    const spinAnim = Animated.loop(
      Animated.timing(spinValue, {
        toValue: 1,
        duration: 1000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );

    setAnimation(spinAnim);
    spinAnim.start();
  };

  const stopSpin = () => {
    if (animation) {
      animation.stop();
      spinValue.setValue(0); // Reset the spin value
    }
  };

  const spin = spinValue.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "360deg"],
  });
  
  return (
    <TouchableWithoutFeedback onPress={() => {
      startSpin();
      props.syncFn().finally(() => {
        stopSpin();
      });
    }}>
      <UiRow.C style={[components.secondaryBtn]}>
        <Text
          style={[{ color: colors.main }, gutters.marginRight_8, fonts.bold]}
        >
          Sync
        </Text>
        <Animated.View style={{ transform: [{ rotate: spin }] }}>
          <Ionicons name="sync-outline" color={colors.main} size={18} />
        </Animated.View>
      </UiRow.C>
    </TouchableWithoutFeedback>
  );
};
