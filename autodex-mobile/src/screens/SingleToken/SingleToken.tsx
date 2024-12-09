import { SafeScreen } from "@/components/template";
import { NavigationProp } from "@react-navigation/native";
import { BottomTabsHeaderRight } from "@/navigators/config";
import {
  createContext,
  Dispatch,
  SetStateAction,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import ProgressStepBar from "@/components/ProgressStepBar";
import { SHARED_STYLES } from "@/theme/shared";
import { BottomSheetModalProvider } from "@gorhom/bottom-sheet";
import { useInput } from "@/hooks/useInput";
import { EConditionOperator, EStrategyFrequency } from "@/constants/strategy";
import { SingleTokenParams } from "@/types/strategy";
import SelectPair from "./components/SelectPair";
import SetStrategy from "./components/SetStrategy";
import Confirm from "./components/Confirm";

const SINGLE_TOKEN_SCREENS = [
  { title: "Select Pair", cpn: SelectPair },
  { title: "Strategy", cpn: SetStrategy },
  { title: "Deposit & Confirm", cpn: Confirm },
];

type SingleTokenContextType = {
  inputs: SingleTokenParams;
  setInputs: Dispatch<SetStateAction<Partial<SingleTokenParams | undefined>>>;
};

const SingleTokenContext = createContext<SingleTokenContextType | undefined>(
  undefined
);

export function useSingleToken(): SingleTokenContextType {
  const context = useContext(SingleTokenContext);
  if (!context) {
    throw new Error("Must be used within Single Token Provider");
  }
  return context;
}

const getDefaultParams = (): SingleTokenParams => {
  return {
    firstPairItem: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    secondPairItem: "",
    amountEachBatch: "0",
    frequency: EStrategyFrequency.DAILY,
    firstBatchDate: new Date(),
    firstBatchTime: new Date(),
    byAtMarketCondition: { type: EConditionOperator.BETWEEN, values: null },
    endDate: null,
    endTime: null,
    targetTokenAmount: null,
    targetSOLAmount: null,
    targetBatchesPurchased: null,
    takeProfit: null,
    stopLoss: null,
    depositAmount: "0",
  };
};

const SingleTokenScreen = ({
  navigation,
}: {
  navigation: NavigationProp<any, any>;
}) => {
  const [singleTokenProgress, setSingleTokenProgress] = useState(0);
  const StrategyContent = SINGLE_TOKEN_SCREENS[singleTokenProgress].cpn || null;
  const defaultParams = getDefaultParams();
  const [inputs, setInputs] = useInput(defaultParams);

  useEffect(() => {
    if (singleTokenProgress === 0) {
      navigation.setOptions({
        title: "Select a token",
        headerRight: () => <BottomTabsHeaderRight />,
      });
    } else {
      navigation.setOptions({
        title: "Create single token DCA",
        headerRight: false,
      });
    }
  }, [singleTokenProgress]);

  return (
    <SingleTokenContext.Provider
      value={useMemo(() => ({ inputs, setInputs }), [inputs, setInputs])}
    >
      <BottomSheetModalProvider>
        <SafeScreen>
          <ProgressStepBar
            steps={SINGLE_TOKEN_SCREENS}
            activeStep={singleTokenProgress}
            containerStyle={SHARED_STYLES.screenPadding}
          />
          <StrategyContent
            singleTokenProgress={singleTokenProgress}
            setSingleTokenProgress={setSingleTokenProgress}
          />
        </SafeScreen>
      </BottomSheetModalProvider>
    </SingleTokenContext.Provider>
  );
};

export default SingleTokenScreen;
