import dotenv from 'dotenv';
import { Resend } from 'resend';

dotenv.config();
export const resend = new Resend(process.env.RESEND_API_KEY);

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailProps) => {
  try {
    const data = await resend.emails.send({
      from: 'PrepPAL <onboarding@resend.dev>',
      to: to,
      subject: subject,
      html: html,
    });

    console.log('Email sent successfully:', data);
    return { success: true, data };
  } catch (error) {
    console.error('Error sending email:', error);
    return { success: false, error };
  }
};
