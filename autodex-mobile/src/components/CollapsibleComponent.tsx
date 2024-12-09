import { useTheme } from "@/theme";
import { useState, useRef } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Animated,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { UiRow } from "@/components/elements/ui-grid/UiRow";
import { UI_CONSTANT } from "@/theme/shared";

const CollapsibleComponent = ({
  title,
  children,
  maxHeight,
  onClear,
}: {
  title: string;
  children: React.ReactNode;
  maxHeight?: number;
  onClear?: () => void;
}) => {
  const { colors, gutters, fonts } = useTheme();
  const [expanded, setExpanded] = useState(false);
  const animatedHeight = useRef(new Animated.Value(0)).current;
  const animatedBorderRadius = useRef(new Animated.Value(16)).current;

  const toggleExpand = () => {
    setExpanded(!expanded);
    Animated.timing(animatedHeight, {
      toValue: expanded ? 0 : 1,
      duration: 300,
      useNativeDriver: false,
    }).start();

    Animated.timing(animatedBorderRadius, {
      toValue: expanded ? 16 : 0,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={toggleExpand}>
        <Animated.View
          style={[
            styles.header,
            {
              backgroundColor: colors.secondaryBlack,
              borderBottomLeftRadius: animatedBorderRadius,
              borderBottomRightRadius: animatedBorderRadius,
            },
          ]}
        >
          <UiRow.LR>
            <Ionicons
              name={`chevron-${expanded ? "up" : "down"}-outline`}
              color={colors.main}
              size={18}
              style={gutters.marginRight_4}
            />
            <Text
              style={[
                styles.title,
                gutters.paddingVertical_4,
                { color: colors.white },
              ]}
            >
              {title}
            </Text>
            {onClear && (
              <TouchableWithoutFeedback onPress={onClear}>
                <UiRow.C
                  style={[
                    gutters.paddingVertical_4,
                    gutters.paddingHorizontal_10,
                    {
                      borderColor: colors.red400,
                      backgroundColor: `${colors.red400}17`,
                      borderRadius: UI_CONSTANT.borderRadius,
                    },
                  ]}
                >
                  <Text
                    style={[
                      { color: colors.red400 },
                      fonts.bold,
                      fonts.size_12,
                    ]}
                  >
                    Clear
                  </Text>
                </UiRow.C>
              </TouchableWithoutFeedback>
            )}
          </UiRow.LR>
        </Animated.View>
      </TouchableOpacity>
      <Animated.View
        style={[
          styles.contentWrapper,
          {
            height: animatedHeight.interpolate({
              inputRange: [0, 1],
              outputRange: [0, maxHeight || 150],
            }),
          },
        ]}
      >
        <View
          style={[styles.content, { backgroundColor: colors.secondaryBlack }]}
        >
          {children}
        </View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginVertical: 7,
  },
  title: {
    flex: 1,
    fontSize: 12,
    fontWeight: "bold",
  },
  header: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
  },
  content: {
    padding: 16,
    paddingTop: 4,
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
  },
  contentWrapper: {
    overflow: "hidden",
  },
});

export default CollapsibleComponent;
