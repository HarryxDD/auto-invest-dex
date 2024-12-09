import { NavigationContainerRef } from "@react-navigation/native";
import * as React from "react";

export default class NavigationRef {
  static navigationRef = React.createRef<NavigationContainerRef<any>>();

static navigate(name: string, params?: any) {
    this.navigationRef.current?.navigate(name, params);
  }

  static goBack() {
    if (this.navigationRef.current?.canGoBack()) {
      this.navigationRef.current?.goBack();
    }
  }

  static reset(params: any) {
    this.navigationRef?.current?.reset(params);
  }
}
