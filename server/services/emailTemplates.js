function buildBaseEmailHtml({
  preheader,
  badge,
  heading,
  intro,
  actionLabel,
  actionUrl,
  rawToken,
  expiryNote,
  footerNote,
  logoUrl,
}) {
  return `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>${heading}</title>
  </head>
  <body style="margin:0;padding:0;background-color:#EDF0F6;color:#00001C;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;-webkit-font-smoothing:antialiased;">
    <!-- Preheader -->
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;mso-hide:all;">
      ${preheader}
    </div>

    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#EDF0F6;padding:40px 16px;">
      <tr>
        <td align="center">
          <!-- Main Card -->
          <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:520px;background-color:#FFFFFF;border:1px solid #C2CBE0;border-radius:6px;overflow:hidden;">
            
            <!-- Dark Ink Brand Header with Official HEAT Logo -->
            <tr>
              <td style="padding:22px 28px;background-color:#00001C;border-bottom:3px solid #BC907B;">
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0">
                  <tr>
                    <td align="left" valign="middle">
                      <img
                        src="${logoUrl}"
                        alt="HEAT"
                        width="124"
                        style="display:block;height:auto;max-height:36px;width:auto;border:0;outline:none;text-decoration:none;"
                      />
                    </td>
                    <td align="right" valign="middle">
                      <span style="display:inline-block;padding:5px 10px;background-color:#151223;border:1px solid #252238;border-radius:3px;font-size:11px;font-weight:600;letter-spacing:0.6px;color:#A4B1CD;">
                        ${badge}
                      </span>
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Content Body -->
            <tr>
              <td style="padding:32px 28px 28px 28px;">
                <h1 style="margin:0 0 12px 0;font-size:22px;font-weight:700;line-height:1.3;letter-spacing:-0.3px;color:#00001C;">
                  ${heading}
                </h1>
                <p style="margin:0 0 26px 0;font-size:15px;line-height:1.65;color:#151223;">
                  ${intro}
                </p>

                <!-- Primary Rectangular CTA Button -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="margin-bottom:28px;">
                  <tr>
                    <td align="center">
                      <a
                        href="${actionUrl}"
                        target="_blank"
                        rel="noopener noreferrer"
                        style="display:block;width:100%;box-sizing:border-box;padding:14px 22px;background-color:#00001C;color:#FFFFFF;text-decoration:none;text-align:center;font-size:14px;font-weight:600;letter-spacing:0.2px;border-radius:4px;border:1px solid #00001C;"
                      >
                        ${actionLabel}
                      </a>
                    </td>
                  </tr>
                </table>

                <!-- Manual Security Token Box -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color:#EDF0F6;border:1px solid #C2CBE0;border-radius:4px;margin-bottom:22px;">
                  <tr>
                    <td style="padding:14px 16px;">
                      <div style="font-size:11px;font-weight:600;color:#474747;margin-bottom:6px;">
                        Manual verification token
                      </div>
                      <div style="font-family:ui-monospace,SFMono-Regular,Menlo,Monaco,Consolas,monospace;font-size:12px;word-break:break-all;color:#00001C;line-height:1.5;font-weight:600;">
                        ${rawToken}
                      </div>
                    </td>
                  </tr>
                </table>

                <!-- Fallback Link -->
                <p style="margin:0 0 6px 0;font-size:12px;line-height:1.5;color:#474747;">
                  Button not working? Paste this link into your browser:
                </p>
                <p style="margin:0 0 24px 0;font-size:12px;line-height:1.5;word-break:break-all;">
                  <a href="${actionUrl}" style="color:#00001C;font-weight:500;text-decoration:underline;">${actionUrl}</a>
                </p>

                <!-- Security & Expiry Notice -->
                <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border-top:1px solid #E2E7F1;padding-top:18px;">
                  <tr>
                    <td style="font-size:12px;line-height:1.6;color:#474747;">
                      <strong style="color:#151223;">Security note:</strong> ${expiryNote}<br />
                      ${footerNote}
                    </td>
                  </tr>
                </table>
              </td>
            </tr>

            <!-- Footer -->
            <tr>
              <td style="padding:16px 28px;background-color:#E2E7F1;border-top:1px solid #C2CBE0;text-align:center;font-size:12px;color:#474747;">
                &copy; 2026 HEAT Personal Finance &middot; Mete &#350;irin
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

export function getSignUpVerificationTemplate({ verifyLink, rawToken, logoUrl = "cid:heat_logo" }) {
  const html = buildBaseEmailHtml({
    preheader: "Confirm your email address to activate your HEAT workspace.",
    badge: "Account verification",
    heading: "Confirm your email address",
    intro:
      "Welcome to HEAT. Confirm your email address below to activate your personal finance workspace and start tracking your monthly budget, spendings, and recurring subscriptions.",
    actionLabel: "Verify email address",
    actionUrl: verifyLink,
    rawToken,
    expiryNote: "This verification link expires in 24 hours.",
    footerNote: "If you did not create a HEAT account, you can safely disregard this message.",
    logoUrl,
  });

  const text = [
    "HEAT — Confirm your email address",
    "",
    "Welcome to HEAT. Confirm your email address to activate your account:",
    verifyLink,
    "",
    `Manual verification token: ${rawToken}`,
    "",
    "This link expires in 24 hours.",
  ].join("\n");

  return { html, text };
}

export function getPasswordResetTemplate({ resetLink, resetToken, logoUrl = "cid:heat_logo" }) {
  const html = buildBaseEmailHtml({
    preheader: "Reset your HEAT account password.",
    badge: "Password reset",
    heading: "Reset your password",
    intro:
      "We received a request to reset the password for your HEAT account. Use the button below to choose a new password and secure your session.",
    actionLabel: "Choose a new password",
    actionUrl: resetLink,
    rawToken: resetToken,
    expiryNote: "This password reset link expires in 30 minutes.",
    footerNote:
      "If you did not request a password reset, no changes have been made to your account.",
    logoUrl,
  });

  const text = [
    "HEAT — Reset your password",
    "",
    "Use the link below to choose a new password for your HEAT account:",
    resetLink,
    "",
    `Manual reset token: ${resetToken}`,
    "",
    "This link expires in 30 minutes.",
  ].join("\n");

  return { html, text };
}
