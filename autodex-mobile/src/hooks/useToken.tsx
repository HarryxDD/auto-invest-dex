/* eslint-disable react/jsx-no-constructed-context-values */
import { ReactNode, useContext, createContext, useState, useEffect } from "react";
import { Token } from "@/libs/entities/platform-config.entity";
import { TokenService } from "@/libs/services/token.service";

const TokenContext = createContext<{
  whiteListedTokens: Token[];
}>(null);

export const TokenProvider = ({ children }: {
  children: ReactNode;
}) => {
  const [tokens, setTokens] = useState<Token[]>([]);

  const handleFetchTokenPrice = async () => {
    console.log("--- Start syncing market data ---");
    await new TokenService().syncMarketData();
    console.log("--- Start fetching white listed tokens ---")
    const response = await new TokenService().fetchWhiteListedTokens();
    if (!response.data) {
      return;
    }
    setTokens(response.data);
  };

  useEffect(() => {
    handleFetchTokenPrice();
  }, []);

  return <TokenContext.Provider value={{ whiteListedTokens: tokens }}>{children}</TokenContext.Provider>;
}

export const useToken = () => {
  const token = useContext(TokenContext);
  if (!token) {
    throw new Error("Must be used within TokenProvider");
  }

  return token;
};