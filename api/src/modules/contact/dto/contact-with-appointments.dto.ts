export interface AppointmentSummary {
  id: string;
  serviceType: string;
  appointmentDate: string;
  appointmentTime: string;
  status: string;
  notes?: string;
}

export interface ContactWithAppointments {
  id: string;
  name: string;
  phone: string;
  email?: string;
  source: string;
  total_interactions: number;
  last_interaction?: string;
  last_appointment?: AppointmentSummary;
  next_appointment?: AppointmentSummary;
  total_appointments: number;
}



