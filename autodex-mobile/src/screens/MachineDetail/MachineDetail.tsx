/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  Text,
  Linking,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  TouchableWithoutFeedback,
} from "react-native";
import { useTheme } from "@/theme";
import { SafeScreen } from "@/components/template";
import { UiCol, UiRow } from "@/components";
import { RouteProp, useRoute } from "@react-navigation/native";
import { MainParamList } from "@/types/navigation";
import { MachineItemSection } from "@/components/MachineItemSection";
import { SHARED_STYLES, UI_CONSTANT } from "@/theme/shared";
import { useCallback, useEffect, useMemo, useState } from "react";
import { MachineService } from "@/libs/services/machine.service";
import { PoolEntity, PoolStatus } from "@/libs/entities/pool.entity";
import { useToken } from "@/hooks/useToken";
import { truncateAddress } from "@/utils/helpers/string";
import { convertHoursToDurationsTime, extractAveragePrice } from "@/utils";
import {
  MachineActivity,
  convertDecimal,
} from "@/libs/entities/machine.entity";
import BigDecimal from "js-big-decimal";

import moment from "moment";

import { UtilsProvider } from "@/utils/utils.provider";
import { TouchableOpacity } from "react-native-gesture-handler";
import UiDivider from "@/components/UiDivider";
import { MachineStatuses } from "@/constants/mymachine";
import { useEvmWallet } from "@/hooks/evm-context/useEvmWallet";
import { SyncButton } from "@/components/SyncButton";
import CubeGridLoader from "@/components/CubeGridLoader";

