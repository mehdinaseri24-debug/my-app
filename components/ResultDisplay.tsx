import React, { useState } from 'react';
import type { CalculationResult, SignalData } from '../types';

interface ResultDisplayProps {
  result: CalculationResult | null;
  error: string | null;
  signalData: Omit<SignalData, 'accountBalance'> | null;
}

const ResultCard: React.FC<{ label: string; value: React.ReactNode; unit: string; icon: React.ReactNode }> = ({ label, value, unit, icon }) => (
    <div className="bg-gray-800 rounded-lg p-4 flex items-center space-x-4 space-x-reverse">
        <div className="flex-shrink-0 w-12 h-12 flex items-center justify-center bg-gray-700 rounded-full">
            {icon}
        </div>
        <div>
            <p className="text-sm text-gray-400">{label}</p>
            <p className="text-xl md:text-2xl font-bold text-white">
                {value} {unit && <span className="text-base md:text-lg font-normal text-gray-300">{unit}</span>}
            </p>
        </div>
    </div>
);

const ExecutionField: React.FC<{ label: string; value: string | number }> = ({ label, value }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = () => {
        if (!value || value === '---') return;
        navigator.clipboard.writeText(value.toString()).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    return (
        <div className="flex justify-between items-center bg-gray-900 p-3 rounded-lg border border-gray-700">
            <span className="text-gray-400 font-medium">{label}</span>
            <button 
              onClick={handleCopy} 
              className="flex items-center gap-3 text-white font-mono text-lg rounded-md px-2 py-1 hover:bg-gray-700 transition-colors"
              title="کپی کردن"
              aria-label={`کپی کردن ${label}`}
            >
                <span>{value}</span>
                <span className="text-gray-500 w-5 h-5 flex items-center justify-center">
                    {copied ? (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                        </svg>
                    ) : (
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
                        </svg>
                    )}
                </span>
            </button>
        </div>
    );
};


export const ResultDisplay: React.FC<ResultDisplayProps> = ({ result, error, signalData }) => {
  if (error) {
    return (
      <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-lg" role="alert">
        <strong className="font-bold">خطا! </strong>
        <span className="block sm:inline">{error}</span>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  return (
    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-6 animate-fade-in">
        <h3 className="text-xl font-semibold mb-4 text-center text-teal-300">نتایج محاسبه</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <ResultCard 
                label="میزان ریسک" 
                value={`$${result.riskAmountUSD.toFixed(2)}`} 
                unit="دلار" 
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 17h8m0 0V9m0 8l-8-8-4 4-6-6" />
                    </svg>
                }
            />
            {result.profitAmountUSD > 0 && (
                <ResultCard 
                    label="سود احتمالی" 
                    value={`$${result.profitAmountUSD.toFixed(2)}`} 
                    unit="دلار" 
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-teal-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                           <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                    }
                />
            )}
             <ResultCard 
                label="حجم معامله (لات)" 
                value={result.lotSize.toFixed(3)} 
                unit="لات" 
                icon={
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                }
            />
            {result.rewardToRiskRatio && result.rewardToRiskRatio > 0 && (
                 <ResultCard 
                    label="نسبت سود به ریسک (R:R)" 
                    value={
                        <span className="flex items-center">
                            <span className="text-green-400">{result.rewardToRiskRatio.toFixed(2)}</span>
                            <span className="text-gray-300 mx-1">:</span>
                            <span className="text-red-400">1</span>
                        </span>
                    }
                    unit=""
                    icon={
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                           <path strokeLinecap="round" strokeLinejoin="round" d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                        </svg>
                    }
                />
            )}
        </div>

        {signalData && (
            <div className="mt-8 border-t border-gray-700 pt-6">
                <h4 className="text-lg font-semibold mb-4 text-center text-gray-300">مقادیر برای ثبت سفارش</h4>
                <div className="space-y-3 max-w-sm mx-auto">
                    <ExecutionField label="Price (EN)" value={signalData.openPrice} />
                    <ExecutionField label="Volume (LOT)" value={result.lotSize.toFixed(3)} />
                    <ExecutionField label="Take Profit (TP)" value={signalData.takeProfit || '---'} />
                    <ExecutionField label="Stop Loss (SL)" value={signalData.stopLoss} />
                </div>
            </div>
        )}
    </div>
  );
};