import type { CalculationResult, SignalData } from '../types';

// This function now performs the calculation directly, making it faster and more reliable.
// It is wrapped in a Promise to maintain the async structure in the App component.
export const calculateLotSize = async (data: SignalData): Promise<CalculationResult> => {
  return new Promise((resolve, reject) => {
    try {
      // Destructure data. Prices are now pre-adjusted in the UI component.
      const { instrument, riskPercent, quotePrice, accountBalance, openPrice, stopLoss, takeProfit } = data;

      // Determine pip size
      const isJpyPair = instrument.toUpperCase().includes('JPY');
      const pipSize = isJpyPair ? 0.01 : 0.0001;
      
      // Spread logic is now handled in the SignalInput component.
      // This service receives already-adjusted prices.

      // 1. Calculate Money at Risk (in USD) using the provided accountBalance
      const riskAmountUSD = accountBalance * (riskPercent / 100);

      // 2. Calculate Stop Loss in Pips using the adjusted prices
      if (openPrice === stopLoss) {
        return resolve({ lotSize: 0, riskAmountUSD, profitAmountUSD: 0 });
      }
      const stopLossPips = Math.abs(openPrice - stopLoss) / pipSize;

      // 3. Calculate Pip Value (in USD)
      const quoteCurrency = instrument.split('/')[1]?.toUpperCase();
      if (!quoteCurrency || quotePrice <= 0) {
        throw new Error("Invalid instrument or quote price.");
      }
      
      let pipValuePerLotUSD = 0;
      if (quoteCurrency === 'USD') {
        pipValuePerLotUSD = 10;
      } else if (quoteCurrency === 'JPY') {
        pipValuePerLotUSD = 1000 / quotePrice;
      } else {
        pipValuePerLotUSD = 10 / quotePrice;
      }
      
      // 4. Calculate Position Size (in Lots)
      const valueOfAllPipsAtRisk = stopLossPips * pipValuePerLotUSD;
      if (valueOfAllPipsAtRisk <= 0) {
        return resolve({ lotSize: 0, riskAmountUSD, profitAmountUSD: 0 });
      }
      const lotSize = riskAmountUSD / valueOfAllPipsAtRisk;
      
      // 5. Calculate Potential Profit and R:R Ratio using the adjusted prices
      let profitAmountUSD = 0;
      let rewardToRiskRatio: number | undefined = undefined;

      if (takeProfit && openPrice !== takeProfit) {
        const profitPips = Math.abs(takeProfit - openPrice) / pipSize;
        profitAmountUSD = profitPips * pipValuePerLotUSD * lotSize;
         if (stopLossPips > 0) {
            rewardToRiskRatio = profitPips / stopLossPips;
        }
      }

      // Resolve with the final results. Display components will handle rounding.
      resolve({
        lotSize: lotSize,
        riskAmountUSD: riskAmountUSD,
        profitAmountUSD: profitAmountUSD,
        rewardToRiskRatio: rewardToRiskRatio,
      });

    } catch (error) {
      console.error("Calculation Error:", error);
      reject(error);
    }
  });
};