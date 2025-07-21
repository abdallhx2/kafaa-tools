import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { FileText, Download, Lock, Loader2 } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";
import { ilovePDFManager } from '@/utils/ilovepdf-api';

const PDFProtector = () => {
  const [file, setFile] = useState<File | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [permissions, setPermissions] = useState({
    print: true,
    copy: true,
    modify: false,
    fillForms: true,
    extract: false,
    assemble: false,
    printHighRes: true
  });
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
      setResultBlob(null);
      setProgress({ stage: '', percent: 0 });
    } else {
      toast({
        title: "خطأ في الملف",
        description: "يرجى اختيار ملف PDF صحيح",
        variant: "destructive",
      });
    }
  };

  const handlePermissionChange = (permission: keyof typeof permissions, checked: boolean) => {
    setPermissions(prev => ({
      ...prev,
      [permission]: checked
    }));
  };

  const protectPDF = async () => {
    if (!file) {
      toast({
        title: "لا يوجد ملف",
        description: "يرجى اختيار ملف PDF أولاً",
        variant: "destructive",
      });
      return;
    }

    if (!password.trim()) {
      toast({
        title: "كلمة مرور مطلوبة",
        description: "يرجى إدخال كلمة مرور للحماية",
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "كلمة المرور غير متطابقة",
        description: "تأكد من تطابق كلمة المرور والتأكيد",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress({ stage: 'جاري البدء...', percent: 0 });

    try {
      const result = await ilovePDFManager.processWorkflow(
        'protect',
        [file],
        { 
          password: password,
          permissions: permissions
        },
        (stage, percent) => {
          setProgress({ stage, percent });
        }
      );

      setResultBlob(result);
      
      toast({
        title: "تم حماية PDF بنجاح!",
        description: "تم إضافة كلمة مرور وصلاحيات للملف",
      });
    } catch (error) {
      toast({
        title: "خطأ في الحماية",
        description: "فشل في حماية ملف PDF",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultBlob && file) {
      const filename = file.name.replace('.pdf', '_protected.pdf');
      ilovePDFManager.downloadBlob(resultBlob, filename);
    }
  };

  return (
    <div className="space-y-6">
      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader className="text-center relative">
          <div className="w-20 h-20 mx-auto mb-6 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <Lock className="h-10 w-10 text-primary-foreground" />
          </div>
          <CardTitle className="text-3xl gradient-text mb-2">حماية PDF</CardTitle>
          <CardDescription className="text-muted-foreground text-lg">إضافة كلمة مرور وصلاحيات أمان لملف PDF</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">اختر ملف PDF:</label>
            <Input
              type="file"
              accept=".pdf"
              onChange={handleFileChange}
              className="cursor-pointer"
            />
          </div>

          {file && (
            <div className="flex items-center gap-2 p-3 bg-muted rounded-lg">
              <FileText className="h-4 w-4 text-primary" />
              <div className="flex-1">
                <p className="text-sm font-medium">{file.name}</p>
                <p className="text-xs text-muted-foreground">
                  ملف PDF غير محمي
                </p>
              </div>
            </div>
          )}

          {file && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="password">كلمة المرور:</Label>
                  <Input
                    id="password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="أدخل كلمة مرور قوية"
                    className="text-left"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">تأكيد كلمة المرور:</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="أعد إدخال كلمة المرور"
                    className="text-left"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <Label>الصلاحيات المسموحة:</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="print"
                      checked={permissions.print}
                      onCheckedChange={(checked) => handlePermissionChange('print', checked as boolean)}
                    />
                    <Label htmlFor="print" className="text-sm">السماح بالطباعة</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="copy"
                      checked={permissions.copy}
                      onCheckedChange={(checked) => handlePermissionChange('copy', checked as boolean)}
                    />
                    <Label htmlFor="copy" className="text-sm">السماح بالنسخ</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="modify"
                      checked={permissions.modify}
                      onCheckedChange={(checked) => handlePermissionChange('modify', checked as boolean)}
                    />
                    <Label htmlFor="modify" className="text-sm">السماح بالتعديل</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="fillForms"
                      checked={permissions.fillForms}
                      onCheckedChange={(checked) => handlePermissionChange('fillForms', checked as boolean)}
                    />
                    <Label htmlFor="fillForms" className="text-sm">ملء النماذج</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="extract"
                      checked={permissions.extract}
                      onCheckedChange={(checked) => handlePermissionChange('extract', checked as boolean)}
                    />
                    <Label htmlFor="extract" className="text-sm">استخراج الصفحات</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id="assemble"
                      checked={permissions.assemble}
                      onCheckedChange={(checked) => handlePermissionChange('assemble', checked as boolean)}
                    />
                    <Label htmlFor="assemble" className="text-sm">تجميع المستند</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          {processing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>{progress.stage}</span>
                <span>{progress.percent.toFixed(0)}%</span>
              </div>
              <div className="w-full bg-muted rounded-full h-2">
                <div 
                  className="bg-gradient-primary h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
            </div>
          )}

          <div className="flex gap-2 justify-center">
            <Button 
              onClick={protectPDF} 
              disabled={!file || !password.trim() || password !== confirmPassword || processing}
              className="bg-gradient-primary hover:shadow-glow text-primary-foreground transition-smooth font-medium disabled:opacity-50"
            >
              {processing ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {progress.stage}
                </>
              ) : (
                <>
                  <Lock className="mr-2 h-4 w-4" />
                  حماية PDF
                </>
              )}
            </Button>
            
            {resultBlob && (
              <Button onClick={downloadResult} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                تحميل PDF المحمي
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFProtector;