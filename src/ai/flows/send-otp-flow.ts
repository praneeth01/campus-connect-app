'use server';
/**
 * @fileOverview A flow for sending a one-time password (OTP) for phone verification.
 *
 * - sendOtp - A function that handles sending the OTP.
 * - SendOtpInput - The input type for the sendOtp function.
 * - SendOtpOutput - The return type for the sendOtp function.
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

const SendOtpInputSchema = z.object({
  contactNo: z.string().describe('The contact number to send the OTP to.'),
});
export type SendOtpInput = z.infer<typeof SendOtpInputSchema>;

const SendOtpOutputSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  // In a real app, you wouldn't return the OTP to the client.
  // This is for simulation purposes only.
  otp: z.string(),
});
export type SendOtpOutput = z.infer<typeof SendOtpOutputSchema>;

export async function sendOtp(input: SendOtpInput): Promise<SendOtpOutput> {
  return sendOtpFlow(input);
}

const sendOtpFlow = ai.defineFlow(
  {
    name: 'sendOtpFlow',
    inputSchema: SendOtpInputSchema,
    outputSchema: SendOtpOutputSchema,
  },
  async (input) => {
    console.log(`Simulating OTP sent to ${input.contactNo}`);

    // In a real-world scenario, you would integrate with an SMS gateway provider here.
    // For example:
    // const response = await smsProvider.send({ to: input.contactNo, message: `Your OTP is ${otp}` });
    // if (!response.success) {
    //   return { success: false, message: "Failed to send OTP.", otp: "" };
    // }

    const dummyOtp = "123456";

    return {
      success: true,
      message: 'OTP sent successfully.',
      otp: dummyOtp, // This is for simulation only.
    };
  }
);
