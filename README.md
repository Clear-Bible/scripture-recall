# ScriptureRecall is live today @ [recall.bible](https://recall.bible)

_[Try it yourself here](https://recall.bible)_

## Discover Memory Verses

Converse with AI to find memory verses related to your interests. All AI recommendations are based on a curated dataset of topics and associated scripture.

To ensure that scripture is not misquoted, the text of each recommended verse is programmatically inserted rather than AI generated.

<kbd><img src="doc/2024-09-14 16.48.15.gif" alt="drawing" width="350" style="border-radius: 10px;"/></kbd> <kbd><img src="doc/Screen Shot 2024-09-14 at 4.56.15 PM.png" alt="drawing" width="350" style="border-radius: 10px;"/></kbd>

&nbsp;

Add recommended verses to your memory bank so that you can practice them.

<kbd><img src="doc/2024-09-14 17.11.36.gif" alt="drawing" width="350" style="border-radius: 10px;"/></kbd>

&nbsp;

## Practice Memory Verses

Learn and maintain memory verses by practicing with an AI. Both text and audio chat are supported! With AI, when you fail to remember a verse it can give you hints (rather than just looking at the verse).

Depending on how well you know a verse, the AI will use different memorization techniques to build your memory. For example, specifying that you only "kind of know" a verse will prompt the AI to start by using fill-in-the-blanks while is a verse is marked as "I know it!" then the LLM will ask you to recite it from memory.

<table>
  <tr>
    <td>

### Text Practice

<kbd><img src="doc/2024-09-14 17.49.30.gif" alt="drawing" width="350" style="border-radius: 10px;"/></kbd>

</td>
<td>

### Audio Practice

<kbd><img src="doc/2024-09-14 21.16.30.gif" alt="drawing" width="350" style="border-radius: 10px;"/></kbd>

</td>
  </tr>
</table>

## Track Memory Verses

Add verses you want to memorize.

Track your learning progress as verses go from "I don't know it" to "I kind of know it" to "I know it!"

The content of a verse is hidden by default so that you aren't spoiled when trying to test your memory.

# Data Created for this Project

- [Bible Topics](https://github.com/Clear-Bible/BibleTopics) is used as the knowledge base for the Discover Chat's RAG system.
- [Kathario (`OSIS-reconstitution` branch)](https://github.com/Clear-Bible/kathairo.py/tree/OSIS-reconstitution) for processing the Biblical text (BSB) used by the Discover chat.

# Tech Stack

- Vite + React
- Shadcn + TailwindCSS
- IndexedDB
- Text models: OpenAI
- Voice model: Hume.AI
- Capacitor for deployment on iOS

All code and data was developed within the 30-day window of the hackathon.

# Developer Info

## Run Locally

- Install dependencies: `npm install`
- Start local server: `npm run dev`

To use Voice Chat, you must provide a Hume AI API key and secret key.
To do so, create a `.env.local` file with the following variables:

```
VITE_HUME_API_KEY=<your API key>
VITE_HUME_CLIENT_SECRET=<your secret key>
VITE_OPENAI_API_KEY=<your API key>
VITE_OPENAI_BIBLE_VERSE_RECOMMENDER_ID=<your recommender ID>
```

**DO NOT CHECK `.env.local` file into git.**

## Run iOS Simulator

The ability to deploy this app in a native app store wrapper is being developed for iOS via Capacitor.

Development for iOS happens locally on a mac with XCode and an iOS Simulator.

To test the iOS deployment:

- Install the macOS [preprequisites](https://capacitorjs.com/docs/getting-started/environment-setup) for working with capacitor.
- Locally run `npm run dev-ios`.
