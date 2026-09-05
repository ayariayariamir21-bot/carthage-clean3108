import "./load-env";
import { bootstrapAdmin } from "@/lib/auth/bootstrap";

async function main(): Promise<void> {
  const email = process.env.ADMIN_EMAIL;

  if (!email) {
    console.error("Variable d'environnement manquante : définissez ADMIN_EMAIL.");
    process.exit(1);
  }

  const result = await bootstrapAdmin({ email });

  if (result.created) {
    console.log(`✓ Compte admin créé : ${result.user.email} (rôle: admin)`);
    console.log("");
    console.log("================================================================");
    console.log("MOT DE PASSE INITIAL (affiché une seule fois - conservez-le) :");
    console.log(result.initialPassword);
    console.log("================================================================");
    console.log("");
    console.log("L'administrateur devra changer ce mot de passe lors de sa première connexion.");
  } else {
    console.log("ℹ Un administrateur existe déjà, aucune action effectuée.");
  }
}

main().catch((error) => {
  console.error("Erreur lors du bootstrap admin :", error);
  process.exit(1);
});
