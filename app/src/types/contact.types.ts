export interface Tag {
  id: string;
  business_id: string;
  label: string;
  color: string;
  icon?: string;
  created_at: string;
  contactCount?: number;
}

export interface ContactTag {
  id: string;
  contact_id: string;
  tag_id: string;
  tag: Tag;
  assigned_at: string;
}

export interface Contact {
  id: string;
  business_id: string;
  name: string;
  phone: string;
  email?: string;
  source: 'call' | 'whatsapp' | 'instagram' | 'facebook' | 'web' | 'manual';
  notes?: string;
  total_interactions: number;
  last_interaction?: string;
  last_conversation_summary?: string;
  conversation_id?: string;
  contactTags: ContactTag[];
  created_at: string;
  updated_at: string;
}

export interface ContactsResponse {
  data: Contact[];
  total: number;
  page: number;
  limit: number;
}

export interface CreateContactDto {
  business_id: string;
  name: string;
  phone: string;
  email?: string;
  source?: string;
  notes?: string;
}

export interface CreateTagDto {
  business_id: string;
  label: string;
  color: string;
  icon?: string;
}

export interface AssignTagsDto {
  tag_ids: string[];
}

