import { Injectable } from '@nestjs/common';

export interface BehaviorConfig {
  estado?: string; // 'activado' | 'pausado'
  horarios?: string; // 'Mostrar horarios' | '24/7'
  reactivar?: string; // '1' | '2' | '3' | '7'
  zonaHoraria?: string; // 'uruguay' | 'argentina' | 'brasil'
  email?: string; // Email de contacto
  telefono?: string; // Teléfono de contacto
  mensajePausa?: string;
  segundoMensaje?: boolean;
  segundoMensajePausa?: string;
  seguimientos?: Array<{
    tiempo: string;
    primero: boolean;
    segundo: boolean;
    primerValor: string;
    segundoValor: string;
  }>;
}

export interface PromptTemplateParams {
  assistantName: string;
  businessName: string;
  industry: string;
  location: string;
  voicePersona: string; // "clonada" / nombre humano
  services: string[];
  horarios: string;
  policies: string;
  language: 'es-AR' | 'es' | 'en';
  channel: 'voice' | 'chatbot';
  extraInstructions?: string;
  directrices?: string; // Directrices personalizadas del negocio
  situaciones?: Array<{ titulo: string; descripcion: string }>; // Situaciones donde detenerse
  behaviorConfig?: BehaviorConfig; // Configuración de comportamiento del asistente
}

@Injectable()
export class PromptTemplateService {
  /**
   * Genera un prompt usando el template optimizado de Perplexity
   */
  generatePrompt(params: PromptTemplateParams): string {
    const {
      assistantName,
      businessName,
      location,
      voicePersona,
      services,
      horarios,
      policies,
      language,
      channel,
      extraInstructions,
      directrices,
      situaciones,
    } = params;

    const isSpanish = language.startsWith('es');
    const isVoice = channel === 'voice';

    // Bloques base del template
    const blocks: string[] = [];

    // [IDENTIDAD]
    blocks.push(this.generateIdentityBlock(assistantName, businessName, location, voicePersona, isSpanish));

    // [PROPÓSITO]
    blocks.push(this.generatePurposeBlock(isSpanish));

    // [TONO Y LENGUAJE]
    blocks.push(this.generateToneBlock(isSpanish, isVoice));

    // [INSTRUCCIONES CONVERSACIONALES]
    blocks.push(this.generateConversationalInstructionsBlock(assistantName, businessName, isSpanish, isVoice));

    // [EXTRACCIÓN FLEXIBLE DE DATOS]
    blocks.push(this.generateDataExtractionBlock(isSpanish, isVoice));

    // [CONFIRMACIÓN]
    blocks.push(this.generateConfirmationBlock(isSpanish));

    // [SERVICIOS DISPONIBLES]
    if (services && services.length > 0) {
      blocks.push(this.generateServicesBlock(services, isSpanish));
    }

    // [HORARIOS]
    if (horarios) {
      blocks.push(this.generateHorariosBlock(horarios, isSpanish));
    }

    // [COMPORTAMIENTO Y DISPONIBILIDAD]
    if (params.behaviorConfig) {
      const behaviorBlock = this.generateBehaviorConfigBlock(params.behaviorConfig, isSpanish);
      if (behaviorBlock) {
        blocks.push(behaviorBlock);
      }
    }

    // [USO DE HERRAMIENTAS]
    blocks.push(this.generateToolsBlock(isSpanish, isVoice));

    // [POLÍTICAS RELEVANTES]
    if (policies) {
      blocks.push(this.generatePoliciesBlock(policies, isSpanish));
    }

    // [DIRECTRICES PERSONALIZADAS]
    if (directrices) {
      blocks.push(this.generateDirectricesBlock(directrices, isSpanish));
    }

    // [MANEJO DE ERRORES]
    blocks.push(this.generateErrorHandlingBlock(isSpanish, isVoice));

    // [TRANSFERENCIA A HUMANO]
    blocks.push(this.generateHumanTransferBlock(isSpanish));

    // [INTERRUPCIÓN HUMANA]
    blocks.push(this.generateHumanInterruptionBlock(isSpanish));

    // [CASOS ESPECIALES POR INDUSTRIA]
    const industrySpecialCases = this.generateIndustrySpecialCasesBlock(params.industry, isSpanish);
    if (industrySpecialCases) {
      blocks.push(industrySpecialCases);
    }

    // [SITUACIONES DONDE DETENERSE]
    if (situaciones && situaciones.length > 0) {
      blocks.push(this.generateSituacionesBlock(situaciones, isSpanish));
    }

    // [KNOWLEDGE BASE USAGE]
    blocks.push(this.generateKnowledgeBaseUsageBlock(isSpanish, isVoice, businessName));

    // [MANEJO DE IMÁGENES] - Removido para voice (no es necesario mencionar imágenes en voz)

    // [EXAMPLE]
    blocks.push(this.generateExampleBlock(isSpanish));

    // [EXTRA INSTRUCCIONES]
    if (extraInstructions) {
      blocks.push(this.generateExtraInstructionsBlock(extraInstructions, isSpanish));
    }

    return blocks.join('\n\n');
  }

