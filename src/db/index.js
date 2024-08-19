import Snippets from "@/data/snippets";

export async function getAllSnippets() {
  console.info("getAllSnippets", Snippets);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(Snippets);
    }, 1500); // 1500 milliseconds = 1.5 seconds
  });
}

export async function getSnippetById(id) {
  console.info("getSnippetById", id);
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(
        Snippets.find((snippet) => {
          return snippet.id === id;
        }),
      );
    }, 700);
  });
}
