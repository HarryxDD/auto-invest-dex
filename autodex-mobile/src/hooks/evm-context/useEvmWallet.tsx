/* eslint-disable @typescript-eslint/no-unused-vars */
import {
  FC,
  useMemo,
  useState,
  useEffect,
  ReactNode,
  useContext,
  useCallback,
  createContext,
} from "react";
import {
  JsonRpcSigner,
  BrowserProvider,
  BigNumberish as BigNumber,
} from "ethers";
import {
  MachineChef__factory,
  MachineRegistry__factory,
} from "@/libs/providers/evm-program";
import { Params } from "@/libs/providers/evm-program/contracts/MachineChef";
  
import { useWalletClient } from "wagmi";
import { platformConfig } from "@/libs/entities/platform-config.entity";
import { MachineEntity } from "@/libs/entities/machine.entity";
import { createPublicClient, formatEther, http } from "viem";
import { avalanche } from "viem/chains";
import { MachineService } from "@/libs/services/machine.service";


/** @dev Define the number of confirmations which each transaction should wait for. */
const CONFIRMATIONS = 5;

/** @dev Initialize context. */
export const EvmWalletContext = createContext<{
  signer: JsonRpcSigner;
  nativeBalance: string;
  closeMachine(MachineId: string): Promise<void>;
  pauseMachine(MachineId: string): Promise<void>;
  resumeMachine(MachineId: string): Promise<void>;
  withdrawMachine(MachineId: string): Promise<void>;
  closePositionMachine(Machine: MachineEntity): Promise<void>;
  depositMachine(MachineId: string, depositedAmount: BigNumber): Promise<void>;
  createMachine(
    depositedAmount: BigNumber,
    createdMachineParams: Params.CreateMachineParamsStruct
  ): Promise<string>;
}>(null as any);

