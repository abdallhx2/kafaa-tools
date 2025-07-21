import { Star } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';

interface ToolCard {
  id: string;
  title: string;
  description: string;
  icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  category: string;
  popular?: boolean;
}

interface HomePageProps {
  searchQuery: string;
  filteredTools: ToolCard[];
  allTools: ToolCard[];
  categories: Record<string, { title: string; color: string }>;
}

const HomePage = ({ searchQuery, filteredTools, allTools, categories }: HomePageProps) => {
  return (
    <div className="min-h-screen rtl" dir="rtl">
      <div className="max-w-8xl mx-auto px-4 ">

        {/* نتائج البحث */}
        {searchQuery && (
          <Card className="border-2 border-dashed border-blue-200 bg-blue-50/30">
            <CardHeader className="pb-4">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">نتائج البحث</CardTitle>
                  <CardDescription>
                    {filteredTools.length > 0 
                      ? `تم العثور على ${filteredTools.length} أداة تطابق بحثك`
                      : 'لم يتم العثور على نتائج مطابقة'
                    }
                  </CardDescription>
                </div>
                <Badge variant="secondary">{filteredTools.length} نتيجة</Badge>
              </div>
            </CardHeader>
            {filteredTools.length > 0 && (
              <CardContent className="pt-0">
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                  {filteredTools.map((tool) => (
                    <Link key={tool.id} to={`/${tool.id}`}>
                      <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-gray-200 bg-white h-full">
                        {tool.popular && (
                          <div className="absolute top-1 left-1 z-10">
                            <Star className="h-3 w-3 text-yellow-500 fill-current" />
                          </div>
                        )}
                        <CardContent className="p-3">
                          <div className="flex flex-col items-center text-center space-y-2">
                            <div className={`p-1.5 rounded-lg ${categories[tool.category as keyof typeof categories].color}/10`}>
                              <tool.icon className={`h-4 w-4 ${categories[tool.category as keyof typeof categories].color.replace('bg-', 'text-')}`} />
                            </div>
                            <h3 className="text-xs font-medium leading-tight">{tool.title}</h3>
                            <Button size="sm" variant="outline" className="w-full text-xs py-1 h-6">
                              استخدم
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </CardContent>
            )}
          </Card>
        )}

        {/* عرض جميع الأدوات */}
        {!searchQuery && (
          <div className="space-y-6">
            <div className="text-center">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">جميع الأدوات</h2>
              <p className="text-gray-600 mb-8">
                {allTools.length} أداة متاحة
              </p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-4">
              {allTools.map((tool) => (
                <Link key={tool.id} to={`/${tool.id}`}>
                  <Card className="group hover:shadow-md transition-all duration-200 hover:-translate-y-0.5 border border-gray-200 bg-white h-full">
                    {tool.popular && (
                      <div className="absolute top-2 left-2 z-10">
                        <Star className="h-3 w-3 text-yellow-500 fill-current" />
                      </div>
                    )}
                    <CardContent className="p-3">
                      <div className="flex flex-col items-center text-center space-y-2">
                        <div className={`p-2 rounded-lg ${categories[tool.category as keyof typeof categories]?.color || 'bg-gray-500'}/10 group-hover:scale-105 transition-transform`}>
                          <tool.icon className={`h-5 w-5 ${categories[tool.category as keyof typeof categories]?.color?.replace('bg-', 'text-') || 'text-gray-500'}`} />
                        </div>
                        <h3 className="text-sm font-medium leading-tight">{tool.title}</h3>
                        <p className="text-xs text-gray-600 line-clamp-2">{tool.description}</p>
                        <Button size="sm" variant="outline" className="w-full text-xs">
                          استخدمها الآن
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

export default HomePage;
