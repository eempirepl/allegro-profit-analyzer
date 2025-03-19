import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

interface BaseLinkerError {
  error_code?: string;
  error_message?: string;
}

// Funkcja do testowania połączenia z BaseLinker API
const testBaseLinkerConnection = async (token: string): Promise<{ success: boolean; message: string }> => {
  try {
    // Utworzenie parametrów żądania
    const params = new URLSearchParams();
    params.append('token', token);
    params.append('method', 'getStoragesList'); // Używamy metody, która nie wymaga dodatkowych parametrów
    
    // Wykonanie żądania do BaseLinker API
    const response = await axios.post('https://api.baselinker.com/connector.php', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Sprawdzenie odpowiedzi
    if (response.data) {
      if (response.data.error_code) {
        // Jeśli BaseLinker zwrócił kod błędu
        const error = response.data as BaseLinkerError;
        return {
          success: false,
          message: `Błąd BaseLinker API: ${error.error_message || error.error_code}`
        };
      }
      
      // Jeśli nie ma błędu, połączenie jest poprawne
      return {
        success: true,
        message: 'Połączenie z BaseLinker API działa poprawnie'
      };
    }
    
    return {
      success: false,
      message: 'Otrzymano nieprawidłową odpowiedź z BaseLinker API'
    };
  } catch (error: any) {
    console.error('Błąd podczas testowania połączenia z BaseLinker API:', error);
    
    // Sprawdzenie czy błąd pochodzi z axios
    if (error.response) {
      // Serwer odpowiedział kodem błędu
      return {
        success: false,
        message: `Błąd serwera BaseLinker (${error.response.status}): ${error.response.data?.error_message || 'Nieznany błąd'}`
      };
    } else if (error.request) {
      // Nie otrzymano odpowiedzi
      return {
        success: false,
        message: 'Nie można połączyć się z serwerem BaseLinker. Sprawdź połączenie internetowe.'
      };
    }
    
    // Inny błąd
    return {
      success: false,
      message: `Błąd podczas testowania połączenia: ${error.message}`
    };
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Zabezpieczenie przed dostępem z zewnątrz - tylko żądania z tej samej domeny
  const referer = req.headers.referer || '';
  const host = req.headers.host || '';
  
  if (!referer.includes(host)) {
    return res.status(403).json({ 
      success: false, 
      message: 'Brak dostępu' 
    });
  }
  
  // Tylko metoda POST jest obsługiwana
  if (req.method !== 'POST') {
    return res.status(405).json({ 
      success: false, 
      message: 'Metoda nie jest obsługiwana' 
    });
  }
  
  // Odczytanie tokenu z żądania
  const { token } = req.body;
  
  if (!token) {
    return res.status(400).json({ 
      success: false, 
      message: 'Nie podano tokenu API' 
    });
  }
  
  // Testowanie połączenia
  const result = await testBaseLinkerConnection(token);
  
  if (result.success) {
    return res.status(200).json(result);
  } else {
    return res.status(400).json(result);
  }
} 