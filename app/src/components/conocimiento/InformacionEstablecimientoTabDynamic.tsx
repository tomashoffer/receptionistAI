import { useState } from 'react';
import { ChevronDown, ChevronRight, Megaphone, PlayCircle, Plus, Trash2 } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { businessTypeContent, BusinessType } from '../../.config/businessTypeContent';

interface Situacion {
  id: number;
  titulo: string;
  descripcion: string;
}

interface Props {
  businessType: BusinessType;
}

export function InformacionEstablecimientoTab({ businessType }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set());
  const content = businessTypeContent[businessType].informacionEstablecimiento;
  
  // Initialize state dynamically based on business type
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

  const [situaciones, setSituaciones] = useState<Situacion[]>([
    {
      id: 1,
      titulo: 'Consultas que requieren evaluación personalizada',
      descripcion: 'Casos complejos que requieren atención directa del equipo'
    }
  ]);

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

  const addSituacion = () => {
    const newId = Math.max(...situaciones.map(s => s.id), 0) + 1;
    setSituaciones([...situaciones, {
      id: newId,
      titulo: '',
      descripcion: ''
    }]);
  };

  const removeSituacion = (id: number) => {
    setSituaciones(situaciones.filter(s => s.id !== id));
  };

  const updateSituacion = (id: number, field: 'titulo' | 'descripcion', value: string) => {
    setSituaciones(situaciones.map(s => 
      s.id === id ? { ...s, [field]: value } : s
    ));
  };

  return (
    <div className="p-8 space-y-6 max-w-5xl">
      {/* Importante Section */}
      <div className="bg-purple-50 border border-purple-200 rounded-lg p-6">
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
              En este apartado podrán proporcionar información completa y detallada sobre su establecimiento para que el asistente virtual pueda brindar respuestas precisas y personalizadas. Cuanta más información completa y detallada proporciones, más profesional y útil será la experiencia del cliente con su asistente virtual.
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
              className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-green-500"
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

      {/* SITUACIONES */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('situaciones')}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-red-500"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('situaciones') ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
            <span className="text-gray-900">Situaciones en las que el Asistente debe detenerse</span>
          </div>
          <span className="text-sm text-gray-500">{situaciones.length} situaciones configuradas</span>
        </button>

        {expandedSections.has('situaciones') && (
          <div className="p-6 border-t border-gray-200 bg-gray-50 space-y-4">
            <p className="text-sm text-gray-600 mb-4">
              Define situaciones específicas en las que el asistente debe transferir la conversación a un humano.
            </p>

            {situaciones.map((situacion, index) => (
              <div key={situacion.id} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-start justify-between mb-3">
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200">
                    Situación {index + 1}
                  </Badge>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeSituacion(situacion.id)}
                    className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>

                <div className="space-y-3">
                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Título de la situación</Label>
                    <Input
                      placeholder="Ej: Consultas complejas"
                      value={situacion.titulo}
                      onChange={(e) => updateSituacion(situacion.id, 'titulo', e.target.value)}
                      className="bg-white"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label className="text-sm text-gray-700">Descripción</Label>
                    <Textarea
                      placeholder="Describe cuándo debe detenerse el asistente..."
                      value={situacion.descripcion}
                      onChange={(e) => updateSituacion(situacion.id, 'descripcion', e.target.value)}
                      rows={2}
                      className="bg-white"
                    />
                  </div>
                </div>
              </div>
            ))}

            <Button
              variant="outline"
              onClick={addSituacion}
              className="w-full border-dashed border-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar nueva situación
            </Button>
          </div>
        )}
      </div>

    </div>
  );
}
