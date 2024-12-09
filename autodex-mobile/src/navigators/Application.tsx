import { createStackNavigator } from "@react-navigation/stack";
import { LinkingOptions, NavigationContainer } from "@react-navigation/native";
import { useTheme } from "@/theme";
import messaging from "@react-native-firebase/messaging";
import type { ApplicationStackParamList } from "@/types/navigation";
import {
  deepLinkConfig,
  STACK_AUTH,
  STACK_MAIN,
} from "@/navigators/route-names";
import { MainNavigator } from "@/navigators/main-navigator";
import { SelectChainModal } from "@/components/SelectChainModal";
import { useApp } from "@/contexts/app.context";
import { FilterTokenModal } from "@/components/FilterTokenModal";
import NavigationRef from "@/utils/navigation-ref";
import NotifeeManager from "@/services/notifee-manager";
import { AuthNavigator } from "@/navigators/auth-navigator";
import { isIos } from "@/constants/app";
import { useEffect, useRef } from "react";
import { Linking } from "react-native";
import { Notification } from "@notifee/react-native";
import dynamicLinks, {
  FirebaseDynamicLinksTypes,
} from "@react-native-firebase/dynamic-links";
import { useEvmWallet } from "@/hooks/evm-context/useEvmWallet";

const Stack = createStackNavigator<ApplicationStackParamList>();

export const RootStack = () => {
  const { variant } = useTheme();
  const { signer } = useEvmWallet();
  const notifeeManager = NotifeeManager.getInstance();

  useEffect(() => {
    const unsubscribe = messaging().onMessage(async (remoteMessage) => {
      const title =
        remoteMessage.notification?.title || remoteMessage.data?.title || "";
      const body =
        remoteMessage.notification?.body || remoteMessage.data?.body || "";
      const subtitle = remoteMessage.data?.subtitle || "";
      if (!isIos) {
        notifeeManager.displayNotification({
          title: title as string,
          body: body as any,
          subtitle: subtitle as string,
          data: remoteMessage.data,
        });
      }
    });

    return unsubscribe;
  }, [notifeeManager]);

  const renderScreens = () => {
    const screens = [];

    if (!signer?.address) {
      screens.push(
        <Stack.Screen
          key={STACK_AUTH}
          name={STACK_AUTH}
          component={AuthNavigator}
          options={{ headerShown: false }}
        />
      );
    } else {
      screens.push(
        <Stack.Screen
          key={STACK_MAIN}
          name={STACK_MAIN}
          component={MainNavigator}
          options={{ headerShown: false }}
        />
      );
    }

    return screens;
  };

  return (
    <Stack.Navigator
      key={variant}
      screenOptions={{
        headerShown: false,
      }}
    >
      {renderScreens()}
    </Stack.Navigator>
  );
};

function ApplicationNavigator() {
  const { navigationTheme } = useTheme();
  const { navigationRef } = NavigationRef;
  const { selectChainModalRef, filterTokenModalRef } = useApp();
  const isReadyRef = useRef<boolean>(false);
  const notifeeManager = NotifeeManager.getInstance();

  const linking: LinkingOptions<ApplicationStackParamList> = {
    prefixes: ["mrthing://", "https://mrthing.page.link"],
    config: deepLinkConfig,
    async getInitialURL(): Promise<string> {
      // Check if the app was opened by a deep link
      let url = await Linking.getInitialURL();
      const dynamicLinkUrl = await dynamicLinks().getInitialLink();
      const initialPushNotification =
        await notifeeManager.getInitialPushNotification();
      const message = await messaging().getInitialNotification();
      if (
        initialPushNotification &&
        initialPushNotification?.notification?.data?.deeplink
      ) {
        url = initialPushNotification?.notification?.data?.deeplink as string;
      }

      if (message?.data?.deeplink) {
        url = message?.data?.deeplink as string;
      }

      if (dynamicLinkUrl) {
        url = dynamicLinkUrl.url;
      }

      if (url) {
        let interval: NodeJS.Timeout | null = null;
        interval = setInterval(() => {
          if (isReadyRef.current) {
            Linking.canOpenURL(url).then((supported) => {
              if (supported) {
                Linking.openURL(url).catch((e) => {
                  console.log(`[${e}]: Open force update app link err: ${url}`);
                });
              }
            });
            if (interval) {
              clearInterval(interval);
            }
          }
        }, 100);
      }

      return "";
    },
    // Custom function to subscribe to incoming links
    subscribe(listener: (deeplink: string) => void) {
      const onReceiveURL = ({ url }: { url: string }) => {
        listener(url);
      };
      // Listen to incoming links from deep linking
      const linkingSubscription = Linking.addEventListener("url", onReceiveURL);
      const onPressNotification = (notification: Notification) => {
        console.log("Pressing Notification");
        if (notification?.data?.deeplink) {
          listener(String(notification.data.deeplink));
        }
      };
      notifeeManager.setNotificationForwardingFunction(onPressNotification);
      const handleDynamicLink = async (
        dynamicLink: FirebaseDynamicLinksTypes.DynamicLink
      ) => {
        const endpoint = dynamicLink.url.split("/")?.[3];
        console.log("Dynamic link: ", endpoint);
        listener(dynamicLink.url);
      };
      const unsubscribeToDynamicLinks =
        dynamicLinks().onLink(handleDynamicLink);

      const unsubscribeNotification = messaging().onNotificationOpenedApp(
        (message) => {
          const url = message?.data?.deeplink as string;

          if (url) {
            // Any custom logic to check whether the URL needs to be handled

            // Call the listener to let React Navigation handle the URL
            listener(url);
          }
        }
      );
      return () => {
        unsubscribeToDynamicLinks();
        linkingSubscription.remove();
        unsubscribeNotification();
      };
    },
  };

  return (
    <NavigationContainer
      linking={linking}
      ref={navigationRef}
      theme={navigationTheme}
      onReady={() => {
        isReadyRef.current = true;
      }}
    >
      <RootStack />
      <SelectChainModal ref={selectChainModalRef} />
      <FilterTokenModal ref={filterTokenModalRef} />
    </NavigationContainer>
  );
}

export default ApplicationNavigator;
