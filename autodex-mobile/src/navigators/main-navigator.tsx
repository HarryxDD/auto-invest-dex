import { createStackNavigator } from "@react-navigation/stack";
import {
  BOTTOM_TABS,
  SCREEN_MACHINE_DETAIL,
  SCREEN_PNL_ANALYSIS,
  SCREEN_SINGLE_TOKEN,
  SCREEN_LIMIT_ORDER,
  SCREEN_TWAP,
  SCREEN_BASKET_DCA,
  SCREEN_SETTINGS,
} from "@/navigators/route-names";
import { MainParamList } from "@/types/navigation";
import BottomTabsNavigator from "@/navigators/bottom-tabs-navigator";
import MachineDetail from "@/screens/MachineDetail/MachineDetail";
import PNLAnalysis from "@/screens/PNLAnalysis/PNLAnalysis";
import SingleTokenScreen from "@/screens/SingleToken/SingleToken";
import LimitOrderScreen from "@/screens/LimitOrder/LimitOrder";
import TWAPScreen from "@/screens/TWAP/TWAP";
import BasketDCAScreen from "@/screens/BasketDCA/BasketDCA";
import SettingsScreen from "@/screens/Settings/Settings";
import { AppHeaderBackButton } from "./config";

const MainStack = createStackNavigator<MainParamList>();

export const MainNavigator = () => {
  return (
    <MainStack.Navigator screenOptions={{ headerShown: false }}>
      <MainStack.Screen
        name={BOTTOM_TABS}
        component={BottomTabsNavigator}
        options={{
          headerShown: false,
        }}
      />
      <MainStack.Screen
        name={SCREEN_MACHINE_DETAIL}
        component={MachineDetail}
        options={{
          headerShown: true,
          headerLeft: () => <AppHeaderBackButton />,
          headerTitle: "Machine details",
        }}
      />
      <MainStack.Screen
        name={SCREEN_PNL_ANALYSIS}
        component={PNLAnalysis}
        options={{
          headerShown: true,
          headerLeft: () => <AppHeaderBackButton />,
          headerTitle: "PNL Analysis",
        }}
      />
      <MainStack.Screen
        name={SCREEN_SETTINGS}
        component={SettingsScreen}
        options={{
          headerShown: true,
          headerLeft: () => <AppHeaderBackButton />,
          headerTitle: "Settings",
        }}
      />
      <MainStack.Screen
        name={SCREEN_SINGLE_TOKEN}
        component={SingleTokenScreen}
        options={{
          headerShown: true,
          headerLeft: () => <AppHeaderBackButton />,
        }}
      />
      <MainStack.Screen
        name={SCREEN_LIMIT_ORDER}
        component={LimitOrderScreen}
        options={{
          headerShown: true,
          headerTitle: "Limit Order",
        }}
      />
      <MainStack.Screen
        name={SCREEN_TWAP}
        component={TWAPScreen}
        options={{
          headerShown: true,
          headerTitle: "TWAP",
        }}
      />
      <MainStack.Screen
        name={SCREEN_BASKET_DCA}
        component={BasketDCAScreen}
        options={{
          headerShown: true,
          headerTitle: "Limit Order",
        }}
      />
    </MainStack.Navigator>
  );
};
