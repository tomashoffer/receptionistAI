'use client';

import { useState, useRef } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Button } from '../ui/button';
import { Progress } from '../ui/progress';
import { Alert, AlertDescription } from '../ui/alert';
import { Upload, FileSpreadsheet, Download, CheckCircle2, XCircle, AlertCircle } from 'lucide-react';
import { apiService } from '@/services/api.service';

interface ImportResult {
  total: number;
  created: number;
  updated: number;
  errors: Array<{
    row: number;
    data: any;
    error: string;
  }>;
}

interface ImportContactsModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  businessId: string;
  onSuccess: () => void;
}

export function ImportContactsModal({
  open,
  onOpenChange,
  businessId,
  onSuccess,
}: ImportContactsModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      validateAndSetFile(droppedFile);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      validateAndSetFile(selectedFile);
    }
  };

  const validateAndSetFile = (file: File) => {
    const allowedTypes = [
      'text/csv',
      'application/vnd.ms-excel',
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    ];

    if (!allowedTypes.includes(file.type)) {
      setError('Formato de archivo no soportado. Use CSV o Excel (.xlsx)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      setError('El archivo es demasiado grande. Máximo 10MB');
      return;
    }

    setFile(file);
    setError(null);
    setResult(null);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsUploading(true);
    setError(null);
    setResult(null);

    try {
      const data = await apiService.importContacts(businessId, file) as ImportResult;
      setResult(data);

      // Si no hay errores, cerrar modal después de 2 segundos
      if (data.errors.length === 0) {
        setTimeout(() => {
          onSuccess();
          handleClose();
        }, 2000);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsUploading(false);
    }
  };

  const handleDownloadTemplate = async () => {
    try {
      const blob = await apiService.downloadTemplate();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'plantilla-contactos.xlsx';
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleClose = () => {
    setFile(null);
    setResult(null);
    setError(null);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Importar Contactos</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Descargar plantilla */}
          <Alert>
            <Download className="h-4 w-4" />
            <AlertDescription>
              <div className="flex items-center justify-between">
                <span className="text-sm">
                  Descarga la plantilla para asegurarte de usar el formato correcto
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadTemplate}
                >
                  <Download className="w-3 h-3 mr-1" />
                  Descargar plantilla
                </Button>
              </div>
            </AlertDescription>
          </Alert>

          {/* Área de drag & drop */}
          {!result && (
            <div
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`
                border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
                ${isDragging
                  ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                  : 'border-gray-300 dark:border-gray-700 hover:border-purple-400 dark:hover:border-purple-600'
                }
              `}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept=".csv,.xlsx,.xls"
                onChange={handleFileSelect}
                className="hidden"
              />

              {file ? (
                <div className="space-y-3">
                  <FileSpreadsheet className="w-12 h-12 mx-auto text-purple-600" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      {file.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {(file.size / 1024).toFixed(2)} KB
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFile(null);
                    }}
                  >
                    Cambiar archivo
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  <Upload className="w-12 h-12 mx-auto text-gray-400" />
                  <div>
                    <p className="font-medium text-gray-900 dark:text-gray-100">
                      Arrastra tu archivo aquí o haz clic para seleccionar
                    </p>
                    <p className="text-sm text-gray-500">
                      Formatos soportados: CSV, Excel (.xlsx)
                    </p>
                    <p className="text-xs text-gray-400 mt-1">
                      Máximo 10MB - Hasta 1,000 contactos
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Error */}
          {error && (
            <Alert variant="destructive">
              <XCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Resultado */}
          {result && (
            <div className="space-y-3">
              {/* Resumen */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-green-50 dark:bg-green-900/20 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-green-600">{result.created}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Creados</p>
                </div>
                <div className="bg-blue-50 dark:bg-blue-900/20 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-blue-600">{result.updated}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Actualizados</p>
                </div>
                <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-lg text-center">
                  <p className="text-2xl font-bold text-red-600">{result.errors.length}</p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Errores</p>
                </div>
              </div>

              {/* Mensaje de éxito */}
              {result.errors.length === 0 ? (
                <Alert>
                  <CheckCircle2 className="h-4 w-4 text-green-600" />
                  <AlertDescription className="text-green-600">
                    ✅ Todos los contactos se importaron correctamente
                  </AlertDescription>
                </Alert>
              ) : (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="space-y-2">
                      <p className="font-medium">
                        Se encontraron {result.errors.length} errores:
                      </p>
                      <div className="max-h-32 overflow-y-auto space-y-1 text-xs">
                        {result.errors.slice(0, 5).map((err, idx) => (
                          <div key={idx} className="bg-red-50 dark:bg-red-900/20 p-2 rounded">
                            <span className="font-medium">Fila {err.row}:</span> {err.error}
                          </div>
                        ))}
                        {result.errors.length > 5 && (
                          <p className="text-gray-500">
                            ... y {result.errors.length - 5} errores más
                          </p>
                        )}
                      </div>
                    </div>
                  </AlertDescription>
                </Alert>
              )}
            </div>
          )}

          {/* Progress bar */}
          {isUploading && (
            <div className="space-y-2">
              <Progress value={50} className="w-full" />
              <p className="text-sm text-center text-gray-500">
                Procesando archivo...
              </p>
            </div>
          )}

          {/* Acciones */}
          <div className="flex gap-2 justify-end">
            {!result && (
              <>
                <Button variant="outline" onClick={handleClose}>
                  Cancelar
                </Button>
                <Button
                  onClick={handleImport}
                  disabled={!file || isUploading}
                >
                  {isUploading ? 'Importando...' : 'Importar contactos'}
                </Button>
              </>
            )}
            {result && (
              <Button onClick={handleClose}>
                {result.errors.length === 0 ? 'Cerrar' : 'Revisar errores'}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

