'use client';

import { useState } from 'react';
import { ArrowRight, Trash2, ChevronLeft, ChevronRight } from 'lucide-react';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { PageHeader } from './layout/PageHeader';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from './ui/dialog';
import { Textarea } from './ui/textarea';
import { Label } from './ui/label';
import { useUserStore } from '../stores/userStore';

interface TrainingQuestion {
  id: number;
  fecha: string;
  hora: string;
  pregunta: string;
  respondida: boolean;
}

export function Entrenamiento() {
  const { user } = useUserStore();
  const [questions, setQuestions] = useState<TrainingQuestion[]>([
    {
      id: 1,
      fecha: 'Lun, 13 de oct',
      hora: '16:00 hs',
      pregunta: '¿Cuál es el precio del catering para un evento? ¿Cuál es el ...',
      respondida: false
    },
    {
      id: 2,
      fecha: 'Sáb, 18 de jul',
      hora: '11:58 hs',
      pregunta: '¿Pueden enviar fotos del sector de juegos infantiles?',
      respondida: false
    }
  ]);

  const [selectedQuestion, setSelectedQuestion] = useState<TrainingQuestion | null>(null);
  const [respuesta, setRespuesta] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleResponder = (question: TrainingQuestion) => {
    setSelectedQuestion(question);
    setRespuesta('');
    setDialogOpen(true);
  };

  const handleGuardarRespuesta = () => {
    if (selectedQuestion) {
      setQuestions(questions.map(q => 
        q.id === selectedQuestion.id 
          ? { ...q, respondida: true }
          : q
      ));
      setDialogOpen(false);
      setSelectedQuestion(null);
      setRespuesta('');
    }
  };

  const handleEliminar = (id: number) => {
    setQuestions(questions.filter(q => q.id !== id));
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <PageHeader
        title={
          <div>
            <h1 className="text-lg md:text-xl lg:text-2xl">
              Hola <span className="text-purple-600">{user?.first_name || 'Usuario'}</span>, bienvenido al centro de entrenamiento 💪
            </h1>
          </div>
        }
        showBusinessSelector={false}
      >
        {/* Entrenamiento Rápido Card */}
        <Card className="border-purple-200 bg-purple-50/50 mt-4 md:mt-6">
          <div className="p-4 md:p-6">
            <h2 className="text-base md:text-lg mb-2 md:mb-3 font-semibold">Entrenamiento Rápido</h2>
            <p className="text-xs md:text-sm text-gray-600 leading-relaxed">
              En esta sección, puedes fortalecer el conocimiento del asistente respondiendo preguntas que no pudo contestar y que generaron una pausa en la conversación. Cada respuesta que brindes ayuda al asistente a aprender y a reducir interrupciones en el futuro, lo que significa interacciones más fluidas y precisas con los usuarios.
            </p>
          </div>
        </Card>
      </PageHeader>

      {/* Main Content */}
      <div className="p-4 md:p-6 lg:p-8">
        <Card>
          {/* Table Header - Solo visible en desktop */}
          <div className="hidden md:block bg-purple-600 text-white px-4 md:px-6 py-3 md:py-4 rounded-t-lg">
            <div className="grid grid-cols-12 gap-4 items-center">
              <div className="col-span-3 lg:col-span-2 flex items-center gap-2">
                <span className="text-sm">Fecha 📅</span>
              </div>
              <div className="col-span-6 lg:col-span-7">
                <span className="text-sm">Pregunta</span>
              </div>
              <div className="col-span-3 text-right">
                <span className="text-sm">Acciones</span>
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="divide-y divide-gray-200">
            {questions.length === 0 ? (
              <div className="px-4 md:px-6 py-8 md:py-12 text-center text-gray-500">
                <div className="mb-3 text-3xl md:text-4xl">💪</div>
                <p className="text-sm">No hay preguntas pendientes de entrenamiento</p>
                <p className="text-xs text-gray-400 mt-1">Todas las preguntas han sido respondidas</p>
              </div>
            ) : (
              questions.map((question) => (
                <div key={question.id} className="hover:bg-gray-50 transition-colors">
                  {/* Vista Desktop - Tabla */}
                  <div className="hidden md:block px-4 md:px-6 py-3 md:py-4">
                    <div className="grid grid-cols-12 gap-4 items-center">
                      {/* Fecha */}
                      <div className="col-span-3 lg:col-span-2">
                        <div className="text-sm text-gray-900">{question.fecha}</div>
                        <div className="text-xs text-gray-500">{question.hora}</div>
                      </div>

                      {/* Pregunta */}
                      <div className="col-span-6 lg:col-span-7">
                        <p className="text-sm text-gray-700 line-clamp-2">
                          {question.pregunta}
                        </p>
                      </div>

                      {/* Acciones */}
                      <div className="col-span-3 flex items-center justify-end gap-2">
                        <Button
                          onClick={() => handleResponder(question)}
                          className="bg-purple-600 hover:bg-purple-700 text-white gap-2"
                          size="sm"
                        >
                          Responder
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                        <Button
                          onClick={() => handleEliminar(question.id)}
                          variant="destructive"
                          size="sm"
                          className="px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {/* Vista Mobile - Card */}
                  <div className="md:hidden p-4 space-y-3">
                    {/* Fecha y hora */}
                    <div className="flex items-center gap-2 text-xs text-gray-500">
                      <span>📅</span>
                      <span>{question.fecha}</span>
                      <span>•</span>
                      <span>{question.hora}</span>
                    </div>

                    {/* Pregunta */}
                    <p className="text-sm text-gray-700">
                      {question.pregunta}
                    </p>

                    {/* Acciones */}
                    <div className="flex gap-2">
                      <Button
                        onClick={() => handleResponder(question)}
                        className="bg-purple-600 hover:bg-purple-700 text-white flex-1 gap-2"
                        size="sm"
                      >
                        Responder
                        <ArrowRight className="w-4 h-4" />
                      </Button>
                      <Button
                        onClick={() => handleEliminar(question.id)}
                        variant="destructive"
                        size="sm"
                        className="px-3"
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Pagination */}
          {questions.length > 0 && (
            <div className="px-4 md:px-6 py-3 md:py-4 border-t border-gray-200 flex items-center justify-between">
              <Button variant="ghost" size="sm" disabled className="gap-2 text-gray-400">
                <ChevronLeft className="w-3 h-3 md:w-4 md:h-4" />
                <span className="hidden sm:inline">Anterior</span>
                <span className="sm:hidden">Ant</span>
              </Button>
              <Button variant="ghost" size="sm" disabled className="gap-2 text-gray-400">
                <span className="hidden sm:inline">Siguiente</span>
                <span className="sm:hidden">Sig</span>
                <ChevronRight className="w-3 h-3 md:w-4 md:h-4" />
              </Button>
            </div>
          )}
        </Card>
      </div>

      {/* Dialog para responder */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base md:text-lg">Responder pregunta de entrenamiento</DialogTitle>
            <DialogDescription className="text-xs md:text-sm">
              Proporciona una respuesta que el asistente podrá usar para futuras consultas similares
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-3 md:space-y-4">
            {/* Pregunta original */}
            <div className="space-y-2">
              <Label className="text-sm">Pregunta del usuario</Label>
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-3 md:p-4">
                <p className="text-xs md:text-sm text-gray-700">{selectedQuestion?.pregunta}</p>
                <p className="text-xs text-gray-500 mt-2">
                  {selectedQuestion?.fecha} • {selectedQuestion?.hora}
                </p>
              </div>
            </div>

            {/* Respuesta */}
            <div className="space-y-2">
              <Label htmlFor="respuesta" className="text-sm">
                Tu respuesta <span className="text-red-500">*</span>
              </Label>
              <Textarea
                id="respuesta"
                placeholder="Escribe aquí la respuesta que el asistente debe aprender..."
                rows={6}
                value={respuesta}
                onChange={(e) => setRespuesta(e.target.value)}
                className="resize-none text-sm"
              />
              <p className="text-xs text-gray-500">
                Esta respuesta se agregará al conocimiento del asistente y se utilizará para responder preguntas similares en el futuro.
              </p>
            </div>
          </div>

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button 
              variant="outline" 
              onClick={() => setDialogOpen(false)}
              className="w-full sm:w-auto order-2 sm:order-1"
            >
              Cancelar
            </Button>
            <Button 
              onClick={handleGuardarRespuesta}
              disabled={!respuesta.trim()}
              className="bg-purple-600 hover:bg-purple-700 w-full sm:w-auto order-1 sm:order-2"
            >
              Guardar respuesta
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
