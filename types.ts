export interface CalculationResult {
  lotSize: number;
  riskAmountUSD: number;
  profitAmountUSD: number;
  rewardToRiskRatio?: number;
}

export interface SignalData {
    instrument: string;
    openPrice: number;
    stopLoss: number;
    takeProfit?: number;
    riskPercent: number;
    quotePrice: number;
    accountBalance: number;
    spread?: number;
}