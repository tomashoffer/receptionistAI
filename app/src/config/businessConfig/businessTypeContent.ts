import { IndustryType } from '../../stores/userStore';

export type BusinessType = IndustryType;

export interface ConfigField {
  key: string;
  label: string;
  defaultValue: string;
  locked: boolean;
  multiline?: boolean;
  rows?: number;
}

export interface Situacion {
  titulo: string;
  descripcion: string;
}

export interface PrecioDisponibilidadSection {
  key: string;
  title: string;
  borderColor: string;
  questions: {
    pregunta: string;
    placeholder: string;
    defaultValue: string;
  }[];
}

export interface BusinessContentConfig {
  configuracionAsistente: {
    fields: ConfigField[];
    directrices: {
      defaultValue: string;
    };
    situaciones: Situacion[];
  };
  precioDisponibilidad: {
    secciones: PrecioDisponibilidadSection[];
    situaciones: Situacion[];
    configAvanzada: {
      detenerseCotizacion: boolean;
      totalMinimo: string;
      instruccionesCalculo: string;
      mensajeFijo: string;
    };
  };
  informacionEstablecimiento: {
    [key: string]: {
      title: string;
      questions: {
        pregunta: string;
        placeholder: string;
        defaultValue: string;
      }[];
    };
  };
  informacionExtra: {
    [key: string]: {
      title: string;
      questions: {
        pregunta: string;
        placeholder: string;
        defaultValue: string;
      }[];
    };
  };
  areasComunes: {
    title: string;
    areas: {
      tipo: string;
      nombre: string;
      descripcion: string;
    }[];
    tiposDisponibles: {
      value: string;
      label: string;
      description: string;
    }[];
  };
}

