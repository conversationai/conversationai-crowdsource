# Conversation AI Crowdsource (TypeScript) Scripts

Various typescript scripts intended to be run with ts-node for Conversation AI
crowdsource data management. General useage expected to be:

```ts-node ts-bin/<nameofscript> <arguments>```

## Installing Dependencies

Global dependencies for development: [Google Cloud SDK (aka
gcloud)](https://cloud.google.com/sdk/), node (which is usually most easily
installed and managed using
[nvm](https://github.com/creationix/nvm/blob/master/README.md)),
[typescript](https://www.typescriptlang.org/) to write sensible JS code, and
[yarn](https://yarnpkg.com/lang/en/).

After you have installed node/npm using nvm, you can install the other global dependencies using:

```bash
npm install -g typescript yarn ts-node
```

Then from this directory, use yarn to install the local package dependencies:

```bash
yarn install
```

## Script To Create a Relative Rating Dataset

* The file `./ts-bin/pair_comments_for_relativerating.ts` contains a script to
  convert wikipedia comments in jsonlines into a relative rating task (also in
  jsonlines).

## Development & Testing

To test, run:

```bash
yarn run test
```

## About this code

This repository contains example code to help experimentation with the Perspective API; it is not an official Google product.
