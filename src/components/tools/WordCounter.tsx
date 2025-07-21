import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, FileText, Copy } from 'lucide-react';
import { toast } from '@/hooks/use-toast';


interface Stats {
  characters: number;
  charactersNoSpaces: number;
  words: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTime: number;
  speakingTime: number;
}

const WordCounter = () => {
  const [text, setText] = useState('');
  const [stats, setStats] = useState<Stats>({
    characters: 0,
    charactersNoSpaces: 0,
    words: 0,
    sentences: 0,
    paragraphs: 0,
    lines: 0,
    readingTime: 0,
    speakingTime: 0
  });

  const analyzeText = (inputText: string): Stats => {
    if (!inputText.trim()) {
      return {
        characters: 0,
        charactersNoSpaces: 0,
        words: 0,
        sentences: 0,
        paragraphs: 0,
        lines: 0,
        readingTime: 0,
        speakingTime: 0
      };
    }

    const characters = inputText.length;
    const charactersNoSpaces = inputText.replace(/\s/g, '').length;
    
    // عدد الكلمات
    const words = inputText.trim() === '' ? 0 : inputText.trim().split(/\s+/).filter(word => word.length > 0).length;
    
    // عدد الجمل
    const sentences = inputText.split(/[.!?]+/).filter(sentence => sentence.trim().length > 0).length;
    
    // عدد الفقرات
    const paragraphs = inputText.split(/\n\s*\n/).filter(paragraph => paragraph.trim().length > 0).length;
    
    // عدد الأسطر
    const lines = inputText.split('\n').length;
    
    // وقت القراءة (250 كلمة في الدقيقة)
    const readingTime = Math.ceil(words / 250);
    
    // وقت التحدث (150 كلمة في الدقيقة)
    const speakingTime = Math.ceil(words / 150);

    return {
      characters,
      charactersNoSpaces,
      words,
      sentences,
      paragraphs,
      lines,
      readingTime,
      speakingTime
    };
  };

  useEffect(() => {
    setStats(analyzeText(text));
  }, [text]);

  const handleClear = () => {
    setText('');
    toast({
      title: "تم مسح النص",
      description: "تم مسح النص وإعادة تعيين الإحصائيات"
    });
  };

  const handleCopyStats = () => {
    const statsText = `
إحصائيات النص:
• الأحرف: ${stats.characters.toLocaleString()}
• الأحرف بدون مسافات: ${stats.charactersNoSpaces.toLocaleString()}
• الكلمات: ${stats.words.toLocaleString()}
• الجمل: ${stats.sentences.toLocaleString()}
• الفقرات: ${stats.paragraphs.toLocaleString()}
• الأسطر: ${stats.lines.toLocaleString()}
• وقت القراءة: ${stats.readingTime} دقيقة
• وقت التحدث: ${stats.speakingTime} دقيقة
    `.trim();

    navigator.clipboard.writeText(statsText);
    toast({
      title: "تم النسخ",
      description: "تم نسخ إحصائيات النص للحافظة"
    });
  };

  const handlePasteFromClipboard = async () => {
    try {
      const clipboardText = await navigator.clipboard.readText();
      setText(clipboardText);
      toast({
        title: "تم اللصق",
        description: "تم لصق النص من الحافظة"
      });
    } catch (error) {
      toast({
        title: "خطأ في اللصق",
        description: "لا يمكن الوصول للحافظة",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Button 
        variant="ghost" 
        className="mb-6 hover:bg-accent"
      >
        <ArrowLeft className="h-4 w-4 mr-2" />
        العودة للأدوات
      </Button>

      <Card className="glass">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
            <FileText className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl gradient-text">عداد الكلمات والأحرف</CardTitle>
          <CardDescription>
            إحصائيات تفصيلية شاملة للنص مع أوقات القراءة والتحدث
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* إحصائيات سريعة */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card className="bg-gradient-card border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.characters.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">أحرف</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.words.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">كلمات</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.sentences.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">جمل</div>
              </CardContent>
            </Card>
            <Card className="bg-gradient-card border-primary/20">
              <CardContent className="p-4 text-center">
                <div className="text-2xl font-bold text-primary">{stats.paragraphs.toLocaleString()}</div>
                <div className="text-sm text-muted-foreground">فقرات</div>
              </CardContent>
            </Card>
          </div>

          {/* منطقة النص */}
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button onClick={handlePasteFromClipboard} variant="outline" size="sm">
                لصق من الحافظة
              </Button>
              <Button onClick={handleClear} variant="outline" size="sm">
                مسح النص
              </Button>
              <Button onClick={handleCopyStats} variant="outline" size="sm">
                <Copy className="h-4 w-4 mr-2" />
                نسخ الإحصائيات
              </Button>
            </div>
            
            <Textarea
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="ابدأ بكتابة النص هنا أو الصق النص المراد تحليله..."
              className="min-h-[300px] resize-none transition-smooth"
              dir="auto"
            />
            
            <div className="text-xs text-muted-foreground text-right">
              {stats.characters.toLocaleString()} حرف • {stats.words.toLocaleString()} كلمة
            </div>
          </div>

          {/* إحصائيات تفصيلية */}
          {text.trim() && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="bg-gradient-subtle border-secondary/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">إحصائيات النص</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">إجمالي الأحرف:</span>
                    <span className="font-semibold">{stats.characters.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الأحرف بدون مسافات:</span>
                    <span className="font-semibold">{stats.charactersNoSpaces.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الكلمات:</span>
                    <span className="font-semibold">{stats.words.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الجمل:</span>
                    <span className="font-semibold">{stats.sentences.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الفقرات:</span>
                    <span className="font-semibold">{stats.paragraphs.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">الأسطر:</span>
                    <span className="font-semibold">{stats.lines.toLocaleString()}</span>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-subtle border-secondary/30">
                <CardHeader className="pb-4">
                  <CardTitle className="text-lg">أوقات القراءة والتحدث</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="text-center p-4 bg-primary/10 rounded-lg">
                    <div className="text-2xl font-bold text-primary">{stats.readingTime}</div>
                    <div className="text-sm text-muted-foreground">دقيقة للقراءة</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      (250 كلمة في الدقيقة)
                    </div>
                  </div>
                  <div className="text-center p-4 bg-secondary/10 rounded-lg">
                    <div className="text-2xl font-bold text-secondary">{stats.speakingTime}</div>
                    <div className="text-sm text-muted-foreground">دقيقة للتحدث</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      (150 كلمة في الدقيقة)
                    </div>
                  </div>
                  
                  {stats.words > 0 && (
                    <div className="pt-4 border-t border-border/50">
                      <div className="text-sm space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">متوسط الكلمات/الجملة:</span>
                          <span>{(stats.words / Math.max(stats.sentences, 1)).toFixed(1)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">متوسط الأحرف/الكلمة:</span>
                          <span>{(stats.charactersNoSpaces / Math.max(stats.words, 1)).toFixed(1)}</span>
                        </div>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default WordCounter;