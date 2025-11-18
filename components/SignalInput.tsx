import React, { useState, useEffect } from 'react';
import type { SignalData } from '../types';
import { parseSignalString } from '../services/signalParser';

interface SignalFormProps {
  onSubmit: (data: Omit<SignalData, 'accountBalance'>) => void;
  isLoading: boolean;
}

const InputField: React.FC<{
    id: keyof Omit<SignalData, 'accountBalance'> | 'riskPercent' | 'openPrice' | 'stopLoss' | 'quotePrice' | 'takeProfit' | 'spread';
    label: string;
    type: 'text' | 'number';
    value: string | number;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    placeholder?: string;
    step?: string;
    required?: boolean;
    disabled: boolean;
    helpText?: string;
}> = ({ id, label, value, onChange, disabled, helpText, ...props }) => (
    <div>
        <label htmlFor={id} className="block text-md font-medium text-gray-300 mb-2">
            {label}
        </label>
        <input
            id={id}
            name={id}
            value={value}
            onChange={onChange}
            disabled={disabled}
            className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200"
            {...props}
        />
        {helpText && <p className="mt-2 text-xs text-gray-500">{helpText}</p>}
    </div>
);


export const SignalForm: React.FC<SignalFormProps> = ({ onSubmit, isLoading }) => {
  const [rawSignal, setRawSignal] = useState('');
  
  // formData holds the values displayed in the input fields
  const [formData, setFormData] = useState({
    instrument: '',
    openPrice: '',
    stopLoss: '',
    takeProfit: '',
    riskPercent: '',
    quotePrice: '',
    spread: '',
  });

  // basePrices holds the unadjusted prices, from pasting or manual input
  const [basePrices, setBasePrices] = useState({
    openPrice: '',
    stopLoss: '',
    takeProfit: '',
  });

  // Effect 1: Parse raw signal to populate base prices and other form fields
  useEffect(() => {
    if (rawSignal) {
      const parsed = parseSignalString(rawSignal);
      const newBasePrices = {
        openPrice: parsed.openPrice || '',
        stopLoss: parsed.stopLoss || '',
        takeProfit: parsed.takeProfit || '',
      };
      setBasePrices(newBasePrices);

      setFormData(prev => ({
        ...prev,
        instrument: parsed.instrument || prev.instrument,
        riskPercent: parsed.riskPercent || prev.riskPercent,
        // The spread is now entered manually first and should not be overwritten by the parser.
        openPrice: newBasePrices.openPrice,
        stopLoss: newBasePrices.stopLoss,
        takeProfit: newBasePrices.takeProfit,
        quotePrice: newBasePrices.openPrice || prev.quotePrice,
      }));
    }
  }, [rawSignal]);

  // Effect 2: Central logic for applying spread adjustments live.
  // Runs whenever base prices, spread value, or instrument changes.
  useEffect(() => {
    const { spread, instrument } = formData;
    const { openPrice: baseOpen, stopLoss: baseSL, takeProfit: baseTP } = basePrices;

    if (!spread || !baseOpen || !baseSL || !instrument) {
      setFormData(prev => ({
        ...prev,
        openPrice: baseOpen,
        stopLoss: baseSL,
        takeProfit: baseTP || '',
        ...(prev.openPrice !== baseOpen && { quotePrice: baseOpen })
      }));
      return;
    }
    
    try {
      const spreadNum = parseFloat(spread);
      let openPriceNum = parseFloat(baseOpen);
      let stopLossNum = parseFloat(baseSL);
      let takeProfitNum = baseTP ? parseFloat(baseTP) : undefined;
      
      if (isNaN(spreadNum) || isNaN(openPriceNum) || isNaN(stopLossNum)) {
        throw new Error("Invalid number format");
      }

      const isJpyPair = instrument.toUpperCase().includes('JPY');
      const pipSize = isJpyPair ? 0.01 : 0.0001;
      const pipetteSize = pipSize / 10;
      const spreadAdjustmentValue = spreadNum * pipetteSize;
      const isBuyOrder = stopLossNum < openPriceNum;

      if (isBuyOrder) {
        openPriceNum += spreadAdjustmentValue;
        stopLossNum -= spreadAdjustmentValue;
        if (takeProfitNum !== undefined) takeProfitNum -= spreadAdjustmentValue;
      } else { // isSellOrder
        openPriceNum -= spreadAdjustmentValue;
        stopLossNum += spreadAdjustmentValue;
        if (takeProfitNum !== undefined) takeProfitNum += spreadAdjustmentValue;
      }
      
      const precision = isJpyPair ? 3 : 5;
      const adjustedOpen = openPriceNum.toFixed(precision);
      const adjustedSL = stopLossNum.toFixed(precision);
      const adjustedTP = takeProfitNum !== undefined ? takeProfitNum.toFixed(precision) : '';

      setFormData(prev => ({
        ...prev,
        openPrice: adjustedOpen,
        stopLoss: adjustedSL,
        takeProfit: adjustedTP,
        quotePrice: adjustedOpen,
      }));
    } catch (e) {
      console.error("Error applying spread:", e);
      setFormData(prev => ({
        ...prev,
        openPrice: baseOpen,
        stopLoss: baseSL,
        takeProfit: baseTP || '',
        quotePrice: baseOpen,
      }));
    }
  }, [basePrices, formData.spread, formData.instrument]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    
    setFormData(prev => ({ ...prev, [name]: value }));

    if (['openPrice', 'stopLoss', 'takeProfit'].includes(name)) {
      setBasePrices(prev => ({ ...prev, [name]: value }));
    }
    
    if (name === 'openPrice' && !formData.spread) {
      setFormData(prev => ({ ...prev, quotePrice: value }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Prices in formData are already adjusted.
    // We send spread:undefined to prevent double-application by the service.
    const numericData: Omit<SignalData, 'accountBalance'> = {
        instrument: formData.instrument,
        openPrice: parseFloat(formData.openPrice),
        stopLoss: parseFloat(formData.stopLoss),
        takeProfit: formData.takeProfit ? parseFloat(formData.takeProfit) : undefined,
        riskPercent: parseFloat(formData.riskPercent),
        quotePrice: parseFloat(formData.quotePrice),
        spread: undefined,
    };
    onSubmit(numericData);
  };

  const isSignalInputDisabled = isLoading || !formData.spread;

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-gray-800/50 border border-gray-700 rounded-lg p-6">
       <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2">
            <label htmlFor="rawSignal" className="block text-md font-medium text-gray-300 mb-2">
                سیگنال خود را اینجا الصاق کنید (اختیاری)
            </label>
            <textarea
                id="rawSignal"
                name="rawSignal"
                rows={3}
                value={rawSignal}
                onChange={(e) => setRawSignal(e.target.value)}
                disabled={isSignalInputDisabled}
                className="w-full bg-gray-800 border border-gray-600 rounded-lg p-3 text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-shadow duration-200 disabled:bg-gray-700/50 disabled:cursor-not-allowed"
                placeholder={isSignalInputDisabled ? "ابتدا اسپرد را در کادر سمت راست وارد کنید" : "مثال: Buy USD/CAD at 1.40186, SL 1.39992, Risk 2%"}
            />
             <p className="mt-2 text-xs text-gray-500">
              {isSignalInputDisabled
                ? "برای فعال شدن این قسمت، ابتدا باید اسپرد را وارد کنید."
                : "جفت ارز، قیمت ورود، حد ضرر، حد سود و ریسک به صورت خودکار استخراج و اعمال می‌شوند."
              }
            </p>
          </div>
          <div className="md:col-span-1">
            <InputField 
              id="spread" 
              label="اسپرد (پیپت)" 
              type="number" 
              value={formData.spread} 
              onChange={handleChange} 
              disabled={isLoading} 
              placeholder="مثال: 15" 
              step="0.1"
              helpText="این مقدار قیمت‌ها را بر اساس نوع معامله (خرید/فروش) تنظیم می‌کند."
            />
          </div>
      </div>

      <div className="border-t border-gray-700 !mt-4"></div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <InputField id="instrument" label="جفت ارز" type="text" value={formData.instrument} onChange={handleChange} disabled={isLoading} placeholder="مثال: EUR/USD" required />
        <InputField id="riskPercent" label="ریسک (%)" type="number" value={formData.riskPercent} onChange={handleChange} disabled={isLoading} placeholder="مثال: 2" step="0.1" required />
        <InputField id="openPrice" label="قیمت ورود" type="number" value={formData.openPrice} onChange={handleChange} disabled={isLoading} placeholder="1.07500" step="0.00001" required />
        <InputField id="stopLoss" label="حد ضرر" type="number" value={formData.stopLoss} onChange={handleChange} disabled={isLoading} placeholder="1.07200" step="0.00001" required />
        <InputField id="takeProfit" label="حد سود (اختیاری)" type="number" value={formData.takeProfit} onChange={handleChange} disabled={isLoading} placeholder="1.08000" step="0.00001" />
      </div>
      <InputField 
        id="quotePrice" 
        label="قیمت فعلی" 
        type="number" 
        value={formData.quotePrice} 
        onChange={handleChange} 
        disabled={isLoading} 
        placeholder="به طور خودکار از قیمت ورود پر می‌شود" 
        step="0.00001"
        required
        helpText="به طور پیش‌فرض، همان قیمت ورود در نظر گرفته می‌شود. برای محاسبه دقیق‌تر در جفت‌ارزهایی که ارز دوم USD نیست (مثلاً USD/CAD)، قیمت فعلی آن جفت‌ارز را وارد کنید."
      />
      <button
        type="submit"
        disabled={isLoading}
        className="w-full flex justify-center items-center bg-blue-600 hover:bg-blue-700 disabled:bg-blue-800 disabled:text-gray-400 disabled:cursor-not-allowed text-white font-bold py-3 px-4 rounded-lg transition-colors duration-200 mt-4"
      >
        {isLoading ? 'در حال محاسبه...' : 'محاسبه کن'}
      </button>
    </form>
  );
};
