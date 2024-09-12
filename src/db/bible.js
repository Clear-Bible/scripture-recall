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

export function getVersesByReference(ids) {
  return db.verses.bulkGet(ids);
}

export async function getNextId() {
  return generateId();
}
