import { z } from 'zod';

const TokenSchema = z.object({
  address: z.string(),
  symbol: z.string(),
  decimals: z.number(),
  chainId: z.number(),
  name: z.string(),
  coinKey: z.string().optional(),
  priceUSD: z.string().optional(),
  logoURI: z.string().optional(),
});

const ActionSchema = z.object({
  fromChainId: z.number(),
  toChainId: z.number(),
  fromToken: TokenSchema,
  toToken: TokenSchema,
  fromAmount: z.string(),
  toAddress: z.string().optional(),
  fromAddress: z.string().optional(),
  slippage: z.number().optional(),
});

const FeeCostSchema = z.object({
  name: z.string(),
  description: z.string().optional(),
  percentage: z.string(),
  token: TokenSchema,
  amount: z.string().optional(),
  amountUSD: z.string(),
  included: z.boolean().optional(),
});

const GasCostSchema = z.object({
  type: z.string(),
  price: z.string().optional(),
  estimate: z.string().optional(),
  limit: z.string().optional(),
  amount: z.string(),
  amountUSD: z.string().optional(),
  token: TokenSchema,
});

const EstimateSchema = z.object({
  tool: z.string().optional(),
  fromAmount: z.string(),
  fromAmountUSD: z.string().optional(),
  toAmount: z.string(),
  toAmountMin: z.string(),
  toAmountUSD: z.string().optional(),
  approvalAddress: z.string(),
  feeCosts: z.array(FeeCostSchema).optional(),
  gasCosts: z.array(GasCostSchema).optional(),
  executionDuration: z.number().optional(),
  data: z.record(z.any()).optional(),
});

const ToolDetailsSchema = z
  .object({
    key: z.string(),
    name: z.string(),
    logoURI: z.string().optional(),
  })
  .partial()
  .optional();

const IncludedStepSchema = z.object({
  id: z.string(),
  type: z.string(),
  tool: z.string(),
  toolDetails: ToolDetailsSchema,
  action: ActionSchema,
  estimate: EstimateSchema,
});

const StepSchema = z.object({
  id: z.string(),
  type: z.enum(['swap', 'cross', 'lifi', 'protocol']).optional(),
  tool: z.string(),
  toolDetails: ToolDetailsSchema,
  action: ActionSchema,
  estimate: EstimateSchema,
  integrator: z.string().optional(),
  includedSteps: z.array(IncludedStepSchema).optional(),
  referrer: z.string().optional(),
  execution: z.unknown().optional(),
  transactionRequest: z.unknown().optional(),
});

export const QuoteResponseSchema = StepSchema;
export type QuoteResponse = z.infer<typeof QuoteResponseSchema>;

const RouteSchema = z.object({
  id: z.string(),
  fromChainId: z.number(),
  toChainId: z.number(),
  fromToken: TokenSchema,
  toToken: TokenSchema,
  fromAmount: z.string(),
  fromAmountUSD: z.string().optional(),
  toAmount: z.string(),
  toAmountMin: z.string(),
  toAmountUSD: z.string().optional(),
  gasCostUSD: z.string().optional(),
  steps: z.array(StepSchema),
  fromAddress: z.string().optional(),
  toAddress: z.string().optional(),
  containsSwitchChain: z.boolean().optional(),
});

export const AdvancedRoutesResponseSchema = z.object({
  routes: z.array(RouteSchema),
  unavailableRoutes: z.union([z.array(z.any()), z.record(z.any())]).optional(),
});

export type AdvancedRoutesResponse = z.infer<
  typeof AdvancedRoutesResponseSchema
>;

const ChainIdSchema = z.union([z.string(), z.number()]);

const SupportedChainsSchema = z.object({
  fromChainId: ChainIdSchema,
  toChainId: ChainIdSchema,
});

const BridgeSchema = z.object({
  key: z.string(),
  name: z.string(),
  logoURI: z.string().optional(),
  supportedChains: z.array(SupportedChainsSchema).optional(),
});

const ExchangeSchema = z.object({
  key: z.string(),
  name: z.string(),
  logoURI: z.string().optional(),
  supportedChains: z.array(ChainIdSchema).optional(),
});

export const ToolsResponseSchema = z.object({
  bridges: z.array(BridgeSchema).optional(),
  exchanges: z.array(ExchangeSchema).optional(),
});

export type ToolsResponse = z.infer<typeof ToolsResponseSchema>;

const ToolErrorSchema = z.object({
  errorType: z.string().optional(),
  code: z.string().optional(),
  action: ActionSchema.optional(),
  tool: z.string().optional(),
  message: z.string().optional(),
});

export const ErrorResponseSchema = z.object({
  message: z.string(),
  errorCode: z.string().optional(),
  statusCode: z.number().optional(),
  errors: z.union([z.record(ToolErrorSchema), z.array(ToolErrorSchema)])
    .optional()
    .nullable(),
});

export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;


