import hardhatConfig from "./hardhat.config";

console.log(JSON.stringify({ hardhatConfig }));

export default {
  ...hardhatConfig,
  networks: {
    ...(hardhatConfig as any).networks,
    hardhat: {
      ...(hardhatConfig as any).networks.hardhat,
      forking: {
        url: (hardhatConfig as any).networks.avaxc.url,
      },
    },
  },
};
