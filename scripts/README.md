# Conversation AI Crowdsource (TypeScript) Scripts

Various typescript scripts intended to be run with ts-node for Conversation AI
crowdsource data management. General useage expected to be:

```ts-node ts-bin/<nameofscript> <arguments>```

## Installing Dependencies

Global node dependencies for development: gcloud, node (suggest you use nvm to install it) are [typescript](https://www.typescriptlang.org/) to write sensible JS code, and [yarn](https://yarnpkg.com/lang/en/), and of course node (which is usually most easily installed and managed using [nvm](https://github.com/creationix/nvm/blob/master/README.md)):

After you have installed node/npm using nvm, you can install the other global dependencies using:

```bash
npm install -g typescript yarn ts-node
```

Then from this directory, use yarn to install the local package dependencies:

```bash
yarn install
```

## Run Scripts

```bash
ts-node ./ts-bin/pair_comments_for_relativerating.ts \
  --infile="./tmp/path-to-input.jsonl" \
  --outfile="./tmp/path-to-paired.jsonl"
./node_modules/.bin/json2csv --ndjson \
  --input="./tmp/path-to-paired.jsonl" \
  --output="./tmp/path-to-paired.csv"
```

## Development & Testing

To test, run:

```bash
yarn run test
```

## About this code

This repository contains example code to help experimentation with the Perspective API; it is not an official Google product.
