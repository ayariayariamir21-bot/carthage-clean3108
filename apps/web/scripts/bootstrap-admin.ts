import "./load-env";
import { bootstrapAdmin } from "@/lib/auth/bootstrap";

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error(
      "Variables d'environnement manquantes : définissez ADMIN_EMAIL et ADMIN_PASSWORD.",
    );
    process.exit(1);
  }

  if (password.length < 8) {
    console.error("Le mot de passe admin doit contenir au moins 8 caractères.");
    process.exit(1);
  }

  const result = await bootstrapAdmin({ email, password });

  if (result.created) {
    console.log(`✓ Compte admin créé : ${result.user.email} (rôle: admin)`);
  } else {
    console.log("ℹ Un administrateur existe déjà, aucune action effectuée.");
  }
}

main().catch((error) => {
  console.error("Erreur lors du bootstrap admin :", error);
  process.exit(1);
});
