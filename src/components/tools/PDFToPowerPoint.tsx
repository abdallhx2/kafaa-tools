import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Download, Presentation, Loader2, Upload } from 'lucide-react';
import { useToast } from "@/hooks/use-toast";

// iLovePDF API interfaces and classes integrated directly
interface APICredentials {
  publicKey: string;
  secretKey: string;
  apiUrl: string;
}

interface TaskResponse {
  server: string;
  task: string;
}

class ILovePDFAPI {
  private credentials: APICredentials;
  private authToken?: string;
  private tokenExpiry?: number;

  constructor() {
    this.credentials = {
      publicKey: import.meta.env.VITE_ILOVEPDF_PUBLIC_KEY || "",
      secretKey: import.meta.env.VITE_ILOVEPDF_SECRET_KEY || "",
      apiUrl: import.meta.env.VITE_ILOVEPDF_API_URL || 'https://api.ilovepdf.com/v1'
    };
  }

  // Check if credentials are valid
  hasValidCredentials(): boolean {
    return !!(this.credentials.publicKey && this.credentials.secretKey);
  }

  // Generate JWT token for authentication
  private async generateToken(): Promise<string> {
    if (!this.hasValidCredentials()) {
      throw new Error('مفاتيح API مطلوبة');
    }

    const now = Math.floor(Date.now() / 1000);
    
    // Check if current token is still valid
    if (this.authToken && this.tokenExpiry && now < this.tokenExpiry - 300) {
      return this.authToken;
    }

    try {
      // Create JWT payload
      const payload = {
        iss: this.credentials.publicKey,
        aud: 'ilovepdf',
        iat: now,
        exp: now + 7200 // 2 hours
      };

      // In production, use proper JWT signing with the secret key
      // For now, using base64 encoding (replace with proper JWT library)
      const header = { alg: 'HS256', typ: 'JWT' };
      const headerB64 = btoa(JSON.stringify(header));
      const payloadB64 = btoa(JSON.stringify(payload));
      
      // This should be properly signed with HMAC SHA256 using secretKey
      const signature = btoa(this.credentials.secretKey + headerB64 + payloadB64);
      
      this.authToken = `${headerB64}.${payloadB64}.${signature}`;
      this.tokenExpiry = payload.exp;
      
      return this.authToken;
    } catch (error) {
      throw new Error('فشل في إنشاء رمز المصادقة');
    }
  }

