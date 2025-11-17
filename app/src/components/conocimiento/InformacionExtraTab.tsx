import { useState } from 'react';
import { ChevronDown, ChevronRight, Megaphone, PlayCircle } from 'lucide-react';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { businessTypeContent, BusinessType } from '../../config/businessTypeContent';

interface Props {
  businessType: BusinessType;
}

export function InformacionExtraTab({ businessType }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const content = businessTypeContent[businessType].informacionExtra;

  // Initialize state dynamically
  const [formData, setFormData] = useState<Record<string, Record<string, string>>>(() => {
    const initialData: Record<string, Record<string, string>> = {};
    Object.keys(content).forEach(sectionKey => {
      initialData[sectionKey] = {};
      content[sectionKey].questions.forEach((q, index) => {
        initialData[sectionKey][`respuesta${index + 1}`] = q.defaultValue;
      });
    });
    return initialData;
  });

  const toggleSection = (id: string) => {
    const newExpanded = new Set(expandedSections);
    if (newExpanded.has(id)) {
      newExpanded.delete(id);
    } else {
      newExpanded.add(id);
    }
    setExpandedSections(newExpanded);
  };

  const updateField = (section: string, field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-5xl mx-auto">
      {/* Importante Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-4 md:p-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0">
            <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center">
              <Megaphone className="w-5 h-5 text-white" />
            </div>
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h3 className="text-purple-900">Importante</h3>
              <button className="flex items-center gap-1 text-sm text-purple-600 hover:text-purple-700">
                <PlayCircle className="w-4 h-4" />
                <span>Ver Video</span>
              </button>
            </div>
            <p className="text-sm text-purple-900/80 leading-relaxed">
              En este apartado podrán proporcionar información complementaria y enriquecedora que ayudará a que el asistente brinde una experiencia más completa. Cuanto más contexto y detalles proporciones, más valioso será el asesoramiento que el asistente podrá ofrecer.
            </p>
          </div>
        </div>
      </div>

      {/* Dynamic Sections */}
      {Object.keys(content).map((sectionKey) => {
        const section = content[sectionKey];
        const questionCount = section.questions.length;
        
        return (
          <div key={sectionKey} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
            <button
              onClick={() => toggleSection(sectionKey)}
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-blue-500"
            >
              <div className="flex items-center gap-3">
                {expandedSections.has(sectionKey) ? (
                  <ChevronDown className="w-5 h-5 text-gray-600" />
                ) : (
                  <ChevronRight className="w-5 h-5 text-gray-600" />
                )}
                <span className="text-gray-900">{section.title}</span>
              </div>
              <span className="text-sm text-gray-500">{questionCount}/{questionCount} preguntas</span>
            </button>

            {expandedSections.has(sectionKey) && (
              <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-6">
                {section.questions.map((question, index) => {
                  const fieldKey = `respuesta${index + 1}`;
                  
                  return (
                    <div key={index} className="space-y-2">
                      <Label className="text-gray-700">{question.pregunta}</Label>
                      <Textarea 
                        placeholder={question.placeholder}
                        value={formData[sectionKey]?.[fieldKey] || ''}
                        onChange={(e) => updateField(sectionKey, fieldKey, e.target.value)}
                        rows={3}
                        className="bg-white"
                      />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        );
      })}

    </div>
  );
}
