import {
  BottomSheetModal,
  BottomSheetModalProps,
  BottomSheetModalProvider,
} from "@gorhom/bottom-sheet";
import { ForwardedRef, forwardRef } from "react";
import { ModalBackdrop } from "@/components/ModalBackdrop";
import { Text } from "react-native";
import { useTheme } from "@/theme";
import { UiCol } from "@/components";
import { SHARED_STYLES } from "@/theme/shared";

interface Props extends Partial<BottomSheetModalProps> {}

export const SelectChainModal = forwardRef(
  (props: Props, ref: ForwardedRef<BottomSheetModal>) => {
    const { containerStyle, snapPoints = ["40%"], ...rest } = props;
    const { colors, fonts, gutters } = useTheme();

    return (
      <BottomSheetModalProvider>
        <BottomSheetModal
          ref={ref}
          enableContentPanningGesture={false}
          // handleIndicatorStyle={styles.indicator}
          backdropComponent={ModalBackdrop}
          snapPoints={snapPoints}
          keyboardBehavior="extend"
          // onDismiss={}
          handleComponent={null}
          backgroundStyle={{ backgroundColor: colors.purple50 }}
          {...rest}
        >
          <UiCol.L.X style={SHARED_STYLES.screenPadding}>
            <Text style={[fonts.size_24, fonts.bold, { color: colors.main }]}>
              Under Development!
            </Text>
            <Text
              style={[
                fonts.size_16,
                gutters.marginTop_10,
                { color: colors.white },
              ]}
            >
              We are currently working hard to bring you the best experience
              possible. This feature is under development and will be available
              soon. Please stay tuned for updates and thank you for your
              patience!
            </Text>
          </UiCol.L.X>
        </BottomSheetModal>
      </BottomSheetModalProvider>
    );
  }
);
