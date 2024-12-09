import { EMachineTab, EMachineType } from "@/constants/mymachine";

export const MYMACHINES = {
  [EMachineTab.HISTORY]: [
    {
      id: 1,
      chain: {
        name: "BLOCK/USDC",
        subname: "Blockasset",
        url: "",
        address: "#123413214213",
      },
      strategy: "10 USDC monthly",
      strategyDesc: "10 USDC <= 100,517,06 BLOCK",
      totalInvested: "120 USDC",
      APL: "+ 0.00 USDC (0.00%)",
      avgPrice: "1 USDC = 1000.491 BLOCK",
      status: EMachineType.CLOSED,
    },
    {
      id: 2,
      chain: {
        name: "BLOCK/SOL",
        subname: "Blockasset",
        url: "",
        address: "#123413214213",
      },
      strategy: "10 SOL monthly",
      strategyDesc: "10 USDC <= 100,517,06 BLOCK",
      totalInvested: "120 SOL",
      APL: "+ 0.00 SOL (0.00%)",
      avgPrice: "1 SOL = 1000.491 BLOCK",
      status: EMachineType.ENDED,
    },
  ],
  [EMachineTab.RUNNING]: [
    {
      id: 3,
      chain: {
        name: "BLOCK/USDC",
        subname: "Blockasset",
        url: "",
        address: "#123413214213",
      },
      strategy: "10 USDC monthly",
      strategyDesc: "10 USDC <= 100,517,06 BLOCK",
      totalInvested: "120 USDC",
      APL: "+ 0.00 USDC (0.00%)",
      avgPrice: "1 USDC = 1000.491 BLOCK",
      status: EMachineType.ON_GOING,
    },
  ],
};

export const HISTORY_DATA = [
  {
    id: 1,
    date: "2022-09-02 10:00 (UTC +7)",
    hash: "#199499",
    pair: "BNB/BLOCK",
    type: "Create",
  },
  {
    id: 2,
    date: "2022-09-02 10:00 (UTC +7)",
    hash: "#199499",
    pair: "BNB/BLOCK",
    type: "Create",
    amount: "100.32 BNB",
  },
  {
    id: 3,
    date: "2022-09-02 10:00 (UTC +7)",
    hash: "#199499",
    pair: "BNB/BLOCK",
    type: "Create",
    amount: "100.32 BNB",
    tokenAmount: "3,293,482.00 BLOCK",
  },
  {
    id: 4,
    date: "2022-09-02 10:00 (UTC +7)",
    hash: "#199499",
    pair: "BNB/BLOCK",
    type: "Create",
    amount: "100.32 BNB",
    tokenAmount: "3,293,482.00 BLOCK",
  },
];

export const PROFILE_PIE_CHART = [
  {
    value: 47,
    color: "#009FFF",
    gradientCenterColor: "#006DFF",
    focused: true,
  },
  { value: 40, color: "#93FCF8", gradientCenterColor: "#3BE9DE" },
  { value: 16, color: "#BDB2FA", gradientCenterColor: "#8F80F3" },
  { value: 3, color: "#FFA5BA", gradientCenterColor: "#FF7F97" },
];

export const PROFILE_LINE_CHART = [
  { value: 15 },
  { value: 30 },
  { value: 26 },
  { value: 40 },
];

export const SELECT_TOKEN_DATA = [
  { abbr: "BTC", name: "Bitcoin", value: "$29,213.13" },
  { abbr: "ETH", name: "Ethereum", value: "$1.212" },
  { abbr: "BNB", name: "BNB", value: "$323,03" },
  { abbr: "XRP", name: "XRP", value: "$0,512" },
];
