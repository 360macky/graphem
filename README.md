<p align="center">
  <img
    src=".github/logo.png"
    align="center"
    width="100"
    alt="Graphem"
    title="Graphem"
  />
  <h1 align="center">Graphem</h1>
</p>

<p align="center">
  🚀 Connector to integrate <a href="https://graphql.org/" target="_blank">GraphQL</a> to <a href="https://nasa.github.io/openmct/" target="_blank">NASA OpenMCT</a> in <a href="https://graphql.org/learn/queries/" target="_blank">queries</a> and <a href="https://www.apollographql.com/docs/react/data/subscriptions/" target="_blank">subscriptions</a>. ⏰
</p>

<p align="center">
  <a href="https://github.com/enisdenjo/graphql-ws"><img src="https://img.shields.io/static/v1?label=GraphQL&message=v16.6.6&color=E10098&logo=graphql&style=flat-square" /></a>
  <a href="https://github.com/enisdenjo/graphql-ws"><img src="https://img.shields.io/static/v1?label=NASA%20Open%20MCT&message=v2.1.2&color=E03C31&logo=nasa&style=flat-square" /></a>
</p>

<p align="center">
  🚀 <a href="https://www.graphem.space">www.graphem.space</a> 🪐
</p>

![Demo of Graphem](./.github/demo.jpg)

## 🚀 Concept

Graphem is a plugin that allows viewing telemetry data in NASA Open MCT directly from a GraphQL server.

