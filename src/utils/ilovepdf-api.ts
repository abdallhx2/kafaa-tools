/* eslint-disable no-useless-catch */
/* eslint-disable @typescript-eslint/no-explicit-any */
interface APICredentials {
  publicKey: string;
  secretKey: string;
  apiUrl: string;
}

interface TaskResponse {
  server: string;
  task: string;
}

interface ProcessingTask {
  id: string;
  tool: string;
  status: 'pending' | 'uploading' | 'processing' | 'completed' | 'failed';
  progress: number;
  files: File[];
  result?: string;
  error?: string;
}

class ILovePDFManager {
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

  // Set API credentials
  setCredentials(credentials: Partial<APICredentials>) {
    this.credentials = { ...this.credentials, ...credentials };
  }

  // Get stored credentials
  getCredentials() {
    return this.credentials;
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
  async processFiles(server: string, task: string, toolSettings: any = {}): Promise<void> {
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
    settings: any = {},
    onProgress?: (stage: string, progress: number) => void
  ): Promise<Blob> {
    try {
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

    } catch (error) {
      throw error;
    }
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

  // Validate file types for specific tools
  validateFiles(tool: string, files: File[]): { valid: boolean; message?: string } {
    const toolConfigs: Record<string, { accept: string[]; maxSize?: number; maxFiles?: number }> = {
      'pdftojpg': { accept: ['.pdf'], maxFiles: 1 },
      'pdftopng': { accept: ['.pdf'], maxFiles: 1 },
      'pdftoword': { accept: ['.pdf'], maxFiles: 1 },
      'pdftoexcel': { accept: ['.pdf'], maxFiles: 1 },
      'pdftopowerpoint': { accept: ['.pdf'], maxFiles: 1 },
      'pdftohtml': { accept: ['.pdf'], maxFiles: 1 },
      'pdftotext': { accept: ['.pdf'], maxFiles: 1 },
      'imagetopdf': { accept: ['.jpg', '.jpeg', '.png', '.gif', '.bmp', '.tiff'], maxFiles: 20 },
      'htmltopdf': { accept: ['.html', '.htm'], maxFiles: 1 },
      'officetopdf': { accept: ['.doc', '.docx', '.xls', '.xlsx', '.ppt', '.pptx'], maxFiles: 1 },
      'merge': { accept: ['.pdf'], maxFiles: 20 },
      'split': { accept: ['.pdf'], maxFiles: 1 },
      'compress': { accept: ['.pdf'], maxFiles: 1 },
      'unlock': { accept: ['.pdf'], maxFiles: 1 },
      'protect': { accept: ['.pdf'], maxFiles: 1 },
      'repair': { accept: ['.pdf'], maxFiles: 1 },
      'rotate': { accept: ['.pdf'], maxFiles: 1 },
      'removepages': { accept: ['.pdf'], maxFiles: 1 },
      'extractpages': { accept: ['.pdf'], maxFiles: 1 },
      'pagenumber': { accept: ['.pdf'], maxFiles: 1 },
      'watermark': { accept: ['.pdf'], maxFiles: 1 },
      'ocr': { accept: ['.pdf'], maxFiles: 1 },
      'validatepdfa': { accept: ['.pdf'], maxFiles: 1 },
      'fillforms': { accept: ['.pdf'], maxFiles: 1 },
      'sign': { accept: ['.pdf'], maxFiles: 1 },
      'signature': { accept: ['.pdf'], maxFiles: 1 },
      'pdftoa': { accept: ['.pdf'], maxFiles: 1 },
      'optimize': { accept: ['.pdf'], maxFiles: 1 },
      'crop': { accept: ['.pdf'], maxFiles: 1 }
    };

    const config = toolConfigs[tool];
    if (!config) {
      return { valid: true }; // Allow all files for unknown tools
    }

    // Check file count
    if (config.maxFiles && files.length > config.maxFiles) {
      return { 
        valid: false, 
        message: `الحد الأقصى للملفات هو ${config.maxFiles}` 
      };
    }

    // Check file types
    for (const file of files) {
      const extension = '.' + file.name.split('.').pop()?.toLowerCase();
      if (!config.accept.includes(extension)) {
        return { 
          valid: false, 
          message: `نوع الملف غير مدعوم. الأنواع المدعومة: ${config.accept.join(', ')}` 
        };
      }
    }

    return { valid: true };
  }
}

// Create singleton instance
export const ilovePDFManager = new ILovePDFManager();

// Export types
export type { APICredentials, TaskResponse, ProcessingTask };