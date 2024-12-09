import { FC } from "react";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import DateTimePicker, {
  AndroidNativeProps,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  DateTimePickerEvent,
  IOSNativeProps,
} from "@react-native-community/datetimepicker";

export interface DateTimePickerProps {
  onConfirm: (date: Date) => void;
  onCancel: () => void;
  isVisible: boolean;
  mode?: "date" | "time" | "datetime";
  date?: Date;
}

export type DateTimePickerIOSProps = DateTimePickerProps &
  Omit<IOSNativeProps, "value" | "mode" | "onChange">;
export type DateTimePickerAndroidProps = DateTimePickerProps &
  Omit<AndroidNativeProps, "value" | "mode" | "onChange">;

declare const DateTimePickerModal: FC<
  DateTimePickerIOSProps | DateTimePickerAndroidProps
>;

export default DateTimePickerModal;
