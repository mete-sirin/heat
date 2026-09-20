import { Resend } from "resend";
import { config } from "../utils/config.js";

const resend = new Resend(config.resendKey);

async function sendVerificationMail(targetMail, rawToken) {
  const verifyLink = `www.heat.com/api/?token=${rawToken}`;
  try {
    const { data, error } = await resend.emails.send({
      from: "Mete Sirin <onboarding@metesirin.dev>",
      to: targetMail,
      subject: "Welcome to Heat",
      text: `Testing message ${verifyLink}`,
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
} //need to implement rate limiting
export default sendVerificationMail;
