export enum EntityType {
  TOKEN = 'token',
  NFT = 'nft',
}

export class Token {
  id: string;
  chainId: string;
  isNativeCoin: boolean;
  address: string;
  entityType: EntityType;
  name: string;
  symbol: string;
  image: string;
  coingeckoId: string;
  decimals: number;

  /** In Dollars */
  estimatedValue: number;
}

export const platformConfig = {
    CHAIN_ID: 43114,
    MACHINE_PROGRAM_ADDRESS: "0xAb3DC4f481C0b081011B03Bf1d30B56ae96B5099",
    MACHINE_VAULT_PROGRAM_ADDRESS: "0xe2663497c34CC70AFbEB97aC0aE428CeDBbc06EC",
    MACHINE_REGISTRY_PROGRAM_ADDRESS: "0x2EB0833F05bBC24329f1955c9fD45A2419F521d9",
    NACHINE_MULTICALL3_PROGRAM_ADDRESS: "0x2EB0833F05bBC24329f1955c9fD45A2419F521d9",
    BASE_TOKEN_ADDRESS: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7", // Avax native token
    TARGET_TOKEN_ADDRESS: "",
    whitelistTokenEntities: {
        "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7": {
            address: "0xB31f66AA3C1e785363F0875A1B74E27b85FD66c7",
            name: "Avalanche",
            symbol: "AVAX",
            decimals: 18,
            logoURI: "https://assets.coingecko.com/coins/images/12559/standard/Avalanche_Circle_RedWhite_Trans.png?1696512369",
            chainId: 43114,
        },
        "0x152b9d0FdC40C096757F570A51E494bd4b943E50": {
            address: "0x152b9d0FdC40C096757F570A51E494bd4b943E50",
            name: "Bitcoin",
            symbol: "BTC",
            decimals: 18,
            logoURI: "https://assets.coingecko.com/coins/images/1/standard/bitcoin.png?1696501400",
            chainId: 43114,
        },
    } as any as Record<string, Token>,
    whiteListedRouters: {
        address: '0x60aE616a2155Ee3d9A68541Ba4544862310933d4',
        isV3: false,
        routerVersion: '1',
        ammTag: 'traderjoe',
        ammName: 'TraderJoe',
        dexUrl: 'https://traderjoexyz.com/avalanche/trade',
        inputTag: 'inputCurrency',
        outputTag: 'outputCurrency',
    },
}