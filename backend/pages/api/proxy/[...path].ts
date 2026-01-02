// pages/api/proxy/[...path].ts
import type { NextApiRequest, NextApiResponse } from 'next';

const BASE_URL = 'http://homolog.controleembarque.com.br';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  // Trata requisições OPTIONS (preflight)
  if (req.method === 'OPTIONS') {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Access-Control-Max-Age', '86400');
    return res.status(200).end();
  }

  const { path } = req.query;
  
  // Reconstrói o caminho completo
  const apiPath = Array.isArray(path) ? path.join('/') : path;
  const targetUrl = `${BASE_URL}/${apiPath}`;

  console.log(`[PROXY] ${req.method} ${targetUrl}`);

  try {
    // Prepara os headers
    const headers: HeadersInit = {
      'Content-Type': req.headers['content-type'] || 'text/xml; charset=utf-8',
    };

    // Adiciona outros headers relevantes
    if (req.headers.authorization) {
      headers['Authorization'] = req.headers.authorization as string;
    }

    // Prepara o body (para métodos que aceitam body)
    let body: string | undefined;
    if (req.method !== 'GET' && req.method !== 'HEAD') {
      if (typeof req.body === 'string') {
        body = req.body;
      } else if (typeof req.body === 'object') {
        body = JSON.stringify(req.body);
      }
    }

    const response = await fetch(targetUrl, {
      method: req.method,
      headers,
      body,
    });

    const data = await response.text();
    
    // Define os headers CORS
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
    res.setHeader('Content-Type', response.headers.get('content-type') || 'text/xml');
    
    console.log(`[PROXY] Response: ${response.status}`);
    res.status(response.status).send(data);
  } catch (error) {
    console.error('[PROXY] Error:', error);
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.status(500).json({ 
      error: 'Erro ao fazer proxy da requisição',
      details: error instanceof Error ? error.message : 'Erro desconhecido'
    });
  }
}

export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};
