import { BrowserRouter, Routes, Route } from "react-router-dom";
import Services from "./pages/Services";
import NotFound from "./pages/NotFound";
import SEO from "./components/SEO";
import { toolsMetadata, defaultMetadata } from "./utils/seo-metadata";

// Import layout components
import Layout from './components/layout/Layout';
import { Button } from './components/ui/button';
import { ArrowRight } from 'lucide-react';

// Import all tool components
import OCRTool from './components/tools/OCRTool';
import PowerPointToPDF from './components/tools/PowerPointToPDF';
import PDFToWord from './components/tools/PDFToWord';
import ImageCompressor from './components/tools/ImageCompressor';
import BackgroundRemover from './components/tools/BackgroundRemover';
import QRGenerator from './components/tools/QRGenerator';
import QRReader from './components/tools/QRReader';
import PasswordGenerator from './components/tools/PasswordGenerator';
import UnitConverter from './components/tools/UnitConverter';
import ColorGenerator from './components/tools/ColorGenerator';
import CurrencyConverter from './components/tools/CurrencyConverter';
import PDFSplitter from './components/tools/PDFSplitter';
import AgeCalculator from './components/tools/AgeCalculator';
import DateConverter from './components/tools/DateConverter';
import DistanceCalculator from './components/tools/DistanceCalculator';
import ColorPicker from './components/tools/ColorPicker';
import WordCounter from './components/tools/WordCounter';
import BMICalculator from './components/tools/BMICalculator';
import GradeCalculator from './components/tools/GradeCalculator';
import LinkHealthChecker from './components/tools/LinkHealthChecker';
import EncodingConverter from './components/tools/EncodingConverter';
import AdvancedURLShortener from './components/tools/AdvancedURLShortener';
import FontGenerator from './components/tools/FontGenerator';
import JSONEditor from './components/tools/JSONEditor';
import SpeedTest from './components/tools/SpeedTest';

// Import new iLovePDF tools
import PDFToPNG from './components/tools/PDFToPNG';
import PDFToExcel from './components/tools/PDFToExcel';
import PDFToPowerPoint from './components/tools/PDFToPowerPoint';
import PDFUnlocker from './components/tools/PDFUnlocker';
import PDFProtector from './components/tools/PDFProtector';
import PDFRotator from './components/tools/PDFRotator';
import HTMLToPDF from './components/tools/HTMLToPDF';
import PDFToHTML from './components/tools/PDFToHTML';
import PDFToText from './components/tools/PDFToText';
import PDFWatermark from './components/tools/PDFWatermark';

// Tool wrapper component for consistent layout and SEO
const ToolWrapper = ({ children, toolId }: { children: React.ReactNode; toolId: string }) => {
  const metadata = toolsMetadata[toolId] || defaultMetadata;
  
  return (
    <>
      <SEO 
        title={metadata.title}
        description={metadata.description}
        keywords={metadata.keywords}
        url={`/${toolId}`}
        toolId={toolId}
      />
      <Layout>
        <div className="mb-8">
          <Button
            variant="outline"
            onClick={() => window.location.href = '/'}
            className="mb-4 transition-smooth hover:bg-primary/10"
          >
            <ArrowRight className="ml-2 h-4 w-4" />
            العودة إلى الأدوات
          </Button>
        </div>
        <main>{children}</main>
      </Layout>
    </>
  );
};

// Home page wrapper with SEO
const HomeWrapper = () => (
  <>
    <SEO 
      title={defaultMetadata.title}
      description={defaultMetadata.description}
      keywords={defaultMetadata.keywords}
      url="/"
    />
    <Services />
  </>
);

