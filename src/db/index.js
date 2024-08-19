import Snippets from "@/data/snippets";

let _snippets = Array.from(Snippets);

export async function getAllSnippets() {
  console.info("getAllSnippets", _snippets);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(_snippets);
    }, 1500);
  });
}

export async function getSnippetById(id) {
  console.info("getSnippetById", id);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        _snippets.find((snippet) => {
          return snippet.id === id;
        }),
      );
    }, 700);
  });
}

export async function saveSnippet(snippet) {
  const newSnippets = [..._snippets, snippet];
  _snippets = newSnippets;
  return Promise.resolve(_snippets);
}

export async function updateSnippet(snippetToUpdate) {
  const existingSnippet = _snippets.find((snippet) => {
    return snippet.id === snippetToUpdate.id;
  });

  existingSnippet.reference = snippetToUpdate.reference;
  existingSnippet.body = snippetToUpdate.body;
  existingSnippet.status = snippetToUpdate.status;

  const snippetsMinus = _snippets.filter((snippet) => {
    return snippet.id !== existingSnippet.id;
  });

  _snippets = [...snippetsMinus, existingSnippet];

  return Promise.resolve(_snippets);
}

export async function deleteSnippet(snippetId) {
  const newSnippets = _snippets.filter((snippet) => {
    return snippet.id !== snippetId;
  });
  _snippets = newSnippets;
  return Promise.resolve(_snippets);
}

export async function getNextId() {
  const ids = _snippets.map((snippet) => Number(snippet.id)).sort();
  const biggestId = Math.max(...ids);
  return Promise.resolve(biggestId + 1);
}
