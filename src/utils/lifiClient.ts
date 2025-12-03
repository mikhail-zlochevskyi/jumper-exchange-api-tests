import { APIRequestContext, APIResponse } from '@playwright/test';
import { config } from '../config/env';

type QuoteOrder = 'FASTEST' | 'CHEAPEST';

type QuoteParams = {
  fromChain: string;
  toChain: string;
  fromToken: string;
  toToken: string;
  fromAmount: string;
  fromAddress: string;
  toAddress?: string;
  order?: QuoteOrder;
  slippage?: number;
  integrator?: string;
  fee?: number;
  referrer?: string;
  allowBridges?: string[];
  allowExchanges?: string[];
  denyBridges?: string[];
  denyExchanges?: string[];
  preferBridges?: string[];
  preferExchanges?: string[];
  allowDestinationCall?: boolean;
  fromAmountForGas?: string;
  maxPriceImpact?: number;
  swapStepTimingStrategies?: string[];
  routeTimingStrategies?: string[];
  skipSimulation?: boolean;
};

type RouteOptions = {
  insurance?: boolean;
  integrator?: string;
  slippage?: number;
  bridges?: {
    allow?: string[];
    deny?: string[];
    prefer?: string[];
  };
  exchanges?: {
    allow?: string[];
    deny?: string[];
    prefer?: string[];
  };
  order?: QuoteOrder;
  allowSwitchChain?: boolean;
  allowDestinationCall?: boolean;
  referrer?: string;
  fee?: number;
  maxPriceImpact?: number;
  timing?: Record<string, unknown>;
};

type RoutesRequestBody = {
  fromChainId: number;
  toChainId: number;
  fromTokenAddress: string;
  toTokenAddress: string;
  fromAmount: string;
  fromAddress?: string;
  toAddress?: string;
  fromAmountForGas?: string;
  options?: RouteOptions;
};

export class LifiClient {
  constructor(private request: APIRequestContext) {}

  async getQuote(params: QuoteParams): Promise<APIResponse> {
    const queryParams = new URLSearchParams({
      fromChain: params.fromChain,
      toChain: params.toChain,
      fromToken: params.fromToken,
      toToken: params.toToken,
      fromAmount: params.fromAmount,
      fromAddress: params.fromAddress,
    });

    const optionalParams: Record<string, string | undefined> = {
      toAddress: params.toAddress,
      order: params.order,
      slippage: params.slippage?.toString(),
      integrator: params.integrator,
      fee: params.fee?.toString(),
      referrer: params.referrer,
      allowDestinationCall: params.allowDestinationCall?.toString(),
      fromAmountForGas: params.fromAmountForGas,
      maxPriceImpact: params.maxPriceImpact?.toString(),
      skipSimulation: params.skipSimulation?.toString(),
    };

    Object.entries(optionalParams).forEach(([key, value]) => {
      if (value !== undefined && value !== '') {
        queryParams.append(key, value);
      }
    });

    const arrayParams: Array<[string, string[] | undefined]> = [
      ['allowBridges', params.allowBridges],
      ['allowExchanges', params.allowExchanges],
      ['denyBridges', params.denyBridges],
      ['denyExchanges', params.denyExchanges],
      ['preferBridges', params.preferBridges],
      ['preferExchanges', params.preferExchanges],
      ['swapStepTimingStrategies', params.swapStepTimingStrategies],
      ['routeTimingStrategies', params.routeTimingStrategies],
    ];

    arrayParams.forEach(([key, arr]) => {
      arr?.forEach((value) => {
        if (value) {
          queryParams.append(key, value);
        }
      });
    });

    return this.request.get(`${config.baseURL}/quote?${queryParams.toString()}`);
  }

  async postAdvancedRoutes(body: RoutesRequestBody): Promise<APIResponse> {
    return this.request.post(`${config.baseURL}/advanced/routes`, {
      data: body,
    });
  }

  async getTools(params?: { chains?: Array<string | number> }): Promise<APIResponse> {
    if (!params?.chains) {
      return this.request.get(`${config.baseURL}/tools`);
    }

    const queryParams = new URLSearchParams();
    params.chains.forEach((chain) =>
      queryParams.append('chains', chain.toString())
    );

    return this.request.get(`${config.baseURL}/tools?${queryParams.toString()}`);
  }
}