const App = () => (
  <BrowserRouter>
    <Routes>
      {/* Home page */}
      <Route path="/" element={<HomeWrapper />} />
      
      {/* Document tools */}
      <Route path="/ocr" element={<ToolWrapper toolId="ocr"><OCRTool onBack={() => window.location.href = '/'} /></ToolWrapper>} />
      <Route path="/powerpoint-to-pdf" element={<ToolWrapper toolId="powerpoint-to-pdf"><PowerPointToPDF /></ToolWrapper>} />
      <Route path="/pdf-to-word" element={<ToolWrapper toolId="pdf-to-word"><PDFToWord /></ToolWrapper>} />
      <Route path="/pdf-splitter" element={<ToolWrapper toolId="pdf-splitter"><PDFSplitter /></ToolWrapper>} />
      
      {/* New iLovePDF tools */}
      <Route path="/pdf-to-png" element={<ToolWrapper toolId="pdf-to-png"><PDFToPNG /></ToolWrapper>} />
      <Route path="/pdf-to-excel" element={<ToolWrapper toolId="pdf-to-excel"><PDFToExcel /></ToolWrapper>} />
      <Route path="/pdf-to-powerpoint" element={<ToolWrapper toolId="pdf-to-powerpoint"><PDFToPowerPoint /></ToolWrapper>} />
      <Route path="/pdf-unlocker" element={<ToolWrapper toolId="pdf-unlocker"><PDFUnlocker /></ToolWrapper>} />
      <Route path="/pdf-protector" element={<ToolWrapper toolId="pdf-protector"><PDFProtector /></ToolWrapper>} />
      <Route path="/pdf-rotator" element={<ToolWrapper toolId="pdf-rotator"><PDFRotator /></ToolWrapper>} />
      <Route path="/html-to-pdf" element={<ToolWrapper toolId="html-to-pdf"><HTMLToPDF /></ToolWrapper>} />
      <Route path="/pdf-to-html" element={<ToolWrapper toolId="pdf-to-html"><PDFToHTML /></ToolWrapper>} />
      <Route path="/pdf-to-text" element={<ToolWrapper toolId="pdf-to-text"><PDFToText /></ToolWrapper>} />
      <Route path="/pdf-watermark" element={<ToolWrapper toolId="pdf-watermark"><PDFWatermark /></ToolWrapper>} />
      
      {/* Image tools */}
      <Route path="/image-compressor" element={<ToolWrapper toolId="image-compressor"><ImageCompressor /></ToolWrapper>} />
      <Route path="/background-remover" element={<ToolWrapper toolId="background-remover"><BackgroundRemover /></ToolWrapper>} />
      <Route path="/color-picker" element={<ToolWrapper toolId="color-picker"><ColorPicker onBack={() => window.location.href = '/'} /></ToolWrapper>} />
      <Route path="/color-generator" element={<ToolWrapper toolId="color-generator"><ColorGenerator /></ToolWrapper>} />
      
      {/* Calculator tools */}
      <Route path="/age-calculator" element={<ToolWrapper toolId="age-calculator"><AgeCalculator/></ToolWrapper>} />
      <Route path="/date-converter" element={<ToolWrapper toolId="date-converter"><DateConverter /></ToolWrapper>} />
      <Route path="/distance-calculator" element={<ToolWrapper toolId="distance-calculator"><DistanceCalculator /></ToolWrapper>} />
      <Route path="/bmi-calculator" element={<ToolWrapper toolId="bmi-calculator"><BMICalculator /></ToolWrapper>} />
      <Route path="/grade-calculator" element={<ToolWrapper toolId="grade-calculator"><GradeCalculator/></ToolWrapper>} />
      
      {/* Utility tools */}
      <Route path="/qr-generator" element={<ToolWrapper toolId="qr-generator"><QRGenerator /></ToolWrapper>} />
      <Route path="/qr-reader" element={<ToolWrapper toolId="qr-reader"><QRReader /></ToolWrapper>} />
      <Route path="/password-generator" element={<ToolWrapper toolId="password-generator"><PasswordGenerator /></ToolWrapper>} />
      <Route path="/unit-converter" element={<ToolWrapper toolId="unit-converter"><UnitConverter /></ToolWrapper>} />
      <Route path="/currency-converter" element={<ToolWrapper toolId="currency-converter"><CurrencyConverter /></ToolWrapper>} />
      <Route path="/word-counter" element={<ToolWrapper toolId="word-counter"><WordCounter /></ToolWrapper>} />
      <Route path="/link-health-checker" element={<ToolWrapper toolId="link-health-checker"><LinkHealthChecker /></ToolWrapper>} />
      <Route path="/encoding-converter" element={<ToolWrapper toolId="encoding-converter"><EncodingConverter /></ToolWrapper>} />
      <Route path="/advanced-url-shortener" element={<ToolWrapper toolId="advanced-url-shortener"><AdvancedURLShortener /></ToolWrapper>} />
      <Route path="/font-generator" element={<ToolWrapper toolId="font-generator"><FontGenerator /></ToolWrapper>} />
      <Route path="/json-editor" element={<ToolWrapper toolId="json-editor"><JSONEditor /></ToolWrapper>} />
      <Route path="/speed-test" element={<ToolWrapper toolId="speed-test"><SpeedTest /></ToolWrapper>} />
      
      {/* 404 page */}
      <Route path="*" element={<NotFound />} />
    </Routes>
  </BrowserRouter>
);

export default App;