/** @dev Expose wallet provider for usage. */
export const EvmWalletProvider: FC<{ children: ReactNode }> = (props) => {
  const client = useWalletClient();
  const chain = avalanche;
  const [balance, setBalance] = useState<string>("0");

  const machineService = new MachineService();

  const signer = useMemo(() => {
    if (client?.data && chain && platformConfig) {
      const { account, transport } = client.data;

      if (chain.id === platformConfig.CHAIN_ID) {
        const provider = new BrowserProvider(transport as any, {
          chainId: chain.id,
          name: chain.name,
        });

        return new JsonRpcSigner(provider, account.address);
      }
    }

    return null;
  }, [client, chain, platformConfig]);

  const machineChef = useMemo(() => {
    if (platformConfig && signer) {
      return MachineChef__factory.connect(
        platformConfig?.MACHINE_PROGRAM_ADDRESS,
        signer
      );
    }
    return null;
  }, [platformConfig, signer]);

  const machineRegistry = useMemo(() => {
    if (platformConfig && signer) {
      return MachineRegistry__factory.connect(
        platformConfig?.MACHINE_REGISTRY_PROGRAM_ADDRESS,
        signer
      );
    }
    return null;
  }, [platformConfig, signer]);

  // Initialize public client.
  const publicClient = useMemo(() => {
    return createPublicClient({
      chain,
      transport: http(),
    });
  }, [chain]);

  // Fetch native balance.
  const fetchNativeBalance = useCallback(async () => {
    setBalance(formatEther( await publicClient.getBalance({
      address: signer?.address as any,
    })));
  }, [client, signer, publicClient]);

  // Fetch native balance.
  useEffect(() => {
    fetchNativeBalance();
  }, [signer]);

  /**
   * @dev The function to create a Machine in evm.
   * @params depositedAmount.
   * @params params.
   */
  const createMachine = useCallback(
    async (
      depositedAmount: BigNumber,
      createdMachineParams: Params.CreateMachineParamsStruct
    ) => {
      if (!signer) return;

      // Create a empty pool off-chain.
      const emptyPool = await machineService.createEmptyMachinePoolOffChain(signer.address);
      createdMachineParams.id = emptyPool._id;

      const chef = MachineChef__factory.connect(
        platformConfig?.MACHINE_PROGRAM_ADDRESS,
        signer
      );

      const tx = await chef.createMachineAndDepositEther(
        { ...createdMachineParams },
        { value: depositedAmount }
      );

      console.log("JOB::: wait transaction", tx);
      await (tx as any).wait(CONFIRMATIONS);
      await machineService.syncMachine(createdMachineParams.id);

      return emptyPool._id;
    },
    [signer]
  );

  /**
   * @dev The function to deposit fund to a Machine in evm.
   * @params MachineId.
   */
  const depositMachine = useCallback(
    async (MachineId: string, depositedAmount: BigNumber) => {
      if (!machineChef) return;
      const tx = await machineChef.depositEther(MachineId, {
        value: depositedAmount,
      });

      /** @dev Wait for confirmation. */
      await (tx as any).wait(CONFIRMATIONS);
    },
    [signer, machineChef]
  );

  /**
   * @dev The function to close Machine in evm.
   * @params MachineId.
   */
  const closeMachine = useCallback(
    async (MachineId: string) => {
      if (!machineChef) return;
      const tx = await machineChef
        .connect(signer)
        .multicall([
          machineChef
            .connect(signer)
            .interface.encodeFunctionData("closeMachine", [MachineId]),
          machineChef
            .connect(signer)
            .interface.encodeFunctionData("withdraw", [MachineId]),
        ]);

      /** @dev Wait for confirmation. */
      await (tx as any).wait(CONFIRMATIONS);
    },
    [signer, machineChef, platformConfig, client, chain]
  );

  /**
   * @dev The function to close position of Machine in evm.
   * @params MachineId.
   */
  const closePositionMachine = useCallback(
    (Machine: MachineEntity) => {
      /**
       * @dev Call to hamster server to get fee.
       */
      const isV3 = platformConfig.whiteListedRouters.isV3 || false;
      const ammRouterAddress =
        platformConfig.whiteListedRouters.address || "";
    },
    [signer, machineChef]
  );

  /**
   * @dev The function to pause Machine in evm.
   * @params MachineId.
   */
  const pauseMachine = useCallback(
    async (MachineId: string) => {
      const tx = await machineChef?.pauseMachine(MachineId);
      /** @dev Wait for confirmation. */
      await (tx as any).wait(CONFIRMATIONS);
    },
    [signer, machineChef]
  );

  /**
   * @dev The function to resume Machine in evm.
   * @params MachineId.
   */
  const resumeMachine = useCallback(
    async (MachineId: string) => {
      console.log("resume Machine", MachineId);
      const tx = await machineChef?.restartMachine(MachineId);
      /** @dev Wait for confirmation. */
      await (tx as any).wait(CONFIRMATIONS);
    },
    [signer, machineChef]
  );

  /**
   * @dev The function to withdraw Machine in evm.
   * @params MachineId.
   */
  const withdrawMachine = useCallback(
    async (MachineId: string) => {
      // eslint-disable-next-line no-unsafe-optional-chaining
      if (!machineRegistry || !machineChef) return;
      const MachineStatus = (await machineRegistry.machines(MachineId)).status;
      if (Number(MachineStatus) !== 3) {
        await closeMachine(MachineId);
      } else {
        const tx = await machineChef.withdraw(MachineId);
        /** @dev Wait for confirmation. */
        await (tx as any).wait(CONFIRMATIONS);
      }
    },
    [signer, machineChef, machineRegistry, closeMachine]
  );

  return (
    <EvmWalletContext.Provider
      // eslint-disable-next-line react/jsx-no-constructed-context-values
      value={{
        signer,
        createMachine,
        depositMachine,
        closeMachine,
        closePositionMachine,
        pauseMachine,
        withdrawMachine,
        resumeMachine,
        nativeBalance: balance,
      } as any}
    >
      {props.children}
    </EvmWalletContext.Provider>
  );
};

/** @dev Use context hook. */
export const useEvmWallet = () => {
  const context = useContext(EvmWalletContext);
  if (!context) {
    throw new Error("Must be in provider");
  }
  return context;
};
