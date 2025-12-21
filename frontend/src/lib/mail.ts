import { Resend } from 'resend';

import { env } from '@/config/env';

const resend = new Resend(env.RESEND_API_KEY);

interface SendEmailProps {
  to: string;
  subject: string;
  html: string;
}

export const sendEmail = async ({ to, subject, html }: SendEmailProps) => {
  try {
    const data = await resend.emails.send({
      //NOTE: Temporary for now as there is no custom domain yet, we might also switch to AWS SES
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
