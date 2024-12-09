import { Text, Modal, StyleSheet, TouchableOpacity } from "react-native";
import { UiCol } from "@/components/elements/ui-grid/UiCol";
import { useTheme } from "@/theme";
import { IconSuccess } from "@/theme/assets/icons/svg";
import { SHARED_STYLES } from "@/theme/shared";
import { UiRow } from "./elements/ui-grid/UiRow";

interface Props {
  visible: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const SuccessModal = ({ visible, onClose, title, children }: Props) => {
  const { fonts, colors, components, gutters } = useTheme();

  return (
    <Modal
      animationType="slide"
      visible={visible}
      onRequestClose={onClose}
      transparent
    >
      <UiCol.C.X style={{ backgroundColor: `${colors.richBlack}95` }}>
        <UiCol.LRC
          style={[
            styles.modalView,
            { backgroundColor: colors.charlestonGreen },
          ]}
        >
          <IconSuccess style={SHARED_STYLES.selfCenter} />
          <Text
            style={[
              fonts.bold,
              fonts.size_18,
              gutters.marginVertical_10,
              SHARED_STYLES.selfCenter,
              { color: colors.white },
            ]}
          >
            {title}
          </Text>
          {children}
          <TouchableOpacity onPress={onClose}>
            <UiRow.C
              style={[
                components.primaryBtn,
                gutters.paddingVertical_10,
                gutters.marginTop_14,
              ]}
            >
              <Text style={[{ color: colors.white }, fonts.bold]}>Done</Text>
            </UiRow.C>
          </TouchableOpacity>
        </UiCol.LRC>
      </UiCol.C.X>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalView: {
    maxWidth: 340,
    borderRadius: 10,
    paddingVertical: 20,
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
});

export default SuccessModal;
