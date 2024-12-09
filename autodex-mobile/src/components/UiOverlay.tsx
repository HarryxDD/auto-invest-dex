import {
  Modal,
  View,
  StyleSheet,
  TouchableOpacity,
  Text,
  ViewStyle,
  StyleProp,
} from "react-native";

const UiOverlay = ({
  isVisible,
  onClose,
  children,
  transparent = true,
  overlayStyle,
  contentStyle,
}: {
  isVisible: boolean;
  children: React.ReactNode;
  onClose?: () => void;
  transparent?: boolean;
  overlayStyle?: StyleProp<ViewStyle>;
  contentStyle?: StyleProp<ViewStyle>;
}) => {
  return (
    <Modal
      animationType="fade"
      transparent={transparent}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={[styles.overlay, overlayStyle]}>
        <TouchableOpacity style={styles.background} onPress={onClose} />
        <View style={[styles.content, contentStyle]}>
          {children}
          {onClose && (
            <TouchableOpacity style={styles.closeButton} onPress={onClose}>
              <Text style={styles.closeButtonText}>Close</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  background: {
    position: "absolute",
    width: "100%",
    height: "100%",
  },
  content: {
    padding: 20,
    backgroundColor: "white",
    borderRadius: 10,
    alignItems: "center",
  },
  closeButton: {
    marginTop: 10,
    padding: 10,
    backgroundColor: "#2196F3",
    borderRadius: 5,
  },
  closeButtonText: {
    color: "white",
    fontWeight: "bold",
  },
});

export default UiOverlay;
