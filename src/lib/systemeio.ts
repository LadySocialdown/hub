const API_BASE = "https://api.systeme.io/api";

interface SystemeContact {
  id: number;
  email: string;
}

interface SystemeTag {
  id: number;
  name: string;
}

function apiKey(): string {
  const key = process.env.SYSTEME_IO_API_KEY;
  if (!key) throw new Error("SYSTEME_IO_API_KEY manquante");
  return key;
}

async function systemeFetch(path: string, init: RequestInit = {}): Promise<Response> {
  return fetch(`${API_BASE}${path}`, {
    ...init,
    headers: {
      "X-API-Key": apiKey(),
      "Content-Type": "application/json",
      Accept: "application/json",
      ...init.headers,
    },
  });
}

async function findContactByEmail(email: string): Promise<SystemeContact | null> {
  const res = await systemeFetch(`/contacts?email=${encodeURIComponent(email)}`);
  if (!res.ok) throw new Error(`GET /contacts a échoué (${res.status}): ${await res.text()}`);
  const body = await res.json();
  const contact = Array.isArray(body?.items) ? body.items[0] : undefined;
  return contact ? { id: contact.id, email: contact.email } : null;
}

async function createOrUpdateContact(email: string, prenom: string): Promise<SystemeContact> {
  const res = await systemeFetch("/contacts", {
    method: "POST",
    body: JSON.stringify({
      email,
      fields: [{ slug: "first_name", value: prenom }],
    }),
  });

  if (res.status === 201 || res.status === 200) {
    const body = await res.json();
    return { id: body.id, email: body.email };
  }

  // 422 = contact déjà existant chez systeme.io : on récupère son id à la place.
  if (res.status === 422) {
    const existing = await findContactByEmail(email);
    if (existing) return existing;
  }

  throw new Error(`POST /contacts a échoué (${res.status}): ${await res.text()}`);
}

async function findTagByName(name: string): Promise<SystemeTag | null> {
  let startingAfter: number | undefined;
  for (let page = 0; page < 20; page++) {
    const qs = startingAfter ? `?startingAfter=${startingAfter}` : "";
    const res = await systemeFetch(`/tags${qs}`);
    if (!res.ok) throw new Error(`GET /tags a échoué (${res.status}): ${await res.text()}`);
    const body = await res.json();
    const items: SystemeTag[] = body?.items ?? [];
    const match = items.find((t) => t.name.trim().toLowerCase() === name.trim().toLowerCase());
    if (match) return match;
    if (items.length === 0) break;
    startingAfter = items[items.length - 1].id;
  }
  return null;
}

async function createTag(name: string): Promise<SystemeTag> {
  const res = await systemeFetch("/tags", {
    method: "POST",
    body: JSON.stringify({ name }),
  });
  if (!res.ok) throw new Error(`POST /tags a échoué (${res.status}): ${await res.text()}`);
  return res.json();
}

async function getOrCreateTag(name: string): Promise<SystemeTag> {
  const existing = await findTagByName(name);
  if (existing) return existing;
  return createTag(name);
}

async function assignTag(contactId: number, tagId: number): Promise<void> {
  const res = await systemeFetch(`/contacts/${contactId}/tags`, {
    method: "POST",
    body: JSON.stringify({ tagId }),
  });
  // 204 = tag ajouté, 200/422 = déjà présent selon les versions de l'API.
  if (!res.ok && res.status !== 422) {
    throw new Error(`POST /contacts/${contactId}/tags a échoué (${res.status}): ${await res.text()}`);
  }
}

/**
 * Pousse une préinscription vers Systeme.io : crée/retrouve le contact et lui
 * applique le tag donné (créé s'il n'existe pas encore côté Systeme.io).
 * Ne doit jamais faire échouer le flux de préinscription : à appeler avec
 * un try/catch côté appelant.
 */
export async function pushPreinscriptionToSystemeIo(
  email: string,
  prenom: string,
  tagName: string
): Promise<void> {
  const contact = await createOrUpdateContact(email, prenom);
  const tag = await getOrCreateTag(tagName);
  await assignTag(contact.id, tag.id);
}
