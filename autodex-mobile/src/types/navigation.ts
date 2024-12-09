import {
  BOTTOM_TABS,
  SCREEN_HISTORY,
  SCREEN_MY_MACHINES,
  SCREEN_PROFILE,
  SCREEN_STRATEGY,
  STACK_MAIN,
  SCREEN_MACHINE_DETAIL,
  SCREEN_PNL_ANALYSIS,
  SCREEN_SINGLE_TOKEN,
  SCREEN_ONBOARDING,
  STACK_AUTH,
  SCREEN_TWAP,
  SCREEN_LIMIT_ORDER,
  SCREEN_BASKET_DCA,
  SCREEN_SETTINGS,
} from "@/navigators/route-names";
import type { StackScreenProps } from "@react-navigation/stack";

export type ApplicationStackParamList = {
  [STACK_MAIN]: undefined;
  [STACK_AUTH]: undefined;
};

export type ApplicationScreenProps =
  StackScreenProps<ApplicationStackParamList>;

export type MainParamList = {
  [BOTTOM_TABS]: undefined;
  [SCREEN_MACHINE_DETAIL]: { machineId: string | number };
  [SCREEN_PNL_ANALYSIS]: undefined;
  [SCREEN_SETTINGS]: undefined;
  [SCREEN_SINGLE_TOKEN]: undefined;
  [SCREEN_LIMIT_ORDER]: undefined;
  [SCREEN_TWAP]: undefined;
  [SCREEN_BASKET_DCA]: undefined;
};

export type AuthParamList = {
  [SCREEN_ONBOARDING]: undefined;
};

export type BottomTabsParamList = {
  [SCREEN_MY_MACHINES]: undefined;
  [SCREEN_STRATEGY]: undefined;
  [SCREEN_HISTORY]: undefined;
  [SCREEN_PROFILE]: undefined;
};
