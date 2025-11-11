import { IndustryType } from '../stores/userStore';

export type BusinessType = IndustryType;

export interface BusinessContentConfig {
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

export const businessTypeContent: Record<BusinessType, BusinessContentConfig> = {
  hotel: {
    informacionEstablecimiento: {
      general: {
        title: 'Información general del hotel',
        questions: [
          {
            pregunta: '¿Cuál es el nombre completo del establecimiento?',
            placeholder: 'Ej: Hotel Edelweiss Punta del Este',
            defaultValue: 'Hotel Edelweiss Punta del Este'
          },
          {
            pregunta: '¿Dónde está ubicado el establecimiento?',
            placeholder: 'Dirección completa',
            defaultValue: 'Av. Francia 5678, Punta del Este, Maldonado, Uruguay'
          },
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
          },
          {
            pregunta: '¿Cuál es la página web o redes sociales del establecimiento?',
            placeholder: 'URLs de web y redes sociales',
            defaultValue: 'https://edelweiss.uy - Instagram: @edelweisshotel'
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
    informacionEstablecimiento: {
      general: {
        title: 'Información general de la peluquería',
        questions: [
          {
            pregunta: '¿Cuál es el nombre de la peluquería?',
            placeholder: 'Ej: Estilo y Corte',
            defaultValue: 'Estilo y Corte'
          },
          {
            pregunta: '¿Dónde está ubicada la peluquería?',
            placeholder: 'Dirección completa',
            defaultValue: 'Av. Principal 1234, Montevideo'
          },
          {
            pregunta: '¿Cuál es el concepto o especialidad de la peluquería?',
            placeholder: 'Ej: Peluquería moderna especializada en cortes y coloración',
            defaultValue: 'Peluquería moderna especializada en cortes de tendencia y técnicas de coloración avanzadas'
          },
          {
            pregunta: '¿Qué hace única a tu peluquería?',
            placeholder: 'Describe lo que te diferencia...',
            defaultValue: 'Equipo de estilistas certificados con formación internacional y productos premium'
          },
          {
            pregunta: '¿Cuál es la página web o redes sociales?',
            placeholder: 'URLs de web y redes sociales',
            defaultValue: 'Instagram: @estiloycorte - Facebook: Estilo y Corte'
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
    informacionEstablecimiento: {
      general: {
        title: 'Información general del restaurante',
        questions: [
          {
            pregunta: '¿Cuál es el nombre del restaurante?',
            placeholder: 'Ej: La Trattoria',
            defaultValue: 'La Trattoria'
          },
          {
            pregunta: '¿Dónde está ubicado el restaurante?',
            placeholder: 'Dirección completa',
            defaultValue: 'Calle Gourmet 789, Ciudad Vieja'
          },
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
          },
          {
            pregunta: '¿Cuál es la página web o redes sociales?',
            placeholder: 'URLs de web y redes sociales',
            defaultValue: 'www.latrattoria.uy - Instagram: @latrattoriauy'
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
    informacionEstablecimiento: {
      general: {
        title: 'Información general de la clínica dental',
        questions: [
          {
            pregunta: '¿Cuál es el nombre de la clínica?',
            placeholder: 'Ej: Clínica Dental Sonrisa',
            defaultValue: 'Clínica Dental Sonrisa'
          },
          {
            pregunta: '¿Dónde está ubicada la clínica?',
            placeholder: 'Dirección completa',
            defaultValue: 'Av. Salud 456, Montevideo'
          },
          {
            pregunta: '¿Cuál es la especialidad o enfoque de la clínica?',
            placeholder: 'Especialidades',
            defaultValue: 'Clínica dental integral con especialidades en ortodoncia e implantes'
          },
          {
            pregunta: '¿Qué hace única a tu clínica?',
            placeholder: 'Diferenciadores',
            defaultValue: 'Tecnología de punta, equipo multidisciplinario, atención personalizada'
          },
          {
            pregunta: '¿Cuál es la página web o redes sociales?',
            placeholder: 'URLs',
            defaultValue: 'www.sonrisa.com.uy - Instagram: @clinicasonrisa'
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
    informacionEstablecimiento: {
      general: {
        title: 'Información general del negocio',
        questions: [
          {
            pregunta: '¿Cuál es el nombre del establecimiento?',
            placeholder: 'Nombre del negocio',
            defaultValue: 'Mi Negocio'
          },
          {
            pregunta: '¿Dónde está ubicado?',
            placeholder: 'Dirección completa',
            defaultValue: 'Dirección del establecimiento'
          },
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
  }
};

// Mapeo simplificado para los otros tipos de negocio (puedes expandirlos después)
businessTypeContent.medical_clinic = {
  ...businessTypeContent.dental_clinic,
  informacionEstablecimiento: {
    ...businessTypeContent.dental_clinic.informacionEstablecimiento,
    general: {
      ...businessTypeContent.dental_clinic.informacionEstablecimiento.general,
      title: 'Información general de la clínica médica'
    }
  }
};

businessTypeContent.fitness_center = businessTypeContent.other;
businessTypeContent.beauty_salon = businessTypeContent.hair_salon;
businessTypeContent.law_firm = businessTypeContent.other;
businessTypeContent.consulting = businessTypeContent.other;
businessTypeContent.real_estate = businessTypeContent.other;
businessTypeContent.automotive = businessTypeContent.other;

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

export interface BusinessContentConfig {
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