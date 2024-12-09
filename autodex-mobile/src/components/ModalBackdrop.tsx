import { BottomSheetBackdrop } from "@gorhom/bottom-sheet";

interface ModalBackdropProps {
  // containerStyle?: StyleProp<ViewStyle>;
}

export const ModalBackdrop = (props: ModalBackdropProps) => (
  // @ts-ignore
  <BottomSheetBackdrop
    disappearsOnIndex={-1}
    appearsOnIndex={0}
    pressBehavior="close"
    {...props}
  />
);
