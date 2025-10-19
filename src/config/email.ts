import brevo from "@getbrevo/brevo";

const sendVerificationEmail = async (
  receiverEmail: string,
  verificationCode: string
) => {
  const apiInstance = new brevo.TransactionalEmailsApi();
  apiInstance.setApiKey(
    brevo.TransactionalEmailsApiApiKeys.apiKey,
    process.env.BREVO_API_KEY as string
  );

  const sendSmtpEmail = new brevo.SendSmtpEmail();
  sendSmtpEmail.subject = "Your Taytay Marketplace Verification Code";
  sendSmtpEmail.sender = {
    name: "Taytay Marketplace",
    email: process.env.SMTP_EMAIL || "no-reply@taytaymarketplace.com",
  };
  sendSmtpEmail.to = [{ email: receiverEmail }];
  sendSmtpEmail.htmlContent = `
    <div style="font-family: Arial, sans-serif; padding: 20px; background-color: #f4f7fa;">
      <div style="max-width: 600px; margin: auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
        
        <div style="background: linear-gradient(135deg, #5b4ac9 0%, #4a3ab0 100%); padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px;">🔐 Verification Code</h1>
        </div>
        
        <div style="padding: 40px 30px; color: #333;">
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 20px;">Hello,</p>
          <p style="font-size: 16px; line-height: 1.6; margin-bottom: 30px;">
            You requested to log in to your <strong>Taytay Marketplace</strong> account.
            Please use the verification code below to complete your login:
          </p>

          <!-- Copy-style field -->
          <div style="background: #f8f9fa; border: 2px dashed #5b4ac9; border-radius: 8px; padding: 25px; text-align: center; margin: 30px 0;">
            <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; text-transform: uppercase; letter-spacing: 1px;">Your Verification Code</p>
            <div style="display: inline-block; background: white; border: 1px solid #ccc; border-radius: 6px; padding: 10px 20px; font-size: 24px; font-weight: bold; color: #5b4ac9; letter-spacing: 8px; font-family: 'Courier New', monospace;">
              ${verificationCode}
            </div>
            <p style="font-size: 12px; color: #888; margin-top: 10px;">
              Copy this code and paste it into the app to continue.
            </p>
          </div>

          <p style="font-size: 14px; color: #666; margin-top: 30px;">⏱️ This code will expire in <strong>10 minutes</strong>.</p>
          <p style="font-size: 14px; color: #666; margin-top: 20px;">If you didn’t request this code, please ignore this email or contact our support team.</p>
        </div>

        <div style="background: #f8f9fa; padding: 20px 30px; text-align: center; border-top: 1px solid #e9ecef;">
          <p style="margin: 0 0 10px 0; font-size: 13px; color: #666;">
            Need help? Contact us at <a href="mailto:support@taytaymarketplace.com" style="color: #5b4ac9; text-decoration: none;">support@taytaymarketplace.com</a>
          </p>
          <p style="margin: 0; font-size: 12px; color: #999;">© 2025 Taytay Marketplace. All rights reserved.</p>
        </div>
      </div>

      <div style="max-width: 600px; margin: 20px auto 0; text-align: center;">
        <p style="font-size: 12px; color: #999; line-height: 1.5;">
          🔒 For your security, never share this code with anyone. Taytay Marketplace will never ask for your verification code via phone or email.
        </p>
      </div>
    </div>
  `;

  try {
    await apiInstance.sendTransacEmail(sendSmtpEmail);
    console.log(`✅ Verification email sent to ${receiverEmail}`);
  } catch (error) {
    console.error("❌ Failed to send verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

export default sendVerificationEmail;