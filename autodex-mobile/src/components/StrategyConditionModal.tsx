import {
  BottomSheetModal,
  BottomSheetModalProps,
  TouchableOpacity,
} from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef } from "react";
import { StyleProp, Text, ViewStyle } from "react-native";
import { useDismissModal } from "@/hooks/useDismissModal";
import { ModalBackdrop } from "@/components/ModalBackdrop";
import { UiRow, UiCol } from "@/components";
import { EConditionOperator, STRATEGY_CONDITIONS } from "@/constants/strategy";
import { useTheme } from "@/theme";
import { SHARED_STYLES } from "@/theme/shared";

interface Props extends Partial<BottomSheetModalProps> {
  onSelectCondition: (condition: EConditionOperator) => any;
  containerStyle?: StyleProp<ViewStyle>;
  selectedCondition: EConditionOperator;
}

export const StrategyConditionModal = forwardRef(
  (props: Props, ref: ForwardedRef<BottomSheetModal>) => {
    const {
      containerStyle,
      snapPoints = ["35%", "90%"],
      selectedCondition,
      onSelectCondition,
      ...rest
    } = props;
    const { dismissAll } = useDismissModal();
    const { fonts, colors, gutters } = useTheme();

    const handleSelectCondition = (condition: EConditionOperator) => {
      onSelectCondition(condition);
      dismissAll();
    };

    return (
      <BottomSheetModal
        ref={ref}
        snapPoints={snapPoints}
        backdropComponent={ModalBackdrop}
        keyboardBehavior="extend"
        handleComponent={null}
        backgroundStyle={{ backgroundColor: colors.purple50 }}
        handleIndicatorStyle={{ backgroundColor: colors.white }}
        {...rest}
      >
        <UiCol.X style={SHARED_STYLES.screenPadding}>
          <UiRow.T style={gutters.marginVertical_16}>
            <Text style={[fonts.bold, fonts.size_16, { color: colors.white }]}>
              Select condition
            </Text>
          </UiRow.T>
          <UiCol>
            {STRATEGY_CONDITIONS.map((condition) => (
              <TouchableOpacity
                key={condition}
                onPress={() => handleSelectCondition(condition)}
              >
                <UiRow.C style={gutters.marginVertical_14}>
                  <Text style={[fonts.size_16, { color: colors.white }]}>
                    {condition}
                  </Text>
                </UiRow.C>
              </TouchableOpacity>
            ))}
          </UiCol>
        </UiCol.X>
      </BottomSheetModal>
    );
  }
);
