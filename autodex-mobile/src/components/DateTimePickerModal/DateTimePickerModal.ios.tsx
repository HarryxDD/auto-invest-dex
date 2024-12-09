import { useState } from "react";
// import { Overlay, useTheme } from "@rneui/themed";
import DateTimePicker, {
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { UiRow } from "@/components";
import { Button } from "react-native";
import { useTheme } from "@/theme";
import { DateTimePickerIOSProps as Props } from "./DateTimePickerModal";
import UiOverlay from "../UiOverlay";

const DateTimePickerModal = (props: Props) => {
  const {
    date = new Date(),
    isVisible,
    onCancel,
    onConfirm,
    mode,
    ...rest
  } = props;
  const [currentDate, setCurrentDate] = useState(date);
  const { colors } = useTheme();

  const handleOnCancel = () => {
    onCancel();
  };

  const handleOnConfirm = () => {
    onConfirm(currentDate);
  };

  const handleChange = (event: DateTimePickerEvent, dateValue?: Date) => {
    if (event.type === "dismissed" || !dateValue) {
      return;
    }
    setCurrentDate(dateValue);
  };

  if (!isVisible || !mode) {
    return null;
  }

  return (
    <UiOverlay
      isVisible={isVisible}
      contentStyle={{ backgroundColor: colors.purple50 }}
    >
      <DateTimePicker
        textColor={colors.white}
        accentColor={colors.main}
        onChange={handleChange}
        value={currentDate}
        display="inline"
        style={{ transform: [{ scale: 0.97 }] }}
        mode={mode}
        {...rest}
      />
      <UiRow.R>
        <Button title="Cancel" color={colors.main} onPress={handleOnCancel} />
        <Button title="Confirm" color={colors.main} onPress={handleOnConfirm} />
      </UiRow.R>
    </UiOverlay>
  );
};

export default DateTimePickerModal;
