import { ethers, upgrades } from "hardhat";
import {
  MachineChef,
  MachineRegistry,
  MachineVault,
  Multicall3,
} from "../typechain-types";
import { ContractTransactionResponse } from "ethers";

export const ensureTransaction = async (tx: ContractTransactionResponse) => {
  const r = await tx.wait(5);
  console.log("Tx completed hash: ", r?.hash);
  return r;
};

async function main() {
  const Multicall3Contract = await ethers.getContractFactory("Multicall3");
  const Multicall3 =
    (await Multicall3Contract.deploy()) as unknown as Multicall3;
  await Multicall3.deploymentTransaction()?.wait(5);
  console.log("Multicall3 deployed at", await Multicall3.getAddress());

  const MachineChefContract = await ethers.getContractFactory("MachineChef");
  const Chef = (await upgrades.deployProxy(MachineChefContract, [], {
    unsafeAllow: ["constructor", "delegatecall"],
  })) as unknown as MachineChef;
  await Chef.deploymentTransaction()?.wait(5);
  console.log("Chef deployed at", await Chef.getAddress());

  const MachineRegistryContract =
    await ethers.getContractFactory("MachineRegistry");
  const Registry = (await upgrades.deployProxy(MachineRegistryContract, [], {
    unsafeAllow: ["constructor"],
  })) as unknown as MachineRegistry;
  await Registry.deploymentTransaction()?.wait(5);
  console.log("Registry deployed at", await Registry.getAddress());

  const MachineVaultContract = await ethers.getContractFactory("MachineVault");
  const Vault = (await upgrades.deployProxy(MachineVaultContract, [], {
    unsafeAllow: ["constructor"],
  })) as unknown as MachineVault;
  await Vault.deploymentTransaction()?.wait(5);
  console.log("Vault deployed at", await Vault.getAddress());

  await ensureTransaction(
    await Registry.grantRole(
      await Registry.OPERATOR(),
      "0xCACE3FcBA03276481F1306F6cdCCA50e7EEb096F", /// Only this address can make dca trading
    ),
  );
  await ensureTransaction(
    await Registry.grantRole(
      await Registry.OPERATOR(),
      await Multicall3.getAddress(), /// OPERATOR
    ),
  );
  await ensureTransaction(
    await Registry.grantRole(await Registry.RELAYER(), await Chef.getAddress()),
  );
  await ensureTransaction(
    await Registry.grantRole(
      await Registry.RELAYER(),
      await Vault.getAddress(),
    ),
  );

  await ensureTransaction(
    await Registry.whitelistAddress(
      "0x60aE616a2155Ee3d9A68541Ba4544862310933d4", // V2 Router
      true,
    ),
  );
  await ensureTransaction(
    await Registry.whitelistAddress(
      "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // WAVAX
      true,
    ),
  );
  await ensureTransaction(
    await Registry.whitelistAddress(
      "0xB97EF9Ef8734C71904D8002F8b6Bc66Dd9c48a6E", // USDC
      true,
    ),
  );
  await ensureTransaction(
    await Registry.whitelistAddress(
      "0x152b9d0FdC40C096757F570A51E494bd4b943E50", // BTCB
      true,
    ),
  );

  await ensureTransaction(await Vault.setRegistry(await Registry.getAddress()));
  await ensureTransaction(
    await Vault.initEtherman("0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7"),
  );

  await ensureTransaction(await Chef.setRegistry(await Registry.getAddress()));
  await ensureTransaction(await Chef.setVault(await Vault.getAddress()));
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
