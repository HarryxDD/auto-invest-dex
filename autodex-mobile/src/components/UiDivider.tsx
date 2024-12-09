import { View, StyleSheet } from "react-native";

const UiDivider = ({
  color = "#7886A030",
  thickness = 0.5,
  marginVertical = 5,
}: {
  color?: string;
  thickness?: number;
  marginVertical?: number;
}) => {
  return (
    <View
      style={[
        styles.divider,
        {
          borderBottomColor: color,
          borderBottomWidth: thickness,
          marginVertical,
        },
      ]}
    />
  );
};

const styles = StyleSheet.create({
  divider: {
    width: "100%",
  },
});

export default UiDivider;
