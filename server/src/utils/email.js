import { Resend } from "resend";
import AppError from "./AppError.js";

export async function sendEmail({ to, subject, text, html, replyTo }) {
  const apiKey = process.env.RESEND_API_KEY;
  // If you are using the Resend testing domain (onboarding@resend.dev),
  // you MUST send FROM onboarding@resend.dev and ONLY TO your own registered email.
  const from =
    process.env.RESEND_FROM ||
    process.env.EMAIL_FROM ||
    "onboarding@resend.dev";
  const recipients = (Array.isArray(to) ? to : [to])
    .map((value) => String(value || "").trim())
    .filter(Boolean);

  if (!apiKey) {
    console.error("❌ RESEND_API_KEY is missing");
    throw new AppError(
      "Email service is not configured. Please set RESEND_API_KEY.",
      500,
    );
  }

  const resend = new Resend(apiKey);

  try {
    if (!recipients.length) {
      throw new AppError("Email recipient is required", 400);
    }

    const emailData = {
      from,
      to: recipients,
      subject,
      text,
      html,
    };

    if (replyTo) {
      emailData.reply_to = replyTo;
    }

    console.log(`📤 Attempting to send email from ${from} to ${emailData.to}`);

    let { data, error } = await resend.emails.send(emailData);

    const shouldFallbackToOnboarding =
      process.env.NODE_ENV !== "production" &&
      from !== "onboarding@resend.dev" &&
      (error?.message?.includes("domain is not verified") ||
        error?.statusCode === 403);

    // Local/dev fallback to Resend's test sender when custom domain
    // hasn't been verified yet.
    if (shouldFallbackToOnboarding) {
      console.warn(
        "⚠️ Sender domain not verified. Retrying with onboarding@resend.dev for development.",
      );
      ({ data, error } = await resend.emails.send({
        ...emailData,
        from: "onboarding@resend.dev",
      }));
    }

    if (error) {
      console.error("❌ Resend API Error:", error);
      // Special handling for domain verification errors
      if (
        error.message?.includes("onboarding@resend.dev") ||
        error.code === 403
      ) {
        throw new AppError(
          "Email sending failed. If using a trial account, ensure you are sending to your verified email address.",
          403,
        );
      }
      throw new AppError(error.message || "Failed to send email", 500);
    }

    console.log("✅ Email sent successfully:", data.id);
    return data;
  } catch (err) {
    console.error("❌ Email Sending Failed:", err.message);
    if (err instanceof AppError) throw err;
    throw new AppError(
      err.message || "Internal server error during email sending",
      500,
    );
  }
}
