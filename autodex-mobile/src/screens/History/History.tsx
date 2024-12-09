import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "@/theme";
import { SafeScreen } from "@/components/template";
import { UiCol, UiRow } from "@/components";
import { SHARED_STYLES } from "@/theme/shared";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useInput } from "@/hooks/useInput";
import { MachineItemSection } from "@/components/MachineItemSection";
import UiDivider from "@/components/UiDivider";
import { useEvmWallet } from "@/hooks/evm-context/useEvmWallet";
import { useEffect, useState } from "react";
import { MachineService } from "@/libs/services/machine.service";
import { ActivityTypeMap, UserHistory, convertDecimal } from "@/libs/entities/machine.entity";
import moment from "moment";
import { UtilsProvider } from "@/utils/utils.provider";
import { useToken } from "@/hooks/useToken";

function History() {
  const { fonts, colors, components, gutters } = useTheme();
  const [inputs, setInputs] = useInput({ searchValue: "" });
  const [machineActivites, setMachineActivites] = useState<UserHistory[]>([]);
  const { whiteListedTokens } = useToken();

  const signer = useEvmWallet();

  useEffect(() => {
    if (!signer.signer.address) {
      return;
    }

    new MachineService()
      .getUserActivities(signer.signer.address)
      .then((res) => {
        if (!res) return;
        setMachineActivites(res);
      });
  }, [signer]);

  const renderSearchAndFilter = () => (
    <>
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
      <UiRow.LR style={gutters.marginVertical_20}>
        <Text style={[fonts.semiBold, fonts.size_12, { color: colors.white }]}>
          Filter by
        </Text>
        <TouchableWithoutFeedback onPress={() => {}}>
          <UiRow.C style={[components.secondaryBtn]}>
            <Text
              style={[
                gutters.marginRight_8,
                fonts.bold,
                { color: colors.white },
              ]}
            >
              Last 3 months
            </Text>
            <Ionicons name="calendar-outline" color={colors.main} size={18} />
          </UiRow.C>
        </TouchableWithoutFeedback>
      </UiRow.LR>
    </>
  );

  return (
    <SafeScreen>
      <ScrollView>
        <UiCol style={SHARED_STYLES.screenPadding}>
          {renderSearchAndFilter()}
          {machineActivites.map((item, idx) => {
            const baseToken = whiteListedTokens.find(
              (token) => token.address === item.pool.baseTokenAddress
            );
            const targetToken = whiteListedTokens.find(
              (token) => token.address === item.pool.targetTokenAddress
            );

            console.log(item.type);

            return (
              <UiCol key={`MACHINE::ACTIVIT::${idx}`}>
                <UiRow.LR style={gutters.marginBottom_10}>
                  <Text
                    style={[fonts.bold, fonts.size_12, { color: colors.white }]}
                  >
                    {moment(item.createdAt).format("DD MMM YYYY")}
                  </Text>
                  <Text style={[fonts.semiBold, { color: colors.grayText }]}>
                    {new UtilsProvider().makeShort(item.eventHash, 8)}
                  </Text>
                </UiRow.LR>
                <UiCol
                  style={[
                    { backgroundColor: colors.secondaryBlack },
                    styles.itemContainer,
                  ]}
                >
                  {baseToken && (
                    <>
                      <MachineItemSection title="Pair" value={`${targetToken.symbol}/${baseToken.symbol}`} />
                      {(item.type || convertDecimal(item.baseTokenAmount) || convertDecimal(item.targetTokenAmount)) && (
                        <UiDivider />
                      )}
                    </>
                  )}
                  {item.type && (
                    <>
                      <MachineItemSection title="Type" value={ActivityTypeMap[item.type]} />
                      {(convertDecimal(item.baseTokenAmount) || convertDecimal(item.targetTokenAmount)) && <UiDivider />}
                    </>
                  )}
                  {item.baseTokenAmount && (
                    <>
                      <MachineItemSection title={`${baseToken.symbol} Amount`} value={new UtilsProvider().getDisplayedDecimals(item.baseTokenAmount)} />
                      {item.baseTokenAmount && <UiDivider />}
                    </>
                  )}
                  {item.targetTokenAmount && (
                    <>
                      <MachineItemSection title={`${targetToken.symbol} Amount`} value={new UtilsProvider().getDisplayedDecimals(item.targetTokenAmount)} />
                      {item.targetTokenAmount && <UiDivider />}
                    </>
                  )}
                </UiCol>
              </UiCol>
            );
          })}
        </UiCol>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  searchbarInput: {
    flex: 1,
    color: "#fff",
    paddingVertical: 1,
  },
  itemContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
});

export default History;
