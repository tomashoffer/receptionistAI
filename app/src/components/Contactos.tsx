'use client';

import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table';
import { Popover, PopoverContent, PopoverTrigger } from './ui/popover';
import { Checkbox } from './ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './ui/dropdown-menu';
import { 
  Search, 
  Filter, 
  Download,
  Upload,
  UserPlus,
  ExternalLink,
  RefreshCw,
  Tag as TagIcon,
  ChevronLeft,
  ChevronRight,
  MoreVertical,
  Edit2,
  Trash2,
  Eye,
} from 'lucide-react';
import { useUserStore } from '../stores/userStore';
import { PageHeader } from './layout/PageHeader';
import { TagCell } from './contacts/TagCell';
import { TagManagerModal } from './contacts/TagManagerModal';
import { ImportContactsModal } from './contacts/ImportContactsModal';
import { DeleteContactDialog } from './contacts/DeleteContactDialog';
import { EditContactModal } from './contacts/EditContactModal';
import { ContactDetailsModal } from './contacts/ContactDetailsModal';
import { CreateContactModal } from './contacts/CreateContactModal';
import { MultiSelectFilter } from './contacts/MultiSelectFilter';
import { Contact, Tag, ContactsResponse } from '@/types/contact.types';
import { apiService } from '@/services/api.service';

const TAG_COLORS: Record<string, string> = {
  pink: 'bg-pink-100 text-pink-700',
  orange: 'bg-orange-500 text-white',
  blue: 'bg-blue-500 text-white',
  gray: 'bg-gray-600 text-white',
  green: 'bg-green-500 text-white',
  purple: 'bg-purple-500 text-white',
  red: 'bg-red-500 text-white',
  yellow: 'bg-yellow-400 text-yellow-900',
  indigo: 'bg-indigo-500 text-white',
  teal: 'bg-teal-500 text-white',
};

