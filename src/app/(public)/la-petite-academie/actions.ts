"use server";

import { Resend } from "resend";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import { pushPreinscriptionToSystemeIo } from "@/lib/systemeio";

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const SYSTEME_IO_TAG_NAME = "La petite Académie Promo Lancement";

export interface PreinscriptionState {
  ok: boolean;
  message: string;
}

function confirmationEmailHtml(prenom: string): string {
  return `
    <div style="font-family: sans-serif; color: #1A1410; max-width: 480px; margin: 0 auto;">
      <p style="font-size: 20px; color: #5A3E36;">Salut ${prenom} !</p>
      <p>C'est confirmé : ta place est réservée pour <strong>La Petite Académie</strong>.</p>
      <p>En tant que préinscrite, tu es garantie de bénéficier :</p>
      <ul>
        <li>du tarif de lancement à <strong>497€</strong> au lieu de 597€</li>
        <li>du module complémentaire « Les bases du marketing à connaître avant de commencer » offert</li>
      </ul>
      <p>On te préviendra en priorité dès l'ouverture, avec ton tarif préférentiel garanti. Aucun engagement, aucun paiement pour l'instant.</p>
      <p>À très vite,<br />Sania — Lady Socialdown</p>
    </div>
  `;
}

export async function submitPreinscription(
  _prevState: PreinscriptionState | null,
  formData: FormData
): Promise<PreinscriptionState> {
  const prenom = String(formData.get("prenom") ?? "").trim();
  const email = String(formData.get("email") ?? "")
    .trim()
    .toLowerCase();

  if (!prenom || !email) {
    return { ok: false, message: "Merci de renseigner ton prénom et ton email." };
  }
  if (!EMAIL_REGEX.test(email)) {
    return { ok: false, message: "Cet email ne semble pas valide." };
  }

  const supabase = createServerSupabaseClient();
  const { error } = await supabase
    .from("preinscriptions_academie")
    .upsert({ prenom, email, date: new Date().toISOString() }, { onConflict: "email" });

  if (error) {
    console.error("[preinscription] échec de l'enregistrement Supabase", error);
    return { ok: false, message: "Une erreur est survenue, réessaie dans un instant." };
  }

  if (process.env.SYSTEME_IO_API_KEY) {
    try {
      await pushPreinscriptionToSystemeIo(email, prenom, SYSTEME_IO_TAG_NAME);
    } catch (error) {
      // L'échec de la synchro Systeme.io ne doit pas faire échouer la préinscription elle-même.
      console.error("[preinscription] échec de la synchro Systeme.io", error);
    }
  }

  if (process.env.RESEND_API_KEY) {
    try {
      const resend = new Resend(process.env.RESEND_API_KEY);
      await resend.emails.send({
        from: "Lady Socialdown <hello@ladysocialdown.com>",
        to: email,
        subject: "Ta place est réservée pour La Petite Académie",
        html: confirmationEmailHtml(prenom),
      });
    } catch (error) {
      // L'échec de l'email ne doit pas faire échouer la préinscription elle-même.
      console.error("[preinscription] échec de l'email de confirmation", error);
    }
  }

  return {
    ok: true,
    message: "C'est fait ! Vérifie ta boîte mail pour la confirmation de ta préinscription.",
  };
}
