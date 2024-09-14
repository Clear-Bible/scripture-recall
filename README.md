# ScriptureRecall is live today!  https://recall.bible

## Discover Memory Verses
    - Converse with AI to find memory verses
    - AI recommendations are based on a curated topic dataset
    - The text of scripture itself is not AI generated
    - Add a verse you want to memorize

    ![alt text](<public/Screen Shot 2024-09-14 at 3.54.55 PM.png>)

## Practice Memory Verses
    - Text Practice
        - Various kinds of practice exercises
    - Audio Practice
        - Include audio clip

## Track Memory Verses
    - Adding a verse from Home Screen
    - Editing a Verse
    - Previewing a verse

- our data
- how to use
- Screenshots


    

# Syntereo

_"And Mary treasured these words in her heart..."_

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

# Data Created for this Project

[Bible Topics](https://github.com/Clear-Bible/BibleTopics)

[Kathario `OSIS-reconstitution` branch](https://github.com/Clear-Bible/kathairo.py/tree/OSIS-reconstitution)