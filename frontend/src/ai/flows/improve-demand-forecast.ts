// src/ai/flows/improve-demand-forecast.ts
'use server';

/**
 * @fileOverview This file defines a Genkit flow for improving demand forecast using historical data and external factors.
 *
 * - improveDemandForecast - An async function that takes demand data and external factors to refine the forecast.
 * - ImproveDemandForecastInput - The input type for the improveDemandForecast function.
 * - ImproveDemandForecastOutput - The output type for the improveDemandForecast function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const ImproveDemandForecastInputSchema = z.object({
  historicalDemandData: z
    .string()
    .describe('Historical demand data as a JSON string.'),
  externalFactors: z
    .string()
    .describe('External factors (weather, events) as a JSON string.'),
});

export type ImproveDemandForecastInput = z.infer<
  typeof ImproveDemandForecastInputSchema
>;

const ImproveDemandForecastOutputSchema = z.object({
  refinedDemandForecast: z
    .string()
    .describe('Refined demand forecast as a JSON string.'),
  analysis: z.string().describe('Analysis of factors affecting the forecast.'),
});

export type ImproveDemandForecastOutput = z.infer<
  typeof ImproveDemandForecastOutputSchema
>;

export async function improveDemandForecast(
  input: ImproveDemandForecastInput
): Promise<ImproveDemandForecastOutput> {
  return improveDemandForecastFlow(input);
}

const prompt = ai.definePrompt({
  name: 'improveDemandForecastPrompt',
  input: {schema: ImproveDemandForecastInputSchema},
  output: {schema: ImproveDemandForecastOutputSchema},
  prompt: `You are an expert in demand forecasting for fleet management. Analyze the historical demand data and external factors to refine the demand forecast.

Historical Demand Data: {{{historicalDemandData}}}
External Factors: {{{externalFactors}}}

Provide a refined demand forecast as a JSON string and an analysis of the factors that influenced the forecast.

{{ zod schema=ImproveDemandForecastOutputSchema }}`,
});

const improveDemandForecastFlow = ai.defineFlow(
  {
    name: 'improveDemandForecastFlow',
    inputSchema: ImproveDemandForecastInputSchema,
    outputSchema: ImproveDemandForecastOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
