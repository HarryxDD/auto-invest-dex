import Col, { ColComponent } from "react-native-col";
import isString from "lodash/isString";
import isFunction from "lodash/isFunction";
import { ViewProps } from "react-native";

export interface ColProps extends ViewProps {}

const wrapView =
  (component: any): ColComponent<ColProps> =>
  // @ts-ignore
  ({ style, ...rest }: ColProps) => {
    const Container = component;
    return <Container style={style} {...rest} />;
  };
const CustomCol = wrapView(Col);

Object.entries(Col).forEach((property) => {
  const [name, value] = property;
  if (isString(name) && isFunction(value)) {
    // @ts-ignore
    CustomCol[name] = wrapView(value);
    // @ts-ignore
    CustomCol[name].X = wrapView(value.X);
  }
});

export const UiCol = CustomCol;
