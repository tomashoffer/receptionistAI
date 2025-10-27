import { NextRequest, NextResponse } from 'next/server';

export async function POST(
  request: NextRequest,
  { params }: { params: { businessId: string } }
) {
  try {
    const businessId = params.businessId;
    const body = await request.json();

    console.log(`Webhook VAPI recibido para business ${businessId}:`, body);

    // Verificar el webhook secret si está configurado
    const webhookSecret = process.env.VAPI_WEBHOOK_SECRET;
    if (webhookSecret) {
      const signature = request.headers.get('x-vapi-signature');
      if (!signature) {
        return NextResponse.json({ error: 'Signature missing' }, { status: 401 });
      }
      // TODO: Implementar verificación de signature
    }

    // Procesar diferentes tipos de eventos de VAPI
    switch (body.type) {
      case 'call-started':
        console.log(`Llamada iniciada para business ${businessId}:`, body.call);
        break;
      
      case 'call-ended':
        console.log(`Llamada finalizada para business ${businessId}:`, body.call);
        // Aquí podrías guardar la información de la llamada en tu base de datos
        break;
      
      case 'transcript':
        console.log(`Transcript recibido para business ${businessId}:`, body.transcript);
        // Aquí podrías guardar el transcript en tu base de datos
        break;
      
      case 'function-call':
        console.log(`Function call para business ${businessId}:`, body.functionCall);
        // Aquí podrías procesar function calls específicos
        break;
      
      default:
        console.log(`Evento desconocido para business ${businessId}:`, body);
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Error procesando webhook de VAPI:', error);
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    );
  }
}