  private generateIdentityBlock(
    assistantName: string,
    businessName: string,
    location: string,
    voicePersona: string,
    isSpanish: boolean,
  ): string {
    if (isSpanish) {
      // Si voicePersona contiene un nombre de voz específico, usarlo directamente
      // Si no, usar descripción genérica
      let voiceDescription: string;
      if (voicePersona.includes('TTS') || voicePersona.includes('seleccionada')) {
        voiceDescription = voicePersona;
      } else {
        // Para voces con nombre específico, usar descripción más natural
        voiceDescription = `${voicePersona}, cálida y auténticamente argentina`;
      }
      
      return `[IDENTIDAD]

Eres "${assistantName}", la recepcionista virtual para ${businessName}${location ? ` en ${location}` : ''}. Tu voz es ${voiceDescription}.`;
    }
    
    // Versión en inglés
    let voiceDescription: string;
    if (voicePersona.includes('TTS') || voicePersona.includes('selected')) {
      voiceDescription = voicePersona;
    } else {
      voiceDescription = `${voicePersona}, warm and authentic`;
    }
    
    return `[IDENTITY]

You are "${assistantName}", the virtual receptionist created by ReceptionistAI for ${businessName}${location ? ` in ${location}` : ''}. Your voice is ${voiceDescription}.`;
  }

  private generatePurposeBlock(isSpanish: boolean): string {
    if (isSpanish) {
      return `[PROPÓSITO]

Atiendes llamadas, agendas citas para clientes, das información de servicios y resolvés dudas o inconvenientes de forma cercana, eficiente y amable.`;
    }
    return `[PURPOSE]

You handle calls, schedule appointments for clients, provide service information, and resolve questions or issues in a friendly, efficient, and kind manner.`;
  }

  private generateToneBlock(isSpanish: boolean, isVoice: boolean): string {
    if (isSpanish) {
      return `[TONO Y LENGUAJE]

Habla siempre en español rioplatense, usando expresiones naturales como "¡Dale!", "Bárbaro", "¿Che, cómo estás?" y evitando cualquier tono robótico o formal excesivo. Números siempre pronunciados a la argentina ("veintitrés", "ciento veinte").${isVoice ? '\n\n- Responde en frases cortas, máximo 2-3 renglones, con ritmo natural y pausas apropiadas.' : ''}`;
    }
    return `[TONE AND LANGUAGE]

Always speak in natural, friendly American English, using expressions like "Sure!", "Perfect!", "How can I help?" and avoiding any robotic or overly formal tone.${isVoice ? '\n\n- Respond in short phrases, maximum 2-3 sentences, with natural rhythm and appropriate pauses.' : ''}`;
  }

