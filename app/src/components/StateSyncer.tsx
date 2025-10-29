'use client';

import { useEffect } from 'react';
import { useUserStore } from '@/stores/userStore';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';

// This component ensures the client-side user state is in sync with the server-side session.
export default function StateSyncer() {
  const { user, setUser, setIsLoading, setBusinesses, setActiveBusiness } = useUserStore();

  useEffect(() => {
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
                // Get the token from the backend endpoint
                const tokenResponse = await fetch(`${API_BASE_URL}/auth/token`, {
                  credentials: 'include',
                });
                
                let authHeaders = {};
                if (tokenResponse.ok) {
                  const tokenData = await tokenResponse.json();
                  if (tokenData.accessToken) {
                    authHeaders = {
                      'Authorization': `Bearer ${tokenData.accessToken}`,
                      'Content-Type': 'application/json',
                    };
                  }
                }
                
                const businessResponse = await fetch(`${API_BASE_URL}/businesses`, {
                  credentials: 'include',
                  headers: authHeaders,
                });
                
                if (businessResponse.ok) {
                  const businessData = await businessResponse.json();
                  const businessesList = Array.isArray(businessData) ? businessData : businessData ? [businessData] : [];
                  setBusinesses(businessesList);
                  
                  // Set the first business as active by default
                  if (businessesList.length > 0) {
                    const firstBusiness = businessesList[0];
                    
                    // Si el business ya tiene la relación assistant, usarlo directamente
                    if (firstBusiness.assistant) {
                      setActiveBusiness(firstBusiness);
                      console.log('StateSyncer: Negocios sincronizados con assistant:', businessesList);
                    } else {
                      // Si no tiene la relación assistant, hacer fetch completo del primer business
                      try {
                        const fullBusinessResponse = await fetch(`${API_BASE_URL}/businesses/${firstBusiness.id}`, {
                          credentials: 'include',
                          headers: authHeaders,
                        });
                        
                        if (fullBusinessResponse.ok) {
                          const fullBusiness = await fullBusinessResponse.json();
                          setActiveBusiness(fullBusiness);
                          console.log('StateSyncer: Business completo cargado:', fullBusiness);
                        } else {
                          // Fallback al business sin relación
                          setActiveBusiness(firstBusiness);
                          console.log('StateSyncer: Fallback a business sin assistant');
                        }
                      } catch (error) {
                        console.error('StateSyncer: Error cargando business completo:', error);
                        // Fallback al business sin relación
                        setActiveBusiness(firstBusiness);
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
  }, [user, setUser, setBusinesses, setActiveBusiness]); // Dependencies ensure this runs only when needed.

  // This component doesn't render anything visible
  return null;
}
