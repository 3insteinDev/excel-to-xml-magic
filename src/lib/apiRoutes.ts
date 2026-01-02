// src/lib/apiRoutes.ts
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3001';

export const apiRoutes = {
  motorista: `${BACKEND_URL}/api/proxy/webapi/cadastro/motorista`,
  veiculo: `${BACKEND_URL}/api/proxy/webapi/cadastro/veiculo`,
  transportador: `${BACKEND_URL}/api/proxy/webapi/cadastro/participante`,
  pessoa_fisica: `${BACKEND_URL}/api/proxy/webapi/cadastro/participante`,
  pessoa_juridica: `${BACKEND_URL}/api/proxy/webapi/cadastro/participante`,
} as const;

export type ApiRouteKey = keyof typeof apiRoutes;