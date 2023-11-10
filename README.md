<img src="https://uploads-ssl.webflow.com/6353a854c4fa2d460377c061/63642a6e9b19034a8b42547d_Group%2018-p-500.png" style="width: 200px;">
<br/>

## Supercharge your outbound with AI
<br/>
<br/>

<span><img src="https://shields.io/badge/Coverage-0%25-red">
<img src="https://img.shields.io/badge/Framework-React-blue">
<img src="https://img.shields.io/badge/Component Library-Mantine-blue">
<img src="https://img.shields.io/badge/Testing-0 unit tests-red"></span>

# Table of Contents

1. [SellScale App Overview](#sellscale-app-overview)
2. [Development](#development)
   1. [Overview](#overview)
   2. [Installation & Local Set Up](#installation--local-set-up)
   4. [Making Changes](#making-changes)
3. [Other](#other)

# SellScale App Overview

SellScale App is a **React** app that primarily uses the **Mantine** component library and **Tailwind**. We also use Jest for unit testing, lodash as our main functional utility library, tabler for our icons, and recoil as our global state management solution.

This app is our primary resource for customers to interact with our systems, such as:

- import prospects from CSVs
- view prospect statuses
- write notes on prospects
- create personas and manage CTAs
- check up on their campaigns
  ... and more

# Development

## Overview

The source directory is as follows

```
- public
  (for non-transpiled static files, mainly SEO stuff)
- src
    - assets
    (for images, fonts, etc)
    - auth
    (for user authentication code)
    - components
    (for React components, where most of the code is)
    - constants
    (for static values/variables)
    - utils
    (for library and utility code)
- __tests__
    - category 1
        - test1.js
        - test2.js
    - category 2
        - ...
    - ...
```

This structure keeps our code clean and ensures we know where to find unit tests easily.

## Installation & Local Set Up

If setting up from a fresh machine, make sure you have the following installed before continuing:

- [Node](https://nodejs.org/en/)

The following steps assume that you have the above prerequisites installed - any necessary installations should be added to the list above.

1.  Install the dependancies (in the future, we shouldn't need `--force`)

    ```
    npm i --force
    ```

1.  Create a `.env` file and paste the following example. Ensure that the `REACT_APP_API_URI` points to your locally running the [API](https://github.com/SellScale/sellscale-api).

    ```
    REACT_APP_API_URI=http://localhost:5000
    ```

1.  To start the app, run the following

    ```
    npm start
    ```

1. Make sure that everything is setup but running some unit tests.

- **Run Unit Tests**: Run all the unit tests by typing `npm test`. There should not be any failures.

## Making Changes

In general, when making changes, follow these guidelines:

1. Make a new branch:

```
<YOUR_NAME>_<YEAR-MONTH-DAY>_<DESCRIPTION-SEPARATED-BY-HYPHENS>
```

Examples would be `aakash_2023-01-01_adding-delete-api-for-prospects` or `david_2023-01-02_generate-new-hash-keys`

2. Check out the new branch, and make your feature changes. **INCLUDE DOC**

3. **Add unit tests!** (Do not forget to add unit tests!)

4. Run all unit tests locally. If everything passes, push to branch.

5. Get a peer review from a fellow engineer and have them 'check it off'

6. Verify your Pull Request in Github. If things look good, merge into Master (and it will automatically deploy via our Render pipeline)

# Other

_None for now_
