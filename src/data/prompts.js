const statuses = {
  "3": "Know it!",
  "2": "Kinda know it",
  "1": "Don't know it"
}
export function createPrompt(snippet) {


    return `Introduce yourself as a scripture memorization assistant. 
Help the user memorize ${snippet.reference} which reads: 

"${snippet.body}"

The user currently ranks their knowledge of this verse as "${statuses[snippet.status]}".

Begin by asking the user to recite the verse.
`

}
