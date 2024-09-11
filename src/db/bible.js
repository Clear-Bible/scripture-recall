import Dexie from "dexie";
import { nanoid } from "nanoid";
import BSB from "@/data/BSB";

const generateId = () => nanoid(8);

class BibleDatabase extends Dexie {
  constructor() {
    super("BibleDatabase");
    this.version(1).stores({
      verses: "reference, text, createdAt",
    });
  }
}

const db = new BibleDatabase();

/*
function ensureStatusIsString(snippet) {
  return { ...snippet, status: String(snippet.status) };
}
*/

export async function initializeBibleDatabase() {
  try {
    await db.open();
    const count = await db.verses.count();
    console.log(`Database opened. Current verses count: ${count}`);

    if (count === 0) {
      const versesToAdd = BSB.map((verse) => ensureReferenceAndDate(verse));
      await db.verses.bulkAdd(versesToAdd);
      console.log(`Initialized database with ${versesToAdd.length} verses`);
    } else {
      console.log(
        `Database already contains ${count} verses. Skipping initialization.`,
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

function ensureReferenceAndDate(verse) {
  const now = new Date().toISOString();
  return {
    ...verse,
    reference: verse.reference || generateId(),
    createdAt: verse.createdAt || now,
  };
}

/*
export async function getAllSnippets() {
  return db.snippets.orderBy("createdAt").toArray();
}
*/

export function getVerseByReference(id) {
  return db.verses.get(id);
}

/*
export async function saveSnippet(snippet) {
  const withDateAndId = ensureIdAndDate(snippet);
  const withStatusAsString = ensureStatusIsString(withDateAndId);
  return db.snippets.add(withStatusAsString);
}
*/

/*
export async function updateSnippet(snippetToUpdate) {
  const { id, ...updateData } = ensureIdAndDate(snippetToUpdate);
  await db.snippets.update(id, updateData);
  return { id, ...updateData };
  return db.snippets.update(id, updateData);
}
*/

/*
export async function deleteSnippet(snippetId) {
  return db.snippets.delete(snippetId);
}
*/

export async function getNextId() {
  return generateId();
}
