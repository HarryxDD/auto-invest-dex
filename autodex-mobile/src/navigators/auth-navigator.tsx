import { createStackNavigator } from "@react-navigation/stack";
import { SCREEN_ONBOARDING } from "@/navigators/route-names";
import { AuthParamList } from "@/types/navigation";
import OnboardingScreen from "@/screens/Onboarding/Onboarding";

const AuthStack = createStackNavigator<AuthParamList>();

export const AuthNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{ headerShown: false }}>
      <AuthStack.Screen
        name={SCREEN_ONBOARDING}
        component={OnboardingScreen}
        options={{
          headerShown: false,
        }}
      />
    </AuthStack.Navigator>
  );
};
