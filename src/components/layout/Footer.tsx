import { Zap, Mail, Globe, Github, Linkedin, Twitter } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t bg-gradient-to-br from-background/80 to-muted/20 backdrop-blur-sm mt-20">
      <div className="container mx-auto px-4 py-16">
        <div className="grid md:grid-cols-3 gap-12">
          
          {/* الشعار والوصف */}
          <div className="space-y-6">
            <div className="flex items-center gap-3">
                <img src="/logo.png" alt="كفاءة شعار" className="h-12 w-12 rounded-xl shadow-lg bg-white object-contain p-2" />
              <h3 className="text-2xl font-bold text-black ">كفاءة</h3>
            </div>
            <p className="text-muted-foreground leading-relaxed">
              مجموعة شاملة من الأدوات المجانية المصممة لتسهيل مهامك اليومية وزيادة إنتاجيتك. 
              تم تطوير هذا الموقع باستخدام أحدث التقنيات لضمان أفضل تجربة مستخدم.
            </p>
          </div>

          {/* معلومات المطور */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">المطور</h4>
            <p className="text-lg font-semibold ">عبدالله الحسني</p>
            <div className="space-y-4">
              <div className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Mail className="h-4 w-4" />
                <a href="mailto:3bdallhx2@gmail.com" className="hover:underline">
                  3bdallhx2@gmail.com
                </a>
              </div>
              <div className="flex items-center gap-3 text-muted-foreground hover:text-primary transition-colors">
                <Globe className="h-4 w-4" />
                <a href="https://an1.space" target="_blank" rel="noopener noreferrer" className="hover:underline">
                  https://an1.space
                </a>
              </div>
            </div>
          </div>

          {/* روابط التواصل */}
          <div className="space-y-6">
            <h4 className="text-lg font-semibold text-foreground">تواصل معي</h4>
            <div className="flex gap-4">
              <a href="https://github.com/yourusername" target="_blank" rel="noopener noreferrer" 
                 className="p-3 bg-muted hover:bg-primary hover:text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                <Github className="h-5 w-5" />
              </a>
              <a href="https://linkedin.com/in/yourusername" target="_blank" rel="noopener noreferrer"
                 className="p-3 bg-muted hover:bg-primary hover:text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                <Linkedin className="h-5 w-5" />
              </a>
              <a href="https://twitter.com/yourusername" target="_blank" rel="noopener noreferrer"
                 className="p-3 bg-muted hover:bg-primary hover:text-white rounded-lg transition-all duration-300 hover:shadow-lg hover:scale-105">
                <Twitter className="h-5 w-5" />
              </a>
            </div>
          </div>
        </div>

        {/* خط الفصل وحقوق النشر */}
        <div className="mt-12 pt-8 border-t border-border/50">
          <div className="text-center">
            <p className="text-muted-foreground text-sm">
              جميع الحقوق محفوظة © 2025
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
