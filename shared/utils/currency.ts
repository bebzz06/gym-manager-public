export const formatAmountToCurrency = (amount: number) => {
  return amount / 100;
};
export const formatAmountToCentsOfCurrency = (amount: number) => {
  return amount * 100;
};

export const formatAmount = (amount: number) => {
  return amount.toFixed(2);
};
