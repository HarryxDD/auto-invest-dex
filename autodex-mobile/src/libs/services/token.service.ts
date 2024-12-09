import { axiosInstance } from "@/services/instance";
import { Token } from "../entities/platform-config.entity";

export class TokenService {
  public syncMarketData() {
    console.log(axiosInstance.getUri());
    return axiosInstance.post("/api/whitelist/market/sync-price");
  }

  public fetchWhiteListedTokens() {
    return axiosInstance.get<Token[]>("/api/whitelist");
  }
}