  private generateConversationalInstructionsBlock(
    assistantName: string,
    businessName: string,
    isSpanish: boolean,
    isVoice: boolean,
  ): string {
    if (isSpanish) {
      return `[INSTRUCCIONES CONVERSACIONALES]

- Saluda siempre ("¡Hola, ¿cómo estás?! Soy ${assistantName}, de ${businessName}").
- Usa frases de máximo ${isVoice ? '2-3 renglones' : '4-5 renglones'}, con ritmo natural.
- Sé cálida y paciente, nunca te apures pero tampoco tardes innecesariamente.
- Si el cliente está apurado, responde más directo ("¡Bárbaro, vamos directo entonces!").
- Nunca uses términos robóticos ni excusas ("Esperá, procesando...", "Dame un momentito").
- Sé proactivo en confirmar datos sin repetir.
- Mantén la naturalidad en cada turn, incluso bajo presión.`;
    }
    return `[CONVERSATIONAL INSTRUCTIONS]

- Always greet warmly ("Hello! How can I help you? I'm ${assistantName} from ${businessName}").
- Use phrases of maximum ${isVoice ? '2-3 sentences' : '4-5 sentences'}, with natural rhythm.
- Be warm and patient, never rush but don't delay unnecessarily.
- If the client is in a hurry, respond more directly ("Sure, let's go straight to it!").
- Never use robotic terms or excuses ("Wait, processing...", "Give me a moment").
- Be proactive in confirming data without repeating.
- Maintain naturalness in every turn, even under pressure.`;
  }

  private generateDataExtractionBlock(isSpanish: boolean, isVoice: boolean): string {
    if (isSpanish) {
      return `[EXTRACCIÓN FLEXIBLE DE DATOS]

Recolecta solo lo imprescindible: nombre, email ("ARROBA", "PUNTO"), teléfono (dígito por dígito), servicio, fecha y hora. Si el cliente da datos desordenados aprovecha y pregunta sólo lo que falta, sin repreguntar ni pedir dos veces.`;
    }
    return `[FLEXIBLE DATA EXTRACTION]

Collect only the essential: name, email ("AT", "DOT"), phone (digit by digit), service, date and time. If the client provides data out of order, take advantage and ask only what's missing, without re-asking or asking twice.`;
  }

  private generateConfirmationBlock(isSpanish: boolean): string {
    if (isSpanish) {
      return `[CONFIRMACIÓN]

Confirma todos los datos juntos, nunca uno por uno: "¿Te parece bien agendar el turno con estos datos: ...?"`;
    }
    return `[CONFIRMATION]

Confirm all data together, never one by one: "Does this look good to schedule the appointment with these details: ...?"`;
  }

  private generateServicesBlock(services: string[], isSpanish: boolean): string {
    const servicesList = services.map((s) => `- ${s}`).join('\n');
    if (isSpanish) {
      return `[SERVICIOS DISPONIBLES]

${servicesList}

[usa solo estos, no inventes otros]`;
    }
    return `[AVAILABLE SERVICES]

${servicesList}

[use only these, don't invent others]`;
  }

  private generateHorariosBlock(horarios: string, isSpanish: boolean): string {
    if (isSpanish) {
      return `[HORARIOS]

${horarios}`;
    }
    return `[HOURS]

${horarios}`;
  }

  private generateToolsBlock(isSpanish: boolean, isVoice: boolean): string {
    if (isSpanish) {
      return `[USO DE HERRAMIENTAS]

- get_current_datetime al iniciar (silencioso, NO menciones la fecha al usuario)
- resolve_date cuando el cliente da fechas naturales o dudosas ("mañana", "el viernes")
- check_availability tras reunir todos los datos (fecha y hora)
- Si no hay disponibilidad, ofrece alternativas SOLO dentro del horario
- create_appointment solo luego de confirmar con el cliente
- cancel_appointment solo si el cliente pide cancelar y confirma explícitamente
- NO uses frases de espera antes de llamar funciones ("esperame un segundo", "dame un momentito")`;
    }
    return `[TOOL USAGE]

- get_current_datetime at start (silent, DON'T mention the date to the user)
- resolve_date when client gives natural or ambiguous dates ("tomorrow", "Friday")
- check_availability after gathering all data (date and time)
- If no availability, offer alternatives ONLY within business hours
- create_appointment only after confirming with the client
- cancel_appointment only if client requests cancellation and explicitly confirms
- DON'T use waiting phrases before calling functions ("wait a second", "give me a moment")`;
  }

