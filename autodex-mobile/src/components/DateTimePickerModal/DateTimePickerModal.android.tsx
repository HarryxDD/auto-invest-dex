import { memo, useEffect, useState } from "react";
import DateTimePicker, {
  AndroidNativeProps,
  DateTimePickerEvent,
} from "@react-native-community/datetimepicker";
import { DateTimePickerAndroidProps as Props } from "./DateTimePickerModal";
import { calculateSelectedDate } from "./helper";

const arePropsEqual = (prevProps: Props, nextProps: Props) => {
  return prevProps.isVisible === nextProps.isVisible;
};

const DateTimePickerModal = memo((props: Props) => {
  const {
    date = new Date(),
    isVisible,
    onCancel,
    onConfirm,
    mode,
    ...rest
  } = props;
  const [currentMode, setCurrentMode] = useState<
    AndroidNativeProps["mode"] | null
  >(null);
  const [currentDate, setCurrentDate] = useState<Date>(date);

  useEffect(() => {
    setCurrentMode(mode === "time" ? "time" : "date");
  }, [mode]);

  const handleChange = (event: DateTimePickerEvent, dateValue?: Date) => {
    if (event.type === "dismissed" || !dateValue) {
      // Cancel if the user dismissed the picker or if there's no date value
      onCancel();
      return;
    }

    let selectedDate = dateValue;
    // Because date time picker android native only have two mode is date and time
    if (mode === "datetime" && currentMode === "date") {
      // If in datetime mode and current mode is date, set current mode to time
      setCurrentDate(dateValue);
      setCurrentMode("time");
      return;
    }

    if (mode === "datetime" && currentMode === "time") {
      // If in datetime mode and current mode is time, calculate the selected date
      selectedDate = calculateSelectedDate(currentDate, dateValue);
    }

    // Confirm the selected date and update the current date state
    onConfirm(selectedDate);
    setCurrentDate(selectedDate);
  };

  if (!isVisible || !currentMode) {
    return null;
  }

  return (
    <DateTimePicker
      value={currentDate}
      mode={currentMode}
      onChange={handleChange}
      {...rest}
    />
  );
}, arePropsEqual);

export default DateTimePickerModal;
