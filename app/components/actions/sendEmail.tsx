"use server";

import { Resend } from "resend";

export async function sendEmail(formData: FormData) {
  const name = formData.get("name");
  const email = formData.get("email");
  const message = formData.get("message");

  console.log({ name, email, message });

  if (!process.env.RESEND_API_KEY || !process.env.CONTACT_EMAIL) {
    console.error("Missing server configuration");
    return { ok: false, error: "config" } as const;
  }

  if (!name || !email || !message) {
    return { ok: false, error: "fields" } as const;
  }

  try {
    const resendClient = new Resend(process.env.RESEND_API_KEY);
    const response = await resendClient.emails.send({
      from: "Portfolio <onboarding@resend.dev>",
      to: process.env.CONTACT_EMAIL,
      replyTo: String(email),
      subject: `New contact from ${String(name)}`,
      text: String(message),
    });

    console.log("Resend response:", response);
    return { ok: true } as const;
  } catch (err) {
    console.error("Resend send failed:", err);
    return { ok: false, error: "send" } as const;
  }
}
