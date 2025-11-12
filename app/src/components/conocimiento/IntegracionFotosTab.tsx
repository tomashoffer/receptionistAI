import { useState } from 'react';
import { ChevronDown, ChevronRight, Megaphone, PlayCircle, Plus, Upload, Trash2, X, Image as ImageIcon, ChevronLeft, ChevronRight as ChevronRightIcon } from 'lucide-react';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { ImageWithFallback } from '../figma/ImageWithFallback';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '../ui/dialog';
import { RadioGroup, RadioGroupItem } from '../ui/radio-group';
import { businessTypeContent, BusinessType } from '../../config/businessTypeContent';

interface AreaComun {
  id: number;
  tipo: string;
  nombre: string;
  descripcion: string;
  imagenes: string[];
}

interface Props {
  businessType: BusinessType;
}

export function IntegracionFotosTab({ businessType }: Props) {
  const [expandedSections, setExpandedSections] = useState<Set<string>>(new Set(['areas-comunes']));
  const [showAreaModal, setShowAreaModal] = useState(false);
  const [selectedTipoArea, setSelectedTipoArea] = useState('');
  const [currentImageIndexes, setCurrentImageIndexes] = useState<{[key: number]: number}>({});

  const config = businessTypeContent[businessType].areasComunes;
  
  const [areasComunes, setAreasComunes] = useState<AreaComun[]>(
    config.areas.map((area, index) => ({
      id: index + 1,
      tipo: area.tipo,
      nombre: area.nombre,
      descripcion: area.descripcion,
      imagenes: [
        'https://images.unsplash.com/photo-1678960591129-ff8db00462e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHBvb2wlMjBzd2ltbWluZ3xlbnwxfHx8fDE3NjI4MzYzOTh8MA&ixlib=rb-4.1.0&q=80&w=1080'
      ]
    }))
  );

  const [fotosGenerales, setFotosGenerales] = useState([
    'https://images.unsplash.com/photo-1678960591129-ff8db00462e2?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHBvb2wlMjBzd2ltbWluZ3xlbnwxfHx8fDE3NjI4MzYzOTh8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1762421028657-347de51e7707?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGJ1aWxkaW5nJTIwZXh0ZXJpb3J8ZW58MXx8fHwxNzYyNzg5NDI0fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1740711165973-7989bc31f0d4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJlc3RhdXJhbnQlMjBkaW5pbmd8ZW58MXx8fHwxNzYyODE3NDQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1589443994465-6e59e5a2aed4?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHNwYSUyMGx1eHVyeXxlbnwxfHx8fDE3NjI3MzgxNjZ8MA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1648766378129-11c3d8d0da05?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHJvb20lMjBiZWR8ZW58MXx8fHwxNzYyNzUwNjQ2fDA&ixlib=rb-4.1.0&q=80&w=1080',
    'https://images.unsplash.com/photo-1734356972273-f19d4eac8c7c?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMGxvYmJ5JTIwZW50cmFuY2V8ZW58MXx8fHwxNjI4MzY0MDEfDA&ixlib=rb-4.1.0&q=80&w=1080'
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

  const handleAgregarArea = () => {
    if (selectedTipoArea) {
      // Aquí se agregaría la nueva área
      setShowAreaModal(false);
      setSelectedTipoArea('');
    }
  };

  const nextImage = (areaId: number, totalImages: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [areaId]: ((prev[areaId] || 0) + 1) % totalImages
    }));
  };

  const prevImage = (areaId: number, totalImages: number) => {
    setCurrentImageIndexes(prev => ({
      ...prev,
      [areaId]: ((prev[areaId] || 0) - 1 + totalImages) % totalImages
    }));
  };

  const handleUploadImage = (areaId: number) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    input.multiple = true;
    input.onchange = (e) => {
      const files = (e.target as HTMLInputElement).files;
      if (files) {
        // Aquí se procesarían las imágenes
        // Por ahora solo mostramos un mensaje
        const fileArray = Array.from(files);
        console.log(`Subiendo ${fileArray.length} imágenes para área ${areaId}`);
        
        // Simulación: agregar URLs de ejemplo
        setAreasComunes(prev => prev.map(area => {
          if (area.id === areaId) {
            return {
              ...area,
              imagenes: [
                ...area.imagenes,
                'https://images.unsplash.com/photo-1761534602786-ebebdd9e9c0d?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxob3RlbCUyMHRlcnJhY2UlMjBvdXRkb29yfGVufDF8fHx8MTc2MjgzNjQwMXww&ixlib=rb-4.1.0&q=80&w=1080'
              ]
            };
          }
          return area;
        }));
      }
    };
    input.click();
  };

  return (
    <div className="p-4 md:p-6 lg:p-8 space-y-4 md:space-y-6 max-w-6xl mx-auto">
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
              En este apartado podrán subir fotografías profesionales de tu establecimiento que ayudarán al asistente virtual a proporcionar información visual detallada a los huéspedes. Incluye imágenes de alta calidad de las áreas comunes, habitaciones, servicios, instalaciones y vistas del hotel. Las fotografías son fundamentales para que los potenciales huéspedes puedan visualizar las comodidades y el ambiente de tu establecimiento. Recomendamos subir entre 10 y 30 fotos que muestren los aspectos más atractivos y representativos de tu hotel. Asegúrate de que las imágenes sean claras, bien iluminadas y reflejen fielmente la experiencia que ofrecen.
            </p>
          </div>
        </div>
      </div>

      {/* Info sobre las fotos */}
      <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-4">
        <p className="text-sm text-yellow-900 leading-relaxed">
          <strong>Información sobre las fotos:</strong> Las imágenes deben estar bien iluminadas y capturar fielmente las áreas. Evita filtros excesivos. Formato recomendado: JPG o PNG, tamaño mínimo 1920x1080px.
        </p>
      </div>

      {/* ÁREAS COMUNES DEL ESTABLECIMIENTO */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('areas-comunes')}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-purple-500"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('areas-comunes') ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
            <span className="text-gray-900">Áreas Comunes del Establecimiento</span>
          </div>
          <span className="text-sm text-gray-500">{areasComunes.length} áreas configuradas</span>
        </button>

        {expandedSections.has('areas-comunes') && (
          <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
              {areasComunes.map((area) => (
                <div key={area.id} className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                  {/* Imagen con Carousel */}
                  <div className="relative h-48 bg-gray-100 group">
                    <ImageWithFallback
                      src={area.imagenes[currentImageIndexes[area.id] || 0]}
                      alt={area.nombre}
                      className="w-full h-full object-cover"
                    />
                    
                    {/* Flechas de navegación - solo si hay más de una imagen */}
                    {area.imagenes.length > 1 && (
                      <>
                        <button
                          onClick={() => prevImage(area.id, area.imagenes.length)}
                          className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => nextImage(area.id, area.imagenes.length)}
                          className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-black/50 hover:bg-black/70 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <ChevronRightIcon className="w-5 h-5" />
                        </button>
                      </>
                    )}

                    {/* Indicadores de imagen */}
                    {area.imagenes.length > 1 && (
                      <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                        {area.imagenes.map((_, index) => (
                          <button
                            key={index}
                            onClick={() => setCurrentImageIndexes(prev => ({ ...prev, [area.id]: index }))}
                            className={`w-1.5 h-1.5 rounded-full transition-all ${
                              (currentImageIndexes[area.id] || 0) === index
                                ? 'bg-white w-4'
                                : 'bg-white/50 hover:bg-white/75'
                            }`}
                          />
                        ))}
                      </div>
                    )}

                    {/* Contador de imágenes */}
                    {area.imagenes.length > 1 && (
                      <div className="absolute top-2 right-2 bg-black/60 text-white text-xs px-2 py-1 rounded">
                        {(currentImageIndexes[area.id] || 0) + 1} / {area.imagenes.length}
                      </div>
                    )}
                  </div>

                  {/* Contenido */}
                  <div className="p-4 space-y-3">
                    <div>
                      <div className="text-xs text-purple-600 mb-1">{area.tipo}</div>
                      <h4 className="text-sm text-gray-900 mb-2">{area.nombre}</h4>
                      <p className="text-xs text-gray-600 line-clamp-3">{area.descripcion}</p>
                    </div>

                    <div className="space-y-2">
                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">Nombre del área</Label>
                        <input
                          type="text"
                          value={area.nombre}
                          className="w-full px-3 py-1.5 text-xs border border-gray-200 rounded"
                          readOnly
                        />
                      </div>

                      <div>
                        <Label className="text-xs text-gray-600 mb-1 block">Descripción</Label>
                        <Textarea
                          value={area.descripcion}
                          rows={3}
                          className="text-xs"
                          readOnly
                        />
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button variant="outline" size="sm" className="flex-1 text-xs h-8" onClick={() => handleUploadImage(area.id)}>
                        <Upload className="w-3 h-3 mr-1" />
                        Subir Fotos
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <Button
              onClick={() => setShowAreaModal(true)}
              className="w-full mt-6 border-dashed border-2 bg-white text-purple-600 hover:text-purple-700 hover:bg-purple-50"
              variant="outline"
            >
              <Plus className="w-4 h-4 mr-2" />
              Agregar Área Común
            </Button>
          </div>
        )}
      </div>

      {/* INFORMACIÓN DE ÁREA ESPECÍFICA */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('area-especifica')}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-purple-500"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('area-especifica') ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
            <span className="text-gray-900">Información de Área Específica</span>
          </div>
        </button>

        {expandedSections.has('area-especifica') && (
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-600 mb-4">
              Aquí puedes agregar información más detallada sobre áreas específicas de tu establecimiento.
            </p>
            <Textarea
              placeholder="Describe características específicas, horarios especiales, servicios exclusivos de esta área..."
              rows={4}
              className="bg-white"
            />
          </div>
        )}
      </div>

      {/* FOTOS GENERALES */}
      <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
        <button
          onClick={() => toggleSection('fotos-generales')}
          className="w-full flex items-center justify-between p-5 hover:bg-gray-50 transition-colors border-l-4 border-l-purple-500"
        >
          <div className="flex items-center gap-3">
            {expandedSections.has('fotos-generales') ? (
              <ChevronDown className="w-5 h-5 text-gray-600" />
            ) : (
              <ChevronRight className="w-5 h-5 text-gray-600" />
            )}
            <span className="text-gray-900">Fotos Generales</span>
          </div>
          <span className="text-sm text-gray-500">{fotosGenerales.length} fotos</span>
        </button>

        {expandedSections.has('fotos-generales') && (
          <div className="p-4 md:p-6 border-t border-gray-200 bg-gray-50">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-4 mb-4">
              {fotosGenerales.map((foto, index) => (
                <div key={index} className="relative group aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  <ImageWithFallback
                    src={foto}
                    alt={`Foto general ${index + 1}`}
                    className="w-full h-full object-cover"
                  />
                  <button className="absolute top-2 right-2 w-8 h-8 bg-red-600 text-white rounded-full items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity hidden group-hover:flex">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <Button variant="outline" className="w-full border-dashed border-2 text-purple-600 hover:text-purple-700 hover:bg-purple-50">
              <Upload className="w-4 h-4 mr-2" />
              Subir Fotos Generales
            </Button>
          </div>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-4 md:pt-6">
        <Button variant="outline" className="w-full sm:w-auto">
          Anterior
        </Button>
        <Button className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto">
          Guardar y Continuar
        </Button>
      </div>

      {/* Modal para seleccionar tipo de área común */}
      <Dialog open={showAreaModal} onOpenChange={setShowAreaModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Seleccionar tipo de área común</DialogTitle>
          </DialogHeader>

          <RadioGroup value={selectedTipoArea} onValueChange={setSelectedTipoArea}>
            <div className="space-y-3">
              {config.tiposDisponibles.map((tipo) => (
                <div key={tipo.value} className="flex items-start space-x-3 p-3 rounded-lg hover:bg-gray-50 border border-gray-200">
                  <RadioGroupItem value={tipo.value} id={tipo.value} className="mt-1" />
                  <label htmlFor={tipo.value} className="flex-1 cursor-pointer">
                    <div className="text-sm text-gray-900 mb-1">{tipo.label}</div>
                    <div className="text-xs text-gray-500">{tipo.description}</div>
                  </label>
                </div>
              ))}
            </div>
          </RadioGroup>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAreaModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={handleAgregarArea}
              disabled={!selectedTipoArea}
              className="bg-purple-600 hover:bg-purple-700"
            >
              Agregar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}