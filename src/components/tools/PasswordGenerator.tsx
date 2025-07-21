import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Copy, RefreshCw, Shield } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

const PasswordGenerator = () => {
  const [length, setLength] = useState([12]);
  const [includeUppercase, setIncludeUppercase] = useState(true);
  const [includeLowercase, setIncludeLowercase] = useState(true);
  const [includeNumbers, setIncludeNumbers] = useState(true);
  const [includeSymbols, setIncludeSymbols] = useState(true);
  const [password, setPassword] = useState('');
  const { toast } = useToast();

  const generatePassword = () => {
    let charset = '';
    const uppercase = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
    const lowercase = 'abcdefghijklmnopqrstuvwxyz';
    const numbers = '0123456789';
    const symbols = '!@#$%^&*()_+-=[]{}|;:,.<>?';

    if (includeUppercase) charset += uppercase;
    if (includeLowercase) charset += lowercase;
    if (includeNumbers) charset += numbers;
    if (includeSymbols) charset += symbols;

    if (charset === '') {
      toast({
        title: "خطأ",
        description: "يجب اختيار نوع واحد على الأقل من الأحرف",
        variant: "destructive",
      });
      return;
    }

    let result = '';
    for (let i = 0; i < length[0]; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length));
    }

    setPassword(result);
    toast({
      title: "تم إنشاء كلمة المرور!",
      description: "كلمة مرور قوية جاهزة للاستخدام",
    });
  };

  const copyPassword = async () => {
    if (password) {
      try {
        await navigator.clipboard.writeText(password);
        toast({
          title: "تم النسخ",
          description: "تم نسخ كلمة المرور إلى الحافظة",
        });
      } catch (error) {
        toast({
          title: "فشل في النسخ",
          description: "لم يتم نسخ كلمة المرور",
          variant: "destructive",
        });
      }
    }
  };

  const getPasswordStrength = () => {
    if (!password) return { level: 0, text: '' };
    
    let score = 0;
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[a-z]/.test(password)) score++;
    if (/[A-Z]/.test(password)) score++;
    if (/[0-9]/.test(password)) score++;
    if (/[^A-Za-z0-9]/.test(password)) score++;

    if (score <= 2) return { level: 1, text: 'ضعيف', color: 'bg-red-500' };
    if (score <= 4) return { level: 2, text: 'متوسط', color: 'bg-yellow-500' };
    return { level: 3, text: 'قوي', color: 'bg-green-500' };
  };

  const strength = getPasswordStrength();

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <Shield className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">مولد كلمات المرور</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">إنشاء كلمات مرور قوية وآمنة</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">طول كلمة المرور: {length[0]}</label>
              <Slider
                value={length}
                onValueChange={setLength}
                max={50}
                min={4}
                step={1}
                className="w-full"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">أحرف كبيرة (A-Z)</label>
                <Switch checked={includeUppercase} onCheckedChange={setIncludeUppercase} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">أحرف صغيرة (a-z)</label>
                <Switch checked={includeLowercase} onCheckedChange={setIncludeLowercase} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">أرقام (0-9)</label>
                <Switch checked={includeNumbers} onCheckedChange={setIncludeNumbers} />
              </div>
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium">رموز (!@#$%)</label>
                <Switch checked={includeSymbols} onCheckedChange={setIncludeSymbols} />
              </div>
            </div>
          </div>

          <Button onClick={generatePassword} className="w-full bg-gradient-primary hover:shadow-glow text-primary-foreground transition-smooth font-medium">
            <Shield className="mr-2 h-4 w-4" />
            إنشاء كلمة مرور
          </Button>

          {password && (
            <div className="space-y-4">
              <div className="bg-muted rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium">كلمة المرور:</span>
                  <div className="flex gap-2">
                    <Button onClick={copyPassword} size="sm" variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button onClick={generatePassword} size="sm" variant="outline">
                      <RefreshCw className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
                <div className="font-mono text-lg bg-background p-2 rounded border break-all">
                  {password}
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">قوة كلمة المرور:</span>
                  <span className={`text-sm px-2 py-1 rounded text-white ${strength.color}`}>
                    {strength.text}
                  </span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full transition-all ${strength.color}`}
                    style={{ width: `${(strength.level / 3) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PasswordGenerator;