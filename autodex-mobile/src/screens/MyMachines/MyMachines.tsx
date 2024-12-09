import { UiCol, UiMultiSwitch, UiRow } from "@/components";
import CubeGridLoader from "@/components/CubeGridLoader";
import { MachineItem } from "@/components/MachineItem";
import RegisterUserDeviceTokenModal from "@/components/RegisterUserDeviceTokenModal";
import { SyncButton } from "@/components/SyncButton";
import { SafeScreen } from "@/components/template";
import { EMachineTab } from "@/constants/mymachine";
import { useApp } from "@/contexts/app.context";
import { useEvmWallet } from "@/hooks/evm-context/useEvmWallet";
import { useBoolBag } from "@/hooks/useBoolBag";
import { useDebounce } from "@/hooks/useDebounce";
import { useInput } from "@/hooks/useInput";
import { PoolEntity, PoolStatus } from "@/libs/entities/pool.entity";
import { MachineService } from "@/libs/services/machine.service";
import { useTheme } from "@/theme";
import { SHARED_STYLES } from "@/theme/shared";
import { useNavigation } from "@react-navigation/native";
import { useCallback, useEffect, useState } from "react";
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import messaging from "@react-native-firebase/messaging";

const styles = StyleSheet.create({
  topSection: {
    marginVertical: 20,
  },
  tabContainer: {
    height: 36,
  },
  searchSection: {
    marginVertical: 18,
    gap: 14,
  },
  searchbarInput: {
    flex: 1,
    paddingVertical: 1,
    color: "#fff",
  },
  filterSectionText: {
    marginRight: 10,
    fontWeight: "600",
  },
});

