import React from 'react';
import { X, Ruler } from 'lucide-react';

interface SizeChartModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: string;
}

const SizeChartModal: React.FC<SizeChartModalProps> = ({ isOpen, onClose, category }) => {
  if (!isOpen) return null;

  // 🛠️ STANDARD CHARTS DATA
  // आप इसे अपनी मर्जी से बदल सकते हैं
  const standardCharts: Record<string, any[]> = {
    'suit': [
      { size: 'S', chest: '36"', waist: '28-30"', hip: '38"', length: '40"' },
      { size: 'M', chest: '38"', waist: '30-32"', hip: '40"', length: '42"' },
      { size: 'L', chest: '40"', waist: '32-34"', hip: '42"', length: '44"' },
      { size: 'XL', chest: '42"', waist: '34-36"', hip: '44"', length: '45"' },
      { size: 'XXL', chest: '44"', waist: '36-38"', hip: '46"', length: '46"' },
    ],
    'lehenga': [
      { size: 'Free Size', note: 'Semi-stitched (Up to 42" Waist)' },
    ],
    // Default chart if category doesn't match
    'default': [
      { size: 'S', chest: '36"', waist: '28"' },
      { size: 'M', chest: '38"', waist: '30"' },
      { size: 'L', chest: '40"', waist: '32"' },
      { size: 'XL', chest: '42"', waist: '34"' },
    ]
  };

  // Category match logic (Case insensitive)
  const catKey = Object.keys(standardCharts).find(k => category.toLowerCase().includes(k)) || 'default';
  const chartData = standardCharts[catKey];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-lg overflow-hidden relative">
        
        {/* Header */}
        <div className="bg-dark text-white p-4 flex justify-between items-center">
          <h3 className="font-serif text-lg flex items-center gap-2">
            <Ruler className="w-5 h-5" /> Size Guide: {category}
          </h3>
          <button onClick={onClose} className="hover:bg-white/20 p-1 rounded-full transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6">
          <p className="text-sm text-gray-500 mb-4">
            Measurements are in inches. Use this chart to find your perfect fit.
          </p>

          <div className="overflow-x-auto border rounded-lg">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-dark uppercase font-bold text-xs">
                <tr>
                  {Object.keys(chartData[0]).map((header) => (
                    <th key={header} className="px-4 py-3 border-b">{header}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y">
                {chartData.map((row: any, idx: number) => (
                  <tr key={idx} className="hover:bg-gray-50/50">
                    {Object.values(row).map((val: any, i) => (
                      <td key={i} className={`px-4 py-3 ${i === 0 ? 'font-bold text-accent' : 'text-gray-600'}`}>
                        {val}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="mt-6 bg-yellow-50 p-3 rounded text-xs text-yellow-800 border border-yellow-200">
             💡 <strong>Tip:</strong> If you are in between sizes, we recommend going for the larger size for a comfortable fit.
          </div>
        </div>

      </div>
    </div>
  );
};

export default SizeChartModal;