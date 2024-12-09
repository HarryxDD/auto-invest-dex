import { UiCol, UiRow } from "@/components";
import CollapsibleView from "@/components/CollapsibleComponent";
import {
  EConditionOperator,
  EStrategyFrequency,
  STRATEGY_FREQUENCIES,
} from "@/constants/strategy";
import { useTheme } from "@/theme";
import { IconAvaxc, TrashCan } from "@/theme/assets/icons/svg";
import { SHARED_STYLES } from "@/theme/shared";
import { SetStateAction, useMemo, useRef, useState } from "react";
import {
  Keyboard,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableWithoutFeedback,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import DateTimePickerModal from "@/components/DateTimePickerModal";
import {
  getSelectedDate,
  getSelectedTime,
} from "@/components/DateTimePickerModal/helper";
import { StrategyConditionModal } from "@/components/StrategyConditionModal";
import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { useBoolBag } from "@/hooks/useBoolBag";
import { useSingleToken } from "@/screens/SingleToken/SingleToken";
import { useToken } from "@/hooks/useToken";
import { ImageVariant } from "@/components/atoms";
import { useEvmWallet } from "@/hooks/evm-context/useEvmWallet";

const SetStrategy = ({
  singleTokenProgress,
  setSingleTokenProgress,
}: {
  singleTokenProgress: number;
  setSingleTokenProgress: React.Dispatch<SetStateAction<number>>;
}) => {
  const { fonts, colors, components, gutters } = useTheme();
  const [isShowAdvanceSetup, setIsShowAdvanceSetup] = useState<boolean>(false);
  const strategyConditionModalRef = useRef<BottomSheetModal>(null);
  const { inputs, setInputs } = useSingleToken();
  const [conditionOperator, setConditionOperator] =
    useState<EConditionOperator>(
      inputs.byAtMarketCondition?.type || EConditionOperator.BETWEEN
    );
  const { boolBag, setBoolBag } = useBoolBag({
    showDatePicker: false,
    showTimePicker: false,
  });
  const { showDatePicker, showTimePicker } = boolBag;
  const [selectedFrequency, setSelectedFrequency] = useState(
    EStrategyFrequency.DAILY
  );
  const { whiteListedTokens } = useToken();
  const { nativeBalance } = useEvmWallet();

  const targetToken = useMemo(
    () =>
      whiteListedTokens.find((item) => item.address === inputs.secondPairItem),
    [inputs, whiteListedTokens]
  );

  const handleMoveToNextStep = () => {
    setSingleTokenProgress(singleTokenProgress + 1);
  };

  const handleMoveToPreviousStep = () => {
    setSingleTokenProgress(singleTokenProgress - 1);
  };

  const handleConfirmFirstBatchTime = (mode: string, date: Date) => {
    if (mode === "date") {
      setInputs({ firstBatchDate: date });
      setBoolBag({ showDatePicker: false });
    } else {
      setInputs({ firstBatchTime: date });
      setBoolBag({ showTimePicker: false });
    }
  };

  const handleShowStrategyConditionModal = () => {
    Keyboard.dismiss();
    strategyConditionModalRef?.current?.present();
  };

  const handleSelectCondition = (condition: EConditionOperator) => {
    setConditionOperator(condition);
    setInputs({
      byAtMarketCondition: {
        type: condition,
        values: [
          inputs.byAtMarketCondition?.values?.[0],
          inputs.byAtMarketCondition?.values?.[1],
        ],
      },
    });
  };

  const handleRemoveAdvancedSetup = () => {
    setInputs({
      targetTokenAmount: null,
      targetSOLAmount: null,
      targetBatchesPurchased: null,
    });
  };

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
              source={{
                uri: whiteListedTokens.find(
                  (item) => item.address === inputs.firstPairItem
                ).image,
              }}
              width={18}
              height={18}
            />
            <Text
              style={[
                fonts.semiBold,
                fonts.size_16,
                gutters.marginHorizontal_4,
                { color: colors.white },
              ]}
            >
              {
                whiteListedTokens.find(
                  (item) => item.address === inputs.firstPairItem
                ).name
              }
            </Text>
            <Ionicons
              name="chevron-down-outline"
              color={colors.grayText}
              size={18}
              style={gutters.marginTop_2}
            />
          </UiRow.C>
          <Text style={[fonts.size_12, { color: colors.grayText }]}>
            Balance: {nativeBalance}
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
              source={{
                uri: whiteListedTokens.find(
                  (item) => item.address === inputs.secondPairItem
                ).image,
              }}
              width={18}
              height={18}
            />
            <Text
              style={[
                fonts.semiBold,
                fonts.size_16,
                gutters.marginHorizontal_4,
                { color: colors.white },
              ]}
            >
              {
                whiteListedTokens.find(
                  (item) => item.address === inputs.secondPairItem
                ).name
              }
            </Text>
            <Ionicons
              name="chevron-down-outline"
              color={colors.grayText}
              size={18}
              style={gutters.marginTop_2}
            />
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
            AVAXC
          </Text>
        </UiRow.C>
      </UiRow.LR>
    </UiCol>
  );

  const renderAmountEachBatchSection = () => (
    <UiCol style={styles.sectionWrapper}>
      <UiRow>
        <Text style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}>
          Amount each batch
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
          value={inputs.amountEachBatch.toString()}
          onChangeText={(text) => {
            const numericValue = text.replace(/[^0-9.]/g, "");
            const dotIndex = numericValue.indexOf(".");
            if (dotIndex !== -1) {
              const parts = numericValue.split(".");
              const formattedValue = parts[0] + "." + parts.slice(1).join("");
              setInputs({ amountEachBatch: formattedValue });
            } else {
              setInputs({ amountEachBatch: numericValue });
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

  const renderFrequencySection = () => (
    <UiCol style={styles.sectionWrapper}>
      <UiRow.L>
        <Text style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}>
          Frequency
        </Text>
      </UiRow.L>
      <UiRow style={[SHARED_STYLES.flexWrap, gutters.marginTop_8]}>
        {STRATEGY_FREQUENCIES.map((frequency) => (
          <TouchableWithoutFeedback
            key={frequency.name}
            onPress={() => {
              setSelectedFrequency(frequency.name);
              setInputs({ frequency: frequency.name });
            }}
          >
            <UiCol.C
              style={[
                {
                  backgroundColor:
                    frequency.name === selectedFrequency
                      ? colors.main
                      : colors.charlestonGreen,
                },
                styles.frequencyItem,
              ]}
            >
              <Text
                style={[
                  {
                    color:
                      frequency.name === selectedFrequency
                        ? colors.white
                        : colors.grayText,
                  },
                ]}
              >
                {frequency.name}
              </Text>
            </UiCol.C>
          </TouchableWithoutFeedback>
        ))}
      </UiRow>
    </UiCol>
  );

  const renderFirstBatchTimeSection = () => (
    <UiCol style={styles.sectionWrapper}>
      <DateTimePickerModal
        isVisible={showTimePicker}
        date={inputs.firstBatchTime}
        mode="time"
        onConfirm={(date) => handleConfirmFirstBatchTime("time", date)}
        onCancel={() => setBoolBag({ showTimePicker: false })}
      />
      <DateTimePickerModal
        isVisible={showDatePicker}
        date={inputs.firstBatchDate}
        mode="date"
        onConfirm={(date) => handleConfirmFirstBatchTime("date", date)}
        onCancel={() => setBoolBag({ showDatePicker: false })}
      />
      <UiRow.L>
        <Text style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}>
          First batch time
        </Text>
        <Text style={[fonts.size_16, { color: colors.grayText }]}>
          {" "}
          (+7Hrs)
        </Text>
      </UiRow.L>
      <UiRow style={styles.firstBatchTimeItem}>
        <TouchableWithoutFeedback
          onPress={() => setBoolBag({ showDatePicker: true })}
        >
          <UiRow.LR.X
            style={[
              components.inputContainer,
              { backgroundColor: colors.charlestonGreen },
            ]}
          >
            <Text style={[{ color: colors.white }]}>
              {getSelectedDate(inputs.firstBatchDate)}
            </Text>
            <Ionicons
              name="calendar-outline"
              color={colors.grayText}
              size={18}
              style={gutters.marginTop_2}
            />
          </UiRow.LR.X>
        </TouchableWithoutFeedback>
        <TouchableWithoutFeedback
          onPress={() => setBoolBag({ showTimePicker: true })}
        >
          <UiRow.C
            style={[
              components.inputContainer,
              { backgroundColor: colors.charlestonGreen },
            ]}
          >
            <Text style={[gutters.marginRight_10, { color: colors.white }]}>
              {getSelectedTime(inputs.firstBatchTime)}
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
    </UiCol>
  );

  const renderAdvanceSetupSection = () => (
    <UiCol.LRT>
      <TouchableWithoutFeedback
        onPress={() => {
          setIsShowAdvanceSetup(!isShowAdvanceSetup);
        }}
      >
        <UiRow.C style={styles.sectionWrapper}>
          <Text style={[gutters.marginRight_8, { color: colors.main }]}>
            Advance setup
          </Text>
          <Ionicons
            name={`chevron-${isShowAdvanceSetup ? "up" : "down"}-outline`}
            color={colors.main}
            size={18}
            style={gutters.marginTop_2}
          />
        </UiRow.C>
      </TouchableWithoutFeedback>
      {isShowAdvanceSetup && (
        <UiCol style={styles.sectionWrapper}>
          {/* Buy at market price if */}
          <UiCol style={styles.sectionWrapper}>
            <UiRow.L>
              <Text
                style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}
              >
                Buy at market price if
              </Text>
            </UiRow.L>
            <CollapsibleView title="Add condition" maxHeight={220}>
              <UiCol>
                <Text
                  style={[
                    fonts.size_14,
                    gutters.marginBottom_14,
                    { color: colors.ceil },
                  ]}
                >
                  Each batch ({inputs.amountEachBatch} AVAXC) can buy
                </Text>
                <TouchableWithoutFeedback
                  onPress={handleShowStrategyConditionModal}
                >
                  <UiRow.C
                    style={[
                      components.inputContainer,
                      { backgroundColor: colors.charlestonGreen },
                      SHARED_STYLES.justifyContentBetween,
                    ]}
                  >
                    <UiCol style={styles.width18} />
                    <Text
                      style={[{ color: colors.white }, gutters.marginRight_10]}
                    >
                      {conditionOperator}
                    </Text>
                    <Ionicons
                      name="chevron-down-outline"
                      color={colors.main}
                      size={18}
                      style={gutters.marginTop_2}
                    />
                  </UiRow.C>
                </TouchableWithoutFeedback>
                <UiRow.LR style={gutters.marginTop_14}>
                  <UiRow.X
                    style={[
                      components.inputContainer,
                      { backgroundColor: colors.charlestonGreen },
                    ]}
                  >
                    <TextInput
                      style={[{ color: colors.white }, gutters.marginRight_10]}
                      placeholder="Value"
                      placeholderTextColor={colors.grayText}
                      value={inputs.byAtMarketCondition.values?.[0]}
                      onChangeText={(value) =>
                        setInputs({
                          byAtMarketCondition: {
                            type: conditionOperator,
                            values: [
                              value || "",
                              inputs.byAtMarketCondition.values[1] || "",
                            ],
                          },
                        })
                      }
                      keyboardType="numeric"
                    />
                  </UiRow.X>
                  {conditionOperator === EConditionOperator.BETWEEN && (
                    <>
                      <Text
                        style={[
                          gutters.marginHorizontal_20,
                          { color: colors.white },
                        ]}
                      >
                        and
                      </Text>
                      <UiRow.X
                        style={[
                          components.inputContainer,
                          { backgroundColor: colors.charlestonGreen },
                        ]}
                      >
                        <TextInput
                          style={[
                            { color: colors.white },
                            gutters.marginRight_10,
                          ]}
                          placeholder="Value"
                          placeholderTextColor={colors.grayText}
                          value={inputs.byAtMarketCondition?.values?.[1] || "0"}
                          onChangeText={(value) =>
                            setInputs({
                              byAtMarketCondition: {
                                type: conditionOperator,
                                values: [
                                  inputs.byAtMarketCondition?.values?.[0] || "",
                                  value || "",
                                ],
                              },
                            })
                          }
                          keyboardType="numeric"
                        />
                      </UiRow.X>
                    </>
                  )}
                </UiRow.LR>
                <UiRow.L style={gutters.marginTop_14}>
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
                </UiRow.L>
              </UiCol>
            </CollapsibleView>
          </UiCol>

          {/* Close machine when reach */}
          <UiCol style={styles.sectionWrapper}>
            <UiRow.L>
              <Text
                style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}
              >
                Close machine when reach
              </Text>
            </UiRow.L>
            <CollapsibleView title="Add end time" maxHeight={85}>
              <UiRow style={styles.endTimeWrapper}>
                <TouchableWithoutFeedback
                  onPress={() => setBoolBag({ showDatePicker: true })}
                >
                  <UiRow.LR.X
                    style={[
                      components.inputContainer,
                      { backgroundColor: colors.charlestonGreen },
                    ]}
                  >
                    <Text style={[{ color: colors.white }]}>
                      {getSelectedDate(inputs.firstBatchDate)}
                    </Text>
                    <Ionicons
                      name="calendar-outline"
                      color={colors.grayText}
                      size={18}
                      style={gutters.marginTop_2}
                    />
                  </UiRow.LR.X>
                </TouchableWithoutFeedback>
                <TouchableWithoutFeedback
                  onPress={() => setBoolBag({ showTimePicker: true })}
                >
                  <UiRow.C
                    style={[
                      components.inputContainer,
                      { backgroundColor: colors.charlestonGreen },
                    ]}
                  >
                    <Text
                      style={[gutters.marginRight_10, { color: colors.white }]}
                    >
                      {getSelectedTime(inputs.firstBatchTime)}
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
            </CollapsibleView>
            <CollapsibleView
              title="Add target token amount"
              maxHeight={90}
              onClear={
                inputs.targetTokenAmount
                  ? () => setInputs({ targetTokenAmount: "" })
                  : null
              }
            >
              <UiRow.C
                style={[
                  components.inputContainer,
                  gutters.marginTop_4,
                  { backgroundColor: colors.charlestonGreen },
                ]}
              >
                <ImageVariant
                  source={{ uri: targetToken?.image }}
                  width={18}
                  height={18}
                  style={gutters.marginRight_2}
                />
                <TextInput
                  placeholder="From 0.001"
                  value={inputs.targetTokenAmount?.toString()}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.]/g, "");
                    const dotIndex = numericValue.indexOf(".");
                    if (dotIndex !== -1) {
                      const parts = numericValue.split(".");
                      const formattedValue =
                        parts[0] + "." + parts.slice(1).join("");
                      setInputs({ targetTokenAmount: formattedValue });
                    } else {
                      setInputs({ targetTokenAmount: numericValue });
                    }
                  }}
                  style={styles.textInputStyle}
                  placeholderTextColor={colors.grayText}
                  keyboardType="numeric"
                />
                <Text
                  style={[
                    fonts.semiBold,
                    fonts.size_14,
                    { color: colors.white },
                  ]}
                >
                  {targetToken.symbol}
                </Text>
              </UiRow.C>
            </CollapsibleView>
            <CollapsibleView
              title="Add target AVAXC amount"
              maxHeight={90}
              onClear={
                inputs.targetSOLAmount
                  ? () => setInputs({ targetSOLAmount: "" })
                  : null
              }
            >
              <UiRow.C
                style={[
                  components.inputContainer,
                  gutters.marginTop_4,
                  { backgroundColor: colors.charlestonGreen },
                ]}
              >
                <IconAvaxc
                  width={18}
                  height={18}
                  style={gutters.marginRight_2}
                />
                <TextInput
                  placeholder="From 0.1"
                  value={inputs.targetSOLAmount?.toString()}
                  onChangeText={(text) => {
                    const numericValue = text.replace(/[^0-9.]/g, "");
                    const dotIndex = numericValue.indexOf(".");
                    if (dotIndex !== -1) {
                      const parts = numericValue.split(".");
                      const formattedValue =
                        parts[0] + "." + parts.slice(1).join("");
                      setInputs({ targetSOLAmount: formattedValue });
                    } else {
                      setInputs({ targetSOLAmount: numericValue });
                    }
                  }}
                  style={styles.textInputStyle}
                  placeholderTextColor={colors.grayText}
                  keyboardType="numeric"
                />
                <Text
                  style={[
                    fonts.semiBold,
                    fonts.size_14,
                    { color: colors.white },
                  ]}
                >
                  AVAXC
                </Text>
              </UiRow.C>
            </CollapsibleView>
            <CollapsibleView
              title="Add target batches purchased"
              maxHeight={90}
              onClear={
                inputs.targetBatchesPurchased
                  ? () => setInputs({ targetBatchesPurchased: null })
                  : null
              }
            >
              <UiRow.C
                style={[
                  components.inputContainer,
                  gutters.marginTop_4,
                  { backgroundColor: colors.charlestonGreen },
                ]}
              >
                <TextInput
                  placeholder="Amount of purchased batches"
                  value={inputs.targetBatchesPurchased?.toString()}
                  onChangeText={(val) => {
                    const numericValue = val.replace(/[^0-9]/g, "");
                    setInputs({ targetBatchesPurchased: numericValue });
                  }}
                  style={styles.textInputStyle}
                  placeholderTextColor={colors.grayText}
                  keyboardType="numeric"
                />
              </UiRow.C>
            </CollapsibleView>
          </UiCol>

          {/* Take Profit */}
          {/* <UiCol style={styles.sectionWrapper}>
            <Text
              style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}
            >
              Take Profit
            </Text>
            <UiRow.L>
              <Text
                style={[
                  fonts.size_12,
                  gutters.marginVertical_10,
                  { color: colors.grayText },
                ]}
              >
                At fixed price target
              </Text>
              <QuestionMark
                style={[gutters.marginTop_2, gutters.marginLeft_2]}
              />
            </UiRow.L>
            <UiRow.C
              style={[
                components.inputContainer,
                { backgroundColor: colors.charlestonGreen },
              ]}
            >
              <IconAvaxc width={18} height={18} style={gutters.marginRight_2} />
              <TextInput
                placeholder="Input price take profit"
                value={inputs.takeProfit?.toString()}
                onChangeText={(text) => {
                  setInputs({ takeProfit: +text });
                }}
                style={styles.textInputStyle}
                placeholderTextColor={colors.grayText}
              />
              <Text
                style={[fonts.semiBold, fonts.size_14, { color: colors.white }]}
              >
                AVAXC
              </Text>
            </UiRow.C>
          </UiCol> */}

          {/* Stop Loss */}
          {/* <UiCol style={styles.sectionWrapper}>
            <Text
              style={[fonts.semiBold, fonts.size_16, { color: colors.white }]}
            >
              Stop Loss
            </Text>
            <UiRow.L>
              <Text
                style={[
                  fonts.size_12,
                  gutters.marginVertical_10,
                  { color: colors.grayText },
                ]}
              >
                At fixed price stop loss
              </Text>
              <QuestionMark
                style={[gutters.marginTop_2, gutters.marginLeft_2]}
              />
            </UiRow.L>
            <UiRow.C
              style={[
                components.inputContainer,
                { backgroundColor: colors.charlestonGreen },
              ]}
            >
              <IconAvaxc width={18} height={18} style={gutters.marginRight_2} />
              <TextInput
                placeholder="Input price stop loss"
                value={inputs.stopLoss?.toString()}
                onChangeText={(text) => {
                  setInputs({ stopLoss: +text });
                }}
                style={styles.textInputStyle}
                placeholderTextColor={colors.grayText}
              />
              <Text
                style={[fonts.semiBold, fonts.size_14, { color: colors.white }]}
              >
                AVAXC
              </Text>
            </UiRow.C>
          </UiCol> */}

          <TouchableWithoutFeedback onPress={handleRemoveAdvancedSetup}>
            <UiRow.C.X
              style={[
                components.secondaryBtn,
                gutters.paddingVertical_10,
                {
                  borderColor: colors.red400,
                  backgroundColor: `${colors.red400}17`,
                },
              ]}
            >
              <Text
                style={[
                  { color: colors.red400 },
                  gutters.marginRight_4,
                  fonts.bold,
                ]}
              >
                Remove Advance Setup
              </Text>
              <TrashCan />
            </UiRow.C.X>
          </TouchableWithoutFeedback>
        </UiCol>
      )}
    </UiCol.LRT>
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
      <TouchableWithoutFeedback onPress={handleMoveToNextStep}>
        <UiRow.C.X style={[components.primaryBtn, gutters.paddingVertical_10]}>
          <Text style={[{ color: colors.white }, fonts.bold]}>Continue</Text>
        </UiRow.C.X>
      </TouchableWithoutFeedback>
    </UiRow.LR>
  );

  return (
    <>
      <StrategyConditionModal
        ref={strategyConditionModalRef}
        selectedCondition={conditionOperator}
        onSelectCondition={handleSelectCondition}
      />
      <ScrollView>
        <UiCol.LRT style={[SHARED_STYLES.screenPadding, gutters.marginTop_10]}>
          {renderDCAPairSection()}
          {renderAmountEachBatchSection()}
          {renderFrequencySection()}
          {renderFirstBatchTimeSection()}
          {renderAdvanceSetupSection()}
          {renderScreenButtons()}
        </UiCol.LRT>
      </ScrollView>
    </>
  );
};

const styles = StyleSheet.create({
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
  sectionWrapper: {
    marginBottom: 30,
  },
  textInputStyle: {
    flex: 1,
    paddingVertical: 1,
    marginLeft: 6,
    color: "white",
  },
  frequencyItem: {
    paddingVertical: 10,
    paddingHorizontal: 16,
    marginRight: 10,
    marginVertical: 7,
    borderRadius: 20,
  },
  firstBatchTimeItem: {
    gap: 10,
    marginTop: 16,
  },
  endTimeWrapper: {
    gap: 10,
  },
  buttonWrapper: {
    gap: 16,
  },
  width18: { width: 18 },
  gap10: { gap: 10 },
});

export default SetStrategy;