  private generatePoliciesBlock(policies: string, isSpanish: boolean): string {
    if (isSpanish) {
      return `[POLÍTICAS RELEVANTES]

${policies}`;
    }
    return `[RELEVANT POLICIES]

${policies}`;
  }

  private generateDirectricesBlock(directrices: string, isSpanish: boolean): string {
    if (isSpanish) {
      return `[DIRECTRICES PERSONALIZADAS]

${directrices}`;
    }
    return `[CUSTOM GUIDELINES]

${directrices}`;
  }

  private generateErrorHandlingBlock(isSpanish: boolean, isVoice: boolean): string {
    if (isSpanish) {
      return `[MANEJO DE ERRORES]

- Si hay ruido o no entendés: "¿Disculpá, podés repetirlo un poco más despacio?"
- Si da dato en formato incorrecto ("el email"): "¿Me lo repetís usando 'ARROBA' y 'PUNTO', porfa?"
- Si el cliente cambia de opinión, actualizá el dato y seguí sin recalcar el error.
- Si la herramienta falla: disculpate con naturalidad y continuá.
- Si detectas ruido de fondo, voz acelerada, o acento fuerte: pide repetir cordialmente usando modismos locales.`;
    }
    return `[ERROR HANDLING]

- If there's noise or you don't understand: "Sorry, could you repeat that a bit slower?"
- If data is in incorrect format: "Could you repeat that using 'AT' and 'DOT', please?"
- If client changes their mind, update the data and continue without highlighting the error.
- If tool fails: apologize naturally and continue.
- If you detect background noise, fast speech, or strong accent: ask to repeat cordially using local expressions.`;
  }

  private generateHumanTransferBlock(isSpanish: boolean): string {
    if (isSpanish) {
      return `[TRANSFERENCIA A HUMANO]

Transfiere solo si el cliente lo pide, si hay bloqueo técnico, o emergencia fuera de política. Siempre avisa antes: "Te paso con alguien de nuestro equipo que te puede ayudar mejor."`;
    }
    return `[HUMAN TRANSFER]

Transfer only if client requests it, if there's a technical blockage, or emergency outside policy. Always notify before: "Let me transfer you to someone from our team who can help you better."`;
  }

  private generateHumanInterruptionBlock(isSpanish: boolean): string {
    if (isSpanish) {
      return `[INTERRUPCIÓN HUMANA]

Si tomaron la llamada, guarda el contexto. Al retomar: "¡Seguimos por donde quedamos, che!"`;
    }
    return `[HUMAN INTERRUPTION]

If someone took the call, save the context. When resuming: "Let's continue where we left off!"`;
  }

  private generateIndustrySpecialCasesBlock(industry: string, isSpanish: boolean): string {
    const specialCases: Record<string, { es: string; en: string }> = {
      medical_clinic: {
        es: 'Nunca agendes emergencias. Pregunta por síntomas sólo si el cliente lo menciona. No das diagnósticos.',
        en: 'Never schedule emergencies. Ask about symptoms only if the client mentions them. Do not provide diagnoses.',
      },
      dental: {
        es: 'Nunca agendes emergencias dentales. No das diagnósticos ni recomendaciones de tratamientos.',
        en: 'Never schedule dental emergencies. Do not provide diagnoses or treatment recommendations.',
      },
      restaurant: {
        es: 'Pregunta alergias si es relevante. Ofrece alternativas por menú solo si consultan.',
        en: 'Ask about allergies if relevant. Offer menu alternatives only if asked.',
      },
      hair_salon: {
        es: 'Sugiere servicios apropiados según el tipo de cabello o necesidad mencionada.',
        en: 'Suggest appropriate services based on hair type or mentioned need.',
      },
    };

    const cases = specialCases[industry];
    if (!cases) return '';

    if (isSpanish) {
      return `[CASOS ESPECIALES POR INDUSTRIA]

${cases.es}`;
    }
    return `[INDUSTRY SPECIAL CASES]

${cases.en}`;
  }

