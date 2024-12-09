import { StyleProp, Text, ViewStyle } from "react-native";
import { UiRow } from "@/components/elements/ui-grid/UiRow";
import { useTheme } from "@/theme";

export const MachineItemSection = ({
  title,
  value,
  children,
  containerStyle,
}: {
  title: string;
  value?: string;
  children?: React.ReactNode;
  containerStyle?: StyleProp<ViewStyle>;
}) => {
  const { fonts, colors, gutters } = useTheme();

  return (
    <UiRow.LRT style={[gutters.paddingVertical_10, containerStyle]}>
      <Text style={{ color: colors.ceil }}>{title}</Text>
      {children ?? (
        <Text style={[fonts.semiBold, { color: colors.white }]}>{value}</Text>
      )}
    </UiRow.LRT>
  );
};
