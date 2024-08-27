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
```

**DO NOT CHECK `.env.local` file into git.**

## Run iOS Simulator

The ability to deploy this app in a native app store wrapper is being developed for iOS via Capacitor.

Development for iOS happens locally on a mac with XCode and an iOS Simulator.

To test the iOS deployment:

- Install the macOS [preprequisites](https://capacitorjs.com/docs/getting-started/environment-setup) for working with capacitor.
- Locally run `npm run dev-ios`.
