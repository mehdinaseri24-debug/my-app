export interface ParsedSignal {
  instrument?: string;
  openPrice?: string;
  stopLoss?: string;
  takeProfit?: string;
  riskPercent?: string;
  spread?: string;
}

/**
 * Parses a raw signal string to extract key trading parameters.
 * It uses case-insensitive regular expressions to find common patterns in forex signals.
 * @param signal The raw signal string from the user.
 * @returns An object containing the parsed data.
 */
export const parseSignalString = (signal: string): ParsedSignal => {
  const result: ParsedSignal = {};

  // 1. Extract Instrument (e.g., USD/CAD, EURUSD)
  // Looks for two 3-letter words, optionally separated by a slash. Case-insensitive.
  const instrumentMatch = signal.match(/[A-Z]{3}\/?[A-Z]{3}/i);
  if (instrumentMatch) {
    const instrument = instrumentMatch[0].toUpperCase();
    // Ensure there's a slash for consistency
    result.instrument = instrument.includes('/') 
      ? instrument
      : instrument.slice(0, 3) + '/' + instrument.slice(3);
  }

  // 2. Extract Stop Loss (SL)
  // Looks for keywords like SL, STOPLOSS, STOP followed by a number. Case-insensitive.
  const stopLossMatch = signal.match(/(?:SL|STOPLOSS|STOP)[\s:.]*(\d+\.?\d*)/i);
  if (stopLossMatch && stopLossMatch[1]) {
    result.stopLoss = stopLossMatch[1];
  }

  // 3. Extract Take Profit (TP)
  // Looks for keywords like TP, TAKEPROFIT, TARGET followed by a number. Case-insensitive.
  const takeProfitMatch = signal.match(/(?:TP|TAKEPROFIT|TARGET)[\s:.]*(\d+\.?\d*)/i);
  if (takeProfitMatch && takeProfitMatch[1]) {
    result.takeProfit = takeProfitMatch[1];
  }

  // 4. Extract Entry Price (EP)
  // First, try specific keywords like EP, ENTRY, AT. Case-insensitive.
  let openPriceMatch = signal.match(/(?:EP|ENTRY|AT)[\s:.]*(\d+\.?\d*)/i);
  if (openPriceMatch && openPriceMatch[1]) {
    result.openPrice = openPriceMatch[1];
  } else {
    // If no keyword is found, find all numbers and try to identify the entry price.
    // This is a fallback and might not always be accurate, but covers many cases.
    const allNumbers = signal.match(/\d+\.\d+/g) || [];
    // Filter out the numbers we already identified as stop loss or take profit.
    const remainingNumbers = allNumbers.filter(n => n !== result.stopLoss && n !== result.takeProfit);
    if (remainingNumbers.length > 0) {
      // A common convention is that the first number mentioned is the entry price.
      result.openPrice = remainingNumbers[0];
    }
  }

  // 5. Extract Risk Percentage
  // Looks for Farsi "ریسک" or English "RISK" followed by a number. Case-insensitive for English part.
  const riskMatch = signal.match(/(?:ریسک|risk)[\s:.]*(\d+\.?\d*)/i);
  if (riskMatch && riskMatch[1]) {
    result.riskPercent = riskMatch[1];
  }

  // 6. Extract Spread
  // Looks for Farsi "اسپرد" or English "SPREAD". Case-insensitive for English part.
  const spreadMatch = signal.match(/(?:اسپرد|spread)[\s:.]*(\d+\.?\d*)/i);
  if (spreadMatch && spreadMatch[1]) {
    result.spread = spreadMatch[1];
  }

  return result;
};