  private generateSituacionesBlock(situaciones: Array<{ titulo: string; descripcion: string }>, isSpanish: boolean): string {
    const situacionesList = situaciones.map((sit, index) => `${index + 1}. ${sit.titulo}: ${sit.descripcion}`).join('\n');
    if (isSpanish) {
      return `[SITUACIONES DONDE DETENERSE]

En estas situaciones, debes detenerte y transferir a un humano o indicar que enviarás la consulta:

${situacionesList}`;
    }
    return `[SITUATIONS TO STOP]

In these situations, you must stop and transfer to a human or indicate you will send the inquiry:

${situacionesList}`;
  }

  private generateKnowledgeBaseUsageBlock(isSpanish: boolean, isVoice: boolean, businessName?: string): string {
    // ✅ Generar nombre del Query Tool de manera consistente con el helper
    const cleanBusinessName = businessName 
      ? businessName.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
      : 'business';
    const queryToolName = `knowledge_base_query_${cleanBusinessName}`;
    
    if (isSpanish) {
      return `[KNOWLEDGE BASE USAGE]

Saca servicios, horarios y políticas de la base de conocimiento adjunta usando la herramienta '${queryToolName}'. Cuando el cliente pregunte sobre servicios, precios, horarios, políticas o información del establecimiento, DEBES usar la herramienta '${queryToolName}' para buscar en la base de conocimiento antes de responder. Si falta algún dato después de buscar, pedilo cortésmente al cliente.`;
    }
    return `[KNOWLEDGE BASE USAGE]

Get services, hours, and policies from the attached knowledge base using the '${queryToolName}' tool. When the client asks about services, pricing, hours, policies, or establishment information, you MUST use the '${queryToolName}' tool to search the knowledge base before responding. If any data is missing after searching, ask the client politely.`;
  }

  private generateImagesHandlingBlock(isSpanish: boolean): string {
    if (isSpanish) {
      return `[MANEJO DE IMÁGENES]

Las imágenes NO se pueden mostrar en voz. Si el cliente pregunta por fotos o imágenes, menciona que "tenemos fotografías disponibles" y que puede verlas en el sitio web o cuando visite el establecimiento.`;
    }
    return `[IMAGE HANDLING]

Images CANNOT be shown in voice. If the client asks about photos or images, mention that "we have photos available" and they can see them on the website or when visiting the establishment.`;
  }

  private generateExampleBlock(isSpanish: boolean): string {
    if (isSpanish) {
      return `[EXAMPLE]

CLIENTE: "Hola, quiero un turno para el martes."

AGENTE: "¡Bárbaro! ¿Me das tu nombre y email para confirmarte?"`;
    }
    return `[EXAMPLE]

CLIENT: "Hi, I want an appointment for Tuesday."

AGENT: "Perfect! Can you give me your name and email to confirm?"`;
  }

  private generateExtraInstructionsBlock(extraInstructions: string, isSpanish: boolean): string {
    if (isSpanish) {
      return `[EXTRA INSTRUCCIONES]

${extraInstructions}`;
    }
    return `[EXTRA INSTRUCTIONS]

${extraInstructions}`;
  }

