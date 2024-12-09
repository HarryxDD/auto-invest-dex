export function truncateString(str: string, num: number) {
  if (!str) {
    return "";
  }
  if (str.length > num) {
    return `${str.slice(0, num)}...`;
  }
  return str;
}

export function truncateAddress(
  address: string,
  nPrefix?: number,
  nSuffix?: number
) {
  const match = address.match(/^(0x[a-zA-Z0-9])[a-zA-Z0-9]+([a-zA-Z0-9])$/);
  const nTotalIsLongerThanAddress =
    (nPrefix || 0) + (nSuffix || 0) > address.length;

  return match && !nTotalIsLongerThanAddress
    ? `0x${address.slice(2, 2 + (nPrefix || 4))}…${address.slice(
        address.length - (nSuffix || 4)
      )}`
    : address;
}
