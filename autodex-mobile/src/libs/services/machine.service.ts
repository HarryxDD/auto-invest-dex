import { axiosInstance } from "@/services/instance";
import {
  GetQuoteDto,
  MachineActivity,
  UserHistory,
} from "@/libs/entities/machine.entity";
import {
  ChainID,
  FindPoolSortOption,
  PoolEntity,
  PoolStatus,
  UserToken,
} from "@/libs/entities/pool.entity";
import qs from "qs";

export class MachineService {
  /**
   * Create a new machine pool off-chain
   * @param walletAddress
   * @returns
   */
  async createEmptyMachinePoolOffChain(walletAddress: string) {
    const response = await axiosInstance.post<any>(
      `/api/pool/avaxc/${walletAddress}`,
      {}
    );

    return response.data as unknown as PoolEntity;
  }

  /**
   * Sync machine pool
   * @param machineId
   * @returns
   */
  async syncMachine(machineId: string) {
    return axiosInstance.post(
      `/api/pool/evm/${machineId}/sync`,
      {},
      { headers: { "content-type": "text/plain;charset=UTF-8" } }
    );
  }

  /**
   * Get quote
   * @param getQuoteDto
   * @returns
   */
  async getQuote(getQuoteDto: GetQuoteDto) {
    const response = await axiosInstance.get<any>(
      `/api/metadata/market/quote`,
      {
        params: getQuoteDto,
      }
    );

    return response.data;
  }

  /**
   * Get machine list
   * @param ownerAddress
   * @param statuses
   */
  async getMachineList(
    ownerAddress: string,
    statuses: PoolStatus[],
    searchValue: string
  ): Promise<PoolEntity[]> {
    const response = await axiosInstance.get<PoolEntity[]>("/api/pool", {
      params: {
        statuses,
        ownerAddress,
        chainId: "avaxc",
        search: searchValue.toString(),
        sortBy: FindPoolSortOption.CURRENT_SPENT_BASE_TOKEN_AMOUNT_DESC,
      },
      paramsSerializer: (params) => {
        return qs.stringify(params, {
          arrayFormat: "repeat",
        });
      },
    });

    return response.data;
  }

  /**
   * Get machine list by owner address
   * @param ownerAddress
   */
  async syncWalletMachines(walletAddress: string) {
    return axiosInstance.post(
      `/api/pool/user/evm/${walletAddress}/sync`,
      {},
      {
        headers: { "content-type": "text/plain;charset=UTF-8" },
        params: {
          chainId: ChainID.AvaxC,
        },
      }
    );
  }

  /**
   * Get machine list by owner address
   * @param ownerAddress
   */
  async getMachine(machineId: string) {
    const response = await axiosInstance.get<PoolEntity>(
      `/api/pool/${machineId}`
    );
    return response.data;
  }

  /**
   * Get machine list by owner address
   * @param ownerAddress
   */
  async getMachineActivities(machineId: string) {
    const response = await axiosInstance.get<MachineActivity[]>(
      `/api/pool/${machineId}/activities`
    );
    return response.data;
  }

  async getPortfolioUserTokens(walletAddress: string) {
    const response = await axiosInstance.get<UserToken[]>(
      `/api/portfolio/${walletAddress}/user-tokens?chainId=avaxc`
    );
    return response.data;
  }

  /**
   * Get portfolio pnl
   * @param walletAddress
   * @returns
   */
  async getPortfolioPnl(walletAddress: string) {
    const response = await axiosInstance.get<
      Array<{
        ownerAddress: string;
        totalROIValueInUSD: number;
      }>
    >(`/api/portfolio/${walletAddress}/pnl?chainId=avaxc`);
    return response.data;
  }

  /**
   * Get user activities
   * @param walletAddress
   * @returns
   */
  async getUserActivities(walletAddress: string) {
    const response = await axiosInstance.get<UserHistory[]>(
      `/api/pool/user-activities?ownerAddress=${walletAddress}`
    );
    return response.data;
  }

  async registerAuthChallenge(walletAddress: string, challenge: string) {
    return axiosInstance.post(
      `/api/auth/challenge`,
      { walletAddress, challenge },
      { headers: { "content-type": "application/json" } }
    );
  }

  /**
   * Register user device token
   * @param walletAddress
   * @param deviceToken
   */
  async registerUserDeviceToken(registerDto: {
    walletAddress: string;
    deviceToken: string;
    authChallengeId: string;
    signature: string;
  }) {
    await axiosInstance.post(
      `/api/portfolio/${registerDto.walletAddress}/user-device`,
      {
        deviceToken: registerDto.deviceToken,
        signature: registerDto.signature,
        authChallengeId: registerDto.authChallengeId,
        ownerAddress: registerDto.walletAddress,
      },
      { headers: { "content-type": "application/json" } }
    );
  }

  /**
   * Check device token
   * @param walletAddress
   * @param deviceToken
   */
  async checkDeviceToken(walletAddress: string, deviceToken: string) {
    const response = await axiosInstance.post(
      `/api/portfolio/${walletAddress}/user-device/check`,
      { deviceToken },
      { headers: { "content-type": "application/json" } }
    );
    return response.data;
  }
}
