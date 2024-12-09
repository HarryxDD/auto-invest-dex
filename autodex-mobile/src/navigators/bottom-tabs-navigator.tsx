import { BottomTabsParamList } from "@/types/navigation";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import {
  SCREEN_HISTORY,
  SCREEN_MY_MACHINES,
  SCREEN_PROFILE,
  SCREEN_STRATEGY,
} from "@/navigators/route-names";
import { History, MyMachines, Profile, Strategy } from "@/screens";
import BottomTabsContent from "@/components/BottomTabsContent";
import {
  IconHistoryFill,
  IconHistoryOutline,
  IconMyMachineFill,
  IconMyMachineOutline,
  IconProfileFill,
  IconProfileOutline,
  IconStrategyFill,
  IconStrategyOutline,
} from "@/theme/assets/icons/svg";
import { AppHeaderSettingButton, bottomTabsScreenOptions } from "./config";

const Tab = createBottomTabNavigator<BottomTabsParamList>();

function BottomTabsNavigator() {
  return (
    <Tab.Navigator tabBar={(props) => <BottomTabsContent {...props} />}>
      <Tab.Screen
        name={SCREEN_MY_MACHINES}
        component={MyMachines}
        options={{
          ...bottomTabsScreenOptions,
          title: "My Machines",
          tabBarIcon: ({ focused, size }) =>
            !focused ? (
              <IconMyMachineOutline width={size} />
            ) : (
              <IconMyMachineFill width={size} />
            ),
        }}
      />
      <Tab.Screen
        name={SCREEN_STRATEGY}
        component={Strategy}
        options={{
          ...bottomTabsScreenOptions,
          title: "Strategy",
          tabBarIcon: ({ focused, size }) =>
            !focused ? (
              <IconStrategyOutline width={size} />
            ) : (
              <IconStrategyFill width={size} />
            ),
        }}
      />
      <Tab.Screen
        name={SCREEN_HISTORY}
        component={History}
        options={{
          ...bottomTabsScreenOptions,
          title: "History",
          tabBarIcon: ({ focused, size }) =>
            !focused ? (
              <IconHistoryOutline width={size} />
            ) : (
              <IconHistoryFill width={size} />
            ),
        }}
      />
      <Tab.Screen
        name={SCREEN_PROFILE}
        component={Profile}
        options={{
          title: "Profile",
          headerRight: () => <AppHeaderSettingButton />,
          tabBarIcon: ({ focused, size }) =>
            !focused ? (
              <IconProfileOutline width={size} />
            ) : (
              <IconProfileFill width={size} />
            ),
        }}
      />
    </Tab.Navigator>
  );
}

export default BottomTabsNavigator;
