import { Search, X, Star } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Link } from 'react-router-dom';

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category: string;
  popular?: boolean;
}

interface HeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  categories: Record<string, { title: string; color: string }>;
  featuredTools: ToolCard[];
}

const Header = ({ searchQuery, onSearchChange, categories, featuredTools }: HeaderProps) => {
  const clearSearch = () => {
    onSearchChange('');
  };

  return (
    <div className="relative">
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-primary/5 rounded-3xl -z-10"></div>
      <div className="text-center space-y-8 py-20 px-6">
        <div className="flex justify-center mb-8">
              <img src="/logo.png" alt="Logo" className="h-30 w-32" />
        </div>
        <h1 className="text-4xl md:text-6xl lg:text-5xl font-bold text-black">
          كفاءة
        </h1>
        <p className="text-base md:text-lg text-muted-foreground/80 max-w-3xl mx-auto leading-relaxed">
          مجموعة شاملة من الأدوات المجانية المصممة خصيصاً لتسهيل مهامك اليومية وزيادة إنتاجيتك
        </p>
        
        {/* Search Bar */}
        <div className="max-w-2xl mx-auto relative mt-8">
          <div className="relative">
            <Search className="absolute right-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="ابحث عن الأدوات بالاسم أو الوصف..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full pr-12 pl-10 py-4 text-lg rounded-2xl border-2 border-border/50 focus:border-primary/50 bg-white/80 backdrop-blur-sm shadow-lg"
            />
            {searchQuery && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearSearch}
                className="absolute left-2 top-1/2 transform -translate-y-1/2 h-8 w-8 p-0 hover:bg-muted rounded-full"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>

        {/* قائمة الأدوات المميزة */}
        {!searchQuery && featuredTools.length > 0 && (
          <div className="max-w-6xl mx-auto mt-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
              <h2 className="text-xl font-semibold text-gray-800">الأدوات المميزة</h2>
              <Star className="h-5 w-5 text-yellow-500 fill-current" />
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {featuredTools.slice(0, ).map((tool) => (
                <Link key={tool.id} to={`/${tool.id}`}>
                  <Card className="group hover:shadow-lg transition-all duration-300 hover:-translate-y-1 border-2 border-transparent hover:border-yellow-200 bg-gradient-to-br from-yellow-50/80 to-orange-50/60 backdrop-blur-sm h-full">
                    <CardContent className="p-4">
                      <div className="flex flex-col items-center text-center space-y-3">
                        <div className="relative">
                          <div className={`p-3 rounded-xl ${categories[tool.category]?.color || 'bg-gray-500'}/20 group-hover:scale-110 transition-transform`}>
                            <tool.icon className={`h-6 w-6 ${categories[tool.category]?.color?.replace('bg-', 'text-') || 'text-gray-500'}`} />
                          </div>
                          <div className="absolute -top-1 -right-1">
                            <Star className="h-4 w-4 text-yellow-500 fill-current" />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <h3 className="text-sm font-semibold leading-tight text-gray-800">{tool.title}</h3>
                          <p className="text-xs text-gray-600 line-clamp-2">{tool.description}</p>
                        </div>
                        <Button size="sm" className="w-full text-xs bg-gradient-to-r from-yellow-500 to-orange-500 hover:from-yellow-600 hover:to-orange-600 text-white">
                          استخدم الآن
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>
          </div>
        )}
      
      </div>
    </div>
  );
};

export default Header;
