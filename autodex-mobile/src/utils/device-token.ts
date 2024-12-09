import messaging from "@react-native-firebase/messaging";

export const updateDeviceToken = async () => {
  try {
    const authStatus = await messaging().hasPermission();
    console.log(`Firebase: Auth Status -> ${authStatus}`);
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log("Firebase: Start getting token");
      const fcmToken = await messaging().getToken();
      console.log("Firebase: Get token OK");
      if (fcmToken) {
        // await dispatch(
        //   addUserDevice({
        //     data: {
        //       device_token: fcmToken,
        //       type: "fcm",
        //     },
        //   })
        // );
      }
    }
  } catch (e) {
    console.error(e);
  }
};

export const removeDeviceToken = async () => {
  try {
    const authStatus = await messaging().hasPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;
    if (enabled) {
      const fcmToken = await messaging().getToken();
      if (fcmToken) {
        // await dispatch!(
        //   logoutApi({
        //     data: {
        //       device_token: fcmToken,
        //     },
        //   })
        // );
      }
    }
  } catch (e) {
    console.error(e);
  }
};
