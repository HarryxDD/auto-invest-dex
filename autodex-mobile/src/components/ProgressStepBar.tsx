import React from "react";
import { StyleProp, StyleSheet, Text, ViewStyle } from "react-native";
import { useTheme } from "@/theme";
import { UiRow, UiCol } from "@/components";

interface Step {
  title: string;
  isDone?: boolean;
  cpn?: any;
}

interface Props {
  steps: Step[];
  activeStep: number;
  containerStyle?: StyleProp<ViewStyle>;
}

const StepsProgressBar: React.FC<Props> = ({
  steps,
  activeStep,
  containerStyle,
}) => {
  const { colors } = useTheme();

  return (
    <UiRow.C style={[styles.progressBarContainer, containerStyle]}>
      {steps.map((step, index) => (
        <UiCol.X key={step.title}>
          <UiRow.C.X style={styles.progressBarStep}>
            <UiCol.C
              style={[
                styles.progressBarStepCircle,
                {
                  backgroundColor:
                    index <= activeStep ? colors.main : colors.charlestonGreen,
                },
              ]}
            >
              <Text style={[{ color: colors.white }]}>{index + 1}</Text>
            </UiCol.C>
            <UiCol
              style={[
                styles.progressBarStepLine,
                {
                  width: `${index === steps.length - 1 ? 0 : 100}%`,
                  backgroundColor:
                    index <= activeStep - 1
                      ? colors.main
                      : colors.charlestonGreen,
                },
              ]}
            />
          </UiRow.C.X>
          <Text
            style={[
              styles.progressBarStepLineLabel,
              {
                color: index <= activeStep ? colors.white : colors.grayText,
              },
            ]}
          >
            {step.title}
          </Text>
        </UiCol.X>
      ))}
    </UiRow.C>
  );
};

const styles = StyleSheet.create({
  progressBarContainer: {
    height: 70,
    borderRadius: 10,
    marginVertical: 20,
  },
  progressBarStep: {
    position: "relative",
  },
  progressBarStepCircle: {
    width: 40,
    height: 40,
    borderRadius: 50,
  },
  progressBarStepLine: {
    position: "absolute",
    left: "50%",
    height: 2,
    borderRadius: 10,
    zIndex: -1,
  },
  progressBarStepLineLabel: {
    marginTop: 16,
    alignSelf: "center",
    fontSize: 14,
  },
});

export default StepsProgressBar;
