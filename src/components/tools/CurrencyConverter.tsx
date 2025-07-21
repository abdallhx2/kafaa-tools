import { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ArrowLeftRight, RefreshCw } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const CurrencyConverter = () => {
  const [amount, setAmount] = useState('1');
  const [fromCurrency, setFromCurrency] = useState('USD');
  const [toCurrency, setToCurrency] = useState('SAR');
  const [result, setResult] = useState('');
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [lastUpdated, setLastUpdated] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const currencies = [
    { code: 'USD', name: 'دولار أمريكي', symbol: '$' },
    { code: 'SAR', name: 'ريال سعودي', symbol: 'ر.س' },
    { code: 'EUR', name: 'يورو', symbol: '€' },
    { code: 'GBP', name: 'جنيه إسترليني', symbol: '£' },
    { code: 'AED', name: 'درهم إماراتي', symbol: 'د.إ' },
    { code: 'EGP', name: 'جنيه مصري', symbol: 'ج.م' },
    { code: 'KWD', name: 'دينار كويتي', symbol: 'د.ك' },
    { code: 'QAR', name: 'ريال قطري', symbol: 'ر.ق' },
    { code: 'BHD', name: 'دينار بحريني', symbol: 'د.ب' },
    { code: 'OMR', name: 'ريال عماني', symbol: 'ر.ع' },
    { code: 'JOD', name: 'دينار أردني', symbol: 'د.أ' },
    { code: 'JPY', name: 'ين ياباني', symbol: '¥' },
    { code: 'CNY', name: 'يوان صيني', symbol: '¥' },
    { code: 'CAD', name: 'دولار كندي', symbol: 'C$' },
    { code: 'AUD', name: 'دولار أسترالي', symbol: 'A$' },
  ];

  // Fixed exchange rates (في التطبيق الحقيقي، يتم جلبها من API)
  const fixedRates: { [key: string]: { [key: string]: number } } = {
    USD: {
      SAR: 3.75, EUR: 0.85, GBP: 0.73, AED: 3.67, EGP: 48.5,
      KWD: 0.31, QAR: 3.64, BHD: 0.38, OMR: 0.38, JOD: 0.71,
      JPY: 110, CNY: 6.45, CAD: 1.25, AUD: 1.35
    }
  };

  const getExchangeRate = async () => {
    setIsLoading(true);
    try {
      // محاكاة تأخير API
      await new Promise(resolve => setTimeout(resolve, 500));
      
      let rate = 1;
      
      if (fromCurrency === toCurrency) {
        rate = 1;
      } else if (fixedRates[fromCurrency] && fixedRates[fromCurrency][toCurrency]) {
        rate = fixedRates[fromCurrency][toCurrency];
      } else if (fixedRates[toCurrency] && fixedRates[toCurrency][fromCurrency]) {
        rate = 1 / fixedRates[toCurrency][fromCurrency];
      } else if (fromCurrency !== 'USD' && toCurrency !== 'USD') {
        // تحويل عبر الدولار الأمريكي
        const fromUSD = fixedRates.USD[fromCurrency] ? 1 / fixedRates.USD[fromCurrency] : 1;
        const toUSD = fixedRates.USD[toCurrency] || 1;
        rate = fromUSD * toUSD;
      } else if (fromCurrency === 'USD') {
        rate = fixedRates.USD[toCurrency] || 1;
      } else if (toCurrency === 'USD') {
        rate = fixedRates.USD[fromCurrency] ? 1 / fixedRates.USD[fromCurrency] : 1;
      }
      
      setExchangeRate(rate);
      setLastUpdated(new Date().toLocaleString('ar-SA'));
      
      toast({
        title: "تم تحديث أسعار الصرف",
        description: "تم الحصول على أحدث أسعار الصرف",
      });
    } catch (error) {
      toast({
        title: "خطأ في التحديث",
        description: "فشل في الحصول على أسعار الصرف",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const convertCurrency = () => {
    const numAmount = parseFloat(amount);
    if (isNaN(numAmount) || !exchangeRate) {
      toast({
        title: "خطأ في التحويل",
        description: "يرجى إدخال رقم صحيح",
        variant: "destructive",
      });
      return;
    }

    const convertedAmount = numAmount * exchangeRate;
    const fromSymbol = currencies.find(c => c.code === fromCurrency)?.symbol || '';
    const toSymbol = currencies.find(c => c.code === toCurrency)?.symbol || '';
    
    setResult(`${fromSymbol}${numAmount.toLocaleString()} = ${toSymbol}${convertedAmount.toLocaleString(undefined, { maximumFractionDigits: 2 })}`);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
    setExchangeRate(null);
    setResult('');
  };

  useEffect(() => {
    if (fromCurrency && toCurrency) {
      getExchangeRate();
    }
  }, [fromCurrency, toCurrency]);

  useEffect(() => {
    if (exchangeRate && amount) {
      convertCurrency();
    }
  }, [exchangeRate, amount]);

  return (
    <div className="space-y-6">
      <Card className="bg-gradient-card shadow-soft border-0">
        <CardHeader className="text-center">
          <CardTitle className="gradient-text">محول العملات</CardTitle>
          <CardDescription>تحويل العملات بأسعار محدثة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">المبلغ:</label>
              <Input
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="أدخل المبلغ"
                type="number"
                min="0"
                step="0.01"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
              <div className="space-y-2">
                <label className="text-sm font-medium">من:</label>
                <Select value={fromCurrency} onValueChange={setFromCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-center">
                <Button onClick={swapCurrencies} variant="outline" size="sm">
                  <ArrowLeftRight className="h-4 w-4" />
                </Button>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium">إلى:</label>
                <Select value={toCurrency} onValueChange={setToCurrency}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent className="max-h-60">
                    {currencies.map((currency) => (
                      <SelectItem key={currency.code} value={currency.code}>
                        {currency.code} - {currency.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={getExchangeRate} disabled={isLoading} variant="outline" className="flex-1">
                <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                {isLoading ? 'جاري التحديث...' : 'تحديث الأسعار'}
              </Button>
            </div>
          </div>

          {result && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="text-center">
                  <div className="text-2xl font-bold text-primary mb-2">
                    {result}
                  </div>
                  {exchangeRate && (
                    <div className="text-sm text-muted-foreground">
                      سعر الصرف: 1 {fromCurrency} = {exchangeRate.toFixed(4)} {toCurrency}
                    </div>
                  )}
                </div>
              </div>

              {lastUpdated && (
                <div className="text-center text-xs text-muted-foreground">
                  آخر تحديث: {lastUpdated}
                </div>
              )}
            </div>
          )}

          <div className="text-xs text-muted-foreground">
            <p><strong>ملاحظة:</strong> هذه أسعار تقريبية للعرض التوضيحي. في التطبيق الحقيقي، يتم جلب الأسعار من مصادر موثوقة مثل البنوك المركزية.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CurrencyConverter;