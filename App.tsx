import React, { useState, useCallback, useEffect } from 'react';
import { Header } from './components/Header';
import { SignalForm } from './components/SignalInput';
import { ResultDisplay } from './components/ResultDisplay';
import { CapitalDisplay } from './components/CapitalDisplay';
import { calculateLotSize } from './services/geminiService';
import type { CalculationResult, SignalData } from './types';
import { LoadingSpinner } from './components/LoadingSpinner';

const App: React.FC = () => {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [submittedSignal, setSubmittedSignal] = useState<Omit<SignalData, 'accountBalance'> | null>(null);
  const [capital, setCapital] = useState<number>(() => {
    try {
      const savedCapital = localStorage.getItem('forexCalculatorCapital');
      return savedCapital ? parseFloat(savedCapital) : 500;
    } catch (e) {
      console.error("Failed to read capital from localStorage", e);
      return 500;
    }
  });

  const handleCapitalChange = useCallback((newCapital: number) => {
    setCapital(newCapital);
    try {
      localStorage.setItem('forexCalculatorCapital', newCapital.toString());
    } catch (e) {
      console.error("Failed to save capital to localStorage", e);
    }
  }, []);

  const handleCalculate = useCallback(async (data: Omit<SignalData, 'accountBalance'>) => {
    setIsLoading(true);
    setResult(null);
    setError(null);
    setSubmittedSignal(data);

    try {
      const completeSignalData: SignalData = {
        ...data,
        accountBalance: capital,
      };
      const calculationResult = await calculateLotSize(completeSignalData);
      setResult(calculationResult);
    } catch (e) {
      console.error(e);
      setError("خطا در محاسبه. لطفاً ورودی‌های خود را بررسی کرده و دوباره امتحان کنید. مطمئن شوید که قیمت فعلی را به درستی وارد کرده‌اید.");
    } finally {
      setIsLoading(false);
    }
  }, [capital]);

  return (
    <div className="min-h-screen bg-gray-900 text-white flex flex-col items-center p-4 sm:p-6">
      <div className="w-full max-w-2xl mx-auto">
        <Header />
        <main className="mt-8 space-y-8">
          <CapitalDisplay capital={capital} onCapitalChange={handleCapitalChange} />
          <SignalForm onSubmit={handleCalculate} isLoading={isLoading} />
          {isLoading && <LoadingSpinner />}
          <ResultDisplay result={result} error={error} signalData={submittedSignal} />
        </main>
      </div>
    </div>
  );
};

export default App;