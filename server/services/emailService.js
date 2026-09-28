import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resend } from "resend";
import { config } from "../utils/config.js";
import { getPasswordResetTemplate, getSignUpVerificationTemplate } from "./emailTemplates.js";

const resend = new Resend(config.resendKey);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const LOGO_PATH = path.resolve(__dirname, "../../client/public/heat_logo.png");

function getLogoAttachment() {
  try {
    const buffer = fs.readFileSync(LOGO_PATH);
    return [
      {
        filename: "heat_logo.png",
        content: buffer.toString("base64"),
        contentType: "image/png",
        contentId: "heat_logo",
      },
    ];
  } catch {
    return [];
  }
}

function getFrontendBaseUrl() {
  return (config.frontendUrl || "http://localhost:5173").replace(/\/$/, "");
}

async function sendVerificationMail(targetMail, rawToken) {
  const verifyLink = `${getFrontendBaseUrl()}/verify-email?token=${rawToken}`;
  const attachments = getLogoAttachment();
  const logoUrl =
    attachments.length > 0 ? "cid:heat_logo" : `${getFrontendBaseUrl()}/heat_logo.png`;

  const { html, text } = getSignUpVerificationTemplate({
    verifyLink,
    rawToken,
    logoUrl,
  });

  try {
    const { error } = await resend.emails.send({
      from: config.emailFrom,
      to: targetMail,
      subject: "Verify your HEAT account",
      html,
      text,
      ...(attachments.length > 0 ? { attachments } : {}),
    });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}

async function sendResetMail(targetMail, resetToken) {
  const resetLink = `${getFrontendBaseUrl()}/reset-password?token=${resetToken}`;
  const attachments = getLogoAttachment();
  const logoUrl =
    attachments.length > 0 ? "cid:heat_logo" : `${getFrontendBaseUrl()}/heat_logo.png`;

  const { html, text } = getPasswordResetTemplate({
    resetLink,
    resetToken,
    logoUrl,
  });

  try {
    const { error } = await resend.emails.send({
      from: config.emailFrom,
      to: targetMail,
      subject: "Reset your HEAT password",
      html,
      text,
      ...(attachments.length > 0 ? { attachments } : {}),
    });
    if (error) {
      console.error("Resend error:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Failed to send email:", err);
    return false;
  }
}

export { sendVerificationMail, sendResetMail };
