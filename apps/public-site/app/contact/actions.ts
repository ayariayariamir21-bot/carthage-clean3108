"use server";

export interface ContactState {
  success?: boolean;
  error?: string;
  fieldErrors?: {
    name?: string;
    email?: string;
    message?: string;
  };
}

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function submitContactAction(
  _previous: ContactState,
  formData: FormData,
): Promise<ContactState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const message = String(formData.get("message") ?? "").trim();

  const fieldErrors: NonNullable<ContactState["fieldErrors"]> = {};
  if (!name) fieldErrors.name = "Merci d'indiquer votre nom.";
  if (!email) fieldErrors.email = "Merci d'indiquer votre email.";
  else if (!EMAIL_RE.test(email)) fieldErrors.email = "L'adresse email renseignée est invalide.";
  if (!message) fieldErrors.message = "Merci de saisir un message.";
  else if (message.length < 10)
    fieldErrors.message = "Votre message doit contenir au moins 10 caractères.";

  if (Object.keys(fieldErrors).length > 0) {
    return { fieldErrors };
  }

  // Site vitrine statique : aucun email n'est réellement envoyé.
  // En production, brancher ici un fournisseur d'email / CRM.
  return { success: true };
}
