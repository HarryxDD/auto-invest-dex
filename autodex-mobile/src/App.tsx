import "@walletconnect/react-native-compat";
import { WagmiConfig } from "wagmi";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { MMKV } from "react-native-mmkv";
import { defineChain } from "viem/utils";
import messaging from "@react-native-firebase/messaging";
import {
  createWeb3Modal,
  defaultWagmiConfig,
  Web3Modal,
} from "@web3modal/wagmi-react-native";

import { ThemeProvider } from "@/theme";
import { useEffect } from "react";
import { isIos } from "@/constants/app";
import { PermissionsAndroid } from "react-native";
import ApplicationNavigator from "@/navigators/Application";
import "./translations";
import { AppProvider } from "@/contexts/app.context";
import { TokenProvider } from "@/hooks/useToken";
import { EvmWalletProvider } from "@/hooks/evm-context/useEvmWallet";

const queryClient = new QueryClient();

export const storage = new MMKV();

// Setup wallet
const projectId = process.env.WALLET_CONNECT_PROJECT_ID || "";

const metadata = {
  name: "AutoDex",
  description: "AutoDex Description",
  url: "",
  icons: ["https://avatars.githubusercontent.com/u/37784886"],
  redirect: {
    native: "YOUR_APP_SCHEME://",
    universal: "YOUR_APP_UNIVERSAL_LINK.com",
  },
};

const avalanche = defineChain({
  id: 43114,
  name: "Avalanche",
  network: "avalanche",
  nativeCurrency: {
    decimals: 18,
    name: "Avalanche",
    symbol: "AVAX",
  },
  rpcUrls: {
    default: { http: ["https://rpc.ankr.com/avalanche"] },
    public: { http: ["https://rpc.ankr.com/avalanche"] },
  },
  blockExplorers: {
    etherscan: { name: "SnowTrace", url: "https://snowtrace.io" },
    default: { name: "SnowTrace", url: "https://snowtrace.io" },
  },
  contracts: {
    multicall3: {
      address: "0x91Cf9E3d7CC2B3Cc8CC8E9e712FC32C203CE9069",
      blockCreated: 46033840,
    },
  },
});

console.log({ projectId, metadata, avalanche });

const chains = [avalanche];
const wagmiConfig = defaultWagmiConfig({ chains, projectId, metadata });

createWeb3Modal({
  projectId,
  chains,
  wagmiConfig,
  enableAnalytics: false, // Optional - defaults to your Cloud configuration
});

function App() {
  useEffect(() => {
    const requestUserPermission = async () => {
      if (isIos) {
        await messaging().requestPermission();
      } else {
        // For API level 33+ - Android 13
        await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS
        );
      }
    };
    requestUserPermission();
  }, []);

  return (
    <GestureHandlerRootView>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider storage={storage}>
          <AppProvider>
            <WagmiConfig config={wagmiConfig as any}>
              <EvmWalletProvider>
                <TokenProvider>
                  <ApplicationNavigator />
                  <Web3Modal />
                </TokenProvider>
              </EvmWalletProvider>
            </WagmiConfig>
          </AppProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </GestureHandlerRootView>
  );
}

export default App;
