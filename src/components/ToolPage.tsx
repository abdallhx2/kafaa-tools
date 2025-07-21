import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface ToolPageProps {
  children: React.ReactNode;
  title?: string;
}

const ToolPage = ({ children, title }: ToolPageProps) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen bg-gradient-background" dir="rtl">
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={handleBack}
            className="mb-4 transition-smooth hover:bg-primary/10"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            العودة إلى الأدوات
          </Button>
        </div>
        
        <main>
          {children}
        </main>
      </div>
    </div>
  );
};

export default ToolPage;