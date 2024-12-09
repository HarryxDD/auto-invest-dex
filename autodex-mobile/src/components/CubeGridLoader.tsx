import { useEffect, useRef, useState } from "react";
import {
  Animated,
  Modal,
  StyleSheet,
  Text,
  TouchableWithoutFeedback,
  View,
} from "react-native";
import { UiCol } from "@/components/elements/ui-grid/UiCol";

const CubeGridLoader = ({
  visible,
  onTurnOff,
}: {
  visible: boolean;
  onTurnOff?: () => void;
}) => {
  const animationValues = useRef(
    [...Array(9)].map(() => new Animated.Value(0))
  ).current;
  const [showCloseButton, setShowCloseButton] = useState(false);

  useEffect(() => {
    const animations = animationValues.map((value) =>
      Animated.loop(
        Animated.sequence([
          Animated.timing(value, {
            toValue: 1,
            duration: 800,
            useNativeDriver: true,
          }),
          Animated.timing(value, {
            toValue: 0,
            duration: 800,
            useNativeDriver: true,
          }),
        ])
      )
    );

    const startAnimations = () => {
      animations.forEach((animation, index) => {
        setTimeout(() => {
          animation.start();
        }, index * 100); // stagger the start time of each animation
      });
    };

    if (visible) {
      startAnimations();
    } else {
      animations.forEach((animation) => animation.stop());
    }

    return () => {
      animations.forEach((animation) => animation.stop());
    };
  }, [visible, animationValues]);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (visible && onTurnOff) {
      timer = setTimeout(() => {
        setShowCloseButton(true);
      }, 20000); // 20 seconds
    } else {
      setShowCloseButton(false);
      if (timer) {
        clearTimeout(timer);
      }
    }

    return () => {
      if (timer) {
        clearTimeout(timer);
      }
    };
  }, [visible]);

  const renderCubes = () => {
    return animationValues.map((animValue, index) => {
      const scale = animValue.interpolate({
        inputRange: [0, 1],
        outputRange: [1, 0.2],
      });
      return (
        <Animated.View
          key={index}
          style={[
            styles.cube,
            {
              transform: [{ scale }],
            },
          ]}
        />
      );
    });
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.backdrop}>
        <View style={styles.grid}>
          {renderCubes().map((cube, index) => (
            <View key={index} style={styles.gridItem}>
              {cube}
            </View>
          ))}
        </View>
        {showCloseButton && (
          <TouchableWithoutFeedback onPress={onTurnOff}>
            <UiCol.C>
              <Text style={styles.buttonContainer}>Something went wrong?</Text>
              <Text style={styles.goBackBtn}>Go back here!</Text>
            </UiCol.C>
          </TouchableWithoutFeedback>
        )}
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  backdrop: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  grid: {
    width: 40,
    height: 40,
    display: "flex",
    flexWrap: "wrap",
    flexDirection: "row",
    transform: [{ scaleY: -1 }],
  },
  gridItem: {
    width: "33.33%",
    height: "33.33%",
    justifyContent: "center",
    alignItems: "center",
  },
  cube: {
    width: 14,
    height: 14,
    backgroundColor: "#fff",
  },
  buttonContainer: {
    marginTop: 40,
    color: "white",
  },
  goBackBtn: {
    color: "white",
    borderBottomWidth: 1,
    borderBottomColor: "white",
  },
});

export default CubeGridLoader;