function MachineDetail() {
  const { colors, fonts, gutters, components } = useTheme();
  const { params } =
    useRoute<RouteProp<MainParamList, "SCREEN_MACHINE_DETAIL">>();
  const { machineId } = params || {};
  const [pool, setPool] = useState<PoolEntity>();
  const [poolActivities, setPoolActivities] = useState<MachineActivity[]>([]);
  const [syncLoading, setSyncLoading] = useState(false);
  const { whiteListedTokens } = useToken();

  // Extracted from useEvmWallet.tsx
  const contract = useEvmWallet();

  const baseToken = useMemo(() => {
    return whiteListedTokens.find(
      (token) => token.address === pool?.baseTokenAddress
    );
  }, [pool]);

  const targetToken = useMemo(() => {
    return whiteListedTokens.find(
      (token) => token.address === pool?.targetTokenAddress
    );
  }, [pool]);

  const syncMachine = async () => {
    if (!machineId) return;
    try {
      setSyncLoading(true);
      await new MachineService().syncMachine(String(machineId));
      const syncedActivities = await new MachineService().getMachineActivities(
        String(machineId)
      );
      setPoolActivities(syncedActivities);

      const syncedData = await new MachineService().getMachine(
        String(machineId)
      );
      setPool(syncedData);
    } catch {
      console.log("Sync failed");
    } finally {
      setSyncLoading(false);
    }
  };

  useEffect(() => {
    if (!machineId) return;
    new MachineService()
      .getMachine(String(machineId))
      .then((res) => {
        if (res) {
          setPool(res);
        }
      })
      .catch((err) => {
        console.log(err);
      });
  }, [machineId]);

  useEffect(() => {
    if (!machineId) return;
    new MachineService()
      .getMachineActivities(String(machineId))
      .then((res) => {
        setPoolActivities(res);
      })
      .catch((err) => {
        console.log(err);
      });
  }, [machineId]);

  const handleRenderFrequency = useCallback(() => {
    let convertedHours = pool?.frequency?.hours;
    if (pool?.frequency?.seconds) {
      convertedHours = (pool?.frequency?.seconds || 0) / 3600;
    }

    const res = convertHoursToDurationsTime(convertedHours);
    if (res.hours) {
      if (res.hours === 1) {
        return "hourly";
      }
      return `every ${res.hours} hours`;
    }
    if (res.days) {
      if (res.days === 1) {
        return "daily";
      }
      return `every ${res.days} days`;
    }
    if (res.weeks) {
      if (res.weeks === 1) {
        return "weekly";
      }
      return `every ${res.weeks} weeks`;
    }
    if (res.months) {
      if (res.months === 1) {
        return "monthly";
      }
      return `every ${res.months} months`;
    }
    if (res.years) {
      if (res.years === 1) {
        return "yearly";
      }
      return `every ${res.years} years`;
    }

    return "daily";
  }, [pool, machineId]);

  const handlePauseMachine = async () => {
    if (!contract.signer) return;
    return contract.pauseMachine(String(pool._id));
  };

  const handleResumeMachine = async () => {
    if (!contract.signer) return;
    return contract.resumeMachine(String(pool._id));
  };

  const handleCloseMachine = async () => {
    if (!contract.signer) return;
    return contract.closeMachine(String(pool._id));
  };

  const handleWithdrawMachine = async () => {
    if (!contract.signer) return;
    return contract.withdrawMachine(String(pool._id));
  };

  const renderActionButton = () => {
    /**
     * @dev Map data to render action button.
     * @returns {Array} Array of action button.
     */
    const mapData = () => {
      const pauseData = {
        title: "Pause Machine",
        theme: components.primaryBtn,
        onPress: handlePauseMachine,
      };

      const resumeData = {
        title: "Resume Machine",
        theme: components.primaryBtn,
        onPress: handleResumeMachine,
      };

      const closeData = {
        title: "Close Machine",
        theme: components.secondaryBtn,
        onPress: handleCloseMachine,
      };

      const withdrawData = {
        title: "Withdraw Machine",
        theme: components.secondaryBtn,
        onPress: handleWithdrawMachine,
      };

      switch (pool?.status) {
        case PoolStatus.ACTIVE:
          return [pauseData, closeData];
        case PoolStatus.PAUSED:
          return [resumeData];
        case PoolStatus.CLOSED:
          return [withdrawData];
        case PoolStatus.ENDED:
        default:
          return null;
      }
    };

    const data = mapData();
    if (!data) return null;

    return (
      <>
        {data.map((item) => (
          <TouchableWithoutFeedback
            disabled={false}
            onPress={() =>
              item
                .onPress()
                .then((res) => console.log(res))
                .catch((err) => console.log(`ERROR::MACHINE::ACTION: ${err}`))
                .finally(() => syncMachine())
            }
            key={Math.random().toString()}
          >
            <UiRow.C.X
              style={[
                item.theme,
                gutters.paddingVertical_10,
                { marginBottom: 10 },
              ]}
            >
              <Text style={[{ color: colors.white }, fonts.bold]}>
                {item.title}
              </Text>
            </UiRow.C.X>
          </TouchableWithoutFeedback>
        ))}
      </>
    );
  };

  const renderProgressSection = () => (
    <UiCol style={{ marginTop: 10 }}>
      <Text
        style={[
          fonts.bold,
          fonts.size_16,
          gutters.marginBottom_10,
          { color: colors.white },
        ]}
      >
        Progress
      </Text>
      <UiCol
        style={[{ backgroundColor: colors.secondaryBlack }, styles.container]}
      >
        <MachineItemSection
          title="Total invested"
          value={`${convertDecimal(pool?.currentSpentBaseToken?.toString())} ${
            baseToken?.symbol
          }`}
        />
        <UiDivider />
        <MachineItemSection
          title="Batch bought"
          value={`${pool?.currentBatchAmount} BATCHES`}
        />
        <UiDivider />
        <MachineItemSection title="Token hold">
          <UiCol.R>
            <Text style={[fonts.semiBold, { color: colors.white }]}>
              1 {baseToken?.symbol} ={" "}
              {extractAveragePrice(baseToken, baseToken)} {targetToken?.symbol}
            </Text>
            <Text style={[fonts.semiBold, { color: colors.white }]}>
              1 {targetToken?.symbol} ={" "}
              {extractAveragePrice(targetToken, baseToken)} {baseToken?.symbol}
            </Text>
          </UiCol.R>
        </MachineItemSection>
        <UiDivider />
        <MachineItemSection title="Tokens hold">
          <UiCol.R>
            <Text style={[fonts.semiBold, { color: colors.white }]}>
              {`${convertDecimal(
                new BigDecimal(pool?.depositedAmount?.toString() || "0")
                  .subtract(
                    new BigDecimal(
                      pool?.currentSpentBaseToken?.toString() || "0"
                    )
                  )
                  .getValue()
                  .toString()
              )} ${baseToken?.symbol}`}
            </Text>
            <Text style={[fonts.semiBold, { color: colors.white }]}>
              {`${convertDecimal(
                pool?.currentReceivedTargetToken?.toString()
              )} ${targetToken?.symbol}`}
            </Text>
          </UiCol.R>
        </MachineItemSection>
        <UiDivider />
        <MachineItemSection title="APL (ROI)">
          <Text
            style={[
              fonts.semiBold,
              {
                color:
                  (pool?.currentROI || 0) < 0 ? colors.red400 : colors.ufoGreen,
              },
            ]}
          >
            {`${new UtilsProvider().getDisplayedDecimals(
              pool?.currentROIValue || 0
            )}`}{" "}
            {baseToken?.symbol} ({`${pool?.currentROI?.toFixed(2) || 0}`}%)
          </Text>
        </MachineItemSection>
      </UiCol>
    </UiCol>
  );

  const renderNextBatchSection = () => (
    <UiCol>
      <Text
        style={[
          fonts.bold,
          fonts.size_16,
          gutters.marginBottom_10,
          { color: colors.white },
        ]}
      >
        Next batch
      </Text>
      <UiCol
        style={[{ backgroundColor: colors.secondaryBlack }, styles.container]}
      >
        <MachineItemSection
          title="Next batch time"
          value={moment(pool?.nextExecutionAt || new Date()).format(
            "DD/MM/YYYY HH:mm"
          )}
        />
        <UiDivider />
        <MachineItemSection
          title="Outstanding deposit"
          value={`${convertDecimal(pool?.remainingBaseTokenBalance || 0)} ${
            baseToken?.symbol
          }`}
        />
      </UiCol>
    </UiCol>
  );

  const renderPoolInfoSection = () => (
    <UiCol>
      <Text
        style={[
          fonts.bold,
          fonts.size_16,
          gutters.marginBottom_10,
          { color: colors.white },
        ]}
      >
        Pool info
      </Text>
      <UiCol
        style={[{ backgroundColor: colors.secondaryBlack }, styles.container]}
      >
        <MachineItemSection
          title="Total deposited"
          value={`${convertDecimal(pool?.depositedAmount)} ${
            baseToken?.symbol
          }`}
        />
        <UiDivider />
        <MachineItemSection
          title="Start date"
          value={`${moment(pool?.startTime).format("DD/MM/YYYY HH:mm")}`}
        />
        <UiDivider />
        {pool?.status && (
          <MachineItemSection title="Status">
            <Text
              style={[
                gutters.paddingHorizontal_14,
                gutters.paddingVertical_8,
                {
                  color: MachineStatuses[pool?.status]?.textColor,
                  backgroundColor:
                    MachineStatuses[pool?.status]?.backgroundColor,
                  borderRadius: UI_CONSTANT.borderRadius,
                },
              ]}
            >
              {MachineStatuses[pool?.status].title}
            </Text>
          </MachineItemSection>
        )}
      </UiCol>
    </UiCol>
  );

  const renderEndConditionSection = () => (
    <UiCol>
      <Text
        style={[
          fonts.bold,
          fonts.size_16,
          gutters.marginBottom_10,
          { color: colors.white },
        ]}
      >
        End Conditions
      </Text>
      <UiCol
        style={[{ backgroundColor: colors.secondaryBlack }, styles.container]}
      >
        <MachineItemSection title="Time" value="16/08/2023 16:00" />
        <MachineItemSection title="or" value="300 SOL" />
      </UiCol>
    </UiCol>
  );

  const renderTPSLSection = () => (
    <UiCol>
      <Text
        style={[
          fonts.bold,
          fonts.size_16,
          gutters.marginBottom_10,
          { color: colors.white },
        ]}
      >
        TP/SL
      </Text>
      <UiCol
        style={[{ backgroundColor: colors.secondaryBlack }, styles.container]}
      >
        <MachineItemSection title="Take profit" value="50 SOL" />
        <MachineItemSection title="Stop loss" value="10% of total invested" />
      </UiCol>
    </UiCol>
  );

  const renderTransactionsSection = useCallback(() => {
    if (!poolActivities.length) return null;
    return (
      <UiCol style={{ marginTop: 10 }}>
        <Text
          style={[
            fonts.bold,
            fonts.size_16,
            gutters.marginBottom_10,
            { color: colors.white },
          ]}
        >
          Bought transaction
        </Text>
        <UiCol
          style={[{ backgroundColor: colors.secondaryBlack }, styles.container]}
        >
          {poolActivities.map((activity, index) => {
            return (
              <SafeAreaView
                key={`activity-${index}-${Math.random().toString()}`}
              >
                {index !== 0 && <UiDivider />}
                <TouchableOpacity
                  onPress={async () => {
                    const url = `https://snowtrace.io/tx/${activity.transactionId}?chainId=43114`;
                    await Linking.openURL(url);
                  }}
                >
                  <MachineItemSection
                    title={moment(activity.createdAt).format(
                      "DD/MM/YYYY HH:mm"
                    )}
                    value={`${activity.baseTokenAmount.toString()} ${
                      baseToken?.symbol
                    } <> ${new UtilsProvider().getDisplayedDecimals(
                      activity.targetTokenAmount
                    )} ${targetToken?.symbol}`}
                  />
                </TouchableOpacity>
              </SafeAreaView>
            );
          })}
        </UiCol>
      </UiCol>
    );
  }, [poolActivities, baseToken, targetToken]);

  return (
    <SafeScreen>
      <CubeGridLoader visible={syncLoading} />
      <ScrollView>
        <UiCol style={SHARED_STYLES.screenPadding}>
          <UiRow.LR
            style={[
              { backgroundColor: colors.charlestonGreen },
              styles.chainInfo,
            ]}
          >
            <UiCol>
              <Text style={[fonts.bold, { color: colors.white }]}>
                {targetToken?.symbol}/{baseToken?.symbol}
              </Text>
              <Text style={[{ color: colors.grayText }, fonts.size_12]}>
                Uniswap
              </Text>
            </UiCol>
            <Text style={[{ color: colors.white }]}>
              #{truncateAddress(pool?._id || pool?.id || "")}
            </Text>
          </UiRow.LR>
          <MachineItemSection
            title="Strategy"
            value={`${convertDecimal(pool?.batchVolume?.toString())} ${
              targetToken?.symbol
            } ${handleRenderFrequency()}`}
            containerStyle={gutters.marginBottom_16}
          />
          <UiRow.LR>
            {/* <TouchableWithoutFeedback onPress={syncMachine}>
              <UiRow.C style={[components.secondaryBtn]}>
                <Text
                  style={[
                    { color: colors.main },
                    gutters.marginRight_8,
                    fonts.bold,
                  ]}
                >
                  Sync
                </Text>
                <Animated.View style={{ transform: [{ rotate: spin }] }}>
                  <Ionicons name="sync-outline" color={colors.main} size={18} />
                </Animated.View>
              </UiRow.C> */}
            <SyncButton syncFn={syncMachine} />
          </UiRow.LR>
          {renderProgressSection()}
          {renderNextBatchSection()}
          {renderPoolInfoSection()}
          {renderActionButton()}
          {/* {renderEndConditionSection()}
          {renderTPSLSection()} */}
          {renderTransactionsSection()}
        </UiCol>
      </ScrollView>
    </SafeScreen>
  );
}

const styles = StyleSheet.create({
  chainInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
});

export default MachineDetail;
