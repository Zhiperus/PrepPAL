export const getResetPasswordTemplate = (resetLink: string) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h1 style="color: #1e293b;">Reset Your Password</h1>
      <p>Hello,</p>
      <p>Someone requested a password reset for your PrepPAL account.</p>
      <a href="${resetLink}" style="display: inline-block; background-color: #1e293b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; margin-top: 10px;">
        Reset Password
      </a>
      <p style="margin-top: 20px; font-size: 12px; color: #666;">
        If the button above doesn't work, copy this link:<br>
        ${resetLink}
      </p>
    </div>
  `;
};

export const getVerifyEmailTemplate = (verifyLink: string) => {
  return `
    <div style="font-family: Arial, sans-serif; color: #333; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 8px;">
      <div style="text-align: center; margin-bottom: 24px;">
        <h1 style="color: #2a4263; font-size: 24px; font-weight: bold;">Verify your email address</h1>
      </div>
      
      <p style="font-size: 16px; line-height: 1.6;">Hello,</p>
      <p style="font-size: 16px; line-height: 1.6;">
        Thanks for joining PrepPAL! To finish setting up your account, please verify your email address by clicking the button below.
      </p>
      
      <div style="text-align: center; margin: 32px 0;">
        <a href="${verifyLink}" style="display: inline-block; background-color: #2a4263; color: white; padding: 12px 24px; text-decoration: none; border-radius: 6px; font-weight: bold; font-size: 16px;">
          Verify Email
        </a>
      </div>
      
      <p style="margin-top: 30px; font-size: 14px; color: #64748b; text-align: center;">
        If the button above doesn't work, copy and paste this link into your browser:<br>
        <a href="${verifyLink}" style="color: #2a4263; word-break: break-all;">${verifyLink}</a>
      </p>
      
      <p style="font-size: 14px; color: #94a3b8; text-align: center; margin-top: 40px;">
        If you didn't create an account with PrepPAL, you can safely ignore this email.
      </p>
    </div>
  `;
};
