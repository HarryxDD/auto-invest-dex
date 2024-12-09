import { ethers, upgrades } from "hardhat";
import { loadFixture, time } from "@nomicfoundation/hardhat-network-helpers";
import {
  MachineChef,
  MachineVault,
  MachineRegistry,
  Multicall3,
  MockedERC20,
  MachineChef__factory,
  MachineRegistry__factory,
} from "../typechain-types";
import { Params } from "../typechain-types/contracts/MachineChef";
import { expect } from "chai";
import { parseEther } from "ethers";

/**
 * @dev Deploy various smart contracts and set up initial conditions for testing
 */
export async function deployFixtures() {
  const [owner, owner2, operator] = await ethers.getSigners();

  /**
   * @dev Deploy Multicall3 contract
   */
  const Multicall3Contract = await ethers.getContractFactory("Multicall3");
  const Multicall3 = (await Multicall3Contract.connect(
    owner,
  ).deploy()) as unknown as Multicall3;

  /**
   * @dev Initialize and deploy MockedERC20 contract
   */
  const MockedERC20Contract = await ethers.getContractFactory("MockedERC20");
  const MockedERC20 = (await MockedERC20Contract.connect(
    owner,
  ).deploy()) as unknown as MockedERC20;

  /**
   * @dev Fund owner2 with ERC20 tokens from MockedERC20
   */
  await MockedERC20.connect(owner).transfer(
    owner2.address,
    BigInt(ethers.WeiPerEther) * BigInt(20),
  );

  /**
   * @dev Deploy MachineChef contract using a proxy
   */
  const MachineChefContract = await ethers.getContractFactory("MachineChef");
  const Chef = (await upgrades.deployProxy(
    MachineChefContract.connect(owner),
    [],
    {
      unsafeAllow: ["constructor", "delegatecall"],
    },
  )) as unknown as MachineChef;

  /**
   * @dev Deploy MachineRegistry contract using a proxy
   */
  const MachineRegistryContract =
    await ethers.getContractFactory("MachineRegistry");
  const Registry = (await upgrades.deployProxy(
    MachineRegistryContract.connect(owner),
    [],
    {
      unsafeAllow: ["constructor"],
    },
  )) as unknown as MachineRegistry;

  /**
   * @dev Deploy MachineVault contract using a proxy
   */
  const MachineVaultContract = await ethers.getContractFactory("MachineVault");
  const Vault = (await upgrades.deployProxy(
    MachineVaultContract.connect(owner),
    [],
    {
      unsafeAllow: ["constructor"],
    },
  )) as unknown as MachineVault;

  /**
   * @dev Configure roles in the MachineRegistry contract
   */
  await Registry.connect(owner).grantRole(
    await Registry.OPERATOR(),
    operator.address,
  );
  await Registry.connect(owner).grantRole(
    await Registry.RELAYER(),
    await Chef.getAddress(),
  );
  await Registry.connect(owner).grantRole(
    await Registry.RELAYER(),
    await Vault.getAddress(),
  );

  /**
   * @dev Whitelist specific addresses in the MachineRegistry contract
   */
  await Registry.whitelistAddress(
    "0x60aE616a2155Ee3d9A68541Ba4544862310933d4", // V2 Router
    true,
  );
  await Registry.whitelistAddress(
    "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
    true,
  );
  await Registry.whitelistAddress(
    "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC
    true,
  );
  await Registry.whitelistAddress(
    "0x152b9d0FdC40C096757F570A51E494bd4b943E50", // BTCB
    true,
  );

  /**
   * @dev Link MachineVault and MachineChef to the MachineRegistry contract
   */
  await Vault.connect(owner).setRegistry(await Registry.getAddress());
  await Vault.initEtherman("0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7");

  await Chef.connect(owner).setRegistry(await Registry.getAddress());
  await Chef.connect(owner).setVault(await Vault.getAddress());

  /**
   * @dev Return deployed contract instances and other useful information for tests
   */
  return {
    Time: time,
    Provider: ethers.provider,
    MockedERC20,
    Registry,
    Vault,
    Chef,
    owner,
    owner2,
    operator,
    Multicall3,
    RouterAddress: "0x60aE616a2155Ee3d9A68541Ba4544862310933d4",
    WAVAX: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
    BTCB: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
    USDC: "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E",
  };
}

