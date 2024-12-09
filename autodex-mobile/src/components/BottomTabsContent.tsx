import { useTheme } from "@/theme";
import { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { View, Text, TouchableOpacity } from "react-native";

function BottomTabsContent({
  state,
  descriptors,
  navigation,
}: BottomTabBarProps) {
  const { gutters, layout, colors } = useTheme();

  return (
    <View style={[layout.row, gutters.marginBottom_14, gutters.paddingTop_10]}>
      {state.routes.map((route, index) => {
        const { options } = descriptors[route.key];
        const label = options.title || "";
        const renderIcon = options.tabBarIcon;
        const isFocused = state.index === index;

        const onPress = () => {
          const event = navigation.emit({
            type: "tabPress",
            target: route.key,
            canPreventDefault: true,
          });

          if (!isFocused && !event.defaultPrevented) {
            navigation.navigate(route.name, route.params);
          }
        };

        return (
          <TouchableOpacity
            key={route.key}
            accessibilityRole="button"
            accessibilityState={isFocused ? { selected: true } : {}}
            accessibilityLabel={options.tabBarAccessibilityLabel}
            testID={options.tabBarTestID}
            onPress={onPress}
            style={[layout.flex_1, layout.itemsCenter]}
          >
            {renderIcon?.({
              focused: isFocused,
              color: isFocused ? colors.main : colors.grayText,
              size: 30,
            })}
            <Text
              style={[
                gutters.marginTop_4,
                { color: isFocused ? colors.main : colors.grayText },
              ]}
            >
              {label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

export default BottomTabsContent;
