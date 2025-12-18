// src/lib/apiRoutes.ts
export const apiRoutes = {
  motorista: "/webapi/cadastro/motorista",
  veiculo: "/webapi/cadastro/veiculo",
  transportador: "/webapi/cadastro/transportador",
  pessoa_fisica: "/webapi/cadastro/pessoa_fisica",
  pessoa_juridica: "/webapi/cadastro/pessoa_juridica",
} as const;

export type ApiRouteKey = keyof typeof apiRoutes;