describe("[avaxc]", function () {
  let fixtures: Awaited<ReturnType<typeof deployFixtures>>;
  let toBeCreatedMachineData: Params.CreateMachineParamsStruct;

  before(async () => {
    fixtures = await loadFixture(deployFixtures);

    toBeCreatedMachineData = {
      id: "test-swap-machine",
      owner: fixtures.owner.address,
      ammRouterAddress: fixtures.RouterAddress,
      baseTokenAddress: fixtures.WAVAX,
      ammRouterVersion: "1",
      targetTokenAddress: fixtures.USDC,
      startAt: parseInt(
        (new Date().getTime() / 1000 + 1).toString(),
      ).toString(),
      batchVolume: ethers.WeiPerEther / BigInt("10"), // 0.1 BNB per batch
      stopConditions: [
        {
          operator: "0",
          value: parseInt(
            (new Date().getTime() / 1000 + 3600).toString(),
          ).toString(),
        },
      ],
      frequency: "3600",
      openingPositionCondition: {
        value0: "0",
        value1: "0",
        operator: "0",
      },
      takeProfitCondition: {
        stopType: "0",
        value: "0",
      },
      stopLossCondition: {
        stopType: "0",
        value: "0",
      },
    };
  });

  it("[auto_investment] should: work with traderjoe router v2", async function () {
    const { Time, Chef, Registry, owner, operator } = fixtures;

    const data = {
      ...toBeCreatedMachineData,
      stopConditions: [
        {
          operator: "0",
          value: parseInt(
            (new Date().getTime() / 1000 + 60010).toString(),
          ).toString(),
        },
        {
          operator: "1",
          value: BigInt("1"),
        },
        {
          operator: "2",
          value: ethers.WeiPerEther,
        },
        {
          operator: "3",
          value: ethers.WeiPerEther,
        },
      ],
    };

    await Chef.connect(owner).createMachineAndDepositEther(data, {
      value: ethers.WeiPerEther,
    });

    await Time.increaseTo(
      parseInt((new Date().getTime() / 1000 + 70000).toString()),
    );

    await Chef.connect(operator).tryMakingDCASwap(data.id, 3000, 0);

    /// @dev Machine has been closed after closing position
    const machine = await Registry.machines(data.id);
    expect(machine.status).eq(3);
  });

  it("[quoter] should: USDC/WAVAX on RouterV2 should work properly", async () => {
    const { Vault, WAVAX, USDC, RouterAddress } = fixtures;
    const [amountIn, amountOut] = await Vault.getCurrentQuote.staticCall(
      USDC,
      WAVAX,
      RouterAddress,
      ethers.WeiPerEther,
      0,
    );

    expect(amountIn).eq(ethers.WeiPerEther);
    expect(amountOut).gt(0);
    expect(amountIn).not.eq(amountOut);
  });

  it("[quoter] should: BTCB/WAVAX on RouterV2 should work properly", async () => {
    const { Vault, WAVAX, BTCB, RouterAddress } = fixtures;
    const [amountIn, amountOut] = await Vault.getCurrentQuote.staticCall(
      WAVAX,
      BTCB,
      RouterAddress,
      ethers.WeiPerEther,
      0,
    );

    expect(amountIn).eq(ethers.WeiPerEther);
    expect(amountOut).gt(0);
    expect(amountIn).not.eq(amountOut);
  });

  it("[auto_investment] should: integration test should work", async () => {
    const { Time } = fixtures;

    const Addresses = {
      MachineVault: "0xe2663497c34CC70AFbEB97aC0aE428CeDBbc06EC",
      MachineRegistry: "0x2EB0833F05bBC24329f1955c9fD45A2419F521d9",
      MachineChef: "0xAb3DC4f481C0b081011B03Bf1d30B56ae96B5099",
      Multicall3: "0x91Cf9E3d7CC2B3Cc8CC8E9e712FC32C203CE9069",
    };

    const fundSigner = await ethers.getImpersonatedSigner(
      "0xA51Cb7b4C449033FE1D1dB392ae6208626374a33",
    );

    await fundSigner.sendTransaction({
      value: parseEther("1000"),
      to: "0xCACE3FcBA03276481F1306F6cdCCA50e7EEb096F",
    });
    console.log("contract call");
    const signer = await ethers.getImpersonatedSigner(
      "0xCACE3FcBA03276481F1306F6cdCCA50e7EEb096F",
    );

    /**
     * @dev Deploy contract
     */
    const Chef = MachineChef__factory.connect(Addresses.MachineChef, signer);

    /**
     * @dev Deploy contract
     */
    const Registry = MachineRegistry__factory.connect(
      Addresses.MachineRegistry,
      signer,
    );

    /**
     * @dev Deploy contract
     */
    const data = {
      ...toBeCreatedMachineData,
      owner: signer.address,
      startAt: parseInt(
        (new Date().getTime() / 1000 + 70000 + 20).toString(),
      ).toString(),
      stopConditions: [
        {
          operator: "0",
          value: parseInt(
            (new Date().getTime() / 1000 + 70000 + 3000).toString(),
          ).toString(),
        },
        {
          operator: "1",
          value: BigInt("1"),
        },
        {
          operator: "2",
          value: ethers.WeiPerEther,
        },
        {
          operator: "3",
          value: ethers.WeiPerEther,
        },
      ],
    };

    await Chef.connect(signer).createMachineAndDepositEther(data, {
      value: ethers.WeiPerEther,
    });

    await Time.increaseTo(
      parseInt((new Date().getTime() / 1000 + 70000 + 1000).toString()),
    );

    await Chef.connect(signer).tryMakingDCASwap(data.id, 3000, 0);

    /// @dev Machine has been closed after closing position
    const machine = await Registry.machines(data.id);
    expect(machine.status).eq(3);
  });
});
