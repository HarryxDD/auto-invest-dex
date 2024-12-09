/* eslint-disable @typescript-eslint/no-unused-vars */
import { UiCol, UiRow } from "@/components";
import { ImageVariant } from "@/components/atoms";
import CubeGridLoader from "@/components/CubeGridLoader";
import {
  getSelectedDate,
  getSelectedTime,
} from "@/components/DateTimePickerModal/helper";
import { MachineItemSection } from "@/components/MachineItemSection";
import SuccessModal from "@/components/SuccessModal";
import { useEvmWallet } from "@/hooks/evm-context/useEvmWallet";
import { useBoolBag } from "@/hooks/useBoolBag";
import { useToken } from "@/hooks/useToken";
import {
  convertBigNumber,
  parseToCreateMachineDtoOnChain,
} from "@/libs/entities/machine.entity";
import { useSingleToken } from "@/screens/SingleToken/SingleToken";
import { useTheme } from "@/theme";
import { IconAvaxc } from "@/theme/assets/icons/svg";
import { SHARED_STYLES } from "@/theme/shared";
import NavigationRef from "@/utils/navigation-ref";
import { useNavigation } from "@react-navigation/native";
import { SetStateAction, useCallback, useMemo, useState } from "react";
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";

const Confirm = ({
  singleTokenProgress,
  setSingleTokenProgress,
}: {
  singleTokenProgress: number;
  setSingleTokenProgress: React.Dispatch<SetStateAction<number>>;
}) => {
  const { fonts, colors, components, gutters } = useTheme();
  const { inputs, setInputs } = useSingleToken();
  const { boolBag, setBoolBag } = useBoolBag({
    showSuccessModal: false,
  });
  const { showSuccessModal } = boolBag;
  const isDisableCreateBtn = parseFloat(inputs.depositAmount) === 0;

  const { whiteListedTokens } = useToken();
  const evmWallet = useEvmWallet();
  const navigation = useNavigation();
  const [currentMachineId, setCurrentMachineId] = useState("");
  const [createPoolLoading, setCreatePoolLoading] = useState(false);

  const baseToken = useMemo(
    () =>
      whiteListedTokens.find((item) => item.address === inputs.firstPairItem),
    [whiteListedTokens, inputs]
  );
  const targetToken = useMemo(
    () =>
      whiteListedTokens.find((item) => item.address === inputs.secondPairItem),
    [whiteListedTokens, inputs]
  );

  const handleGoBack = () => {
    NavigationRef.goBack();
  };

  const handleMoveToPreviousStep = () => {
    setSingleTokenProgress(singleTokenProgress - 1);
  };

  const handlePressDoneSuccessModal = () => {
    setBoolBag({ showSuccessModal: false });
    handleGoBack();
  };

  const handlePressCreateMachine = useCallback(async () => {
    if (!evmWallet.signer) return;
    try {
      setCreatePoolLoading(true);
      const params = parseToCreateMachineDtoOnChain(
        baseToken,
        targetToken,
        evmWallet.signer,
        inputs
      );

      const machineId = await evmWallet.createMachine(
        convertBigNumber(inputs.depositAmount, 18),
        params
      );

      console.log("Successfully create machine");
      setCurrentMachineId(machineId);
      setBoolBag({ showSuccessModal: true });
    } catch (error) {
      console.warn("Error: ", error);
    } finally {
      setCreatePoolLoading(false);
    }
  }, [inputs, evmWallet, navigation]);

  const renderDepositAmountSection = () => (
    <UiCol style={styles.sectionWrapper}>
      <UiRow>
        <Text style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}>
          Deposit amount
        </Text>
        <Text style={[fonts.semiBold, fonts.size_16, { color: colors.red500 }]}>
          {" "}
          *
        </Text>
      </UiRow>
      <UiRow.C
        style={[
          components.inputContainer,
          gutters.marginTop_16,
          { backgroundColor: colors.charlestonGreen },
        ]}
      >
        <IconAvaxc width={18} height={18} style={gutters.marginRight_2} />
        <TextInput
          placeholder="From 0.1"
          value={inputs.depositAmount.toString()}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9.]/g, "");
            const dotIndex = numericValue.indexOf(".");
            if (dotIndex !== -1) {
              const parts = numericValue.split(".");
              const formattedValue = parts[0] + "." + parts.slice(1).join("");
              setInputs({ depositAmount: formattedValue });
            } else {
              setInputs({ depositAmount: numericValue });
            }
          }}
          style={styles.textInputStyle}
          placeholderTextColor={colors.grayText}
          keyboardType="numeric"
        />
        <Text style={[fonts.semiBold, fonts.size_14, { color: colors.white }]}>
          AVAXC
        </Text>
      </UiRow.C>
    </UiCol>
  );

  const renderDCAPairSection = () => (
    <UiCol style={styles.sectionWrapper}>
      <Text style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}>
        DCA Pair
      </Text>
      <UiCol.LRC style={styles.DCAPairWrapper}>
        <UiRow.LR
          style={[
            { backgroundColor: colors.charlestonGreen },
            gutters.paddingHorizontal_24,
            gutters.paddingVertical_24,
            styles.firstPairItem,
          ]}
        >
          <UiRow.C>
            <ImageVariant
              source={{ uri: baseToken.image }}
              width={18}
              height={18}
              style={gutters.marginRight_2}
            />
            <Text
              style={[
                fonts.semiBold,
                fonts.size_16,
                gutters.marginHorizontal_4,
                { color: colors.white },
              ]}
            >
              {baseToken.symbol}
            </Text>
          </UiRow.C>
          <Text style={[fonts.size_12, { color: colors.grayText }]}>
            Balance: {evmWallet.nativeBalance}
          </Text>
        </UiRow.LR>
        <UiRow.LR
          style={[
            { backgroundColor: colors.charlestonGreen },
            gutters.paddingHorizontal_24,
            gutters.paddingVertical_24,
            styles.secondPairItem,
          ]}
        >
          <UiRow.C>
            <ImageVariant
              source={{ uri: targetToken.image }}
              width={18}
              height={18}
              style={gutters.marginRight_2}
            />
            <Text
              style={[
                fonts.semiBold,
                fonts.size_16,
                gutters.marginHorizontal_4,
                { color: colors.white },
              ]}
            >
              {targetToken.symbol}
            </Text>
          </UiRow.C>
        </UiRow.LR>
      </UiCol.LRC>
      <UiRow.LR>
        <Text style={[fonts.semiBold, fonts.size_14, { color: colors.white }]}>
          Provider
        </Text>
        <UiRow.C>
          <IconAvaxc width={18} height={18} style={gutters.marginRight_2} />
          <Text
            style={[
              fonts.semiBold,
              fonts.size_14,
              gutters.marginHorizontal_4,
              { color: colors.white },
            ]}
          >
            Avalanche
          </Text>
        </UiRow.C>
      </UiRow.LR>
    </UiCol>
  );

  const renderSummarySection = () => (
    <UiCol>
      <Text style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}>
        Summary
      </Text>
      <UiCol
        style={[
          { backgroundColor: colors.secondaryBlack },
          styles.contentContainer,
        ]}
      >
        <MachineItemSection
          title="Strategy"
          value={`${inputs.amountEachBatch} ${baseToken.symbol} ${inputs.frequency}`}
        />
        <MachineItemSection
          title="First batch time"
          value={`${getSelectedDate(inputs.firstBatchTime)} ${getSelectedTime(
            inputs.firstBatchTime
          )}`}
        />
      </UiCol>
    </UiCol>
  );

  const renderEndConditionsSection = () => (
    <UiCol>
      <Text style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}>
        End conditions
      </Text>
      <UiCol
        style={[
          { backgroundColor: colors.secondaryBlack },
          styles.contentContainer,
        ]}
      >
        <MachineItemSection title="Time" value="16/02/2023 20:00" />
        <MachineItemSection title="or" value="300 SOL" />
        <MachineItemSection title="or" value="1,000,000,000 BLOCK" />
        <MachineItemSection title="or" value="10 BATCHES" />
      </UiCol>
    </UiCol>
  );

  const renderTPSLSection = () => (
    <UiCol>
      <Text style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}>
        TP/SL
      </Text>
      <UiCol
        style={[
          { backgroundColor: colors.secondaryBlack },
          styles.contentContainer,
        ]}
      >
        <MachineItemSection title="Take profit" value="50 SOL" />
        <MachineItemSection title="Stop loss" value="10% of total invested" />
      </UiCol>
    </UiCol>
  );

  const renderScreenButtons = () => (
    <UiRow.LR style={[styles.buttonWrapper, styles.sectionWrapper]}>
      <TouchableWithoutFeedback onPress={handleMoveToPreviousStep}>
        <UiRow.C.X
          style={[components.secondaryBtn, gutters.paddingVertical_10]}
        >
          <Text style={[{ color: colors.main }, fonts.bold]}>Back</Text>
        </UiRow.C.X>
      </TouchableWithoutFeedback>
      <TouchableWithoutFeedback
        disabled={isDisableCreateBtn}
        onPress={handlePressCreateMachine}
      >
        <UiRow.C.X
          style={[
            !isDisableCreateBtn
              ? components.primaryBtn
              : components.disablePrimaryBtn,
            gutters.paddingVertical_10,
          ]}
        >
          <Text style={[{ color: colors.white }, fonts.bold]}>
            Create machine
          </Text>
        </UiRow.C.X>
      </TouchableWithoutFeedback>
    </UiRow.LR>
  );

  return (
    <>
      <CubeGridLoader
        visible={createPoolLoading}
        onTurnOff={() => setCreatePoolLoading(false)}
      />
      <SuccessModal
        visible={showSuccessModal}
        onClose={handlePressDoneSuccessModal}
        title="Success!"
      >
        <UiCol.LRC style={SHARED_STYLES.screenPadding}>
          <Text
            style={[
              fonts.size_14,
              SHARED_STYLES.textAlignCenter,
              { color: colors.white },
            ]}
          >
            Machine{" "}
            <Text style={{ color: colors.ufoGreen }}>{currentMachineId}</Text>{" "}
            has been created.
          </Text>
          <Text
            style={[
              fonts.size_14,
              gutters.marginVertical_10,
              SHARED_STYLES.textAlignCenter,
              { color: colors.white },
            ]}
          >
            The machine’s status should be updated within 5 minutes.
          </Text>
        </UiCol.LRC>
      </SuccessModal>
      <ScrollView>
        <UiCol.LRT style={[SHARED_STYLES.screenPadding, gutters.marginTop_10]}>
          {renderDepositAmountSection()}
          {renderDCAPairSection()}
          {renderSummarySection()}
          {/* {renderEndConditionsSection()} */}
          {/* {renderTPSLSection()} */}
          {renderScreenButtons()}
        </UiCol.LRT>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
  contentContainer: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginVertical: 20,
  },
  DCAPairWrapper: {
    gap: 4,
    borderRadius: 20,
    marginVertical: 16,
  },
  firstPairItem: {
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
  },
  secondPairItem: {
    borderBottomLeftRadius: 10,
    borderBottomRightRadius: 10,
  },
  textInputStyle: {
    flex: 1,
    paddingVertical: 1,
    marginLeft: 6,
    color: "white",
  },
  sectionWrapper: {
    marginVertical: 30,
  },
  buttonWrapper: {
    gap: 16,
  },
  width18: { width: 18 },
  gap10: { gap: 10 },
});

export default Confirm;
