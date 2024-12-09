import { UiCol } from "@/components/elements/ui-grid/UiCol";
import { UiRow } from "@/components/elements/ui-grid/UiRow";
import { StyleSheet, Text, TouchableWithoutFeedback } from "react-native";
import { useTheme } from "@/theme";
import { useNavigation } from "@react-navigation/native";
import { SCREEN_MACHINE_DETAIL, STACK_MAIN } from "@/navigators/route-names";
import { MachineItemSection } from "@/components/MachineItemSection";
import { PoolEntity } from "@/libs/entities/pool.entity";
import { convertDecimal } from "@/libs/entities/machine.entity";
import { MachineStatuses } from "@/constants/mymachine";
import { SHARED_STYLES, UI_CONSTANT } from "@/theme/shared";
import UiDivider from "@/components/UiDivider";

interface Props {
  pool: PoolEntity;
}

export const MachineItem = (props: Props) => {
  const { pool } = props;
  const { fonts, colors, gutters } = useTheme();
  const { navigate } = useNavigation();

  const handlePressMachine = () => {
    // @ts-ignore
    navigate(STACK_MAIN, {
      screen: SCREEN_MACHINE_DETAIL,
      params: { machineId: pool._id },
    });
  };

  return (
    <TouchableWithoutFeedback onPress={handlePressMachine}>
      <UiCol
        style={[{ backgroundColor: colors.secondaryBlack }, styles.container]}
      >
        <UiRow.LR
          style={[
            { backgroundColor: colors.charlestonGreen },
            styles.chainInfo,
          ]}
        >
          <UiCol>
            <Text style={[fonts.bold, { color: colors.white }]}>AVAXC</Text>
            <Text style={[{ color: colors.grayText }, fonts.size_12]}>
              Avalanche
            </Text>
          </UiCol>
          <Text style={[{ color: colors.white }]}>{pool._id}</Text>
        </UiRow.LR>
        <MachineItemSection title="Strategy">
          <UiCol.R>
            <Text style={[fonts.semiBold, { color: colors.white }]}>
              {/* {machine.strategy} */}
            </Text>
            <Text style={[{ color: colors.grayText }, fonts.size_10]}>
              {/* {machine.strategyDesc} */}
            </Text>
          </UiCol.R>
        </MachineItemSection>
        <UiDivider />
        <MachineItemSection
          title="Total invested"
          value={convertDecimal(pool.currentSpentBaseToken.toString())}
        />
        <UiDivider />
        <MachineItemSection title="APL (ROI)">
          <Text
            style={[
              {
                color:
                  (pool?.currentROI || 0) < 0 ? colors.red400 : colors.ufoGreen,
              },
              fonts.semiBold,
            ]}
          >
            {`${pool?.currentROI?.toFixed(2) || 0}`}%
          </Text>
        </MachineItemSection>
        <UiDivider />
        <MachineItemSection
          title="Average price"
          value={convertDecimal(pool?.avgPrice?.toString())}
        />
        <UiDivider />
        <MachineItemSection
          title="Status"
          containerStyle={SHARED_STYLES.alignItemsCenter}
        >
          <Text
            style={[
              gutters.paddingHorizontal_14,
              gutters.paddingVertical_8,
              {
                color: MachineStatuses[pool?.status].textColor,
                backgroundColor: MachineStatuses[pool?.status].backgroundColor,
                borderRadius: UI_CONSTANT.borderRadius,
              },
            ]}
          >
            {MachineStatuses[pool?.status].title}
          </Text>
        </MachineItemSection>
      </UiCol>
    </TouchableWithoutFeedback>
  );
};

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 20,
  },
  chainInfo: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 10,
    marginBottom: 16,
  },
});
