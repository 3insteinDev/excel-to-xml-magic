// src/lib/apiRoutes.ts
const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:3100';

export const apiRoutes = {
  motorista: `${BACKEND_URL}/api/proxy/webapi/cadastro/motorista`,
  veiculo: `${BACKEND_URL}/api/proxy/webapi/cadastro/veiculo`,
  transportador: `${BACKEND_URL}/api/proxy/webapi/cadastro/participante`,
  pessoa_fisica: `${BACKEND_URL}/api/proxy/webapi/cadastro/participante`,
  pessoa_juridica: `${BACKEND_URL}/api/proxy/webapi/cadastro/participante`,
} as const;

//usar essa rotas abaixo para cadastro sem o autentic que fixa o cadastro com o CNPJ e o Token de autenticação
// export const apiRoutes = {
//   motorista: `https://desenv.controleembarque.com.br/api-integracoes-teste-local/cadastro/motorista`,
//   veiculo: `https://desenv.controleembarque.com.br/api-integracoes-teste-local/cadastro/veiculo`,
//   transportador: `https://desenv.controleembarque.com.br/api-integracoes-teste-local/cadastro/participante`,
//   pessoa_fisica: `https://desenv.controleembarque.com.br/api-integracoes-teste-local/cadastro/participante`,
//   pessoa_juridica: `https://desenv.controleembarque.com.br/api-integracoes-teste-local/cadastro/participante`,
// } as const;

export type ApiRouteKey = keyof typeof apiRoutes;