  // Start a new task
  async startTask(tool: string): Promise<TaskResponse> {
    const token = await this.generateToken();
    
    const response = await fetch(`${this.credentials.apiUrl}/start/${tool}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      }
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`فشل في بدء المهمة: ${errorData.message || response.statusText}`);
    }

    const data = await response.json();
    return {
      server: data.server,
      task: data.task
    };
  }

  // Upload files to server
  async uploadFiles(server: string, task: string, files: File[], onProgress?: (progress: number) => void): Promise<void> {
    const token = await this.generateToken();
    
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);
      formData.append('task', task);

      const response = await fetch(`${server}/v1/upload`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`فشل في رفع الملف: ${file.name}`);
      }

      // Update progress
      if (onProgress) {
        onProgress(((i + 1) / files.length) * 100);
      }
    }
  }

  // Process files with tool settings
  async processFiles(server: string, task: string, toolSettings: Record<string, unknown> = {}): Promise<void> {
    const token = await this.generateToken();
    
    const response = await fetch(`${server}/v1/process`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        task,
        ...toolSettings
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(`فشل في معالجة الملفات: ${errorData.message || 'خطأ غير محدد'}`);
    }
  }

  // Download processed result
  async downloadResult(server: string, task: string): Promise<Blob> {
    const token = await this.generateToken();
    
    const response = await fetch(`${server}/v1/download/${task}`, {
      method: 'GET',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (!response.ok) {
      throw new Error('فشل في تحميل النتيجة');
    }

    return await response.blob();
  }

  // Complete workflow for processing files
  async processWorkflow(
    tool: string, 
    files: File[], 
    settings: Record<string, unknown> = {},
    onProgress?: (stage: string, progress: number) => void
  ): Promise<Blob> {
    // Step 1: Start task
    onProgress?.('بدء المهمة', 10);
    const { server, task } = await this.startTask(tool);

    // Step 2: Upload files
    onProgress?.('رفع الملفات', 30);
    await this.uploadFiles(server, task, files, (uploadProgress) => {
      onProgress?.('رفع الملفات', 30 + (uploadProgress * 0.4));
    });

    // Step 3: Process files
    onProgress?.('معالجة الملفات', 70);
    await this.processFiles(server, task, settings);

    // Step 4: Download result
    onProgress?.('تحميل النتيجة', 90);
    const result = await this.downloadResult(server, task);

    onProgress?.('مكتمل', 100);
    return result;
  }

  // Helper method to download blob as file
  downloadBlob(blob: Blob, filename: string) {
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }

  // Validate files for PDF to PowerPoint conversion
  validateFiles(files: File[]): { valid: boolean; message?: string } {
    // Check file count
    if (files.length > 1) {
      return { 
        valid: false, 
        message: 'الحد الأقصى للملفات هو 1' 
      };
    }

    // Check file types
    for (const file of files) {
      if (file.type !== 'application/pdf') {
        return { 
          valid: false, 
          message: 'نوع الملف غير مدعوم. يجب أن يكون ملف PDF' 
        };
      }
    }

    return { valid: true };
  }
}

// Create API instance
const ilovePDFAPI = new ILovePDFAPI();

const PDFToPowerPoint = () => {
  const [file, setFile] = useState<File | null>(null);
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState({ stage: '', percent: 0 });
  const [resultBlob, setResultBlob] = useState<Blob | null>(null);
  const { toast } = useToast();

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile && selectedFile.type === 'application/pdf') {
      // Check file size (max 50MB)
      if (selectedFile.size > 50 * 1024 * 1024) {
        toast({
          title: "الملف كبير جداً",
          description: "يجب أن يكون حجم الملف أقل من 50 ميجابايت",
          variant: "destructive",
        });
        return;
      }

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

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      // Directly handle the dropped file instead of simulating change event
      if (droppedFile.type === 'application/pdf') {
        // Check file size (max 50MB)
        if (droppedFile.size > 50 * 1024 * 1024) {
          toast({
            title: "الملف كبير جداً",
            description: "يجب أن يكون حجم الملف أقل من 50 ميجابايت",
            variant: "destructive",
          });
          return;
        }

        setFile(droppedFile);
        setResultBlob(null);
        setProgress({ stage: '', percent: 0 });
      } else {
        toast({
          title: "خطأ في الملف",
          description: "يرجى اختيار ملف PDF صحيح",
          variant: "destructive",
        });
      }
    }
  };

  const convertToPowerPoint = async () => {
    if (!file) {
      toast({
        title: "لا يوجد ملف",
        description: "يرجى اختيار ملف PDF أولاً",
        variant: "destructive",
      });
      return;
    }

    // Check if API credentials are configured
    if (!ilovePDFAPI.hasValidCredentials()) {
      toast({
        title: "خطأ في الإعدادات",
        description: "مفاتيح API غير مكونة بشكل صحيح. يرجى التحقق من ملف .env",
        variant: "destructive",
      });
      return;
    }

    setProcessing(true);
    setProgress({ stage: 'جاري البدء...', percent: 0 });

    try {
      // Validate file using the API utility
      const validation = ilovePDFAPI.validateFiles([file]);
      if (!validation.valid) {
        toast({
          title: "خطأ في الملف",
          description: validation.message || "الملف غير صالح",
          variant: "destructive",
        });
        return;
      }

      const result = await ilovePDFAPI.processWorkflow(
        'pdftopowerpoint',
        [file],
        {}, // No additional settings needed for basic conversion
        (stage: string, percent: number) => {
          setProgress({ stage, percent });
        }
      );

      setResultBlob(result);
      
      toast({
        title: "تم التحويل بنجاح!",
        description: "تم تحويل PDF إلى PowerPoint بنجاح",
      });
    } catch (error) {
      console.error('خطأ في التحويل:', error);
      toast({
        title: "خطأ في التحويل",
        description: error instanceof Error ? error.message : "فشل في تحويل ملف PDF إلى PowerPoint",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  const downloadResult = () => {
    if (resultBlob && file) {
      const filename = file.name.replace('.pdf', '.pptx');
      ilovePDFAPI.downloadBlob(resultBlob, filename);
    }
  };

  const removeFile = () => {
    setFile(null);
    setResultBlob(null);
    setProgress({ stage: '', percent: 0 });
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8" dir="rtl">
      <div className="text-center space-y-4">
        <div className="flex justify-center">
          <div className="w-20 h-20 bg-gradient-primary rounded-3xl flex items-center justify-center shadow-glow">
            <Presentation className="h-10 w-10 text-primary-foreground" />
          </div>
        </div>
        <h1 className="text-3xl font-bold gradient-text">تحويل PDF إلى PowerPoint</h1>
        <p className="text-lg text-muted-foreground">
          تحويل ملفات PDF إلى عروض PowerPoint قابلة للتحرير
        </p>
      </div>

      <Card className="glass backdrop-blur-md bg-gradient-card shadow-medium border border-border/20">
        <CardHeader>
          <CardTitle className="text-center">اختر ملف PDF</CardTitle>
          <CardDescription className="text-center">
            يدعم ملفات PDF فقط (الحد الأقصى: 50 ميجابايت)
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {!file ? (
            <div
              className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-12 text-center cursor-pointer hover:border-primary/50 transition-colors"
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => document.getElementById('file-input')?.click()}
            >
              <Upload className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-lg font-medium mb-2">اسحب وأفلت ملف PDF هنا</p>
              <p className="text-muted-foreground mb-4">أو انقر للاختيار من جهازك</p>
              <Button variant="outline">
                اختيار ملف
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-4 p-4 bg-muted/50 rounded-lg">
                <FileText className="h-8 w-8 text-primary" />
                <div className="flex-1">
                  <h3 className="font-medium">{file.name}</h3>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024 / 1024).toFixed(2)} ميجابايت - سيتم تحويله إلى PowerPoint
                  </p>
                </div>
                {!processing && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={removeFile}
                  >
                    إزالة
                  </Button>
                )}
              </div>

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
                  onClick={convertToPowerPoint} 
                  disabled={!file || processing}
                  className="bg-gradient-primary hover:shadow-glow text-primary-foreground transition-smooth font-medium disabled:opacity-50"
                  size="lg"
                >
                  {processing ? (
                    <>
                      <Loader2 className="ml-2 h-4 w-4 animate-spin" />
                      {progress.stage}
                    </>
                  ) : (
                    <>
                      <Presentation className="ml-2 h-4 w-4" />
                      تحويل إلى PowerPoint
                    </>
                  )}
                </Button>
                
                {resultBlob && !processing && (
                  <Button onClick={downloadResult} variant="outline" size="lg">
                    <Download className="ml-2 h-4 w-4" />
                    تحميل PowerPoint
                  </Button>
                )}
              </div>
            </div>
          )}

          <Input
            id="file-input"
            type="file"
            accept=".pdf"
            onChange={handleFileChange}
            className="hidden"
          />
        </CardContent>
      </Card>

      <Card className="bg-muted/30">
        <CardContent className="pt-6">
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">ملاحظات هامة:</h3>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>يتم تحويل النصوص والصور من PDF إلى شرائح PowerPoint</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>قد يختلف التخطيط قليلاً حسب تعقيد ملف PDF الأصلي</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>الحد الأقصى لحجم الملف هو 50 ميجابايت</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-primary">•</span>
                <span>التحويل يتم عبر خدمة iLovePDF الآمنة</span>
              </li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default PDFToPowerPoint;
