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
