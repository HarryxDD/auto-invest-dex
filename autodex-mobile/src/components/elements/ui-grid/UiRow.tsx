import { Row as BaseRow, RowComponent } from "react-native-col";
import isFunction from "lodash/isFunction";
import isString from "lodash/isString";
import { ViewProps } from "react-native";

export interface RowProps extends ViewProps {}

const wrapView =
  (component: any): RowComponent<RowProps> =>
  // @ts-ignore
  ({ style, ...rest }: RowProps) => {
    const Container = component;
    return <Container style={style} {...rest} />;
  };
const CustomRow = wrapView(BaseRow);

Object.entries(BaseRow).forEach((property) => {
  const [name, value] = property;
  if (isString(name) && isFunction(value)) {
    // @ts-ignore
    CustomRow[name] = wrapView(value);
    // @ts-ignore
    CustomRow[name].X = wrapView(value.X);
  }
});

export const UiRow = CustomRow;