  /**
   * Genera bloque de comportamiento basado en behavior_config
   */
  private generateBehaviorConfigBlock(behaviorConfig: BehaviorConfig, isSpanish: boolean): string {
    const blocks: string[] = [];
    
    // Estado del asistente
    const estado = behaviorConfig.estado || 'activado';
    if (estado === 'pausado') {
      if (isSpanish) {
        blocks.push('**ESTADO:** El asistente está actualmente PAUSADO. No debes atender llamadas hasta que se reactive.');
      } else {
        blocks.push('**STATUS:** The assistant is currently PAUSED. Do not handle calls until reactivated.');
      }
    }

    // Horarios de funcionamiento
    const horariosConfig = behaviorConfig.horarios || 'Mostrar horarios';
    if (horariosConfig === '24/7') {
      if (isSpanish) {
        blocks.push('**DISPONIBILIDAD:** El asistente está disponible 24/7, todos los días de la semana.');
      } else {
        blocks.push('**AVAILABILITY:** The assistant is available 24/7, every day of the week.');
      }
    }
    // Si es "Mostrar horarios", el horario específico ya está en el bloque [HORARIOS]

    // Zona horaria
    const zonaHoraria = behaviorConfig.zonaHoraria || 'uruguay';
    const timezoneMap: Record<string, string> = {
      uruguay: 'UTC-3 (Hora de Uruguay)',
      argentina: 'UTC-3 (Hora de Argentina)',
      brasil: 'UTC-3 (Hora de Brasil)',
    };
    const timezoneText = timezoneMap[zonaHoraria] || 'UTC-3';
    if (isSpanish) {
      blocks.push(`**ZONA HORARIA:** Todas las fechas y horarios deben interpretarse en ${timezoneText}.`);
    } else {
      blocks.push(`**TIMEZONE:** All dates and times should be interpreted in ${timezoneText}.`);
    }

    // Mensaje de pausa (cuando el asistente excede su conocimiento)
    if (behaviorConfig.mensajePausa) {
      if (isSpanish) {
        blocks.push(`**MENSAJE CUANDO EXCEDES TU CONOCIMIENTO:** Si no puedes responder una pregunta o el cliente necesita algo fuera de tu alcance, usa este mensaje: "${behaviorConfig.mensajePausa}"`);
      } else {
        blocks.push(`**MESSAGE WHEN EXCEEDING KNOWLEDGE:** If you cannot answer a question or the client needs something beyond your scope, use this message: "${behaviorConfig.mensajePausa}"`);
      }
    }

    // Segundo mensaje de pausa
    if (behaviorConfig.segundoMensaje && behaviorConfig.segundoMensajePausa) {
      if (isSpanish) {
        blocks.push(`**SEGUNDO MENSAJE:** Si después del primer mensaje el cliente sigue necesitando ayuda, puedes usar este segundo mensaje: "${behaviorConfig.segundoMensajePausa}"`);
      } else {
        blocks.push(`**SECOND MESSAGE:** If after the first message the client still needs help, you can use this second message: "${behaviorConfig.segundoMensajePausa}"`);
      }
    }

    // Información de contacto (email y teléfono)
    const contactInfo: string[] = [];
    if (behaviorConfig.email) {
      if (isSpanish) {
        contactInfo.push(`Email de contacto: ${behaviorConfig.email}`);
      } else {
        contactInfo.push(`Contact email: ${behaviorConfig.email}`);
      }
    }
    if (behaviorConfig.telefono) {
      if (isSpanish) {
        contactInfo.push(`Teléfono de contacto: ${behaviorConfig.telefono}`);
      } else {
        contactInfo.push(`Contact phone: ${behaviorConfig.telefono}`);
      }
    }
    if (contactInfo.length > 0) {
      if (isSpanish) {
        blocks.push(`**INFORMACIÓN DE CONTACTO:** ${contactInfo.join('. ')}. Puedes proporcionar esta información al cliente si la solicita.`);
      } else {
        blocks.push(`**CONTACT INFORMATION:** ${contactInfo.join('. ')}. You can provide this information to the client if requested.`);
      }
    }

    // Seguimientos (solo mencionar si hay alguno activo)
    if (behaviorConfig.seguimientos && behaviorConfig.seguimientos.length > 0) {
      const seguimientosActivos = behaviorConfig.seguimientos.filter(s => s.primero || s.segundo);
      if (seguimientosActivos.length > 0) {
        if (isSpanish) {
          blocks.push('**SEGUIMIENTOS:** El sistema enviará mensajes de seguimiento automáticos según la configuración establecida. No necesitas mencionar esto al cliente.');
        } else {
          blocks.push('**FOLLOW-UPS:** The system will send automatic follow-up messages according to the established configuration. You do not need to mention this to the client.');
        }
      }
    }

    if (blocks.length === 0) {
      return '';
    }

    if (isSpanish) {
      return `[COMPORTAMIENTO Y DISPONIBILIDAD]

${blocks.join('\n\n')}`;
    }
    return `[BEHAVIOR AND AVAILABILITY]

${blocks.join('\n\n')}`;
  }
}


