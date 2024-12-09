import { render, screen } from "@testing-library/react-native";
import { MMKV } from "react-native-mmkv";

import { ThemeProvider } from "@/theme";
import sourceImg from "@/theme/assets/images/autodex.png";

import { isImageSourcePropType } from "@/types/guards/image";

import ImageVariant from "./ImageVariant";

describe("ImageVariant component should render correctly", () => {
  let storage: MMKV;

  beforeAll(() => {
    storage = new MMKV();
  });

  test("with only default image and dark variant. Should return default source", () => {
    if (!isImageSourcePropType(sourceImg)) {
      throw new Error("Image source is not valid");
    }

    const component = (
      <ThemeProvider storage={storage}>
        <ImageVariant source={sourceImg} />
      </ThemeProvider>
    );

    render(component);

    const wrapper = screen.getByTestId("variant-image");

    expect(wrapper.props.source).toBe(sourceImg);
  });

  test("with default image dark image and dark variant. Should return dark source", () => {
    storage.set("theme", "dark");
    if (!isImageSourcePropType(sourceImg)) {
      throw new Error("Image source is not valid");
    }

    const component = (
      <ThemeProvider storage={storage}>
        <ImageVariant source={sourceImg} sourceDark={sourceImg} />
      </ThemeProvider>
    );

    render(component);

    const wrapper = screen.getByTestId("variant-image");

    expect(wrapper.props.source).toBe(sourceImg);
  });
});
