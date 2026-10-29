# Design

## Context

Après l'US-08, la capture vit uniquement dans l'état local de trois composants du panneau :
- `CaptureForm.vue` : valeurs du formulaire, `status`, `createdItemId`, `createdItemUrl`, `savedValues`, `confirmation`, `expanded` ;
- `ExtractCapture.vue` : `sections`, `extracts` (dont `highlight`), `chosen`, `lastUsed`, `editing`, `busy` ;
- `DescriptionEditor.vue` : `text`, `savedText`, `saving`.

Fermer le panneau décharge sa page et perd tout. `notionConfig` (stockage local) contient `databaseId`. Voir `proposal.md` pour le besoin.

## Goals / Non-Goals

**Goals:**
- Un état de capture unique, partagé par les trois composants, conservé dans `browser.storage.local` et restauré à l'ouverture.
- Une lecture de l'état conservé par une fonction pure, testée, qui rejette tout état invalide.

**Non-Goals:**
- Aucune conservation avant la création de l'item (spec `capture-form`).
- Aucune relecture de l'item depuis Notion à la reprise (hors scope « synchronisation »).
- Aucune conservation des surlignages, de l'aperçu, des messages ni d'un extrait en cours de modification.
- Aucune action « Terminer la capture » sur l'erreur « Item introuvable dans Notion » (US-10).

## Decisions

### 1. Dépendances
Aucune nouvelle dépendance ni permission.

### 2. Forme de la capture conservée (`src/capture/capture-session.ts`)
Clé `captureSession` dans `browser.storage.local` :

```ts
interface CaptureSession {
  version: 1;
  databaseId: string;            // base de la configuration au moment de la création
  item: { id: string; url: string };
  form: CaptureFormState;        // valeurs en cours
  savedValues: CaptureFormState; // dernières valeurs enregistrées
  confirmation: string;          // libellé « Item créé… » ou « Modifications enregistrées… »
  expanded: boolean;
  sections: Section[];
  extracts: { blockId: string; sectionId: string | null; text: string }[]; // sans `highlight`
  lastUsed: string;              // identifiant de section ou 'none'
  description: { text: string; savedText: string };
  revision: number;              // incrémenté à chaque écriture
  writer: string;                // identifiant du panneau qui a écrit
}
```

- Fonction pure `parseSession(raw, databaseId)` : renvoie la capture si `raw` a exactement cette forme, `version` égal à `1` et `databaseId` égal à celui de la configuration ; sinon `null`.
- Fonction pure `toSession(state)` : construit l'objet à écrire à partir de l'état du panneau, en retirant `highlight` de chaque extrait.
- Une capture rejetée par `parseSession` est effacée du stockage (exigence « Abandonner une capture d'une autre base », et toute capture illisible).

### 3. État partagé (`src/capture/capture-store.ts`)
- Un état réactif unique (`reactive`) pour le panneau, créé une fois par page et exposé par `useCaptureStore()`.
- Il contient les champs persistants de la décision 2 et les champs éphémères : `status`, `busy`, `editing`, `saving` de la description, erreurs, aperçu.
- Les trois composants lisent et écrivent ces champs dans le store, à la place de leurs `ref` locales correspondantes. Leur logique, leurs props et leur rendu ne changent pas.
- `App.vue` charge la capture avant d'afficher `CaptureForm` : s'il en trouve une valide, le store est restauré avec `status = 'created'` ; sinon il part vide.

### 4. Écriture
- À la création réussie de l'item, la capture est écrite immédiatement.
- Ensuite, chaque changement d'un champ persistant déclenche une écriture, regroupée avec les suivantes pendant 300 ms (`watch` profond sur `toSession`).
- Chaque écriture incrémente `revision` et porte l'identifiant `writer` du panneau, tiré au chargement (`crypto.randomUUID()`).
- La fermeture du panneau pendant le délai de 300 ms peut perdre la dernière frappe. Accepté.

### 5. Reprise
- Restauré, `CaptureForm` passe directement à l'état `created` : pas de pré-remplissage, pas de suivi de l'onglet actif, pas de recherche de doublon, comme après une création (US-03 et US-05).
- `ExtractCapture` reçoit les sections et les extraits avec `highlight` à `null`, `chosen` égal à `lastUsed` et `editing` à `null`, et relance l'écoute de la sélection comme à la création.
- `DescriptionEditor` reçoit `text` et `savedText`.
- Aucun message de confirmation ou d'erreur n'est affiché à la reprise.

### 6. Plusieurs fenêtres
- Chaque panneau écoute `browser.storage.onChanged` sur `captureSession`.
- Un changement venant d'un autre `writer`, avec une `revision` supérieure à celle connue, remplace les champs persistants du store, sans toucher aux champs éphémères.
- Un `editing` ouvert dans ce panneau est conservé si son extrait existe encore, et fermé sinon.
- La suppression de la clé par un autre panneau (« Terminer ») ramène ce panneau au formulaire de préparation.

### 7. Terminer
- Fonction pure `hasUnsavedChanges(state)` : vrai si `changedFields(savedValues, form)` n'est pas vide, si `description.text.trim() !== description.savedText`, ou si `editing` n'est pas `null`.
- Fonction pure `isSending(state)` : vrai si `status` vaut `creating` ou `saving`, si `busy` n'est pas `null`, si un ajout d'extrait est en cours, ou si la description est en cours d'enregistrement.
- Au clic sur « Terminer » (inactif si `isSending`) :
  - sans modification non enregistrée : la clé `captureSession` est supprimée, le store est vidé et `CaptureForm` est recréé (nouvelle `key`), ce qui relance le pré-remplissage depuis l'onglet actif ;
  - sinon : le message de confirmation s'affiche (décision 8), et « Terminer quand même » exécute la même suite.
- Les surlignages de la page lue sont retirés en déconnectant les ports, comme à la fermeture du panneau.

### 8. Interface
- En bas du panneau, sous la zone « Description », un Divider `subtle`, puis `DsButton` `secondary` `md` « Terminer ».
- Confirmation : à la place du bouton, `DsMessage` `warning` « Des modifications ne sont pas enregistrées dans Notion », puis `DsButton` `primary` `sm` « Terminer quand même » et `DsButton` `secondary` `sm` « Annuler », espacés de 8 px.

### 9. Tests
- **Vitest** :
  - `parseSession` : capture valide, autre `databaseId`, `version` inconnue, champ manquant, valeur non objet.
  - `toSession` : `highlight` retiré, tous les champs présents.
  - `hasUnsavedChanges` et `isSending` : chaque condition seule, et aucune.
  - Écriture et lecture de `captureSession` avec le faux navigateur de WXT, et effacement d'une capture rejetée.
- Aucun test Karate : aucun appel Notion nouveau.
- La reprise, les deux fenêtres et le redémarrage de Zen sont vérifiés par la check-list manuelle.

## Risks / Trade-offs

- [Le panneau se ferme pendant la création de l'item] → L'item peut être créé dans Notion sans que la capture soit écrite. Il reste dans Readme center, hors capture. Accepté.
- [Deux fenêtres modifient la capture en même temps] → La dernière écriture l'emporte. Accepté pour un usage personnel.
- [La refonte de l'état touche trois composants] → Leur rendu et leur logique ne changent pas. Les check-lists des US-02 à US-08 servent de vérification de non-régression (tâches 2.2 et 5.3).
