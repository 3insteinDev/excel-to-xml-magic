# Backend Proxy - Excel to XML

Backend Next.js que funciona como proxy para evitar problemas de CORS.

## Instalação

```bash
cd backend
npm install
```

## Desenvolvimento

```bash
npm run dev
```

O servidor estará disponível em `http://localhost:3011`

## Como funciona

O backend recebe requisições do frontend em `/api/proxy/*` e encaminha para `http://homolog.controleembarque.com.br/*`, resolvendo os problemas de CORS.

## Exemplo de uso

Frontend faz requisição para:
```
http://localhost:3011/api/proxy/webapi/cadastro/motorista
```

Backend encaminha para:
```
http://homolog.controleembarque.com.br/webapi/cadastro/motorista
```
