"use server";

import { Resend } from "resend";

const resendClient = new Resend(process.env.RESEND_API_KEY || "");

export async function sendEmail(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  console.log({ name, email, message });

  if (!process.env.RESEND_API_KEY) {
    console.error("Missing RESEND_API_KEY");
    throw new Error("Missing server configuration: RESEND_API_KEY");
  }

  if (!process.env.CONTACT_EMAIL) {
    console.error("Missing CONTACT_EMAIL");
    throw new Error("Missing server configuration: CONTACT_EMAIL");
  }

  if (!name || !email || !message) {
    throw new Error("Missing fields");
  }

  try {
    const response = await resendClient.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL,
      replyTo: String(email),
      subject: `New contact from ${String(name)}`,
      text: String(message),
    });

    console.log("Resend response:", response);

    // Some SDKs throw on error; if SDK returns an error object check it too
    // if ((response as any).error) { ... }

    return { ok: true };
  } catch (err) {
    console.error("Resend send failed:", err);
    throw new Error("Failed to send email");
  }
}
