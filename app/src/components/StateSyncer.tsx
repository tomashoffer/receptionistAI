'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';

// This component ensures the client-side user state is in sync with the server-side session.
// Todas las llamadas al backend pasan por las API routes del frontend (/api/*)
export default function StateSyncer() {
  const { user, setUser, setIsLoading, setBusinesses, setActiveBusiness, activeBusiness: persistedActiveBusiness, _hasHydrated } = useUserStore();

  useEffect(() => {
    // Esperar a que el store se hidrate desde localStorage
    if (!_hasHydrated) {
      console.log('⏳ StateSyncer: Esperando hidratación del store...');
      return;
    }
    
    // This effect runs once when the component mounts.
    // It checks if the user is authenticated (has a session) but the client state is empty.
    if (!user) {
      const fetchUserAndBusinesses = async () => {
        try {
          setIsLoading(true);
          
          // Step 1: It calls our secure frontend API route to get the user data.
          const userResponse = await fetch('/api/auth/me', {
            credentials: 'include',
          });
          
          if (userResponse.ok) {
            const userData = await userResponse.json();
            console.log('StateSyncer: Respuesta completa de /api/auth/me:', userData);
            if (userData) {
              // If data is returned, it populates the global user store.
              setUser(userData);
              console.log('StateSyncer: Usuario sincronizado en el store:', userData);
              
              // Step 2: Fetch businesses for this user
              try {
                // Usar la API route del frontend para obtener los negocios
                const businessResponse = await fetch('/api/businesses', {
                  credentials: 'include',
                });
                
                if (businessResponse.ok) {
                  const businessData = await businessResponse.json();
                  const businessesList = Array.isArray(businessData) ? businessData : businessData ? [businessData] : [];
                  setBusinesses(businessesList);
                  
                  // Determinar qué business activar
                  if (businessesList.length > 0) {
                    // Verificar si hay un activeBusiness persistido y si aún existe
                    let businessToActivate = null;
                    let shouldFetchFull = false;
                    
                    if (persistedActiveBusiness?.id) {
                      // Buscar el business persistido en la lista actual
                      const foundBusiness = businessesList.find((b: any) => b.id === persistedActiveBusiness.id);
                      if (foundBusiness) {
                        businessToActivate = foundBusiness;
                        shouldFetchFull = true; // Siempre actualizar con datos frescos
                        console.log('✅ StateSyncer: Restaurando business persistido:', persistedActiveBusiness.name || persistedActiveBusiness.id);
                      } else {
                        console.log('⚠️ StateSyncer: Business persistido no existe más, usando primero por defecto');
                      }
                    }
                    
                    // Si no hay persistido o no existe más, usar el primero
                    if (!businessToActivate) {
                      businessToActivate = businessesList[0];
                      shouldFetchFull = true;
                      console.log('📌 StateSyncer: Usando primer business por defecto:', businessToActivate.name);
                    }
                    
                    // Cargar el business completo con la relación assistant
                    if (shouldFetchFull) {
                      try {
                        const fullBusinessResponse = await fetch(`/api/businesses/${businessToActivate.id}`, {
                          credentials: 'include',
                        });
                        
                        if (fullBusinessResponse.ok) {
                          const fullBusiness = await fullBusinessResponse.json();
                          setActiveBusiness(fullBusiness);
                          console.log('✅ StateSyncer: Business completo cargado:', fullBusiness.name, 'con assistant:', !!fullBusiness.assistant);
                        } else if (businessToActivate.assistant) {
                          // Si ya tiene assistant en la lista, usar ese
                          setActiveBusiness(businessToActivate);
                          console.log('✅ StateSyncer: Usando business de lista con assistant');
                        } else {
                          // Fallback al business sin relación
                          setActiveBusiness(businessToActivate);
                          console.log('⚠️ StateSyncer: Fallback a business sin assistant completo');
                        }
                      } catch (error) {
                        console.error('❌ StateSyncer: Error cargando business completo:', error);
                        // Fallback al business original
                        setActiveBusiness(businessToActivate);
                      }
                    }
                    
                    // Verificar que se estableció correctamente
                    setTimeout(() => {
                      const currentState = useUserStore.getState();
                      console.log('🔍 StateSyncer: Estado después de establecer activeBusiness:', {
                        activeBusiness: currentState.activeBusiness,
                        businesses: currentState.businesses.length,
                        hasAssistant: !!currentState.activeBusiness?.assistant,
                        vapiAssistantId: currentState.activeBusiness?.assistant?.vapi_assistant_id
                      });
                    }, 100);
                  } else {
                    // Usuario autenticado pero sin negocios - esto es válido, especialmente para nuevos usuarios
                    console.log('✅ StateSyncer: Usuario autenticado sin negocios (nuevo usuario). Pudiendo crear business.');
                    setBusinesses([]);
                    setActiveBusiness(null);
                  }
                } else if (businessResponse.status === 404 || businessResponse.status === 403) {
                  // El usuario no tiene businesses - esto es válido
                  console.log('✅ StateSyncer: Usuario sin negocios (nuevo), estableciendo arrays vacíos');
                  setBusinesses([]);
                  setActiveBusiness(null);
                } else {
                  console.warn('StateSyncer: Error cargando negocios, status:', businessResponse.status);
                  // Aún así, establecer arrays vacíos para permitir que el usuario continúe
                  setBusinesses([]);
                  setActiveBusiness(null);
                }
              } catch (error) {
                console.error('StateSyncer: Error cargando negocios:', error);
              }
            }
          } else if (userResponse.status === 401) {
            // User is not authenticated, which is an expected state. Do nothing.
            console.log('StateSyncer: Usuario no autenticado');
          } else {
            // For any other error (e.g., 500 server error), we should log it for debugging.
            console.error('StateSyncer: Falló al sincronizar el estado del usuario:', userResponse.status);
          }
        } catch (error) {
          // For any other error (e.g., network error), we should log it for debugging.
          console.error('StateSyncer: Error de red al sincronizar el estado del usuario:', error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchUserAndBusinesses();
    }
  }, [user, setUser, setBusinesses, setActiveBusiness, _hasHydrated, persistedActiveBusiness]); // Dependencies ensure this runs only when needed.

  // This component doesn't render anything visible
  return null;
}
