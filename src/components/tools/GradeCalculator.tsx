import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ArrowLeft, GraduationCap, Plus, Trash2 } from 'lucide-react';
import { toast } from '@/hooks/use-toast';


interface Subject {
  id: string;
  name: string;
  grade: string;
  credit: string;
  points: number;
}

interface GPAResult {
  gpa: number;
  totalCredits: number;
  totalPoints: number;
  letterGrade: string;
  percentage: number;
  classification: string;
}

const GradeCalculator = () => {
  const [subjects, setSubjects] = useState<Subject[]>([
    { id: '1', name: '', grade: '', credit: '', points: 0 }
  ]);
  const [gradingSystem, setGradingSystem] = useState('4.0'); // 4.0, 5.0, percentage
  const [result, setResult] = useState<GPAResult | null>(null);

  // أنظمة الدرجات المختلفة
  type GradingSystem = { [key: string]: number };
  
  const gradingSystems: {
    '4.0': GradingSystem;
    '5.0': GradingSystem;
    percentage: GradingSystem;
  } = {
    '4.0': {
      'A+': 4.0, 'A': 4.0, 'A-': 3.7,
      'B+': 3.3, 'B': 3.0, 'B-': 2.7,
      'C+': 2.3, 'C': 2.0, 'C-': 1.7,
      'D+': 1.3, 'D': 1.0, 'F': 0.0
    },
    '5.0': {
      'A+': 5.0, 'A': 4.75, 'A-': 4.5,
      'B+': 4.25, 'B': 4.0, 'B-': 3.75,
      'C+': 3.5, 'C': 3.25, 'C-': 3.0,
      'D+': 2.75, 'D': 2.5, 'F': 0.0
    },
    percentage: {
      '95-100': 4.0, '90-94': 3.7, '85-89': 3.3,
      '80-84': 3.0, '75-79': 2.7, '70-74': 2.3,
      '65-69': 2.0, '60-64': 1.7, '55-59': 1.3,
      '50-54': 1.0, 'أقل من 50': 0.0
    }
  };

  const addSubject = () => {
    setSubjects([...subjects, {
      id: Date.now().toString(),
      name: '',
      grade: '',
      credit: '',
      points: 0
    }]);
  };

  const removeSubject = (id: string) => {
    if (subjects.length > 1) {
      setSubjects(subjects.filter(subject => subject.id !== id));
    }
  };

  const updateSubject = (id: string, field: keyof Subject, value: string) => {
    setSubjects(subjects.map(subject => {
      if (subject.id === id) {
        const updated = { ...subject, [field]: value };
        
        // حساب النقاط عند تحديث الدرجة أو الساعات
        if (field === 'grade' || field === 'credit') {
          const gradePoints = (gradingSystems[gradingSystem as keyof typeof gradingSystems] as Record<string, number>)[updated.grade] || 0;
          const creditValue = parseFloat(updated.credit) || 0;
          updated.points = gradePoints * creditValue;
        }
        
        return updated;
      }
      return subject;
    }));
  };

  const calculateGPA = () => {
    const validSubjects = subjects.filter(s => s.name && s.grade && s.credit);
    
    if (validSubjects.length === 0) {
      toast({
        title: "خطأ",
        description: "يرجى إدخال بيانات مادة واحدة على الأقل",
        variant: "destructive"
      });
      return;
    }

    let totalCredits = 0;
    let totalPoints = 0;

    validSubjects.forEach(subject => {
      const creditValue = parseFloat(subject.credit);
      const gradePoints = gradingSystems[gradingSystem as keyof typeof gradingSystems][subject.grade] || 0;
      
      totalCredits += creditValue;
      totalPoints += gradePoints * creditValue;
    });

    const gpa = totalCredits > 0 ? totalPoints / totalCredits : 0;
    
    // تحديد التقدير والنسبة المئوية
    let letterGrade = '';
    let percentage = 0;
    let classification = '';

    if (gradingSystem === '4.0') {
      if (gpa >= 3.7) {
        letterGrade = 'A';
        percentage = 90 + (gpa - 3.7) * 33.33;
        classification = 'ممتاز';
      } else if (gpa >= 3.3) {
        letterGrade = 'B+';
        percentage = 85 + (gpa - 3.3) * 12.5;
        classification = 'جيد جداً مرتفع';
      } else if (gpa >= 3.0) {
        letterGrade = 'B';
        percentage = 80 + (gpa - 3.0) * 16.67;
        classification = 'جيد جداً';
      } else if (gpa >= 2.7) {
        letterGrade = 'B-';
        percentage = 75 + (gpa - 2.7) * 16.67;
        classification = 'جيد مرتفع';
      } else if (gpa >= 2.3) {
        letterGrade = 'C+';
        percentage = 70 + (gpa - 2.3) * 12.5;
        classification = 'جيد';
      } else if (gpa >= 2.0) {
        letterGrade = 'C';
        percentage = 65 + (gpa - 2.0) * 16.67;
        classification = 'مقبول مرتفع';
      } else if (gpa >= 1.0) {
        letterGrade = 'D';
        percentage = 50 + (gpa - 1.0) * 15;
        classification = 'مقبول';
      } else {
        letterGrade = 'F';
        percentage = gpa * 50;
        classification = 'راسب';
      }
    }

    setResult({
      gpa: Math.round(gpa * 100) / 100,
      totalCredits,
      totalPoints: Math.round(totalPoints * 100) / 100,
      letterGrade,
      percentage: Math.round(percentage * 100) / 100,
      classification
    });

    toast({
      title: "تم حساب المعدل",
      description: `المعدل التراكمي: ${(Math.round(gpa * 100) / 100)} - ${classification}`
    });
  };

  const resetCalculator = () => {
    setSubjects([{ id: '1', name: '', grade: '', credit: '', points: 0 }]);
    setResult(null);
    toast({
      title: "تم إعادة التعيين",
      description: "تم مسح جميع البيانات"
    });
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <Card className="glass">
        <CardHeader className="text-center">
          <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-2xl flex items-center justify-center">
            <GraduationCap className="h-8 w-8 text-primary" />
          </div>
          <CardTitle className="text-3xl gradient-text">حاسبة الدرجات والمعدل</CardTitle>
          <CardDescription>
            حساب المعدل التراكمي (GPA) والفصلي مع أنظمة تقدير مختلفة
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* نظام التقدير */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="gradingSystem">نظام التقدير</Label>
              <Select value={gradingSystem} onValueChange={setGradingSystem}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="4.0">نظام 4.0</SelectItem>
                  <SelectItem value="5.0">نظام 5.0</SelectItem>
                  <SelectItem value="percentage">نظام النسبة المئوية</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={addSubject} variant="outline" className="w-full">
                <Plus className="h-4 w-4 mr-2" />
                إضافة مادة
              </Button>
            </div>
            <div className="space-y-2">
              <Label>&nbsp;</Label>
              <Button onClick={resetCalculator} variant="outline" className="w-full">
                <Trash2 className="h-4 w-4 mr-2" />
                إعادة تعيين
              </Button>
            </div>
          </div>

          {/* جدول المواد */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">المواد الدراسية</h3>
            
            {subjects.map((subject, index) => (
              <Card key={subject.id} className="bg-gradient-card border-border/50">
                <CardContent className="p-4">
                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
                    <div className="space-y-2">
                      <Label>اسم المادة</Label>
                      <Input
                        value={subject.name}
                        onChange={(e) => updateSubject(subject.id, 'name', e.target.value)}
                        placeholder="مثال: الرياضيات"
                        className="transition-smooth"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>الدرجة</Label>
                      <Select
                        value={subject.grade}
                        onValueChange={(value) => updateSubject(subject.id, 'grade', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="اختر الدرجة" />
                        </SelectTrigger>
                        <SelectContent>
                          {Object.keys(gradingSystems[gradingSystem as keyof typeof gradingSystems]).map(grade => (
                            <SelectItem key={grade} value={grade}>
                              {grade}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>الساعات المعتمدة</Label>
                      <Input
                        type="number"
                        value={subject.credit}
                        onChange={(e) => updateSubject(subject.id, 'credit', e.target.value)}
                        placeholder="3"
                        min="0"
                        step="0.5"
                        className="transition-smooth"
                      />
                    </div>
                    
                    <div className="space-y-2">
                      <Label>النقاط</Label>
                      <div className="h-10 px-3 py-2 bg-muted rounded-md flex items-center">
                        <span className="font-mono text-sm">
                          {subject.points ? subject.points.toFixed(2) : '0.00'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <Label>&nbsp;</Label>
                      <Button
                        onClick={() => removeSubject(subject.id)}
                        variant="outline"
                        size="icon"
                        disabled={subjects.length === 1}
                        className="h-10 w-10"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Button onClick={calculateGPA} className="w-full">
            <GraduationCap className="h-4 w-4 mr-2" />
            حساب المعدل التراكمي
          </Button>

          {result && (
            <div className="mt-8 space-y-6">
              {/* النتيجة الرئيسية */}
              <Card className="bg-gradient-card border-primary/20">
                <CardContent className="p-6 text-center">
                  <div className="text-6xl font-bold text-primary mb-2">
                    {result.gpa}
                  </div>
                  <div className="text-xl font-semibold text-secondary mb-2">
                    {result.classification}
                  </div>
                  <div className="text-lg text-muted-foreground">
                    {result.letterGrade} ({result.percentage}%)
                  </div>
                </CardContent>
              </Card>

              {/* تفاصيل الحساب */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-gradient-subtle border-secondary/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-secondary">{result.totalCredits}</div>
                    <div className="text-sm text-muted-foreground">إجمالي الساعات</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-subtle border-secondary/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-secondary">{result.totalPoints}</div>
                    <div className="text-sm text-muted-foreground">إجمالي النقاط</div>
                  </CardContent>
                </Card>
                <Card className="bg-gradient-subtle border-secondary/30">
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-secondary">{result.percentage}%</div>
                    <div className="text-sm text-muted-foreground">النسبة المئوية</div>
                  </CardContent>
                </Card>
              </div>

              {/* تفاصيل المواد */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">تفاصيل المواد</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {subjects.filter(s => s.name && s.grade && s.credit).map((subject, index) => (
                      <div key={subject.id} className="flex justify-between items-center p-3 bg-background rounded-lg">
                        <div className="flex-1">
                          <span className="font-medium">{subject.name}</span>
                          <span className="ml-2 text-sm text-muted-foreground">
                            ({subject.credit} ساعة)
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="font-semibold">{subject.grade}</span>
                          <div className="text-sm text-muted-foreground">
                            {subject.points.toFixed(2)} نقطة
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* مقياس التقديرات */}
              <Card className="bg-muted/50">
                <CardHeader>
                  <CardTitle className="text-lg">مقياس التقديرات - نظام {gradingSystem}</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {Object.entries(gradingSystems[gradingSystem as keyof typeof gradingSystems]).map(([grade, points]) => (
                      <div key={grade} className="flex justify-between p-2 bg-background rounded text-sm">
                        <span>{grade}</span>
                        <span className="font-mono">{points}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <div className="text-center text-sm text-muted-foreground bg-blue-50 p-4 rounded-lg">
                <strong>ملاحظة:</strong> هذه الحاسبة تستخدم أنظمة التقدير الشائعة. 
                قد تختلف أنظمة التقدير بين الجامعات والمؤسسات التعليمية المختلفة.
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default GradeCalculator;