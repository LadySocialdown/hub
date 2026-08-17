import { Resend } from "resend";

function requireResend(): Resend {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) throw new Error("Variable d'environnement manquante : RESEND_API_KEY");
  return new Resend(apiKey);
}

/** resend.emails.send() ne lève pas d'exception en cas d'échec : il renvoie { error }. */
function assertSent(result: { error: { message: string } | null }): void {
  if (result.error) throw new Error(`Échec de l'envoi de l'email (Resend) : ${result.error.message}`);
}

function emailShell(bodyHtml: string): string {
  return `
    <div style="font-family: sans-serif; color: #1A1410; max-width: 480px; margin: 0 auto;">
      ${bodyHtml}
      <p style="margin-top: 32px; font-size: 14px;">À très vite,<br />Sania — Lady Socialdown</p>
    </div>
  `;
}

/** Nouvelle élève sans compte : lien d'invitation Clerk (création de compte, email pré-rempli). */
export async function sendFormationInvitationEmail(params: {
  to: string;
  courseTitle: string;
  invitationUrl: string;
}): Promise<void> {
  const { to, courseTitle, invitationUrl } = params;
  const resend = requireResend();

  const result = await resend.emails.send({
    from: "Lady Socialdown <hello@ladysocialdown.com>",
    to,
    subject: `Ton accès à ${courseTitle} est prêt`,
    html: emailShell(`
      <p style="font-size: 20px; color: #5A3E36;">Bienvenue !</p>
      <p>Ton accès à <strong>${courseTitle}</strong> est confirmé. Il ne te reste qu'une étape :
      crée ton compte élève pour retrouver tes modules dès maintenant.</p>
      <p style="margin: 24px 0;">
        <a href="${invitationUrl}" style="display: inline-block; padding: 12px 24px; background: #5A3E36; color: #FFFEF8; text-decoration: none; border-radius: 999px; font-weight: 600;">
          Créer mon compte
        </a>
      </p>
      <p style="font-size: 13px; opacity: 0.7;">Ce lien est personnel, ne le partage pas.</p>
    `),
  });
  assertSent(result);
}

/** Élève ayant déjà un compte : accès direct à l'espace formation. */
export async function sendFormationAccessReadyEmail(params: {
  to: string;
  courseTitle: string;
  dashboardUrl: string;
}): Promise<void> {
  const { to, courseTitle, dashboardUrl } = params;
  const resend = requireResend();

  const result = await resend.emails.send({
    from: "Lady Socialdown <hello@ladysocialdown.com>",
    to,
    subject: `Ton accès à ${courseTitle} est prêt`,
    html: emailShell(`
      <p style="font-size: 20px; color: #5A3E36;">C'est confirmé !</p>
      <p>Ton accès à <strong>${courseTitle}</strong> vient d'être activé sur ton espace élève.</p>
      <p style="margin: 24px 0;">
        <a href="${dashboardUrl}" style="display: inline-block; padding: 12px 24px; background: #5A3E36; color: #FFFEF8; text-decoration: none; border-radius: 999px; font-weight: 600;">
          Accéder à ma formation
        </a>
      </p>
    `),
  });
  assertSent(result);
}