function MyMachines() {
  const { fonts, colors, components, gutters } = useTheme();
  const screenTabs = [EMachineTab.RUNNING, EMachineTab.HISTORY];
  const [currentTab, setCurrentTab] = useState(EMachineTab.RUNNING);
  const [activePools, setActivePools] = useState<PoolEntity[]>([]);
  const [historyPools, setHistoryPools] = useState<PoolEntity[]>([]);
  const [
    registerUserDeviceTokenDisplayed,
    setRegisterUserDeviceTokenDisplayed,
  ] = useState(false);

  const evmWallet = useEvmWallet();
  const navigation = useNavigation();
  const { filterTokenModalRef } = useApp();
  const { boolBag, setBoolBag } = useBoolBag({
    loadingSyncWalletPools: false,
  });
  const { loadingSyncWalletPools } = boolBag;
  const [inputs, setInputs] = useInput({ searchValue: "" });

  const searchValue = useDebounce(inputs.searchValue, 100);

  const handleSelectToken = () => {
    filterTokenModalRef.current?.present();
  };

  const checkIsAbleToRegisterDevice = useCallback(() => {
    if (!evmWallet.signer?.address) return;
    try {
      messaging()
        .getToken()
        .then(async (token) => {
          const isExist = await new MachineService().checkDeviceToken(
            evmWallet.signer.address,
            token
          );

          if (!isExist) {
            console.log("Registering device token");
            setRegisterUserDeviceTokenDisplayed(true);
          }
        });
      // eslint-disable-next-line no-empty
    } catch {
    } finally {
      // eslint-disable-next-line no-empty
    }
  }, [evmWallet]);

  const registerDevice = useCallback(() => {
    try {
      messaging()
        .getToken()
        .then(async (token) => {
          const challenge = `REGISTER::DEVICE::${
            evmWallet.signer.address
          }::${token}::${new Date().getTime()}`;

          const service = new MachineService();
          const auth = await service.registerAuthChallenge(
            evmWallet.signer.address,
            challenge
          );

          const signature = await evmWallet.signer.signMessage(
            auth.data.challenge
          );

          await new MachineService().registerUserDeviceToken({
            deviceToken: token,
            walletAddress: evmWallet.signer.address,
            authChallengeId: auth.data._id,
            signature,
          });
        })
        .catch((err) => {
          console.log(err);
        });
    } catch (err) {
      console.log(err);
    } finally {
      setRegisterUserDeviceTokenDisplayed(false);
    }
  }, [evmWallet]);

  useEffect(() => {
    checkIsAbleToRegisterDevice();
  }, [evmWallet]);

  const fetchPools = useCallback(() => {
    if (!evmWallet.signer) return;
    new MachineService()
      .getMachineList(
        evmWallet.signer.address,
        [PoolStatus.ACTIVE],
        searchValue
      )
      .then((data) => {
        setActivePools(data);
      })
      .catch((error) => {
        console.log(error);
      });

    new MachineService()
      .getMachineList(
        evmWallet.signer.address,
        [PoolStatus.PAUSED, PoolStatus.CLOSED, PoolStatus.ENDED],
        searchValue
      )
      .then((data) => {
        setHistoryPools(data);
      })
      .catch((error) => {
        console.log(error);
      });
  }, [evmWallet, navigation, searchValue]);

  const syncWalletPools = useCallback(async () => {
    return new Promise((resolve) => {
      if (!evmWallet.signer) resolve(false);
      setBoolBag({ loadingSyncWalletPools: true });
      new MachineService()
        .syncWalletMachines(evmWallet.signer.address)
        .then(() => {
          fetchPools();
        })
        .catch((error) => {
          console.log(error);
        })
        .finally(() => {
          setBoolBag({ loadingSyncWalletPools: false });
          resolve(true);
        });
    });
  }, [evmWallet]);

  useEffect(() => {
    fetchPools();
  }, [evmWallet, navigation, searchValue]);

  const handleChangePoolTab = (tab: EMachineTab) => {
    setInputs({ searchValue: "" });
    setCurrentTab(tab);
  };

  const renderScreenHeader = () => (
    <UiRow.LR style={styles.topSection}>
      <Text style={[fonts.size_20, fonts.bold, { color: colors.white }]}>
        My Machines
      </Text>
      <SyncButton syncFn={syncWalletPools} />
    </UiRow.LR>
  );

  const renderSearchSection = () => (
    <UiRow style={styles.searchSection}>
      <UiRow.C.X style={components.inputContainer}>
        <Ionicons name="search-outline" color={colors.grayText} size={18} />
        <TextInput
          placeholder="Search"
          value={inputs.searchValue}
          onChangeText={(text) => {
            setInputs({ searchValue: text });
          }}
          style={styles.searchbarInput}
          placeholderTextColor={colors.grayText}
        />
      </UiRow.C.X>
      <TouchableWithoutFeedback onPress={handleSelectToken}>
        <UiRow.C style={components.inputContainer}>
          <Text style={[styles.filterSectionText, { color: colors.grayText }]}>
            AVAXC
          </Text>
          <Ionicons
            name="chevron-down-outline"
            color={colors.grayText}
            size={18}
            style={gutters.marginTop_2}
          />
        </UiRow.C>
      </TouchableWithoutFeedback>
    </UiRow>
  );

  return (
    <SafeScreen>
      <CubeGridLoader visible={loadingSyncWalletPools} />
      <UiCol.X style={[SHARED_STYLES.screenPadding]}>
        {renderScreenHeader()}
        <UiMultiSwitch
          items={screenTabs}
          value={currentTab}
          onChange={handleChangePoolTab}
          containerStyle={[
            {
              backgroundColor: colors.secondaryBlack,
            },
            styles.tabContainer,
          ]}
          textStyle={[{ color: colors.grayText }, fonts.bold]}
          activeTextStyle={{ color: colors.white }}
          sliderStyle={{ backgroundColor: colors.main }}
        />
        {renderSearchSection()}
        <FlatList
          data={currentTab === EMachineTab.RUNNING ? activePools : historyPools}
          renderItem={({ item }) => <MachineItem key={item._id} pool={item} />}
          showsVerticalScrollIndicator={false}
          keyExtractor={(item) => `${item._id}`}
          contentContainerStyle={SHARED_STYLES.growX}
        />
      </UiCol.X>
      <RegisterUserDeviceTokenModal
        visible={registerUserDeviceTokenDisplayed}
        onOk={() => registerDevice()}
        onClose={() => setRegisterUserDeviceTokenDisplayed(false)}
        title="Registering this device will allow you to receive notifications for your machines."
      />
    </SafeScreen>
  );
}

export default MyMachines;
