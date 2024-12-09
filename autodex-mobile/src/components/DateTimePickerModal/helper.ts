/**
 *
 * @param date
 * @param time
 * @returns Date
 */
export const calculateSelectedDate = (date: Date, time: Date) => {
  const year = date.getFullYear();
  const month = date.getMonth();
  const day = date.getDate();
  const hours = time.getHours();
  const minutes = time.getMinutes();
  return new Date(year, month, day, hours, minutes);
};

export const getSelectedDate = (date: Date) => {
  return `${date.getDate()}/${date.getMonth()}/${date.getFullYear()}`;
};

export const getSelectedTime = (date: Date) => {
  return `${date.getHours()}:${date.getMinutes()}`;
}