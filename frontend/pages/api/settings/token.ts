import { NextApiRequest, NextApiResponse } from 'next';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const readFile = promisify(fs.readFile);
const writeFile = promisify(fs.writeFile);
const access = promisify(fs.access);
const mkdir = promisify(fs.mkdir);

// Ścieżka do pliku .env
const envFilePath = path.resolve(process.cwd(), '../backend/.env');

// Funkcja sprawdzająca czy plik istnieje
const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await access(filePath);
    return true;
  } catch {
    return false;
  }
};

// Funkcja tworząca plik .env jeśli nie istnieje
const createEnvFileIfNotExists = async (): Promise<void> => {
  try {
    const exists = await fileExists(envFilePath);
    if (!exists) {
      // Upewnij się, że katalog backend istnieje
      const backendDir = path.dirname(envFilePath);
      try {
        await access(backendDir);
      } catch {
        await mkdir(backendDir, { recursive: true });
      }
      // Utwórz pusty plik .env
      await writeFile(envFilePath, '', 'utf8');
    }
  } catch (error) {
    console.error('Błąd podczas tworzenia pliku .env:', error);
    throw error;
  }
};

// Funkcja do odczytania aktualnego tokenu z pliku .env
const getTokenFromEnv = async (): Promise<string> => {
  try {
    await createEnvFileIfNotExists();
    const envData = await readFile(envFilePath, 'utf8');
    const tokenMatch = envData.match(/BASELINKER_API_TOKEN=(.+)/);
    return tokenMatch ? tokenMatch[1].trim() : '';
  } catch (error) {
    console.error('Błąd podczas odczytywania pliku .env:', error);
    return '';
  }
};

// Funkcja do zapisania tokenu do pliku .env
const saveTokenToEnv = async (token: string): Promise<boolean> => {
  try {
    await createEnvFileIfNotExists();
    
    let envData = '';
    try {
      envData = await readFile(envFilePath, 'utf8');
    } catch {
      // Jeśli nie można odczytać pliku, zaczniemy od pustego pliku
      envData = '';
    }
    
    // Sprawdzenie, czy token już istnieje w pliku
    if (envData.includes('BASELINKER_API_TOKEN=')) {
      // Aktualizacja istniejącego tokenu
      const updatedEnvData = envData.replace(
        /BASELINKER_API_TOKEN=.+/,
        `BASELINKER_API_TOKEN=${token}`
      );
      await writeFile(envFilePath, updatedEnvData, 'utf8');
    } else {
      // Dodanie nowego tokenu na końcu pliku
      const updatedEnvData = envData ? `${envData}\nBASELINKER_API_TOKEN=${token}\n` : `BASELINKER_API_TOKEN=${token}\n`;
      await writeFile(envFilePath, updatedEnvData, 'utf8');
    }
    
    return true;
  } catch (error) {
    console.error('Błąd podczas zapisywania tokenu do pliku .env:', error);
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
  
  // Obsługa różnych metod HTTP
  if (req.method === 'GET') {
    // Pobieranie tokenu
    const token = await getTokenFromEnv();
    return res.status(200).json({ token: token || '' });
  } else if (req.method === 'POST') {
    // Zapisywanie tokenu
    const { token } = req.body;
    
    if (!token) {
      return res.status(400).json({ 
        success: false, 
        message: 'Nie podano tokenu API' 
      });
    }
    
    const success = await saveTokenToEnv(token);
    
    if (success) {
      // Ustawienie tokenu w zmiennych środowiskowych dla bieżącej sesji
      process.env.BASELINKER_API_TOKEN = token;
      
      return res.status(200).json({ 
        success: true, 
        message: 'Token API został zapisany pomyślnie' 
      });
    } else {
      return res.status(500).json({ 
        success: false, 
        message: 'Wystąpił błąd podczas zapisywania tokenu API' 
      });
    }
  } else {
    // Nieobsługiwana metoda HTTP
    return res.status(405).json({ 
      success: false, 
      message: 'Metoda nie jest obsługiwana' 
    });
  }
} 