export const businessTypeContent = {
  hotel: {
    configuracionAsistente: {
      fields: [
        {
          key: 'nombre',
          label: 'Nombre del asistente',
          defaultValue: 'Camila',
          locked: true
        },
        {
          key: 'tono',
          label: 'Tono',
          defaultValue: 'Formal',
          locked: true
        },
        {
          key: 'establecimiento',
          label: 'Nombre del establecimiento',
          defaultValue: 'Edelweiss',
          locked: true
        },
        {
          key: 'ubicacion',
          label: 'Ubicación',
          defaultValue: 'Punta del Este',
          locked: true
        },
        {
          key: 'tipoEstablecimiento',
          label: 'Tipo de establecimiento',
          defaultValue: 'Hotel 5 estrellas',
          locked: true
        },
        {
          key: 'infoHotel',
          label: 'Información del hotel',
          defaultValue: 'Un hotel boutique 5 estrellas en Punta del Este, Uruguay; Ambiente exclusivo y acogedor inspirado en los Alpes suizos; Diseño arquitectónico que fusiona elegancia europea con calidez uruguaya; Servicios premium personalizados.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'propuesta',
          label: 'Propuesta de valor',
          defaultValue: 'Experimentar la sofisticación alpina con servicios excepcionales en un entorno costero privilegiado. Ideal para viajeros que buscan exclusividad y atención al detalle en uno de los destinos más codiciados de Sudamérica.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'web',
          label: 'Página web',
          defaultValue: 'https://edelweiss.com',
          locked: true
        }
      ],
      directrices: {
        defaultValue: `• Da análisis curiosos y entretenidos.
• Da una respuesta corta y dinámica de máximo 2-3 renglones.
• Utiliza lenguaje simple y natural, como si hablaras con un amigo.
• Evita la excesiva "jerga" en tono de ventas.
• Sigue siempre estrictamente la información brindada en el "conocimiento/context".
• No recomiendes servicios, actividades, atracciones turísticas, gastronomía o restaurantes que no hayas consultado en el "conocimiento/context".
• Responde SOLO preguntas y consultas relacionadas al establecimiento, operaciones de check-in/out, amenities, servicios, ubicación, restaurantes del hotel y actividades en Punta del Este.
• La información del establecimiento es PRIORIDAD ABSOLUTA. Responde sobre el hotel en cada consulta.
• Camila no puede brindar info/recomendaciones que no estén en el "conocimiento/context".
• Conocimiento/context: El servicio tiene fecha y horario de registro de entrada y registro de salida, incluir dichos datos en la conversación.`
      },
      situaciones: [
        {
          titulo: 'SETTER CITA / LEAD',
          descripcion: 'No conocemos la reserva que cliente booking confirmó/ons'
        },
        {
          titulo: 'SETTER CITA / LEAD',
          descripcion: 'El cliente menciona que le envió un mail o mensaje a IFFY Letters, Booking/Airb, ETC pero no sabe'
        },
        {
          titulo: 'SETTER CITA / LEAD',
          descripcion: 'Ticket no emitido o cancelado / Confirmó y Donde lo hicieron de cheque'
        },
        {
          titulo: 'SETTER CITA / LEAD',
          descripcion: 'Hay problemas o Inconvenientes / Cualquier Deseos (Pillow, Amenities de Cheque'
        },
        {
          titulo: 'SETTER CITA / LEAD',
          descripcion: 'Quieren contactarnos a la recepción o frontdesk/recibe mientras lo atenderán que'
        },
        {
          titulo: 'SETTER CITA / LEAD',
          descripcion: 'Cualquier RECLAMO'
        },
        {
          titulo: 'SETTER CITA / LEAD',
          descripcion: 'Consulta pregunta por un familiar'
        }
      ]
    },
    precioDisponibilidad: {
      secciones: [
        {
          key: 'pagos',
          title: 'Pagos y Tarifas',
          borderColor: 'border-l-green-500',
          questions: [
            {
              pregunta: '¿Cómo se determinan las tarifas del establecimiento?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Hay tarifas especiales para grupos, eventos o estadías prolongadas?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Qué métodos de pago se aceptan?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Se requiere algún depósito o pago por adelantado?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Cuál es la política de cancelación?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Hay cargos adicionales que los clientes deben conocer?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Ofrecen descuentos o promociones especiales?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Cómo se manejan los reembolsos en caso de cancelación?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            }
          ]
        },
        {
          key: 'proceso',
          title: 'Proceso de reserva',
          borderColor: 'border-l-orange-500',
          questions: [
            {
              pregunta: '¿Cómo puede un cliente hacer una reserva?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Los clientes pueden realizar reservas a través de nuestro sitio web, por teléfono o enviando un correo electrónico a reservas@edelweiss.uy'
            },
            {
              pregunta: '¿Qué información se necesita para completar una reserva?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Necesitamos nombre completo, fecha de llegada y salida, tipo de habitación preferida y datos de contacto (email y teléfono)'
            },
            {
              pregunta: '¿Cuánto tiempo antes se debe hacer una reserva?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Recomendamos reservar con al menos 48 horas de anticipación, especialmente durante temporada alta'
            }
          ]
        }
      ],
      situaciones: [
        {
          titulo: 'Consultas sobre precios fuera del rango estándar',
          descripcion: 'Si el cliente solicita cotizaciones para más de 10 habitaciones o eventos especiales'
        },
        {
          titulo: 'Solicitudes de descuentos personalizados',
          descripcion: 'Cuando el cliente pide descuentos especiales que no están en las promociones activas'
        }
      ],
      configAvanzada: {
        detenerseCotizacion: true,
        totalMinimo: '5000',
        instruccionesCalculo: 'Calcular el precio total multiplicando la tarifa por noche por el número de noches. Agregar impuestos del 10% y fee de servicio del 5%.',
        mensajeFijo: 'Nota: Todas nuestras tarifas incluyen desayuno buffet y acceso al spa. Los precios pueden variar según disponibilidad y temporada.'
      }
    },
    informacionEstablecimiento: {
      general: {
        title: 'Información general del hotel',
        questions: [
          {
            pregunta: '¿Cuál es el tipo de establecimiento?',
            placeholder: 'Ej: Hotel boutique 5 estrellas',
            defaultValue: 'Hotel boutique 5 estrellas'
          },
          {
            pregunta: '¿Cuál es la historia o el concepto del establecimiento?',
            placeholder: 'Describe la historia o concepto...',
            defaultValue: 'Un hotel boutique 5 estrellas en Punta del Este, Uruguay. Ambiente exclusivo y acogedor inspirado en los Alpes suizos.'
          },
          {
            pregunta: '¿Qué hace único a tu establecimiento?',
            placeholder: 'Describe lo que te diferencia...',
            defaultValue: 'Experimentar la sofisticación alpina con servicios excepcionales en un entorno costero privilegiado.'
          }
        ]
      },
      horarios: {
        title: 'Horarios',
        questions: [
          {
            pregunta: '¿Cuál es el horario de check-in?',
            placeholder: 'Ej: 15:00 hrs',
            defaultValue: '15:00 hrs'
          },
          {
            pregunta: '¿Cuál es el horario de check-out?',
            placeholder: 'Ej: 11:00 hrs',
            defaultValue: '11:00 hrs'
          },
          {
            pregunta: '¿Cuál es el horario de atención de recepción?',
            placeholder: 'Ej: 24 horas',
            defaultValue: '24 horas'
          },
          {
            pregunta: '¿Hay horarios especiales para otros servicios (spa, restaurante, etc.)?',
            placeholder: 'Describe horarios de servicios...',
            defaultValue: 'Spa: 8:00-22:00 hrs. Restaurante desayuno: 7:00-11:00 hrs.'
          }
        ]
      },
      politicas: {
        title: 'Políticas y Normas',
        questions: [
          {
            pregunta: '¿Se aceptan mascotas?',
            placeholder: 'Política de mascotas',
            defaultValue: 'Sí, aceptamos mascotas pequeñas (hasta 10kg) con un cargo adicional de USD 30 por noche'
          },
          {
            pregunta: '¿Hay política de cancelación?',
            placeholder: 'Describe la política de cancelación',
            defaultValue: 'Cancelación gratuita hasta 48 horas antes del check-in.'
          },
          {
            pregunta: '¿Cuáles son las normas de la casa?',
            placeholder: 'Normas del establecimiento',
            defaultValue: 'No fumar en habitaciones. Horario de silencio de 23:00 a 8:00 hrs.'
          },
          {
            pregunta: '¿Hay restricciones de edad para los huéspedes?',
            placeholder: 'Restricciones de edad',
            defaultValue: 'Los menores de 18 años deben estar acompañados por un adulto'
          },
          {
            pregunta: '¿Qué políticas de privacidad y seguridad tienen?',
            placeholder: 'Políticas de seguridad',
            defaultValue: 'Cámaras de seguridad en áreas comunes. Cajas de seguridad en habitaciones.'
          }
        ]
      },
      habitaciones: {
        title: 'Habitaciones y Comodidades',
        questions: [
          {
            pregunta: '¿Qué tipos de habitaciones ofrecen?',
            placeholder: 'Tipos de habitaciones',
            defaultValue: 'Suite Junior, Suite Deluxe, Suite Premium, Suite Presidencial'
          },
          {
            pregunta: '¿Cuántas habitaciones tiene el establecimiento?',
            placeholder: 'Número de habitaciones',
            defaultValue: '24 habitaciones en total'
          },
          {
            pregunta: '¿Qué comodidades incluyen las habitaciones?',
            placeholder: 'Comodidades de habitaciones',
            defaultValue: 'WiFi, TV Smart, minibar, caja fuerte, aire acondicionado'
          },
          {
            pregunta: '¿Las habitaciones tienen accesibilidad para personas con movilidad reducida?',
            placeholder: 'Información de accesibilidad',
            defaultValue: 'Sí, contamos con 2 habitaciones adaptadas'
          },
          {
            pregunta: '¿Hay opciones de habitaciones con vistas especiales?',
            placeholder: 'Tipos de vistas',
            defaultValue: 'Vista al océano, vista al jardín y vista a la piscina'
          },
          {
            pregunta: '¿Qué servicios adicionales se ofrecen en las habitaciones?',
            placeholder: 'Servicios en habitaciones',
            defaultValue: 'Servicio a la habitación 24hrs, limpieza diaria'
          }
        ]
      },
      servicios: {
        title: 'Servicios',
        questions: [
          {
            pregunta: '¿Qué servicios generales ofrece el establecimiento?',
            placeholder: 'Servicios generales',
            defaultValue: 'WiFi gratuito, estacionamiento, spa, gimnasio, piscina'
          },
          {
            pregunta: '¿Ofrecen servicio de transporte?',
            placeholder: 'Servicios de transporte',
            defaultValue: 'Sí, transfer desde/hacia aeropuerto'
          },
          {
            pregunta: '¿Tienen servicio de restaurante o desayuno?',
            placeholder: 'Servicios gastronómicos',
            defaultValue: 'Desayuno buffet incluido. Restaurant gourmet a la carta'
          }
        ]
      }
    },
    informacionExtra: {
      experiencia: {
        title: 'Experiencia del huésped',
        questions: [
          {
            pregunta: '¿Qué experiencia única ofrece tu establecimiento?',
            placeholder: 'Describe la experiencia única...',
            defaultValue: 'Una fusión única de lujo alpino y elegancia costera'
          },
          {
            pregunta: '¿Cuál es el ambiente o estilo del establecimiento?',
            placeholder: 'Describe el ambiente...',
            defaultValue: 'Ambiente boutique exclusivo con diseño arquitectónico europeo'
          }
        ]
      },
      atracciones: {
        title: 'Atracciones y actividades cercanas',
        questions: [
          {
            pregunta: '¿Qué atracciones turísticas hay cerca del establecimiento?',
            placeholder: 'Atracciones cercanas...',
            defaultValue: 'Puerto de Punta del Este, La Mano, Casapueblo'
          },
          {
            pregunta: '¿Hay actividades al aire libre disponibles?',
            placeholder: 'Actividades disponibles...',
            defaultValue: 'Golf, deportes acuáticos, paseos en velero'
          }
        ]
      }
    },
    areasComunes: {
      title: 'Áreas Comunes del Establecimiento',
      areas: [
        {
          tipo: 'Lobby',
          nombre: 'Lobby Principal',
          descripcion: 'Amplio lobby con decoración contemporánea y recepción 24 horas'
        },
        {
          tipo: 'Piscina',
          nombre: 'Piscina Climatizada',
          descripcion: 'Piscina climatizada con vista al mar'
        }
      ],
      tiposDisponibles: [
        { value: 'lobby', label: 'Lobby', description: 'Fotos del lobby y recepción' },
        { value: 'piscina', label: 'Piscina', description: 'Fotos de la piscina' },
        { value: 'spa', label: 'Spa', description: 'Fotos del spa' },
        { value: 'gimnasio', label: 'Gimnasio', description: 'Fotos del gimnasio' },
        { value: 'restaurante', label: 'Restaurante', description: 'Fotos del restaurante' },
        { value: 'habitaciones', label: 'Habitaciones', description: 'Fotos de habitaciones' }
      ]
    }
  },
  
  hair_salon: {
    configuracionAsistente: {
      fields: [
        {
          key: 'nombre',
          label: 'Nombre del asistente',
          defaultValue: 'Camila',
          locked: true
        },
        {
          key: 'tono',
          label: 'Tono',
          defaultValue: 'Amigable',
          locked: true
        },
        {
          key: 'establecimiento',
          label: 'Nombre del salón',
          defaultValue: 'Estilo y Corte',
          locked: true
        },
        {
          key: 'ubicacion',
          label: 'Ubicación',
          defaultValue: 'Montevideo',
          locked: true
        },
        {
          key: 'tipoEstablecimiento',
          label: 'Tipo de establecimiento',
          defaultValue: 'Peluquería moderna',
          locked: true
        },
        {
          key: 'infoHotel',
          label: 'Información del salón',
          defaultValue: 'Peluquería moderna especializada en cortes de tendencia y técnicas de coloración avanzadas. Equipo de estilistas certificados con formación internacional y productos premium.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'propuesta',
          label: 'Propuesta de valor',
          defaultValue: 'Transformar tu look con técnicas profesionales y productos de alta calidad en un ambiente moderno y acogedor.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'web',
          label: 'Página web',
          defaultValue: 'www.estiloycorte.com',
          locked: true
        }
      ],
      directrices: {
        defaultValue: `• Da respuestas cortas y dinámicas de máximo 2-3 renglones.
• Utiliza lenguaje simple y natural, como si hablaras con un amigo.
• Evita la excesiva "jerga" en tono de ventas.
• Sigue siempre estrictamente la información brindada en el "conocimiento/context".
• Responde SOLO preguntas relacionadas a servicios, horarios, precios, estilistas y políticas del salón.
• La información del salón es PRIORIDAD ABSOLUTA.`
      },
      situaciones: [
        {
          titulo: 'Consultas complejas sobre tratamientos',
          descripcion: 'Cuando el cliente pregunta por tratamientos que requieren evaluación previa del estilista'
        },
        {
          titulo: 'Solicitudes de descuentos especiales',
          descripcion: 'Cuando el cliente pide descuentos que no están en las promociones activas'
        },
        {
          titulo: 'Reclamos o quejas',
          descripcion: 'Cualquier reclamo sobre servicios anteriores'
        }
      ]
    },
    precioDisponibilidad: {
      secciones: [
        {
          key: 'pagos',
          title: 'Pagos y Tarifas',
          borderColor: 'border-l-green-500',
          questions: [
            {
              pregunta: '¿Cómo se determinan los precios de los servicios?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Hay diferencias de precio según el estilista?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Qué métodos de pago aceptan?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Efectivo, tarjetas de débito/crédito, transferencias'
            },
            {
              pregunta: '¿Se requiere depósito para servicios largos (coloración, tratamientos)?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Cuál es la política de cancelación de citas?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Cancelación gratuita con 24 horas de anticipación'
            },
            {
              pregunta: '¿Hay cargos adicionales que los clientes deben conocer?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Ofrecen paquetes o promociones?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Paquetes de novia, promociones mensuales, descuentos para nuevos clientes'
            },
            {
              pregunta: '¿Cómo se manejan los reembolsos en caso de cancelación?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            }
          ]
        },
        {
          key: 'proceso',
          title: 'Proceso de agendamiento',
          borderColor: 'border-l-orange-500',
          questions: [
            {
              pregunta: '¿Cómo puede un cliente agendar una cita?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Los clientes pueden agendar a través de nuestro sitio web, por teléfono o WhatsApp'
            },
            {
              pregunta: '¿Qué información se necesita para agendar?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Nombre completo, servicio deseado, fecha y hora preferida, y datos de contacto'
            },
            {
              pregunta: '¿Cuánto tiempo antes se debe agendar?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Recomendamos agendar con al menos 48 horas de anticipación'
            },
            {
              pregunta: '¿Los clientes pueden solicitar un estilista específico?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Sí, los clientes pueden solicitar su estilista preferido al agendar'
            }
          ]
        }
      ],
      situaciones: [
        {
          titulo: 'Consultas sobre precios fuera del rango estándar',
          descripcion: 'Si el cliente solicita cotizaciones para servicios muy complejos o personalizados'
        },
        {
          titulo: 'Solicitudes de descuentos personalizados',
          descripcion: 'Cuando el cliente pide descuentos especiales que no están en las promociones activas'
        }
      ],
      configAvanzada: {
        detenerseCotizacion: false,
        totalMinimo: '',
        instruccionesCalculo: 'Los precios varían según el servicio, duración y estilista. Consultar tarifario actualizado.',
        mensajeFijo: 'Nota: Los precios pueden variar según disponibilidad y temporada. Recomendamos consultar disponibilidad antes de agendar.'
      }
    },
    informacionEstablecimiento: {
      general: {
        title: 'Información general de la peluquería',
        questions: [
          {
            pregunta: '¿Cuál es el concepto o especialidad de la peluquería?',
            placeholder: 'Ej: Peluquería moderna especializada en cortes y coloración',
            defaultValue: 'Peluquería moderna especializada en cortes de tendencia y técnicas de coloración avanzadas'
          },
          {
            pregunta: '¿Qué hace única a tu peluquería?',
            placeholder: 'Describe lo que te diferencia...',
            defaultValue: 'Equipo de estilistas certificados con formación internacional y productos premium'
          }
        ]
      },
      horarios: {
        title: 'Horarios',
        questions: [
          {
            pregunta: '¿Cuál es el horario de atención?',
            placeholder: 'Ej: Lunes a Viernes 9:00-20:00',
            defaultValue: 'Lunes a Viernes: 9:00-20:00hrs. Sábados: 9:00-18:00hrs'
          },
          {
            pregunta: '¿Hay horarios especiales los fines de semana?',
            placeholder: 'Horarios de fin de semana',
            defaultValue: 'Sábados: 9:00-18:00hrs. Domingos: cerrado'
          },
          {
            pregunta: '¿Atienden con cita previa o por orden de llegada?',
            placeholder: 'Sistema de atención',
            defaultValue: 'Trabajamos con sistema de citas, pero aceptamos walk-ins según disponibilidad'
          }
        ]
      },
      servicios: {
        title: 'Servicios',
        questions: [
          {
            pregunta: '¿Qué servicios de corte ofrecen?',
            placeholder: 'Servicios de corte',
            defaultValue: 'Corte dama, caballero, niños. Peinados para eventos. Alisado y brushing'
          },
          {
            pregunta: '¿Qué servicios de coloración ofrecen?',
            placeholder: 'Servicios de color',
            defaultValue: 'Coloración completa, mechas, balayage, ombré, corrección de color'
          },
          {
            pregunta: '¿Ofrecen tratamientos capilares?',
            placeholder: 'Tratamientos disponibles',
            defaultValue: 'Keratina, botox capilar, hidratación profunda, tratamiento anticaída'
          },
          {
            pregunta: '¿Tienen servicios adicionales?',
            placeholder: 'Otros servicios',
            defaultValue: 'Maquillaje, depilación de cejas, extensiones, asesoría de imagen'
          }
        ]
      },
      politicas: {
        title: 'Políticas del Salón',
        questions: [
          {
            pregunta: '¿Cuál es la política de cancelación de citas?',
            placeholder: 'Política de cancelación',
            defaultValue: 'Cancelación gratuita con 24 horas de anticipación'
          },
          {
            pregunta: '¿Cuál es la política de llegadas tarde?',
            placeholder: 'Política de puntualidad',
            defaultValue: 'Tolerancia de 10 minutos. Después puede requerir reprogramación'
          },
          {
            pregunta: '¿Qué métodos de pago aceptan?',
            placeholder: 'Métodos de pago',
            defaultValue: 'Efectivo, tarjetas de débito/crédito, transferencias'
          }
        ]
      },
      equipo: {
        title: 'Equipo Profesional',
        questions: [
          {
            pregunta: '¿Cuántos estilistas trabajan en el salón?',
            placeholder: 'Número de profesionales',
            defaultValue: '5 estilistas profesionales certificados'
          },
          {
            pregunta: '¿Qué certificaciones o experiencia tiene el equipo?',
            placeholder: 'Experiencia del equipo',
            defaultValue: 'Equipo con certificaciones internacionales y más de 10 años de experiencia'
          },
          {
            pregunta: '¿Los clientes pueden solicitar un estilista específico?',
            placeholder: 'Preferencia de estilista',
            defaultValue: 'Sí, los clientes pueden solicitar su estilista preferido al agendar'
          }
        ]
      }
    },
    informacionExtra: {
      productos: {
        title: 'Productos y Marcas',
        questions: [
          {
            pregunta: '¿Qué marcas de productos utilizan?',
            placeholder: 'Marcas de productos',
            defaultValue: 'Loreal Professional, Kerastase, Schwarzkopf, Redken'
          },
          {
            pregunta: '¿Venden productos para el cuidado en casa?',
            placeholder: 'Venta de productos',
            defaultValue: 'Sí, vendemos línea completa de shampoos, acondicionadores y tratamientos'
          }
        ]
      },
      ambiente: {
        title: 'Ambiente y Comodidades',
        questions: [
          {
            pregunta: '¿Qué comodidades ofrece el salón?',
            placeholder: 'Comodidades disponibles',
            defaultValue: 'WiFi gratuito, café, revistas, zona de espera cómoda, estacionamiento'
          },
          {
            pregunta: '¿Cómo es el ambiente del salón?',
            placeholder: 'Describe el ambiente',
            defaultValue: 'Ambiente moderno, relajado y profesional con música ambiente'
          }
        ]
      },
      precios: {
        title: 'Información de Precios',
        questions: [
          {
            pregunta: '¿Cuál es el rango de precios de los servicios principales?',
            placeholder: 'Rango de precios',
            defaultValue: 'Corte dama: $800-1200. Coloración: $1500-3000. Tratamientos: $1000-2500'
          },
          {
            pregunta: '¿Ofrecen paquetes o promociones?',
            placeholder: 'Paquetes disponibles',
            defaultValue: 'Paquetes de novia, promociones mensuales, descuentos para nuevos clientes'
          }
        ]
      }
    },
    areasComunes: {
      title: 'Áreas del Salón',
      areas: [
        {
          tipo: 'Recepción',
          nombre: 'Área de Recepción',
          descripcion: 'Recepción moderna con zona de espera confortable'
        },
        {
          tipo: 'Zona de Corte',
          nombre: 'Estaciones de Corte',
          descripcion: 'Estaciones de trabajo equipadas con espejos y sillones profesionales'
        }
      ],
      tiposDisponibles: [
        { value: 'recepcion', label: 'Recepción', description: 'Fotos del área de recepción' },
        { value: 'corte', label: 'Zona de Corte', description: 'Fotos de estaciones de corte' },
        { value: 'lavado', label: 'Zona de Lavado', description: 'Fotos del área de lavado' },
        { value: 'coloracion', label: 'Zona de Color', description: 'Fotos del área de coloración' },
        { value: 'productos', label: 'Productos', description: 'Fotos de productos a la venta' }
      ]
    }
  },

  restaurant: {
    configuracionAsistente: {
      fields: [
        {
          key: 'nombre',
          label: 'Nombre del asistente',
          defaultValue: 'Camila',
          locked: true
        },
        {
          key: 'tono',
          label: 'Tono',
          defaultValue: 'Amigable',
          locked: true
        },
        {
          key: 'establecimiento',
          label: 'Nombre del restaurante',
          defaultValue: 'La Trattoria',
          locked: true
        },
        {
          key: 'ubicacion',
          label: 'Ubicación',
          defaultValue: 'Ciudad Vieja',
          locked: true
        },
        {
          key: 'tipoEstablecimiento',
          label: 'Tipo de establecimiento',
          defaultValue: 'Restaurante italiano',
          locked: true
        },
        {
          key: 'infoHotel',
          label: 'Información del restaurante',
          defaultValue: 'Restaurante familiar que fusiona recetas tradicionales italianas con toques modernos. Pasta fresca hecha diariamente, horno de leña tradicional, vinos importados de Italia.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'propuesta',
          label: 'Propuesta de valor',
          defaultValue: 'Disfrutar de auténtica cocina italiana en un ambiente cálido y familiar, con ingredientes frescos y técnicas tradicionales.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'web',
          label: 'Página web',
          defaultValue: 'www.latrattoria.com',
          locked: true
        }
      ],
      directrices: {
        defaultValue: `• Da respuestas cortas y dinámicas de máximo 2-3 renglones.
• Utiliza lenguaje simple y natural, como si hablaras con un amigo.
• Evita la excesiva "jerga" en tono de ventas.
• Sigue siempre estrictamente la información brindada en el "conocimiento/context".
• Responde SOLO preguntas relacionadas al menú, horarios, reservas, servicios y políticas del restaurante.
• La información del restaurante es PRIORIDAD ABSOLUTA.`
      },
      situaciones: [
        {
          titulo: 'Consultas sobre eventos grandes',
          descripcion: 'Cuando el cliente solicita reservas para más de 20 personas o eventos especiales'
        },
        {
          titulo: 'Solicitudes de descuentos especiales',
          descripcion: 'Cuando el cliente pide descuentos que no están en las promociones activas'
        },
        {
          titulo: 'Reclamos o quejas',
          descripcion: 'Cualquier reclamo sobre experiencias anteriores'
        }
      ]
    },
    precioDisponibilidad: {
      secciones: [
        {
          key: 'pagos',
          title: 'Pagos y Tarifas',
          borderColor: 'border-l-green-500',
          questions: [
            {
              pregunta: '¿Cómo se determinan los precios del menú?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Hay menú del día o promociones especiales?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Menú ejecutivo de lunes a viernes. Happy hour de 18:00 a 20:00hrs'
            },
            {
              pregunta: '¿Qué métodos de pago aceptan?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Efectivo, tarjetas de débito/crédito, tickets de alimentación'
            },
            {
              pregunta: '¿Se requiere depósito para reservas de grupos grandes?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Cuál es la política de cancelación de reservas?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Cancelación sin cargo con 2 horas de anticipación'
            },
            {
              pregunta: '¿Hay cargos adicionales (propina, servicio)?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Ofrecen descuentos o promociones?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Cómo se manejan los reembolsos en caso de cancelación?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            }
          ]
        },
        {
          key: 'proceso',
          title: 'Proceso de reserva',
          borderColor: 'border-l-orange-500',
          questions: [
            {
              pregunta: '¿Cómo puede un cliente hacer una reserva?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Sí, recomendamos reservar especialmente fines de semana'
            },
            {
              pregunta: '¿Qué información se necesita para completar una reserva?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Nombre completo, número de comensales, fecha y hora preferida, y datos de contacto'
            },
            {
              pregunta: '¿Cuánto tiempo antes se debe hacer una reserva?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Recomendamos reservar con al menos 24 horas de anticipación, especialmente fines de semana'
            },
            {
              pregunta: '¿Aceptan walk-ins o solo con reserva?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Aceptamos walk-ins según disponibilidad, pero recomendamos reservar'
            }
          ]
        }
      ],
      situaciones: [
        {
          titulo: 'Consultas sobre eventos grandes',
          descripcion: 'Si el cliente solicita reservas para más de 20 personas o eventos especiales'
        },
        {
          titulo: 'Solicitudes de descuentos personalizados',
          descripcion: 'Cuando el cliente pide descuentos especiales que no están en las promociones activas'
        }
      ],
      configAvanzada: {
        detenerseCotizacion: false,
        totalMinimo: '',
        instruccionesCalculo: 'Los precios varían según el plato y el menú. Consultar menú actualizado.',
        mensajeFijo: 'Nota: Los precios pueden variar según disponibilidad y temporada. Recomendamos consultar disponibilidad antes de reservar.'
      }
    },
    informacionEstablecimiento: {
      general: {
        title: 'Información general del restaurante',
        questions: [
          {
            pregunta: '¿Qué tipo de cocina ofrecen?',
            placeholder: 'Ej: Cocina italiana contemporánea',
            defaultValue: 'Cocina italiana contemporánea con ingredientes locales'
          },
          {
            pregunta: '¿Cuál es el concepto del restaurante?',
            placeholder: 'Describe el concepto...',
            defaultValue: 'Restaurante familiar que fusiona recetas tradicionales italianas con toques modernos'
          },
          {
            pregunta: '¿Qué hace único a tu restaurante?',
            placeholder: 'Describe lo que te diferencia...',
            defaultValue: 'Pasta fresca hecha diariamente, horno de leña tradicional, vinos importados de Italia'
          }
        ]
      },
      horarios: {
        title: 'Horarios',
        questions: [
          {
            pregunta: '¿Cuál es el horario de almuerzo?',
            placeholder: 'Horario de almuerzo',
            defaultValue: 'Lunes a Domingo: 12:00-16:00hrs'
          },
          {
            pregunta: '¿Cul es el horario de cena?',
            placeholder: 'Horario de cena',
            defaultValue: 'Lunes a Domingo: 19:00-23:30hrs'
          },
          {
            pregunta: '¿Hay días de cierre?',
            placeholder: 'Días de cierre',
            defaultValue: 'Cerrado los martes'
          },
          {
            pregunta: '¿Tienen horarios especiales en fechas festivas?',
            placeholder: 'Horarios especiales',
            defaultValue: 'Consultar horarios especiales para Navidad, Año Nuevo y fechas festivas'
          }
        ]
      },
      menu: {
        title: 'Menú y Especialidades',
        questions: [
          {
            pregunta: '¿Cuáles son las especialidades de la casa?',
            placeholder: 'Platos destacados',
            defaultValue: 'Ravioles de ricota y espinaca, Ossobuco, Tiramisú casero'
          },
          {
            pregunta: '¿Qué categorías tiene el menú?',
            placeholder: 'Secciones del menú',
            defaultValue: 'Entradas, Pastas, Risottos, Carnes, Pescados, Postres'
          },
          {
            pregunta: '¿Tienen menú del día o promociones especiales?',
            placeholder: 'Promociones',
            defaultValue: 'Menú ejecutivo de lunes a viernes. Happy hour de 18:00 a 20:00hrs'
          },
          {
            pregunta: '¿Ofrecen opciones vegetarianas, veganas o sin gluten?',
            placeholder: 'Opciones especiales',
            defaultValue: 'Sí, tenemos opciones vegetarianas, veganas y pasta sin gluten disponible'
          }
        ]
      },
      servicios: {
        title: 'Servicios',
        questions: [
          {
            pregunta: '¿Aceptan reservas?',
            placeholder: 'Sistema de reservas',
            defaultValue: 'Sí, recomendamos reservar especialmente fines de semana'
          },
          {
            pregunta: '¿Tienen servicio de delivery?',
            placeholder: 'Servicio a domicilio',
            defaultValue: 'Sí, delivery propio y mediante apps (PedidosYa, Uber Eats)'
          },
          {
            pregunta: '¿Ofrecen catering para eventos?',
            placeholder: 'Servicios de catering',
            defaultValue: 'Sí, catering para eventos corporativos y sociales'
          },
          {
            pregunta: '¿Tienen salón privado para eventos?',
            placeholder: 'Espacios privados',
            defaultValue: 'Salón privado para hasta 40 personas'
          },
          {
            pregunta: '¿Qué métodos de pago aceptan?',
            placeholder: 'Formas de pago',
            defaultValue: 'Efectivo, tarjetas de débito/crédito, tickets de alimentación'
          }
        ]
      },
      capacidad: {
        title: 'Capacidad e Instalaciones',
        questions: [
          {
            pregunta: '¿Cuál es la capacidad del restaurante?',
            placeholder: 'Número de comensales',
            defaultValue: '80 personas en salón principal, 30 en terraza'
          },
          {
            pregunta: '¿Tienen estacionamiento?',
            placeholder: 'Información de estacionamiento',
            defaultValue: 'Estacionamiento en la calle y convenio con parking cercano'
          },
          {
            pregunta: '¿El local es accesible para personas con movilidad reducida?',
            placeholder: 'Accesibilidad',
            defaultValue: 'Sí, rampa de acceso y baño adaptado'
          }
        ]
      }
    },
    informacionExtra: {
      ambiente: {
        title: 'Ambiente y Experiencia',
        questions: [
          {
            pregunta: '¿Cómo es el ambiente del restaurante?',
            placeholder: 'Describe el ambiente',
            defaultValue: 'Ambiente cálido y familiar, decoración rústica italiana, iluminación tenue'
          },
          {
            pregunta: '¿Es apto para familias con niños?',
            placeholder: 'Servicios para niños',
            defaultValue: 'Sí, menú infantil, sillas altas, área de juegos pequeña'
          },
          {
            pregunta: '¿Tienen música en vivo u otros entretenimientos?',
            placeholder: 'Entretenimiento',
            defaultValue: 'Música italiana de fondo. Jazz en vivo los viernes por la noche'
          }
        ]
      },
      bebidas: {
        title: 'Carta de Bebidas',
        questions: [
          {
            pregunta: '¿Qué opciones de bebidas ofrecen?',
            placeholder: 'Tipos de bebidas',
            defaultValue: 'Vinos italianos y uruguayos, cervezas artesanales, cócteles, jugos naturales'
          },
          {
            pregunta: '¿Tienen sommelier o recomendaciones de maridaje?',
            placeholder: 'Servicio de vinos',
            defaultValue: 'Sí, nuestro sommelier puede recomendar el vino perfecto para cada plato'
          }
        ]
      },
      politicas: {
        title: 'Políticas',
        questions: [
          {
            pregunta: '¿Cuál es la política de cancelación de reservas?',
            placeholder: 'Política de cancelación',
            defaultValue: 'Cancelación sin cargo con 2 horas de anticipación'
          },
          {
            pregunta: '¿Aceptan mascotas?',
            placeholder: 'Política de mascotas',
            defaultValue: 'Sí, aceptamos mascotas en la terraza'
          },
          {
            pregunta: '¿Tienen código de vestimenta?',
            placeholder: 'Dress code',
            defaultValue: 'Casual elegante. No se requiere vestimenta formal'
          }
        ]
      }
    },
    areasComunes: {
      title: 'Áreas del Restaurante',
      areas: [
        {
          tipo: 'Salón Principal',
          nombre: 'Comedor Principal',
          descripcion: 'Salón principal con capacidad para 80 personas'
        },
        {
          tipo: 'Terraza',
          nombre: 'Terraza Exterior',
          descripcion: 'Terraza al aire libre con vista panorámica'
        }
      ],
      tiposDisponibles: [
        { value: 'salon', label: 'Salón Principal', description: 'Fotos del comedor principal' },
        { value: 'terraza', label: 'Terraza', description: 'Fotos de la terraza' },
        { value: 'bar', label: 'Área de Bar', description: 'Fotos del bar' },
        { value: 'cocina', label: 'Cocina Abierta', description: 'Fotos de la cocina' },
        { value: 'privado', label: 'Salón Privado', description: 'Fotos del salón de eventos' },
        { value: 'platos', label: 'Platos', description: 'Fotos de los platos' }
      ]
    }
  },

  dental_clinic: {
    configuracionAsistente: {
      fields: [
        {
          key: 'nombre',
          label: 'Nombre del asistente',
          defaultValue: 'Camila',
          locked: true
        },
        {
          key: 'tono',
          label: 'Tono',
          defaultValue: 'Profesional',
          locked: true
        },
        {
          key: 'establecimiento',
          label: 'Nombre de la clínica',
          defaultValue: 'Clínica Dental Sonrisa',
          locked: true
        },
        {
          key: 'ubicacion',
          label: 'Ubicación',
          defaultValue: 'Montevideo',
          locked: true
        },
        {
          key: 'tipoEstablecimiento',
          label: 'Tipo de establecimiento',
          defaultValue: 'Clínica dental integral',
          locked: true
        },
        {
          key: 'infoHotel',
          label: 'Información de la clínica',
          defaultValue: 'Clínica dental integral con especialidades en ortodoncia e implantes. Tecnología de punta, equipo multidisciplinario, atención personalizada.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'propuesta',
          label: 'Propuesta de valor',
          defaultValue: 'Brindar atención odontológica integral de alta calidad con tecnología avanzada y un equipo profesional especializado.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'web',
          label: 'Página web',
          defaultValue: 'www.clinicasonrisa.com',
          locked: true
        }
      ],
      directrices: {
        defaultValue: `• Da respuestas cortas y dinámicas de máximo 2-3 renglones.
• Utiliza lenguaje simple y natural, como si hablaras con un amigo.
• Evita la excesiva "jerga" médica.
• Sigue siempre estrictamente la información brindada en el "conocimiento/context".
• Responde SOLO preguntas relacionadas a servicios, horarios, precios, especialidades y políticas de la clínica.
• NO proporciona diagnósticos ni asesoramiento médico (solo el odontólogo puede hacerlo).
• La información de la clínica es PRIORIDAD ABSOLUTA.`
      },
      situaciones: [
        {
          titulo: 'Consultas sobre diagnósticos o tratamientos complejos',
          descripcion: 'Cuando el cliente pregunta por diagnósticos o tratamientos que requieren evaluación del odontólogo'
        },
        {
          titulo: 'Urgencias dentales',
          descripcion: 'Cuando el cliente reporta una urgencia dental que requiere atención inmediata'
        },
        {
          titulo: 'Solicitudes de descuentos especiales',
          descripcion: 'Cuando el cliente pide descuentos que no están en las promociones activas'
        }
      ]
    },
    precioDisponibilidad: {
      secciones: [
        {
          key: 'pagos',
          title: 'Pagos y Tarifas',
          borderColor: 'border-l-green-500',
          questions: [
            {
              pregunta: '¿Cómo se determinan los precios de los tratamientos?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Qué seguros médicos aceptan?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Aceptamos todas las mutualistas y seguros médicos privados'
            },
            {
              pregunta: '¿Qué formas de pago aceptan?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Efectivo, tarjetas, transferencias. Planes de financiación disponibles'
            },
            {
              pregunta: '¿Se requiere pago por adelantado?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Cuál es la política de cancelación de citas?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Cancelación gratuita con 24 horas de anticipación'
            },
            {
              pregunta: '¿Hay cargos adicionales que los pacientes deben conocer?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Ofrecen planes de financiación?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Sí, planes de pago en cuotas para tratamientos mayores'
            },
            {
              pregunta: '¿Cuál es el costo de la primera consulta?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Primera consulta: $800. Incluye evaluación y radiografías'
            }
          ]
        },
        {
          key: 'proceso',
          title: 'Proceso de agendamiento',
          borderColor: 'border-l-orange-500',
          questions: [
            {
              pregunta: '¿Cómo puede un paciente agendar una consulta?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Los pacientes pueden agendar a través de nuestro sitio web, por teléfono o WhatsApp'
            },
            {
              pregunta: '¿Qué información se necesita para agendar?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Nombre completo, motivo de consulta, fecha y hora preferida, y datos de contacto'
            },
            {
              pregunta: '¿Cuánto tiempo antes se debe agendar?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Recomendamos agendar con al menos 48 horas de anticipación'
            },
            {
              pregunta: '¿Los pacientes pueden elegir su odontólogo?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Sí, los pacientes pueden solicitar atención con el profesional de su preferencia'
            }
          ]
        }
      ],
      situaciones: [
        {
          titulo: 'Consultas sobre tratamientos complejos',
          descripcion: 'Si el cliente solicita cotizaciones para tratamientos que requieren evaluación previa del odontólogo'
        },
        {
          titulo: 'Solicitudes de descuentos personalizados',
          descripcion: 'Cuando el cliente pide descuentos especiales que no están en las promociones activas'
        }
      ],
      configAvanzada: {
        detenerseCotizacion: false,
        totalMinimo: '',
        instruccionesCalculo: 'Los precios varían según el tratamiento y la complejidad. Consultar tarifario actualizado.',
        mensajeFijo: 'Nota: Los precios pueden variar según el tratamiento y la complejidad. Recomendamos consultar disponibilidad antes de agendar.'
      }
    },
    informacionEstablecimiento: {
      general: {
        title: 'Información general de la clínica dental',
        questions: [
          {
            pregunta: '¿Cuál es la especialidad o enfoque de la clínica?',
            placeholder: 'Especialidades',
            defaultValue: 'Clínica dental integral con especialidades en ortodoncia e implantes'
          },
          {
            pregunta: '¿Qué hace única a tu clínica?',
            placeholder: 'Diferenciadores',
            defaultValue: 'Tecnología de punta, equipo multidisciplinario, atención personalizada'
          }
        ]
      },
      horarios: {
        title: 'Horarios',
        questions: [
          {
            pregunta: '¿Cuál es el horario de atención?',
            placeholder: 'Horarios',
            defaultValue: 'Lunes a Viernes: 9:00-19:00hrs. Sábados: 9:00-13:00hrs'
          },
          {
            pregunta: '¿Atienden urgencias fuera del horario?',
            placeholder: 'Urgencias',
            defaultValue: 'Sí, tenemos servicio de urgencias 24/7 llamando al número de emergencias'
          },
          {
            pregunta: '¿Trabajan con sistema de citas?',
            placeholder: 'Sistema de turnos',
            defaultValue: 'Sí, trabajamos exclusivamente con turnos programados'
          }
        ]
      },
      servicios: {
        title: 'Servicios Odontológicos',
        questions: [
          {
            pregunta: '¿Qué servicios de odontología general ofrecen?',
            placeholder: 'Servicios generales',
            defaultValue: 'Limpiezas, obturaciones, endodoncias, extracciones, prótesis'
          },
          {
            pregunta: '¿Qué especialidades tienen disponibles?',
            placeholder: 'Especialidades',
            defaultValue: 'Ortodoncia, implantología, periodoncia, odontopediatría, estética dental'
          },
          {
            pregunta: '¿Ofrecen tratamientos estéticos?',
            placeholder: 'Estética dental',
            defaultValue: 'Blanqueamiento, carillas, diseño de sonrisa, coronas de porcelana'
          },
          {
            pregunta: '¿Realizan cirugías?',
            placeholder: 'Servicios quirúrgicos',
            defaultValue: 'Sí, implantes dentales, extracciones complejas, cirugía periodontal'
          }
        ]
      },
      equipo: {
        title: 'Equipo Profesional',
        questions: [
          {
            pregunta: '¿Cuántos odontólogos trabajan en la clínica?',
            placeholder: 'Número de profesionales',
            defaultValue: '6 odontólogos especialistas certificados'
          },
          {
            pregunta: '¿Qué especialidades tiene el equipo?',
            placeholder: 'Especialidades del equipo',
            defaultValue: 'Ortodoncista, implantólogo, periodoncista, endodoncista, odontopediatra'
          },
          {
            pregunta: '¿Los pacientes pueden elegir su odontólogo?',
            placeholder: 'Elección de profesional',
            defaultValue: 'Sí, los pacientes pueden solicitar atención con el profesional de su preferencia'
          }
        ]
      },
      tecnologia: {
        title: 'Tecnología y Equipamiento',
        questions: [
          {
            pregunta: '¿Qué tecnología utilizan?',
            placeholder: 'Equipamiento',
            defaultValue: 'Radiografías digitales, escáner 3D, microscopio dental, sedación consciente'
          },
          {
            pregunta: '¿Cuentan con sala de esterilización?',
            placeholder: 'Bioseguridad',
            defaultValue: 'Sí, sala de esterilización con protocolos internacionales de bioseguridad'
          }
        ]
      }
    },
    informacionExtra: {
      cobertura: {
        title: 'Coberturas y Pagos',
        questions: [
          {
            pregunta: '¿Qué seguros médicos aceptan?',
            placeholder: 'Mutualistas y seguros',
            defaultValue: 'Aceptamos todas las mutualistas y seguros médicos privados'
          },
          {
            pregunta: '¿Qué formas de pago aceptan?',
            placeholder: 'Métodos de pago',
            defaultValue: 'Efectivo, tarjetas, transferencias. Planes de financiación disponibles'
          },
          {
            pregunta: '¿Ofrecen planes de financiación?',
            placeholder: 'Financiación',
            defaultValue: 'Sí, planes de pago en cuotas para tratamientos mayores'
          }
        ]
      },
      primerapresupuesto: {
        title: 'Primera Visita',
        questions: [
          {
            pregunta: '¿Qué incluye la primera consulta?',
            placeholder: 'Primera visita',
            defaultValue: 'Evaluación completa, radiografías de diagnóstico, plan de tratamiento'
          },
          {
            pregunta: '¿Cuál es el costo de la primera consulta?',
            placeholder: 'Costo inicial',
            defaultValue: 'Primera consulta: $800. Incluye evaluación y radiografías'
          }
        ]
      },
      emergencias: {
        title: 'Urgencias y Emergencias',
        questions: [
          {
            pregunta: '¿Cómo manejan las urgencias dentales?',
            placeholder: 'Protocolo de urgencias',
            defaultValue: 'Atención de urgencias el mismo día. Línea de emergencias 24/7'
          },
          {
            pregunta: '¿Qué se considera una urgencia dental?',
            placeholder: 'Tipos de urgencias',
            defaultValue: 'Dolor intenso, trauma dental, infecciones, sangrado, pérdida de prótesis'
          }
        ]
      }
    },
    areasComunes: {
      title: 'Áreas de la Clínica',
      areas: [
        {
          tipo: 'Recepción',
          nombre: 'Sala de Espera',
          descripcion: 'Recepción y sala de espera confortable'
        },
        {
          tipo: 'Consultorios',
          nombre: 'Consultorios Equipados',
          descripcion: 'Consultorios con tecnología de última generación'
        }
      ],
      tiposDisponibles: [
        { value: 'recepcion', label: 'Recepción', description: 'Fotos de recepción y sala de espera' },
        { value: 'consultorio', label: 'Consultorios', description: 'Fotos de los consultorios' },
        { value: 'rayosx', label: 'Sala de Rayos X', description: 'Equipamiento radiológico' },
        { value: 'cirugia', label: 'Sala de Cirugía', description: 'Quirófano dental' },
        { value: 'esterilizacion', label: 'Esterilización', description: 'Sala de esterilización' }
      ]
    }
  },

  // Agrego configuración para "other" como genérico
  other: {
    configuracionAsistente: {
      fields: [
        {
          key: 'nombre',
          label: 'Nombre del asistente',
          defaultValue: 'Camila',
          locked: true
        },
        {
          key: 'tono',
          label: 'Tono',
          defaultValue: 'Amigable',
          locked: true
        },
        {
          key: 'establecimiento',
          label: 'Nombre del negocio',
          defaultValue: 'Mi Negocio',
          locked: true
        },
        {
          key: 'ubicacion',
          label: 'Ubicación',
          defaultValue: 'Ciudad',
          locked: true
        },
        {
          key: 'tipoEstablecimiento',
          label: 'Tipo de establecimiento',
          defaultValue: 'Negocio',
          locked: true
        },
        {
          key: 'infoHotel',
          label: 'Información del negocio',
          defaultValue: 'Descripción de la actividad del negocio',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'propuesta',
          label: 'Propuesta de valor',
          defaultValue: 'Lo que nos hace diferentes',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'web',
          label: 'Página web',
          defaultValue: 'www.mi-negocio.com',
          locked: true
        }
      ],
      directrices: {
        defaultValue: `• Da respuestas cortas y dinámicas de máximo 2-3 renglones.
• Utiliza lenguaje simple y natural, como si hablaras con un amigo.
• Evita la excesiva "jerga" en tono de ventas.
• Sigue siempre estrictamente la información brindada en el "conocimiento/context".
• Responde SOLO preguntas relacionadas a servicios, horarios, precios y políticas del negocio.
• La información del negocio es PRIORIDAD ABSOLUTA.`
      },
      situaciones: [
        {
          titulo: 'Consultas complejas',
          descripcion: 'Cuando el cliente pregunta por servicios que requieren evaluación personalizada'
        },
        {
          titulo: 'Solicitudes de descuentos especiales',
          descripcion: 'Cuando el cliente pide descuentos que no están en las promociones activas'
        },
        {
          titulo: 'Reclamos o quejas',
          descripcion: 'Cualquier reclamo sobre servicios anteriores'
        }
      ]
    },
    precioDisponibilidad: {
      secciones: [
        {
          key: 'pagos',
          title: 'Pagos y Tarifas',
          borderColor: 'border-l-green-500',
          questions: [
            {
              pregunta: '¿Cómo se determinan los precios?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Qué métodos de pago aceptan?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Efectivo, tarjetas de débito/crédito'
            },
            {
              pregunta: '¿Se requiere pago por adelantado?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Cuál es la política de cancelación?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Hay cargos adicionales?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Ofrecen descuentos o promociones?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            }
          ]
        },
        {
          key: 'proceso',
          title: 'Proceso de agendamiento',
          borderColor: 'border-l-orange-500',
          questions: [
            {
              pregunta: '¿Cómo puede un cliente agendar?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Los clientes pueden agendar a través de nuestro sitio web, por teléfono o WhatsApp'
            },
            {
              pregunta: '¿Qué información se necesita para agendar?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Nombre completo, servicio deseado, fecha y hora preferida, y datos de contacto'
            },
            {
              pregunta: '¿Cuánto tiempo antes se debe agendar?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Recomendamos agendar con al menos 48 horas de anticipación'
            }
          ]
        }
      ],
      situaciones: [
        {
          titulo: 'Consultas complejas',
          descripcion: 'Si el cliente solicita servicios que requieren evaluación personalizada'
        },
        {
          titulo: 'Solicitudes de descuentos personalizados',
          descripcion: 'Cuando el cliente pide descuentos especiales que no están en las promociones activas'
        }
      ],
      configAvanzada: {
        detenerseCotizacion: false,
        totalMinimo: '',
        instruccionesCalculo: 'Los precios varían según el servicio. Consultar tarifario actualizado.',
        mensajeFijo: 'Nota: Los precios pueden variar según disponibilidad. Recomendamos consultar disponibilidad antes de agendar.'
      }
    },
    informacionEstablecimiento: {
      general: {
        title: 'Información general del negocio',
        questions: [
          {
            pregunta: '¿A qué se dedica el negocio?',
            placeholder: 'Describe la actividad principal',
            defaultValue: 'Descripción de la actividad del negocio'
          },
          {
            pregunta: '¿Qué hace único a tu negocio?',
            placeholder: 'Diferenciadores',
            defaultValue: 'Lo que nos hace diferentes'
          }
        ]
      },
      horarios: {
        title: 'Horarios',
        questions: [
          {
            pregunta: '¿Cuál es el horario de atención?',
            placeholder: 'Horarios',
            defaultValue: 'Lunes a Viernes: 9:00-18:00hrs'
          }
        ]
      },
      servicios: {
        title: 'Servicios',
        questions: [
          {
            pregunta: '¿Qué servicios o productos ofrecen?',
            placeholder: 'Servicios principales',
            defaultValue: 'Descripción de servicios'
          }
        ]
      }
    },
    informacionExtra: {
      adicional: {
        title: 'Información Adicional',
        questions: [
          {
            pregunta: '¿Hay información adicional relevante?',
            placeholder: 'Información extra',
            defaultValue: ''
          }
        ]
      }
    },
    areasComunes: {
      title: 'Áreas del Establecimiento',
      areas: [],
      tiposDisponibles: [
        { value: 'general', label: 'Área General', description: 'Fotos generales del establecimiento' }
      ]
    }
  },
  
  fitness_center: {
    configuracionAsistente: {
      fields: [
        {
          key: 'nombre',
          label: 'Nombre del asistente',
          defaultValue: 'Camila',
          locked: true
        },
        {
          key: 'tono',
          label: 'Tono',
          defaultValue: 'Energético',
          locked: true
        },
        {
          key: 'establecimiento',
          label: 'Nombre del gimnasio',
          defaultValue: 'FitZone',
          locked: true
        },
        {
          key: 'ubicacion',
          label: 'Ubicación',
          defaultValue: 'Montevideo',
          locked: true
        },
        {
          key: 'tipoEstablecimiento',
          label: 'Tipo de establecimiento',
          defaultValue: 'Gimnasio moderno',
          locked: true
        },
        {
          key: 'infoHotel',
          label: 'Información del gimnasio',
          defaultValue: 'Gimnasio moderno con equipamiento de última generación, clases grupales y entrenamiento personalizado. Ambiente motivador para alcanzar tus objetivos fitness.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'propuesta',
          label: 'Propuesta de valor',
          defaultValue: 'Transforma tu cuerpo y mente con entrenamientos personalizados, clases variadas y un ambiente que te motiva a superar tus límites.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'web',
          label: 'Página web',
          defaultValue: 'www.fitzone.com',
          locked: true
        }
      ],
      directrices: {
        defaultValue: `• Da respuestas cortas y dinámicas de máximo 2-3 renglones.
• Utiliza lenguaje motivador y energético.
• Evita la excesiva "jerga" en tono de ventas.
• Sigue siempre estrictamente la información brindada en el "conocimiento/context".
• Responde SOLO preguntas relacionadas a clases, horarios, membresías, entrenadores y servicios del gimnasio.
• La información del gimnasio es PRIORIDAD ABSOLUTA.`
      },
      situaciones: [
        {
          titulo: 'Consultas sobre planes personalizados complejos',
          descripcion: 'Cuando el cliente pregunta por planes de entrenamiento que requieren evaluación previa del entrenador'
        },
        {
          titulo: 'Solicitudes de descuentos especiales',
          descripcion: 'Cuando el cliente pide descuentos que no están en las promociones activas'
        },
        {
          titulo: 'Consultas médicas o lesiones',
          descripcion: 'Cualquier consulta sobre condiciones médicas o lesiones que requieren atención profesional'
        }
      ]
    },
    precioDisponibilidad: {
      secciones: [
        {
          key: 'membresias',
          title: 'Membresías y Precios',
          borderColor: 'border-l-green-500',
          questions: [
            {
              pregunta: '¿Qué tipos de membresías ofrecen?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Membresía mensual, trimestral, semestral y anual'
            },
            {
              pregunta: '¿Cuáles son los precios de cada membresía?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Hay pases diarios o por clase?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Sí, ofrecemos pases diarios y pases por clase individual'
            },
            {
              pregunta: '¿Qué métodos de pago aceptan?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Efectivo, tarjetas de débito/crédito, transferencias'
            },
            {
              pregunta: '¿Hay descuentos para estudiantes, jubilados o grupos?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Cuál es la política de cancelación de membresía?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Cancelación con 30 días de anticipación'
            },
            {
              pregunta: '¿Ofrecen períodos de prueba o promociones?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Primera clase gratuita, promociones de bienvenida'
            }
          ]
        },
        {
          key: 'horarios',
          title: 'Horarios de Clases y Disponibilidad',
          borderColor: 'border-l-orange-500',
          questions: [
            {
              pregunta: '¿Cuáles son los horarios de clases grupales?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Qué tipos de clases ofrecen?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'HIIT, Yoga, Pilates, Spinning, Zumba, CrossFit, Funcional'
            },
            {
              pregunta: '¿Cuáles son los horarios de uso libre del gimnasio?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Lunes a Viernes: 6:00-23:00, Sábados: 8:00-20:00, Domingos: 9:00-18:00'
            },
            {
              pregunta: '¿Cómo se reservan las clases?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'A través de nuestra app, sitio web o en recepción'
            },
            {
              pregunta: '¿Hay límite de cupos por clase?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Sí, las clases tienen cupos limitados. Recomendamos reservar con anticipación'
            }
          ]
        }
      ],
      situaciones: [
        {
          titulo: 'Consultas sobre planes personalizados complejos',
          descripcion: 'Si el cliente solicita planes de entrenamiento que requieren evaluación personalizada del entrenador'
        },
        {
          titulo: 'Solicitudes de descuentos personalizados',
          descripcion: 'Cuando el cliente pide descuentos especiales que no están en las promociones activas'
        }
      ],
      configAvanzada: {
        detenerseCotizacion: false,
        totalMinimo: '',
        instruccionesCalculo: 'Los precios varían según el tipo de membresía y duración. Consultar tarifario actualizado.',
        mensajeFijo: 'Nota: Los precios pueden variar según promociones vigentes. Recomendamos consultar disponibilidad antes de agendar una visita.'
      }
    },
    informacionEstablecimiento: {
      general: {
        title: 'Información general del gimnasio',
        questions: [
          {
            pregunta: '¿Cuál es el concepto o especialidad del gimnasio?',
            placeholder: 'Ej: Gimnasio moderno con clases grupales',
            defaultValue: 'Gimnasio moderno con equipamiento de última generación y clases grupales variadas'
          },
          {
            pregunta: '¿Qué hace único a tu gimnasio?',
            placeholder: 'Diferenciadores',
            defaultValue: 'Equipamiento de última generación, entrenadores certificados y ambiente motivador'
          }
        ]
      },
      entrenadores: {
        title: 'Entrenadores y Staff',
        questions: [
          {
            pregunta: '¿Quiénes son los entrenadores principales?',
            placeholder: 'Nombres y especialidades',
            defaultValue: ''
          },
          {
            pregunta: '¿Qué certificaciones tienen los entrenadores?',
            placeholder: 'Certificaciones',
            defaultValue: 'Entrenadores certificados internacionalmente'
          },
          {
            pregunta: '¿Ofrecen entrenamiento personalizado?',
            placeholder: 'Información sobre entrenamiento personal',
            defaultValue: 'Sí, ofrecemos entrenamiento personalizado con nuestros entrenadores certificados'
          },
          {
            pregunta: '¿Hay especialistas en áreas específicas (nutrición, rehabilitación)?',
            placeholder: 'Especialidades del staff',
            defaultValue: ''
          }
        ]
      },
      areas: {
        title: 'Áreas y Equipamiento',
        questions: [
          {
            pregunta: '¿Qué áreas tiene el gimnasio?',
            placeholder: 'Ej: Zona de cardio, pesas, clases grupales',
            defaultValue: 'Zona de cardio, zona de pesas, salón de clases grupales, área de stretching'
          },
          {
            pregunta: '¿Qué equipamiento tienen?',
            placeholder: 'Equipamiento disponible',
            defaultValue: 'Máquinas de cardio, pesas libres, máquinas de resistencia, equipamiento funcional'
          },
          {
            pregunta: '¿Tienen piscina, sauna o áreas de relajación?',
            placeholder: 'Amenities adicionales',
            defaultValue: ''
          },
          {
            pregunta: '¿Hay áreas específicas para diferentes tipos de entrenamiento?',
            placeholder: 'Áreas especializadas',
            defaultValue: 'Área de CrossFit, box de entrenamiento funcional, salón de spinning'
          }
        ]
      },
      programas: {
        title: 'Programas y Modalidades',
        questions: [
          {
            pregunta: '¿Qué tipos de clases grupales ofrecen?',
            placeholder: 'Tipos de clases',
            defaultValue: 'HIIT, Yoga, Pilates, Spinning, Zumba, CrossFit, Funcional'
          },
          {
            pregunta: '¿Hay programas especiales (pérdida de peso, ganancia muscular)?',
            placeholder: 'Programas especiales',
            defaultValue: ''
          },
          {
            pregunta: '¿Ofrecen modalidad online o presencial?',
            placeholder: 'Modalidades disponibles',
            defaultValue: 'Modalidad presencial y clases online disponibles'
          },
          {
            pregunta: '¿Hay programas para principiantes?',
            placeholder: 'Programas para principiantes',
            defaultValue: 'Sí, ofrecemos programas de iniciación y clases adaptadas para principiantes'
          }
        ]
      }
    },
    informacionExtra: {
      nutricion: {
        title: 'Programas Nutricionales',
        questions: [
          {
            pregunta: '¿Ofrecen asesoramiento nutricional?',
            placeholder: 'Servicios de nutrición',
            defaultValue: ''
          },
          {
            pregunta: '¿Hay programas de nutrición combinados con entrenamiento?',
            placeholder: 'Programas combinados',
            defaultValue: ''
          }
        ]
      },
      retos: {
        title: 'Retos y Competencias',
        questions: [
          {
            pregunta: '¿Organizan retos o competencias?',
            placeholder: 'Retos y competencias',
            defaultValue: ''
          },
          {
            pregunta: '¿Hay programas de seguimiento de progreso?',
            placeholder: 'Seguimiento de progreso',
            defaultValue: ''
          }
        ]
      },
      tips: {
        title: 'Tips de Entrenamiento',
        questions: [
          {
            pregunta: '¿Qué recomendaciones dan para principiantes?',
            placeholder: 'Tips para principiantes',
            defaultValue: 'Comenzar con intensidad moderada, hidratarse bien, y seguir las indicaciones del entrenador'
          },
          {
            pregunta: '¿Hay información sobre recuperación y descanso?',
            placeholder: 'Información sobre recuperación',
            defaultValue: ''
          }
        ]
      }
    },
    areasComunes: {
      title: 'Áreas del Gimnasio',
      areas: [],
      tiposDisponibles: [
        { value: 'salon_principal', label: 'Salón Principal', description: 'Fotos del salón principal con equipamiento' },
        { value: 'box_crossfit', label: 'Box/CrossFit', description: 'Fotos del área de CrossFit' },
        { value: 'pileta', label: 'Pileta', description: 'Fotos de la piscina si aplica' },
        { value: 'zona_cardio', label: 'Zona de Cardio', description: 'Fotos de máquinas de cardio' },
        { value: 'zona_pesas', label: 'Zona de Pesas', description: 'Fotos del área de pesas' },
        { value: 'area_stretching', label: 'Área de Stretching', description: 'Fotos del área de estiramiento' }
      ]
    }
  },
  
  law_firm: {
    configuracionAsistente: {
      fields: [
        {
          key: 'nombre',
          label: 'Nombre del asistente',
          defaultValue: 'Camila',
          locked: true
        },
        {
          key: 'tono',
          label: 'Tono',
          defaultValue: 'Formal',
          locked: true
        },
        {
          key: 'establecimiento',
          label: 'Nombre del estudio',
          defaultValue: 'Estudio Jurídico',
          locked: true
        },
        {
          key: 'ubicacion',
          label: 'Ubicación',
          defaultValue: 'Montevideo',
          locked: true
        },
        {
          key: 'tipoEstablecimiento',
          label: 'Tipo de establecimiento',
          defaultValue: 'Estudio jurídico',
          locked: true
        },
        {
          key: 'infoHotel',
          label: 'Información del estudio',
          defaultValue: 'Estudio jurídico especializado en diversas áreas del derecho, con equipo de abogados experimentados y comprometidos con la excelencia en el servicio legal.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'propuesta',
          label: 'Propuesta de valor',
          defaultValue: 'Brindamos asesoramiento legal profesional, confiable y personalizado para proteger tus intereses y resolver tus necesidades jurídicas.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'web',
          label: 'Página web',
          defaultValue: 'www.minegocio.com',
          locked: true
        }
      ],
      directrices: {
        defaultValue: `• Da respuestas profesionales y formales de máximo 2-3 renglones.
• Utiliza lenguaje jurídico apropiado pero accesible.
• Evita dar asesoramiento legal específico sin consulta previa.
• Sigue siempre estrictamente la información brindada en el "conocimiento/context".
• Responde SOLO preguntas relacionadas a áreas de práctica, procesos, honorarios y servicios del estudio.
• La información del estudio es PRIORIDAD ABSOLUTA.
• Para consultas legales específicas, siempre derivar a consulta con abogado.`
      },
      situaciones: [
        {
          titulo: 'Consultas legales específicas que requieren evaluación',
          descripcion: 'Cuando el cliente pregunta sobre casos legales específicos que requieren análisis profesional'
        },
        {
          titulo: 'Solicitudes de cotizaciones complejas',
          descripcion: 'Cuando el cliente solicita cotizaciones para casos complejos que requieren evaluación previa'
        },
        {
          titulo: 'Urgencias legales',
          descripcion: 'Cualquier situación legal urgente que requiere atención inmediata'
        }
      ]
    },
    precioDisponibilidad: {
      secciones: [
        {
          key: 'honorarios',
          title: 'Honorarios y Modalidades de Pago',
          borderColor: 'border-l-green-500',
          questions: [
            {
              pregunta: '¿Cómo se determinan los honorarios?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Los honorarios se determinan según la complejidad del caso, tiempo estimado y área de práctica'
            },
            {
              pregunta: '¿Qué modalidades de honorarios ofrecen?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Por hora, fijo por caso, o retainer mensual según el tipo de servicio'
            },
            {
              pregunta: '¿Se requiere pago inicial o retainer?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Depende del tipo de caso. Algunos casos requieren retainer inicial'
            },
            {
              pregunta: '¿Qué métodos de pago aceptan?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Efectivo, transferencias bancarias, cheques'
            },
            {
              pregunta: '¿Hay planes de pago o financiación?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            },
            {
              pregunta: '¿Cuál es la política de facturación?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Facturación mensual o al cierre del caso según acuerdo'
            }
          ]
        },
        {
          key: 'proceso',
          title: 'Proceso de Consulta y Trabajo',
          borderColor: 'border-l-orange-500',
          questions: [
            {
              pregunta: '¿Cómo puede un cliente solicitar una consulta?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Los clientes pueden solicitar consulta a través de nuestro sitio web, por teléfono o email'
            },
            {
              pregunta: '¿Qué información se necesita para la primera consulta?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Breve descripción del caso, documentos relevantes si los hay, y datos de contacto'
            },
            {
              pregunta: '¿Cuánto tiempo tarda en responder una consulta inicial?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Respondemos consultas iniciales dentro de 24-48 horas'
            },
            {
              pregunta: '¿Cómo es el proceso de trabajo con el estudio?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Consulta inicial, evaluación del caso, propuesta de honorarios, y seguimiento del proceso'
            }
          ]
        }
      ],
      situaciones: [
        {
          titulo: 'Consultas legales específicas complejas',
          descripcion: 'Si el cliente solicita asesoramiento sobre casos que requieren análisis legal profundo'
        },
        {
          titulo: 'Solicitudes de cotizaciones para casos complejos',
          descripcion: 'Cuando el cliente solicita cotizaciones para casos que requieren evaluación previa del abogado'
        }
      ],
      configAvanzada: {
        detenerseCotizacion: true,
        totalMinimo: '',
        instruccionesCalculo: 'Los honorarios varían según la complejidad del caso y área de práctica. Se requiere consulta previa para cotización precisa.',
        mensajeFijo: 'Nota: Los honorarios se determinan según la complejidad del caso. Recomendamos una consulta inicial para una cotización precisa.'
      }
    },
    informacionEstablecimiento: {
      general: {
        title: 'Información general del estudio',
        questions: [
          {
            pregunta: '¿Cuál es la especialidad o enfoque del estudio?',
            placeholder: 'Especialidades',
            defaultValue: 'Especializado en diversas áreas del derecho'
          },
          {
            pregunta: '¿Qué hace único a tu estudio?',
            placeholder: 'Diferenciadores',
            defaultValue: 'Equipo de abogados experimentados y comprometidos con la excelencia'
          }
        ]
      },
      equipo: {
        title: 'Equipo y Especialidades',
        questions: [
          {
            pregunta: '¿Quiénes son los abogados principales?',
            placeholder: 'Nombres y especialidades',
            defaultValue: ''
          },
          {
            pregunta: '¿En qué áreas de práctica se especializan?',
            placeholder: 'Áreas de práctica',
            defaultValue: 'Derecho civil, comercial, laboral, familiar, penal'
          },
          {
            pregunta: '¿Qué idiomas hablan los abogados?',
            placeholder: 'Idiomas',
            defaultValue: 'Español, inglés'
          },
          {
            pregunta: '¿Trabajan con empresas o solo particulares?',
            placeholder: 'Tipos de clientes',
            defaultValue: 'Trabajamos con particulares y empresas'
          }
        ]
      },
      casos: {
        title: 'Casos y Experiencia',
        questions: [
          {
            pregunta: '¿Qué tipos de casos manejan frecuentemente?',
            placeholder: 'Tipos de casos',
            defaultValue: ''
          },
          {
            pregunta: '¿Tienen experiencia en casos complejos?',
            placeholder: 'Experiencia en casos complejos',
            defaultValue: 'Sí, tenemos amplia experiencia en casos complejos de diversas áreas'
          },
          {
            pregunta: '¿Qué certificaciones o membresías tienen?',
            placeholder: 'Certificaciones',
            defaultValue: 'Colegio de Abogados, membresías profesionales'
          }
        ]
      }
    },
    informacionExtra: {
      documentacion: {
        title: 'Documentación Requerida',
        questions: [
          {
            pregunta: '¿Qué documentos suelen necesitar para una consulta?',
            placeholder: 'Documentos requeridos',
            defaultValue: 'Documentos relevantes al caso, identificación, y cualquier documentación previa relacionada'
          },
          {
            pregunta: '¿Cómo manejan la confidencialidad?',
            placeholder: 'Políticas de confidencialidad',
            defaultValue: 'Mantenemos estricta confidencialidad según el secreto profesional'
          }
        ]
      },
      politicas: {
        title: 'Políticas y Procesos',
        questions: [
          {
            pregunta: '¿Cuál es su política de comunicación con clientes?',
            placeholder: 'Política de comunicación',
            defaultValue: 'Mantenemos comunicación regular con nuestros clientes sobre el avance de sus casos'
          },
          {
            pregunta: '¿Cómo manejan los plazos y tiempos de respuesta?',
            placeholder: 'Tiempos de respuesta',
            defaultValue: 'Respondemos consultas dentro de 24-48 horas y mantenemos a los clientes informados sobre plazos'
          }
        ]
      }
    },
    areasComunes: {
      title: 'Áreas del Estudio',
      areas: [],
      tiposDisponibles: [
        { value: 'oficinas', label: 'Oficinas', description: 'Fotos de las oficinas' },
        { value: 'salas_reunion', label: 'Salas de Reunión', description: 'Fotos de salas de reunión' },
        { value: 'recepcion', label: 'Recepción', description: 'Fotos del área de recepción' },
        { value: 'biblioteca', label: 'Biblioteca', description: 'Fotos de la biblioteca legal si aplica' }
      ]
    }
  },
  
  consulting: {
    configuracionAsistente: {
      fields: [
        {
          key: 'nombre',
          label: 'Nombre del asistente',
          defaultValue: 'Camila',
          locked: true
        },
        {
          key: 'tono',
          label: 'Tono',
          defaultValue: 'Profesional',
          locked: true
        },
        {
          key: 'establecimiento',
          label: 'Nombre de la consultora',
          defaultValue: 'Consultora',
          locked: true
        },
        {
          key: 'ubicacion',
          label: 'Ubicación',
          defaultValue: 'Montevideo',
          locked: true
        },
        {
          key: 'tipoEstablecimiento',
          label: 'Tipo de establecimiento',
          defaultValue: 'Consultora',
          locked: true
        },
        {
          key: 'infoHotel',
          label: 'Información de la consultora',
          defaultValue: 'Consultora especializada en asesoramiento estratégico y soluciones empresariales, con equipo de consultores experimentados.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'propuesta',
          label: 'Propuesta de valor',
          defaultValue: 'Brindamos asesoramiento estratégico personalizado para ayudar a las empresas a alcanzar sus objetivos y optimizar sus operaciones.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'web',
          label: 'Página web',
          defaultValue: 'www.minegocio.com',
          locked: true
        }
      ],
      directrices: {
        defaultValue: `• Da respuestas profesionales y claras de máximo 2-3 renglones.
• Utiliza lenguaje empresarial apropiado.
• Evita dar asesoramiento específico sin conocer el contexto completo.
• Sigue siempre estrictamente la información brindada en el "conocimiento/context".
• Responde SOLO preguntas relacionadas a servicios, procesos, honorarios y metodología de la consultora.
• La información de la consultora es PRIORIDAD ABSOLUTA.
• Para consultas específicas, siempre derivar a consulta con consultor.`
      },
      situaciones: [
        {
          titulo: 'Consultas específicas que requieren evaluación',
          descripcion: 'Cuando el cliente pregunta sobre proyectos específicos que requieren análisis profesional'
        },
        {
          titulo: 'Solicitudes de cotizaciones complejas',
          descripcion: 'Cuando el cliente solicita cotizaciones para proyectos complejos que requieren evaluación previa'
        }
      ]
    },
    precioDisponibilidad: {
      secciones: [
        {
          key: 'honorarios',
          title: 'Honorarios y Modalidades',
          borderColor: 'border-l-green-500',
          questions: [
            {
              pregunta: '¿Cómo se determinan los honorarios?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Los honorarios se determinan según el alcance del proyecto, tiempo estimado y complejidad'
            },
            {
              pregunta: '¿Qué modalidades de honorarios ofrecen?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Por hora, fijo por proyecto, o retainer mensual según el tipo de servicio'
            },
            {
              pregunta: '¿Se requiere pago inicial?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Depende del proyecto. Algunos proyectos requieren pago inicial'
            },
            {
              pregunta: '¿Qué métodos de pago aceptan?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Transferencias bancarias, cheques'
            },
            {
              pregunta: '¿Hay planes de pago?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: ''
            }
          ]
        },
        {
          key: 'proceso',
          title: 'Proceso de Trabajo',
          borderColor: 'border-l-orange-500',
          questions: [
            {
              pregunta: '¿Cómo puede un cliente solicitar una consulta?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Los clientes pueden solicitar consulta a través de nuestro sitio web, por teléfono o email'
            },
            {
              pregunta: '¿Qué información se necesita para la primera consulta?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Breve descripción del proyecto o necesidad, y datos de contacto'
            },
            {
              pregunta: '¿Cuánto tiempo tarda en responder una consulta inicial?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Respondemos consultas iniciales dentro de 24-48 horas'
            },
            {
              pregunta: '¿Cómo es el proceso de trabajo?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Consulta inicial, evaluación de necesidades, propuesta de honorarios, y ejecución del proyecto'
            }
          ]
        }
      ],
      situaciones: [
        {
          titulo: 'Consultas específicas complejas',
          descripcion: 'Si el cliente solicita asesoramiento sobre proyectos que requieren análisis profundo'
        },
        {
          titulo: 'Solicitudes de cotizaciones para proyectos complejos',
          descripcion: 'Cuando el cliente solicita cotizaciones para proyectos que requieren evaluación previa'
        }
      ],
      configAvanzada: {
        detenerseCotizacion: true,
        totalMinimo: '',
        instruccionesCalculo: 'Los honorarios varían según el alcance y complejidad del proyecto. Se requiere consulta previa para cotización precisa.',
        mensajeFijo: 'Nota: Los honorarios se determinan según el alcance del proyecto. Recomendamos una consulta inicial para una cotización precisa.'
      }
    },
    informacionEstablecimiento: {
      general: {
        title: 'Información general de la consultora',
        questions: [
          {
            pregunta: '¿Cuál es la especialidad o enfoque?',
            placeholder: 'Especialidades',
            defaultValue: 'Asesoramiento estratégico y soluciones empresariales'
          },
          {
            pregunta: '¿Qué hace única a tu consultora?',
            placeholder: 'Diferenciadores',
            defaultValue: 'Equipo de consultores experimentados con enfoque personalizado'
          }
        ]
      },
      equipo: {
        title: 'Equipo y Servicios',
        questions: [
          {
            pregunta: '¿Quiénes son los consultores principales?',
            placeholder: 'Nombres y especialidades',
            defaultValue: ''
          },
          {
            pregunta: '¿En qué áreas se especializan?',
            placeholder: 'Áreas de especialización',
            defaultValue: 'Estrategia empresarial, gestión, marketing, tecnología, recursos humanos'
          },
          {
            pregunta: '¿Qué idiomas hablan los consultores?',
            placeholder: 'Idiomas',
            defaultValue: 'Español, inglés'
          },
          {
            pregunta: '¿Trabajan con empresas de qué tamaño?',
            placeholder: 'Tipos de clientes',
            defaultValue: 'Trabajamos con empresas de todos los tamaños, desde startups hasta grandes corporaciones'
          }
        ]
      }
    },
    informacionExtra: {
      metodologia: {
        title: 'Metodología y Procesos',
        questions: [
          {
            pregunta: '¿Cuál es su metodología de trabajo?',
            placeholder: 'Metodología',
            defaultValue: 'Análisis profundo, estrategia personalizada, implementación y seguimiento'
          },
          {
            pregunta: '¿Cómo manejan la confidencialidad?',
            placeholder: 'Políticas de confidencialidad',
            defaultValue: 'Mantenemos estricta confidencialidad con todos nuestros clientes'
          }
        ]
      }
    },
    areasComunes: {
      title: 'Áreas de la Consultora',
      areas: [],
      tiposDisponibles: [
        { value: 'oficinas', label: 'Oficinas', description: 'Fotos de las oficinas' },
        { value: 'salas_reunion', label: 'Salas de Reunión', description: 'Fotos de salas de reunión' },
        { value: 'recepcion', label: 'Recepción', description: 'Fotos del área de recepción' }
      ]
    }
  },
  
  real_estate: {
    configuracionAsistente: {
      fields: [
        {
          key: 'nombre',
          label: 'Nombre del asistente',
          defaultValue: 'Camila',
          locked: true
        },
        {
          key: 'tono',
          label: 'Tono',
          defaultValue: 'Profesional',
          locked: true
        },
        {
          key: 'establecimiento',
          label: 'Nombre de la inmobiliaria',
          defaultValue: 'Inmobiliaria',
          locked: true
        },
        {
          key: 'ubicacion',
          label: 'Ubicación',
          defaultValue: 'Montevideo',
          locked: true
        },
        {
          key: 'tipoEstablecimiento',
          label: 'Tipo de establecimiento',
          defaultValue: 'Inmobiliaria',
          locked: true
        },
        {
          key: 'infoHotel',
          label: 'Información de la inmobiliaria',
          defaultValue: 'Inmobiliaria especializada en la gestión de propiedades residenciales y comerciales, con amplia experiencia en el mercado inmobiliario.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'propuesta',
          label: 'Propuesta de valor',
          defaultValue: 'Facilitamos la búsqueda, compra, venta y alquiler de propiedades con un servicio profesional y personalizado.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'web',
          label: 'Página web',
          defaultValue: 'www.minegocio.com',
          locked: true
        }
      ],
      directrices: {
        defaultValue: `• Da respuestas profesionales y claras de máximo 2-3 renglones.
• Utiliza lenguaje inmobiliario apropiado.
• Sigue siempre estrictamente la información brindada en el "conocimiento/context".
• Responde SOLO preguntas relacionadas a propiedades, zonas, procesos, comisiones y servicios de la inmobiliaria.
• La información de la inmobiliaria es PRIORIDAD ABSOLUTA.
• Para consultas específicas sobre propiedades, derivar a agente inmobiliario.`
      },
      situaciones: [
        {
          titulo: 'Consultas sobre propiedades específicas que requieren visita',
          descripcion: 'Cuando el cliente pregunta sobre propiedades que requieren información detallada o visita'
        },
        {
          titulo: 'Solicitudes de cotizaciones de tasación',
          descripcion: 'Cuando el cliente solicita tasaciones que requieren evaluación profesional'
        },
        {
          titulo: 'Consultas sobre procesos legales complejos',
          descripcion: 'Cualquier consulta sobre procesos legales de compra/venta que requiere asesoramiento profesional'
        }
      ]
    },
    precioDisponibilidad: {
      secciones: [
        {
          key: 'comisiones',
          title: 'Comisiones y Honorarios',
          borderColor: 'border-l-green-500',
          questions: [
            {
              pregunta: '¿Cómo se determinan las comisiones?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Las comisiones se determinan según el tipo de operación (venta o alquiler) y el valor de la propiedad'
            },
            {
              pregunta: '¿Cuáles son las comisiones típicas?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Comisión estándar del X% sobre el valor de la operación'
            },
            {
              pregunta: '¿Hay diferencias entre venta y alquiler?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Sí, las comisiones varían entre operaciones de venta y alquiler'
            },
            {
              pregunta: '¿Qué métodos de pago aceptan?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Transferencias bancarias, cheques'
            },
            {
              pregunta: '¿Cuándo se cobran las comisiones?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Las comisiones se cobran al cierre de la operación'
            }
          ]
        },
        {
          key: 'requisitos',
          title: 'Requisitos para Alquiler y Venta',
          borderColor: 'border-l-orange-500',
          questions: [
            {
              pregunta: '¿Qué requisitos se necesitan para alquilar?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Documentación de identidad, comprobantes de ingresos, referencias, y garantía'
            },
            {
              pregunta: '¿Qué requisitos se necesitan para comprar?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Precalificación crediticia, documentación de identidad, y capacidad de pago'
            },
            {
              pregunta: '¿Cómo es el proceso de precalificación?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Evaluación de capacidad de pago, historial crediticio, y documentación requerida'
            }
          ]
        },
        {
          key: 'proceso',
          title: 'Proceso de Operación',
          borderColor: 'border-l-blue-500',
          questions: [
            {
              pregunta: '¿Cómo puede un cliente buscar propiedades?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'A través de nuestro sitio web, visitando nuestras oficinas, o contactando a nuestros agentes'
            },
            {
              pregunta: '¿Cómo es el proceso de cierre?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Firma de contrato, verificación de documentación, transferencia de fondos, y escrituración'
            },
            {
              pregunta: '¿Cuánto tiempo tarda el proceso completo?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'El tiempo varía según el tipo de operación, generalmente entre 30-60 días'
            }
          ]
        }
      ],
      situaciones: [
        {
          titulo: 'Consultas sobre propiedades específicas',
          descripcion: 'Si el cliente solicita información detallada sobre propiedades que requieren visita o información específica del agente'
        },
        {
          titulo: 'Solicitudes de tasación',
          descripcion: 'Cuando el cliente solicita tasaciones que requieren evaluación profesional'
        }
      ],
      configAvanzada: {
        detenerseCotizacion: false,
        totalMinimo: '',
        instruccionesCalculo: 'Las comisiones se calculan según el tipo de operación y valor de la propiedad. Consultar con agente para cotización precisa.',
        mensajeFijo: 'Nota: Las comisiones pueden variar según el tipo de operación. Recomendamos consultar con nuestro equipo para información detallada.'
      }
    },
    informacionEstablecimiento: {
      general: {
        title: 'Información general de la inmobiliaria',
        questions: [
          {
            pregunta: '¿Cuál es la especialidad?',
            placeholder: 'Especialidad',
            defaultValue: 'Gestión de propiedades residenciales y comerciales'
          },
          {
            pregunta: '¿Qué hace única a tu inmobiliaria?',
            placeholder: 'Diferenciadores',
            defaultValue: 'Amplia experiencia en el mercado inmobiliario y servicio personalizado'
          }
        ]
      },
      zonas: {
        title: 'Zonas de Operación',
        questions: [
          {
            pregunta: '¿En qué zonas operan?',
            placeholder: 'Zonas de operación',
            defaultValue: 'Operamos en diversas zonas de la ciudad'
          },
          {
            pregunta: '¿Hay zonas de especialización?',
            placeholder: 'Zonas especializadas',
            defaultValue: ''
          }
        ]
      },
      propiedades: {
        title: 'Tipos de Propiedades',
        questions: [
          {
            pregunta: '¿Qué tipos de propiedades gestionan?',
            placeholder: 'Tipos de propiedades',
            defaultValue: 'Propiedades residenciales (casas, apartamentos) y comerciales (oficinas, locales)'
          },
          {
            pregunta: '¿Manejan propiedades de qué rango de precios?',
            placeholder: 'Rango de precios',
            defaultValue: 'Manejamos propiedades en diversos rangos de precios'
          }
        ]
      },
      servicios: {
        title: 'Servicios Complementarios',
        questions: [
          {
            pregunta: '¿Ofrecen servicios de tasación?',
            placeholder: 'Servicios de tasación',
            defaultValue: 'Sí, ofrecemos servicios de tasación profesional'
          },
          {
            pregunta: '¿Ofrecen servicios de staging?',
            placeholder: 'Servicios de staging',
            defaultValue: ''
          },
          {
            pregunta: '¿Ofrecen administración de propiedades?',
            placeholder: 'Administración de propiedades',
            defaultValue: ''
          }
        ]
      }
    },
    informacionExtra: {
      procesos: {
        title: 'Procesos y Checklist',
        questions: [
          {
            pregunta: '¿Cuál es el proceso de precalificación para compradores?',
            placeholder: 'Proceso de precalificación',
            defaultValue: 'Evaluación de capacidad de pago, historial crediticio, y documentación requerida'
          },
          {
            pregunta: '¿Cuál es el proceso de cierre de operación?',
            placeholder: 'Proceso de cierre',
            defaultValue: 'Firma de contrato, verificación de documentación, transferencia de fondos, y escrituración'
          },
          {
            pregunta: '¿Qué checklist deben seguir los compradores?',
            placeholder: 'Checklist para compradores',
            defaultValue: 'Verificar documentación de la propiedad, realizar inspección, obtener financiamiento, y revisar contratos'
          }
        ]
      },
      mercado: {
        title: 'Información de Mercado',
        questions: [
          {
            pregunta: '¿Tienen información sobre tendencias del mercado?',
            placeholder: 'Información de mercado',
            defaultValue: ''
          }
        ]
      }
    },
    areasComunes: {
      title: 'Áreas de la Inmobiliaria',
      areas: [],
      tiposDisponibles: [
        { value: 'oficinas', label: 'Oficinas', description: 'Fotos de las oficinas' },
        { value: 'propiedades_residencial', label: 'Propiedades Residenciales', description: 'Fotos de propiedades residenciales ejemplo' },
        { value: 'propiedades_comercial', label: 'Propiedades Comerciales', description: 'Fotos de propiedades comerciales ejemplo' },
        { value: 'recepcion', label: 'Recepción', description: 'Fotos del área de recepción' }
      ]
    }
  },
  
  automotive: {
    configuracionAsistente: {
      fields: [
        {
          key: 'nombre',
          label: 'Nombre del asistente',
          defaultValue: 'Camila',
          locked: true
        },
        {
          key: 'tono',
          label: 'Tono',
          defaultValue: 'Amigable',
          locked: true
        },
        {
          key: 'establecimiento',
          label: 'Nombre del taller',
          defaultValue: 'Taller Automotriz',
          locked: true
        },
        {
          key: 'ubicacion',
          label: 'Ubicación',
          defaultValue: 'Montevideo',
          locked: true
        },
        {
          key: 'tipoEstablecimiento',
          label: 'Tipo de establecimiento',
          defaultValue: 'Taller automotriz',
          locked: true
        },
        {
          key: 'infoHotel',
          label: 'Información del taller',
          defaultValue: 'Taller automotriz especializado en mantenimiento, reparación y servicios para vehículos, con técnicos certificados y equipamiento moderno.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'propuesta',
          label: 'Propuesta de valor',
          defaultValue: 'Mantenemos tu vehículo en óptimas condiciones con servicios profesionales, repuestos de calidad y atención personalizada.',
          locked: true,
          multiline: true,
          rows: 4
        },
        {
          key: 'web',
          label: 'Página web',
          defaultValue: 'www.minegocio.com',
          locked: true
        }
      ],
      directrices: {
        defaultValue: `• Da respuestas cortas y dinámicas de máximo 2-3 renglones.
• Utiliza lenguaje simple y natural, como si hablaras con un amigo.
• Evita la excesiva "jerga" técnica.
• Sigue siempre estrictamente la información brindada en el "conocimiento/context".
• Responde SOLO preguntas relacionadas a servicios, precios, tiempos, marcas atendidas y políticas del taller.
• La información del taller es PRIORIDAD ABSOLUTA.`
      },
      situaciones: [
        {
          titulo: 'Consultas sobre reparaciones complejas que requieren diagnóstico',
          descripcion: 'Cuando el cliente pregunta sobre problemas que requieren diagnóstico profesional en el taller'
        },
        {
          titulo: 'Solicitudes de cotizaciones para reparaciones complejas',
          descripcion: 'Cuando el cliente solicita cotizaciones para reparaciones que requieren evaluación previa'
        },
        {
          titulo: 'Emergencias en ruta',
          descripcion: 'Cualquier situación de emergencia que requiere asistencia inmediata'
        }
      ]
    },
    precioDisponibilidad: {
      secciones: [
        {
          key: 'servicios',
          title: 'Servicios y Precios',
          borderColor: 'border-l-green-500',
          questions: [
            {
              pregunta: '¿Qué servicios ofrecen?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Mantenimiento preventivo, reparaciones, cambio de aceite, alineación, balanceo, diagnóstico'
            },
            {
              pregunta: '¿Cómo se determinan los precios?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Los precios varían según el servicio, marca del vehículo y complejidad del trabajo'
            },
            {
              pregunta: '¿Hay paquetes de mantenimiento?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Sí, ofrecemos paquetes de mantenimiento preventivo con descuentos'
            },
            {
              pregunta: '¿Qué métodos de pago aceptan?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Efectivo, tarjetas de débito/crédito, transferencias'
            },
            {
              pregunta: '¿Cuánto tiempo tarda cada servicio?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Los tiempos varían según el servicio, desde 1 hora para cambio de aceite hasta varios días para reparaciones complejas'
            },
            {
              pregunta: '¿Hay garantía en los trabajos realizados?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Sí, ofrecemos garantía en todos nuestros trabajos'
            }
          ]
        },
        {
          key: 'repuestos',
          title: 'Repuestos y Disponibilidad',
          borderColor: 'border-l-orange-500',
          questions: [
            {
              pregunta: '¿Tienen repuestos originales?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Sí, trabajamos con repuestos originales y alternativos de calidad'
            },
            {
              pregunta: '¿Cuánto tiempo tarda en llegar un repuesto si no está en stock?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Depende del repuesto, generalmente entre 3-7 días hábiles'
            },
            {
              pregunta: '¿Qué marcas de vehículos atienden?',
              placeholder: 'Escribe la respuesta aquí...',
              defaultValue: 'Atendemos todas las marcas de vehículos'
            }
          ]
        }
      ],
      situaciones: [
        {
          titulo: 'Consultas sobre reparaciones complejas',
          descripcion: 'Si el cliente solicita información sobre reparaciones que requieren diagnóstico profesional'
        },
        {
          titulo: 'Solicitudes de cotizaciones para reparaciones complejas',
          descripcion: 'Cuando el cliente solicita cotizaciones para reparaciones que requieren evaluación previa en el taller'
        }
      ],
      configAvanzada: {
        detenerseCotizacion: false,
        totalMinimo: '',
        instruccionesCalculo: 'Los precios varían según el servicio, marca del vehículo y complejidad. Se requiere evaluación en taller para cotización precisa.',
        mensajeFijo: 'Nota: Los precios pueden variar según la marca del vehículo y complejidad del trabajo. Recomendamos traer el vehículo para una evaluación precisa.'
      }
    },
    informacionEstablecimiento: {
      general: {
        title: 'Información general del taller',
        questions: [
          {
            pregunta: '¿Cuál es la especialidad del taller?',
            placeholder: 'Especialidad',
            defaultValue: 'Mantenimiento, reparación y servicios para vehículos'
          },
          {
            pregunta: '¿Qué hace único a tu taller?',
            placeholder: 'Diferenciadores',
            defaultValue: 'Técnicos certificados, equipamiento moderno y atención personalizada'
          }
        ]
      },
      laboratorio: {
        title: 'Laboratorio y Equipamiento',
        questions: [
          {
            pregunta: '¿Qué equipamiento tienen?',
            placeholder: 'Equipamiento',
            defaultValue: 'Equipamiento moderno para diagnóstico, alineación, balanceo y reparaciones'
          },
          {
            pregunta: '¿Tienen laboratorio de diagnóstico?',
            placeholder: 'Laboratorio de diagnóstico',
            defaultValue: 'Sí, contamos con laboratorio de diagnóstico computarizado'
          },
          {
            pregunta: '¿Qué certificaciones tiene el taller?',
            placeholder: 'Certificaciones',
            defaultValue: 'Taller certificado con técnicos autorizados'
          }
        ]
      },
      marcas: {
        title: 'Marcas y Servicios',
        questions: [
          {
            pregunta: '¿Qué marcas de vehículos atienden?',
            placeholder: 'Marcas atendidas',
            defaultValue: 'Atendemos todas las marcas de vehículos'
          },
          {
            pregunta: '¿Hay marcas con prioridad o especialización?',
            placeholder: 'Marcas especializadas',
            defaultValue: ''
          },
          {
            pregunta: '¿Qué tipos de servicios realizan?',
            placeholder: 'Tipos de servicios',
            defaultValue: 'Mantenimiento preventivo, reparaciones mecánicas, eléctricas, de carrocería'
          }
        ]
      },
      garantias: {
        title: 'Garantías y Servicios Adicionales',
        questions: [
          {
            pregunta: '¿Qué garantías ofrecen?',
            placeholder: 'Garantías',
            defaultValue: 'Garantía en todos los trabajos realizados y repuestos instalados'
          },
          {
            pregunta: '¿Ofrecen asistencia en ruta?',
            placeholder: 'Asistencia en ruta',
            defaultValue: ''
          },
          {
            pregunta: '¿Ofrecen vehículo de cortesía?',
            placeholder: 'Vehículo de cortesía',
            defaultValue: ''
          }
        ]
      }
    },
    informacionExtra: {
      asistencia: {
        title: 'Asistencia en Ruta',
        questions: [
          {
            pregunta: '¿Ofrecen servicio de asistencia en ruta?',
            placeholder: 'Asistencia en ruta',
            defaultValue: ''
          },
          {
            pregunta: '¿Cuál es el tiempo de respuesta?',
            placeholder: 'Tiempo de respuesta',
            defaultValue: ''
          }
        ]
      },
      cortesia: {
        title: 'Servicios de Cortesía',
        questions: [
          {
            pregunta: '¿Ofrecen vehículo de cortesía?',
            placeholder: 'Vehículo de cortesía',
            defaultValue: ''
          },
          {
            pregunta: '¿Hay otros servicios de cortesía?',
            placeholder: 'Otros servicios',
            defaultValue: ''
          }
        ]
      },
      tips: {
        title: 'Tips de Mantenimiento',
        questions: [
          {
            pregunta: '¿Qué recomendaciones dan para el mantenimiento del vehículo?',
            placeholder: 'Tips de mantenimiento',
            defaultValue: 'Realizar mantenimiento preventivo regular, revisar niveles de fluidos, y seguir las recomendaciones del fabricante'
          }
        ]
      }
    },
    areasComunes: {
      title: 'Áreas del Taller',
      areas: [],
      tiposDisponibles: [
        { value: 'boxes', label: 'Boxes de Trabajo', description: 'Fotos de los boxes de trabajo' },
        { value: 'equipamiento', label: 'Equipamiento', description: 'Fotos del equipamiento del taller' },
        { value: 'showroom', label: 'Showroom', description: 'Fotos del showroom si aplica' },
        { value: 'recepcion', label: 'Recepción', description: 'Fotos del área de recepción' },
        { value: 'laboratorio', label: 'Laboratorio', description: 'Fotos del laboratorio de diagnóstico' }
      ]
    }
  }
} as unknown as Record<BusinessType, BusinessContentConfig>;

// Mapeo para medical_clinic y beauty_salon
businessTypeContent.medical_clinic = {
  ...businessTypeContent.dental_clinic,
  informacionEstablecimiento: {
    ...businessTypeContent.dental_clinic.informacionEstablecimiento,
    general: {
      ...businessTypeContent.dental_clinic.informacionEstablecimiento.general,
      title: 'Información general de la clínica médica',
      questions: [
        {
          pregunta: '¿Cuál es la especialidad o enfoque de la clínica?',
          placeholder: 'Especialidades médicas',
          defaultValue: ''
        },
        {
          pregunta: '¿Qué hace única a tu clínica?',
          placeholder: 'Diferenciadores y características especiales',
          defaultValue: ''
        }
      ]
    }
  }
};

businessTypeContent.beauty_salon = businessTypeContent.hair_salon;

// Define appointment type based on business
export type AppointmentType = 'appointment' | 'booking';

// Map business types to appointment types
export const businessAppointmentType: Record<BusinessType, AppointmentType> = {
  // TURNOS/CITAS (sin pago por adelantado)
  'hair_salon': 'appointment',
  'medical_clinic': 'appointment',
  'dental_clinic': 'appointment',
  'fitness_center': 'appointment',
  'beauty_salon': 'appointment',
  'law_firm': 'appointment',
  'consulting': 'appointment',
  'automotive': 'appointment',
  // RESERVAS CON PAGOS (requieren pago/seña)
  'restaurant': 'booking',
  'hotel': 'booking',
  // Others default to appointment
  'real_estate': 'appointment',
  'other': 'appointment'
};

export const appointmentTypeLabels = {
  appointment: {
    singular: 'turno',
    plural: 'turnos',
    verb: 'agendar',
    title: 'Agendamiento de Turnos'
  },
  booking: {
    singular: 'reserva',
    plural: 'reservas',
    verb: 'reservar',
    title: 'Sistema de Reservas'
  }
};