- [**NASA Open MCT**](https://github.com/nasa/openmct) is a next-generation mission operations data visualization framework. Web-based, for desktop and mobile.

- [**GraphQL**](https://github.com/graphql/graphql-js) is a query language for APIs and a runtime for fulfilling those queries with your existing data. A [**GraphQL server**](https://graphql.org/learn/#gatsby-focus-wrapper) provides a way to expose your data to clients using the GraphQL query language.

🛃 All with support for [TypeScript](https://github.com/microsoft/TypeScript).

## 🪐 Installation

Install Graphem from your favorite package manager:

```bash
# Yarn
yarn add graphem
```

```bash
# NPM
npm install graphem
```

Integrate Graphem in the `<head>` tag of your HTML file using:

```html
<script src="node_modules/graphem/dist/index.js"></script>
```

You will need a `JSON` dictionary file before connecting the GraphQL server. This file contains the structure of the folder, how each subscription is managed, and the naming of the units. This file is usually stored in the client.

Here is a basic example with the `prop_happiness` object:

```json
/* dictionary.json */
{
  "name": "Name of the mission",
  "key": "your_key",
  "measurements": [
    {
      "name": "Happiness",
      "key": "prop_happiness",
      "values": [
        {
          "key": "value",
          "name": "Value",
          "units": "kilograms",
          "format": "float",
          "min": 0,
          "max": 100,
          "hints": {
            "range": 1
          }
        },
        {
          "key": "utc",
          "source": "timestamp",
          "name": "Timestamp",
          "format": "utc",
          "hints": {
            "domain": 1
          }
        }
      ]
    }
  ]
}
```

🔌 Connect the plugin with the necessary information from your GraphQL server.

Set the following properties as an object in the Graphem function:

- **Namespace:** Custom namespace. The value of the property will be the same as in the JSON dictionary file. Example: `"rocket.taxonomy"`.
- **Key:** Custom key. The value of the property will be the same as in the JSON dictionary file. Example: `"orion"`.
- **Dictionary path:** The location where you store the JSON dictionary file. Example: `"/dictionary.json"`.
- **Telemetry name:** The value of the property will be the same as in the JSON dictionary file. Name of your telemetry module. Example: `"rocket.telemetry"`.
- **Subscription name:** Name of the GraphQL subscription to fetch historical telemetry. Example: `"formatted"`.
- **URN:** URN (Uniform Resource Name) of the GraphQL endpoint. Without HTTP/HTTPS. Example: `"localhost:4000/graphql"`.

```js
...

openmct.install(Graphem({
    namespace: "rocket.taxonomy",
    key: "orion",
    dictionaryPath: "/dictionary.json",
    telemetryName: "rocket.telemetry",
    subscriptionName: "formatted",
    urn: "localhost:4000/graphql"
}));

openmct.start();
```

### 🛰 Create a GraphQL server

In order to use Graphem correctly you can use the server template that we provide.

[Template GraphQL server from Graphem](https://github.com/360macky/graphem-template-app)

This server has a query available to obtain historical telemetry values, and a subscription to obtain real-time telemetry values.

It has minimal setup in TypeScript, and comes with Nodemon ideal for development on top of it.

## 💻 Development

### ✨ Structure

Graphem's source code is written in [TypeScript](https://github.com/microsoft/TypeScript). This is a file with a default export function called Graphem. This Graphem function returns a function `install`.

```ts
export default function Graphem(configuration: IGraphemConfiguration) {
  ...
  return function install(openmct: IOpenMCT) {
    ...
```

I developed this following the [structure recommended by the NASA Open MCT documentation for plugins](https://nasa.github.io/openmct/plugins-documentation/). So the install function is the function that is executed when importing and using the plugin in a client with Open MCT.

In both cases we inherit an interface to check the passed parameters. `IGraphemConfiguration` is defined at installation time and contains information about the connection between GraphQL and Open MCT.

`IOpenMCT` instead is an interface to ensure intellisense over Open MCT functions. Since Open MCT is not written in TypeScript.

### ⚙️ Configuration Object

The configuration object of Graphem is a parameter that contains relevant information to set up with the plugin. This object is defined by the `IGraphemConfiguration` interface. Some fields are necessary, and others are optional.

```ts
interface IGraphemConfiguration {
  namespace: string;
  key: string;
  dictionaryPath: string;
  telemetryName: string;
  subscriptionName: string;
  urn: string;
  telemetryType?: {
    name: string;
    description: string;
    cssClass?: string;
  };
}
```

### 🎟 GraphQL Client Connection

When installing Graphem we create a [GraphQL client](https://graphql.org/graphql-js/graphql-clients/) whose main purpose will be to provide [real-time information](https://en.wikipedia.org/wiki/Real-time) about the data transferred.

As the real-time transfer is established on [WebSocket](https://developer.mozilla.org/en-US/docs/Web/API/WebSockets_API). A computer communications protocol that provides full-duplex communication channels.

When establishing the connection we require the server address, this address can vary a lot in each use case, so it is established through the `URN` variable in the _Graphem_ configuration when installed.

Also the `createClient` function comes from [`graphql-ws`](https://www.npmjs.com/package/graphql-ws) library.

```ts
const client = createClient({
  webSocketImpl: WebSocket,
  url: `ws://${configuration.urn}`,
});
```

### 🌳 Root creation

Before connection and population of data, Graphem will set a **new object root**. This process will [expose a telemetry folder as a hierarchy of telemetry-providing domain objects](https://github.com/nasa/openmct/blob/master/API.md#root-objects).

```ts
const objectRoot = {
  namespace: configuration.namespace,
  key: configuration.key,
};
openmct.objects.addRoot(objectRoot);
```

### 🧭 Object Provider

The object provider will build **[Domain Objects](https://github.com/nasa/openmct/blob/master/API.md#domain-objects-and-identifiers)**. The structure of the Domain Objects comes from the dictionary.

```ts
const objectProvider: ObjectProvider = {
  get: async (identifier: DomainObjectIdentifier) => {
    const dictionaryResponse = await fetch(configuration.dictionaryPath);
    const dictionary = await dictionaryResponse.json();
    if (identifier.key === configuration.key) {
      return {
        identifier,
        name: dictionary.name,
        type: OBJECT_TYPE.FOLDER,
        location: "ROOT",
      };
    } else {
      const measurement = dictionary.measurements.find(
        (m: Measurement) => m.key === identifier.key
      );
      return {
        identifier,
        name: measurement.name,
        type: configuration.telemetryName,
        telemetry: {
          values: measurement.values,
        },
        location: `${configuration.namespace}:${configuration.key}`,
      };
    }
  },
};

openmct.objects.addProvider(configuration.namespace, objectProvider);
```

## 🗂 Composition Provider

This is a crucial part of Graphem. While Open MCT provides a solution for a composition provider, in Graphem we define a custom composition provider.

Every provider has `appliesTo` and `load` methods.

The `appliesTo` method will filter domain objects by the namespace specified in the configuration parameter, and by the type of `FOLDER`.

After that we load (from the `load` method) the mesaurements objects from the JSON dictionary. This process starts requesting the object from a `dictionaryPath` (provided by the NASA developer) and then destructuring each object returning the `key` property with the `namespace` as a whole object in an array.

```ts
const compositionProvider = {
  appliesTo: (domainObject: DomainObject) => {
    return (
      domainObject.identifier.namespace === configuration.namespace &&
      domainObject.type === OBJECT_TYPE.FOLDER
    );
  },
  load: async () => {
    const dictionaryResponse = await fetch(configuration.dictionaryPath);
    const dictionary = (await dictionaryResponse.json()) as IDictionary;
    return dictionary.measurements.map((m: Measurement) => {
      return {
        namespace: configuration.namespace,
        key: m.key,
      };
    });
  },
};

openmct.composition.addProvider(compositionProvider);
```

## ✋ Contribution Guide

Graphem is an Open Source projects that is activately looking for contributors to enhance the developer experience of NASA Open MCT developers.

If you have any feature in mind, or just want to contribute to this Open Source project please check the Issues section in this repository or create your own. Also you can fork the repository and make changes as you like. [Pull requests](https://github.com/360macky/project-name/pulls) are warmly welcome.

If you have questions about this process post it on the [Discussions section](https://github.com/360macky/graphem/discussions)!

### 🐛 Bug Report

If you find any bug in Graphem, please report it:

1. Go to [Issues](https://github.com/360macky/graphem/issues/new/choose) section.
2. Click on **New Issue** button.
3. Check "Bug report" option and click on **Get Started**.
4. Follow the steps described in the template.

## 🏛️ History

The development of **Graphem** began by generating a prototype of how to build a plugin that obtains basic [GraphQL queries](https://graphql.org/learn/queries/). Although I was able to use the [Apollo client](https://www.apollographql.com/docs/react/), I preferred to use the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to get more lightness in the plugin.

The structure of Graphem will be the following. It is made up of a part to integrate domain objects with object provider and composition provider. Then require the historical data, to display it on the screen, and finally require the real-time data continuously to link them on the same screen.

I was inspired by [NASA Spacecraft](https://github.com/nasa/openmct-tutorial) tutorial to develop these parts.

Currently NASA Open MCT does not support [TypeScript](https://github.com/microsoft/TypeScript) (see [these issues](https://github.com/nasa/openmct/issues?q=is%3Aissue+is%3Aopen+typescript)), but for a better development experience this plugin was built on it.

For better integration with the Graphem package it uses [RollUp](https://rollupjs.org/guide/en/), a module bundler, in the same style as [Open MCT YAMCS](https://github.com/evenstensberg/yamcs-openmct-plugin). Thanks to this same configuration, it will export a file in UMD ([Universal Module Definition](https://github.com/umdjs/umd)) format.

## 📃 License

Distributed under the Apache 2.0 License.
See [`LICENSE`](./LICENSE) for more information.
