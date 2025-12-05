/**
 * Test helper utilities for API testing
 * Provides reusable functions for common test operations
 */

import { APIResponse } from '@playwright/test';
import { ErrorResponseSchema } from './schemaValidators';

/**
 * HTTP status codes that indicate rate limiting
 */
export const RATE_LIMIT_STATUS = 429;

/**
 * HTTP status codes that indicate successful responses
 */
export const SUCCESS_STATUS = [200];

/**
 * HTTP status codes that indicate client errors
 */
export const CLIENT_ERROR_STATUS = [400, 404, 422];

/**
 * HTTP status codes that indicate server errors
 */
export const SERVER_ERROR_STATUS = [500, 502, 503, 504];

/**
 * Validates if a response is rate limited
 * @param status - HTTP status code
 * @returns true if status is 429
 */
export function isRateLimited(status: number): boolean {
  return status === RATE_LIMIT_STATUS;
}

/**
 * Validates if a response is successful
 * @param status - HTTP status code
 * @returns true if status is 200
 */
export function isSuccess(status: number): boolean {
  return SUCCESS_STATUS.includes(status);
}

/**
 * Validates if a response is a client error
 * @param status - HTTP status code
 * @returns true if status is 400, 404, or 422
 */
export function isClientError(status: number): boolean {
  return CLIENT_ERROR_STATUS.includes(status);
}

/**
 * Handles rate-limited responses gracefully
 * Validates error schema if not rate limited, otherwise skips validation
 * @param response - API response object
 * @param expectedStatusCodes - Array of acceptable status codes
 * @returns Object with status and parsed body (if applicable)
 */
export async function handleRateLimit(
  response: APIResponse,
  expectedStatusCodes: number[] = [200, 404, 429]
): Promise<{ status: number; body?: unknown; isRateLimited: boolean }> {
  const status = response.status();
  const isRateLimited = status === RATE_LIMIT_STATUS;

  // If rate limited, return early without parsing
  if (isRateLimited) {
    return { status, isRateLimited: true };
  }

  // Validate status code
  if (!expectedStatusCodes.includes(status)) {
    throw new Error(
      `Unexpected status code: ${status}. Expected one of: ${expectedStatusCodes.join(', ')}`
    );
  }

  // Parse and validate error schema if not successful
  const body = await response.json();
  if (!isSuccess(status)) {
    ErrorResponseSchema.parse(body);
  }

  return { status, body, isRateLimited: false };
}

/**
 * Validates error response structure
 * @param response - API response object
 * @param expectedStatusCodes - Array of acceptable error status codes
 * @returns Parsed error response
 */
export async function validateErrorResponse(
  response: APIResponse,
  expectedStatusCodes: number[] = [400, 404, 422]
): Promise<{ status: number; error: unknown }> {
  const status = response.status();

  if (status === RATE_LIMIT_STATUS) {
    return { status, error: { message: 'Rate limited' } };
  }

  if (!expectedStatusCodes.includes(status)) {
    throw new Error(
      `Unexpected error status: ${status}. Expected one of: ${expectedStatusCodes.join(', ')}`
    );
  }

  const body = await response.json();
  const error = ErrorResponseSchema.parse(body);

  return { status, error };
}

/**
 * Asserts that a value is a valid Ethereum address format
 * @param address - Address string to validate
 * @returns true if address matches Ethereum format
 */
export function isValidEthereumAddress(address: string): boolean {
  return /^0x[a-fA-F0-9]{40}$/.test(address);
}

/**
 * Asserts that a value is a valid Solana address format
 * @param address - Address string to validate
 * @returns true if address matches Solana format
 */
export function isValidSolanaAddress(address: string): boolean {
  // Solana addresses are base58 encoded, typically 32-44 characters
  return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
}

/**
 * Normalizes token address for comparison (lowercase)
 * @param address - Token address
 * @returns Lowercase address
 */
export function normalizeAddress(address: string): string {
  return address.toLowerCase();
}

/**
 * Validates that a numeric string represents a positive amount
 * @param amount - Amount as string
 * @returns true if amount is positive
 */
export function isPositiveAmount(amount: string): boolean {
  const num = Number(amount);
  return !isNaN(num) && num > 0;
}