export function Contactos() {
  const { activeBusiness } = useUserStore();
  
  // Estados
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [tags, setTags] = useState<Tag[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedSource, setSelectedSource] = useState<string>('');
  const [page, setPage] = useState(1);
  const [total, setTotal] = useState(0);
  const [limit] = useState(50);
  const [isLoading, setIsLoading] = useState(false);
  const [isTagManagerOpen, setIsTagManagerOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [contactToDelete, setContactToDelete] = useState<Contact | null>(null);
  const [contactToEdit, setContactToEdit] = useState<Contact | null>(null);
  const [contactToView, setContactToView] = useState<Contact | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Fetch contacts
  const fetchContacts = async () => {
    if (!activeBusiness?.id) return;

    setIsLoading(true);
    try {
      const data = await apiService.getContacts({
        business_id: activeBusiness.id,
        page,
        limit,
        search: searchTerm || undefined,
        tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
        source: selectedSource && selectedSource !== 'all' ? selectedSource : undefined,
      }) as ContactsResponse;

      setContacts(data.data);
      setTotal(data.total);
    } catch (error) {
      console.error('Error al obtener contactos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Fetch tags
  const fetchTags = async () => {
    if (!activeBusiness?.id) return;

    try {
      const data = await apiService.getTags(activeBusiness.id) as Tag[];
      setTags(data);
    } catch (error) {
      console.error('Error al obtener tags:', error);
    }
  };

  // Effects
  useEffect(() => {
    fetchContacts();
  }, [activeBusiness, page, searchTerm, selectedTags, selectedSource]);

  useEffect(() => {
    fetchTags();
  }, [activeBusiness]);

  // Handlers con actualización optimista (sin loading)
  const handleAddTag = async (contactId: string, tagId: string) => {
    // Actualización optimista: agregar el tag localmente antes de la respuesta del servidor
    const tag = tags.find(t => t.id === tagId);
    if (!tag) return;

    setContacts(prevContacts =>
      prevContacts.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            contactTags: [
              ...contact.contactTags,
              {
                id: `temp-${Date.now()}`,
                contact_id: contactId,
                tag_id: tagId,
                tag: tag,
                assigned_at: new Date().toISOString(),
              },
            ],
          };
        }
        return contact;
      })
    );

    // Llamada al backend en segundo plano
    try {
      await apiService.assignTagsToContact(contactId, [tagId]);
      // No recargar - la actualización optimista ya lo mostró
    } catch (error) {
      console.error('Error al agregar tag:', error);
      // Revertir cambio optimista solo si falla
      await fetchContacts();
    }
  };

  const handleRemoveTag = async (contactId: string, tagId: string) => {
    // Actualización optimista: quitar el tag localmente inmediatamente
    setContacts(prevContacts =>
      prevContacts.map(contact => {
        if (contact.id === contactId) {
          return {
            ...contact,
            contactTags: contact.contactTags.filter(ct => ct.tag.id !== tagId),
          };
        }
        return contact;
      })
    );

    // Llamada al backend en segundo plano
    try {
      await apiService.removeTagFromContact(contactId, tagId);
    } catch (error) {
      console.error('Error al quitar tag:', error);
      // Revertir cambio optimista
      await fetchContacts();
    }
  };

  const handleRefresh = () => {
    fetchContacts();
    fetchTags();
  };

  const handleSearchChange = (value: string) => {
    setSearchTerm(value);
    setPage(1); // Reset a primera página al buscar
  };

  const handleExport = async () => {
    if (!activeBusiness?.id) return;

    setIsExporting(true);
    try {
      const blob = await apiService.exportContacts({
        business_id: activeBusiness.id,
        search: searchTerm || undefined,
        tags: selectedTags.length > 0 ? selectedTags.join(',') : undefined,
        source: selectedSource && selectedSource !== 'all' ? selectedSource : undefined,
      });

      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const date = new Date().toISOString().split('T')[0];
      a.download = `contactos-${activeBusiness.name || 'export'}-${date}.xlsx`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error al exportar:', error);
      alert('Error al exportar contactos');
    } finally {
      setIsExporting(false);
    }
  };

  const handleDeleteContact = async () => {
    if (!activeBusiness?.id || !contactToDelete) return;

    setIsDeleting(true);
    try {
      await apiService.deleteContact(contactToDelete.id, activeBusiness.id);
      await fetchContacts();
      setContactToDelete(null);
    } catch (error) {
      console.error('Error al eliminar contacto:', error);
      alert('Error al eliminar el contacto');
    } finally {
      setIsDeleting(false);
    }
  };

  const getSourceIcon = (source: string) => {
    const icons: Record<string, string> = {
      whatsapp: '💬',
      instagram: '📷',
      facebook: '👥',
      call: '☎️',
      web: '🌐',
      manual: '✏️',
    };
    return icons[source] || '📌';
  };

  const getSourceLabel = (source: string) => {
    const labels: Record<string, string> = {
      whatsapp: 'WhatsApp',
      instagram: 'Instagram',
      facebook: 'Facebook',
      call: 'Llamada',
      web: 'Web',
      manual: 'Manual',
    };
    return labels[source] || source;
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('es-AR', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const formatRelativeTime = (dateString?: string) => {
    if (!dateString) return '-';
    
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'ahora';
    if (diffMins < 60) return `hace ${diffMins} minuto${diffMins > 1 ? 's' : ''}`;
    if (diffHours < 24) return `hace ${diffHours} hora${diffHours > 1 ? 's' : ''}`;
    if (diffDays < 7) return `hace ${diffDays} día${diffDays > 1 ? 's' : ''}`;
    
    return formatDate(dateString);
  };

  const totalPages = Math.ceil(total / limit);

  return (
    <div className="bg-gray-50 dark:bg-gray-900">
      <PageHeader
        title={
          <div className="flex items-center gap-3">
            <span className="text-xl md:text-2xl">Contactos</span>
            <Badge variant="secondary" className="bg-purple-100 text-purple-700 dark:bg-purple-900/30 dark:text-purple-300">
              Tutorial
            </Badge>
          </div>
        }
      >
        {/* Action Buttons */}
        <div className="flex items-center justify-between mt-4 gap-4 flex-wrap">
          <div className="flex items-center gap-2 flex-wrap">
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsImportModalOpen(true)}
            >
              <Upload className="w-4 h-4" />
              Importar contactos
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsCreateModalOpen(true)}
            >
              <UserPlus className="w-4 h-4" />
              Agregar contacto
            </Button>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleExport}
              disabled={isExporting || contacts.length === 0}
            >
              <Download className={`w-4 h-4 ${isExporting ? 'animate-bounce' : ''}`} />
              {isExporting ? 'Exportando...' : 'Descargar'}
            </Button>
            
            {/* Filtro por tags */}
            <Popover>
              <PopoverTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <Filter className="w-4 h-4" />
                  Filtros
                  {(selectedTags.length > 0 || selectedSource) && (
                    <Badge variant="secondary" className="ml-1">
                      {selectedTags.length + (selectedSource ? 1 : 0)}
                    </Badge>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-80" align="start">
                <div className="space-y-4">
                  {/* Filtro por etiquetas - Multi-select acumulable */}
                  <div>
                    <p className="font-medium mb-2 text-sm">Filtrar por etiquetas</p>
                    <MultiSelectFilter
                      options={tags.map((tag) => ({
                        value: tag.id,
                        label: tag.label,
                        icon: tag.icon,
                      }))}
                      selectedValues={selectedTags}
                      onSelectedChange={(values) => {
                        setSelectedTags(values);
                        setPage(1);
                      }}
                      placeholder="Seleccionar etiqueta..."
                    />
                  </div>

                  {/* Filtro por fuente - Select simple */}
                  <div className="border-t pt-3">
                    <p className="font-medium mb-2 text-sm">Filtrar por canal</p>
                    <Select
                      value={selectedSource || 'all'}
                      onValueChange={(value) => {
                        setSelectedSource(value === 'all' ? '' : value);
                        setPage(1);
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Todos los canales" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos los canales</SelectItem>
                        <SelectItem value="call">☎️ Llamada</SelectItem>
                        <SelectItem value="whatsapp">💬 WhatsApp</SelectItem>
                        <SelectItem value="instagram">📷 Instagram</SelectItem>
                        <SelectItem value="facebook">👥 Facebook</SelectItem>
                        <SelectItem value="web">🌐 Web</SelectItem>
                        <SelectItem value="manual">✏️ Manual</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Limpiar filtros */}
                  {(selectedTags.length > 0 || selectedSource) && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedTags([]);
                        setSelectedSource('');
                        setPage(1);
                      }}
                      className="w-full mt-3"
                    >
                      Limpiar filtros
                    </Button>
                  )}
                </div>
              </PopoverContent>
            </Popover>

            {/* Gestionar etiquetas */}
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={() => setIsTagManagerOpen(true)}
            >
              <TagIcon className="w-4 h-4" />
              Gestionar etiquetas
            </Button>
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Buscar contacto..."
                className="pl-10 w-64"
                value={searchTerm}
                onChange={(e) => handleSearchChange(e.target.value)}
              />
            </div>
            <Button 
              variant="outline" 
              size="sm" 
              className="gap-2"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualización
            </Button>
          </div>
        </div>

        {/* Tags seleccionados visibles */}
        {selectedTags.length > 0 && (
          <div className="flex items-center gap-2 mt-3 flex-wrap">
            <span className="text-sm text-gray-600 dark:text-gray-400">Filtrando por:</span>
            {selectedTags.map((tagId) => {
              const tag = tags.find((t) => t.id === tagId);
              if (!tag) return null;
              return (
                <Badge
                  key={tagId}
                  className={`${TAG_COLORS[tag.color] || TAG_COLORS.gray} flex items-center gap-1 pr-1 cursor-pointer`}
                  onClick={() => {
                    setSelectedTags((prev) => prev.filter((id) => id !== tagId));
                    setPage(1);
                  }}
                >
                  {tag.icon && <span>{tag.icon}</span>}
                  {tag.label}
                  <span className="ml-1 hover:bg-white/20 rounded-full w-4 h-4 flex items-center justify-center">
                    ×
                  </span>
                </Badge>
              );
            })}
          </div>
        )}
      </PageHeader>

      {/* Table */}
      <div className="flex-1 overflow-auto">
        <Table>
          <TableHeader className="bg-purple-600 sticky top-0 z-10">
            <TableRow className="hover:bg-purple-600">
              <TableHead className="text-white">Actualizado</TableHead>
              <TableHead className="text-white">Nombre</TableHead>
              <TableHead className="text-white">Teléfono</TableHead>
              <TableHead className="text-white">Email</TableHead>
              <TableHead className="text-white">Canal</TableHead>
              <TableHead className="text-white">Etiquetas</TableHead>
              <TableHead className="text-white">Creación</TableHead>
              <TableHead className="text-white">Interacciones</TableHead>
              <TableHead className="text-white text-right">Acciones</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="bg-white dark:bg-transparent">
            {isLoading ? (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <div className="flex items-center justify-center gap-2">
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span className="text-gray-500">Cargando contactos...</span>
                  </div>
                </TableCell>
              </TableRow>
            ) : contacts.length > 0 ? (
              contacts.map((contact) => (
                <TableRow
                  key={contact.id}
                  className="hover:bg-gray-50 dark:hover:bg-purple-500/20 transition-colors"
                >
                  <TableCell className="text-sm">
                    {formatRelativeTime(contact.last_interaction || contact.updated_at)}
                  </TableCell>
                  <TableCell className="text-sm font-medium">
                    {contact.name}
                  </TableCell>
                  <TableCell className="text-sm">
                    {contact.phone}
                  </TableCell>
                  <TableCell className="text-sm">
                    {contact.email || '-'}
                  </TableCell>
                  <TableCell className="text-sm">
                    <div className="flex items-center gap-1">
                      <span>{getSourceIcon(contact.source)}</span>
                      <span className="text-xs">{getSourceLabel(contact.source)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <TagCell
                      contact={contact}
                      businessTags={tags}
                      onAddTag={handleAddTag}
                      onRemoveTag={handleRemoveTag}
                      onRefreshTags={fetchTags}
                    />
                  </TableCell>
                  <TableCell className="text-sm">
                    {formatDate(contact.created_at)}
                  </TableCell>
                  <TableCell className="text-sm">
                    <Badge variant="secondary">
                      {contact.total_interactions}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreVertical className="w-4 h-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => setContactToView(contact)}
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Ver detalles
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer"
                          onClick={() => setContactToEdit(contact)}
                        >
                          <Edit2 className="w-4 h-4 mr-2" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          className="cursor-pointer text-red-600"
                          onClick={() => setContactToDelete(contact)}
                        >
                          <Trash2 className="w-4 h-4 mr-2" />
                          Eliminar
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-12">
                  <p className="text-gray-500 dark:text-slate-400">
                    {searchTerm || selectedTags.length > 0 || selectedSource
                      ? 'No se encontraron contactos con los filtros seleccionados'
                      : 'No hay contactos registrados'}
                  </p>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Footer con paginación */}
      <div className="bg-white dark:bg-transparent border-t border-gray-200 dark:border-slate-800 px-8 py-3 flex items-center justify-between">
        <p className="text-sm text-gray-500 dark:text-slate-400">
          Mostrando {contacts.length > 0 ? (page - 1) * limit + 1 : 0} -{' '}
          {Math.min(page * limit, total)} de {total} contactos
        </p>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1 || isLoading}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Anterior
          </Button>
          <span className="text-sm text-gray-600 dark:text-gray-400">
            Página {page} de {totalPages || 1}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= totalPages || isLoading}
          >
            Siguiente
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* Modal de gestión de tags */}
      <TagManagerModal
        open={isTagManagerOpen}
        onOpenChange={setIsTagManagerOpen}
        businessId={activeBusiness?.id || ''}
        tags={tags}
        onRefresh={() => {
          fetchTags();
          fetchContacts();
        }}
      />

      {/* Modal de importación */}
      <ImportContactsModal
        open={isImportModalOpen}
        onOpenChange={setIsImportModalOpen}
        businessId={activeBusiness?.id || ''}
        onSuccess={() => {
          fetchContacts();
          fetchTags();
        }}
      />

      {/* Diálogo de confirmación para eliminar */}
      <DeleteContactDialog
        open={contactToDelete !== null}
        onOpenChange={(open) => !open && setContactToDelete(null)}
        onConfirm={handleDeleteContact}
        contactName={contactToDelete?.name || ''}
        isLoading={isDeleting}
      />

      {/* Modal de edición */}
      <EditContactModal
        open={contactToEdit !== null}
        onOpenChange={(open) => !open && setContactToEdit(null)}
        contact={contactToEdit}
        businessId={activeBusiness?.id || ''}
        onSuccess={() => {
          fetchContacts();
          setContactToEdit(null);
        }}
      />

      {/* Modal de detalles */}
      <ContactDetailsModal
        open={contactToView !== null}
        onOpenChange={(open) => !open && setContactToView(null)}
        contact={contactToView}
        onEdit={() => {
          setContactToEdit(contactToView);
          setContactToView(null);
        }}
      />

      {/* Modal de crear contacto */}
      <CreateContactModal
        open={isCreateModalOpen}
        onOpenChange={setIsCreateModalOpen}
        businessId={activeBusiness?.id || ''}
        onSuccess={() => {
          fetchContacts();
          fetchTags();
        }}
      />
    </div>
  );
}
