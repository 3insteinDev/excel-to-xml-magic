// src/lib/apiRoutes.ts
export const apiRoutes = {
  motorista: "/webapi/cadastro/motorista",
  veiculo: "/webapi/cadastro/veiculo",
  transportador: "/webapi/cadastro/participante",
  pessoa_fisica: "/webapi/cadastro/participante",
  pessoa_juridica: "/webapi/cadastro/participante",
} as const;

export type ApiRouteKey = keyof typeof apiRoutes;