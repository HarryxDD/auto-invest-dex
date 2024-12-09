import { BottomSheetModal } from "@gorhom/bottom-sheet";
import { BottomSheetModalMethods } from "@gorhom/bottom-sheet/lib/typescript/types";
import {
  createContext,
  Dispatch,
  ReactElement,
  ReactNode,
  RefObject,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";

type UserBalanceInfo = {
  totalBalance: {
    usdValue: any;
    value: any;
  };
  usdPnl: number;
};

type AppContextType = {
  selectChainModalRef: RefObject<BottomSheetModalMethods>;
  filterTokenModalRef: RefObject<BottomSheetModalMethods>;
  userBalanceInfo: UserBalanceInfo;
  setUserBalanceInfo: Dispatch<UserBalanceInfo>;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

function useApp(): AppContextType {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error("Must be used within AppProvider");
  }
  return context;
}

const AppProvider = (props: { children: ReactNode }): ReactElement => {
  const selectChainModalRef = useRef<BottomSheetModal>(null);
  const filterTokenModalRef = useRef<BottomSheetModal>(null);
  const [userBalanceInfo, setUserBalanceInfo] = useState({
    totalBalance: {
      usdValue: 0,
      value: 0,
    },
    usdPnl: 0,
  });

  return (
    <AppContext.Provider
      {...props}
      value={useMemo(
        () => ({
          selectChainModalRef,
          filterTokenModalRef,
          userBalanceInfo,
          setUserBalanceInfo,
        }),
        [
          selectChainModalRef,
          filterTokenModalRef,
          userBalanceInfo,
          setUserBalanceInfo,
        ]
      )}
    />
  );
};

export { AppProvider, useApp };
