import Dexie from "dexie";
import { nanoid } from "nanoid";
import Snippets from "@/data/snippets";

const generateId = () => nanoid(8);

class SnippetsDatabase extends Dexie {
  constructor() {
    super("SnippetsDatabase");
    this.version(1).stores({
      snippets: "id, &reference, body, status, createdAt",
    });
  }
}

const db = new SnippetsDatabase();

function ensureIdAndDate(snippet) {
  const now = new Date().toISOString();
  return {
    ...snippet,
    id: snippet.id || generateId(),
    createdAt: snippet.createdAt || now,
  };
}

function ensureStatusIsString(snippet) {
  return { ...snippet, status: String(snippet.status) };
}

export async function initializeDatabase() {
  try {
    await db.open();
    const count = await db.snippets.count();
    console.log(`Database opened. Current snippet count: ${count}`);

    if (count === 0) {
      const snippetsToAdd = Snippets.map((snippet) => ensureIdAndDate(snippet));
      await db.snippets.bulkAdd(snippetsToAdd);
      console.log(`Initialized database with ${snippetsToAdd.length} snippets`);
    } else {
      console.log(
        `Database already contains ${count} snippets. Skipping initialization.`,
      );
    }
  } catch (error) {
    console.error("Failed to initialize database:", error);
    // Attempt to provide more details about the error
    if (error.inner) {
      console.error("Inner error:", error.inner);
    }
    throw error; // Re-throw the error for upper-level handling
  }
}

export async function getAllSnippets() {
  return db.snippets.orderBy("createdAt").toArray();
}

export async function getSnippetById(id) {
  return db.snippets.get(id);
}

export async function saveSnippet(snippet) {
  const withDateAndId = ensureIdAndDate(snippet);
  const withStatusAsString = ensureStatusIsString(withDateAndId);
  return db.snippets.add(withStatusAsString);
}

export async function updateSnippet(snippetToUpdate) {
  const { id, ...updateData } = ensureIdAndDate(snippetToUpdate);
  await db.snippets.update(id, updateData);
  return { id, ...updateData };
  return db.snippets.update(id, updateData);
}

export async function deleteSnippet(snippetId) {
  return db.snippets.delete(snippetId);
}

export async function getNextId() {
  return generateId();
}
