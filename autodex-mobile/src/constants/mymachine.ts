export enum EMachineTab {
  RUNNING = "Running",
  HISTORY = "History",
}

export enum EMachineType {
  CLOSED = "Closed",
  ON_GOING = "On going",
  ENDED = "Ended",
}

export enum EMachineStatus {
  CREATED = "POOL_STATUS::CREATED",
  ACTIVE = "POOL_STATUS::ACTIVE",
  PAUSED = "POOL_STATUS::PAUSED",
  CLOSED = "POOL_STATUS::CLOSED",
  ENDED = "POOL_STATUS::ENDED",
}

export const MachineStatuses = {
  [EMachineStatus.CREATED]: {
    title: "Created",
    backgroundColor: "#4ADE8012",
    textColor: "#26C673",
  },
  [EMachineStatus.ACTIVE]: {
    title: "Active",
    backgroundColor: "#4ADE8012",
    textColor: "#26C673",
  },
  [EMachineStatus.PAUSED]: {
    title: "Paused",
    backgroundColor: "#FFC20012",
    textColor: "#F0B90B",
  },
  [EMachineStatus.CLOSED]: {
    title: "Closed",
    backgroundColor: "#F7555512",
    textColor: "#F44949",
  },
  [EMachineStatus.ENDED]: {
    title: "Ended",
    backgroundColor: "#F7555512",
    textColor: "#F44949",
  },
};
