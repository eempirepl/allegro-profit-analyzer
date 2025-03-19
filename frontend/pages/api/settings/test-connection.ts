import { NextApiRequest, NextApiResponse } from 'next';
import axios from 'axios';

// Funkcja do testowania połączenia z BaseLinker API
const testBaseLinkerConnection = async (token: string): Promise<boolean> => {
  try {
    // Utworzenie parametrów żądania
    const params = new URLSearchParams();
    params.append('token', token);
    params.append('method', 'getJournalList'); // Używamy prostej metody do testowania połączenia
    
    // Wykonanie żądania do BaseLinker API
    const response = await axios.post('https://api.baselinker.com/connector.php', params, {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded'
      }
    });
    
    // Sprawdzenie odpowiedzi
    if (response.data && !response.data.error_code) {
      return true;
    }
    
    return false;
  } catch (error) {
    console.error('Błąd podczas testowania połączenia z BaseLinker API:', error);
    return false;
  }
};

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  // Zabezpieczenie przed dostępem z zewnątrz - tylko żądania z tej samej domeny
  const referer = req.headers.referer || '';
  const host = req.headers.host || '';
  
  if (!referer.includes(host)) {
    return res.status(403).json({ success: false, message: 'Brak dostępu' });
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
  const connectionSuccessful = await testBaseLinkerConnection(token);
  
  if (connectionSuccessful) {
    return res.status(200).json({ 
      success: true, 
      message: 'Połączenie z BaseLinker API działa poprawnie' 
    });
  } else {
    return res.status(400).json({ 
      success: false, 
      message: 'Błąd połączenia z BaseLinker API. Sprawdź poprawność tokenu.' 
    });
  }
} 