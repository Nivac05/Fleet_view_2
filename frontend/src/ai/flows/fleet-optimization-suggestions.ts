'use server';

/**
 * @fileOverview Provides fleet optimization suggestions using GenAI based on real-time data.
 *
 * - provideFleetOptimizationSuggestions - A function that generates fleet optimization suggestions.
 * - FleetOptimizationInput - The input type for the provideFleetOptimizationSuggestions function.
 * - FleetOptimizationOutput - The return type for the provideFleetOptimizationSuggestions function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'zod';

const FleetOptimizationInputSchema = z.object({
  fleetCurrentData: z.string().describe('Real-time data of the current fleet status in JSON format.'),
  demandForecastData: z.string().describe('Demand forecast data in JSON format.'),
  kpiData: z.string().describe('Key performance indicators data in JSON format.'),
});

export type FleetOptimizationInput = z.infer<typeof FleetOptimizationInputSchema>;

const FleetOptimizationOutputSchema = z.object({
  suggestions: z.string().describe('Suggestions for optimizing fleet allocation, re-positioning, and charging schedules.'),
});

export type FleetOptimizationOutput = z.infer<typeof FleetOptimizationOutputSchema>;

export async function provideFleetOptimizationSuggestions(input: FleetOptimizationInput): Promise<FleetOptimizationOutput> {
  return fleetOptimizationFlow(input);
}

const prompt = ai.definePrompt({
  name: 'fleetOptimizationPrompt',
  input: {schema: FleetOptimizationInputSchema},
  output: {schema: FleetOptimizationOutputSchema},
  prompt: `You are an expert fleet management consultant. Analyze the real-time fleet data, demand forecasts, and KPIs provided to generate actionable suggestions for optimizing fleet allocation, re-positioning vehicles, and adjusting charging schedules to improve efficiency and reduce operational costs.

Fleet Current Data: {{{fleetCurrentData}}}
Demand Forecast Data: {{{demandForecastData}}}
KPI Data: {{{kpiData}}}

Provide clear and concise suggestions:
`,
});

const fleetOptimizationFlow = ai.defineFlow(
  {
    name: 'fleetOptimizationFlow',
    inputSchema: FleetOptimizationInputSchema,
    outputSchema: FleetOptimizationOutputSchema,
  },
  async input => {
    const {output} = await prompt(input);
    return output!;
  }
);
