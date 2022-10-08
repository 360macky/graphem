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

![Demo of Graphem](./.github/demo.jpg)

## 🚀 Concept

Graphem is a plugin that allows viewing telemetry data in NASA Open MCT directly from a GraphQL server.

- [**NASA Open MCT**](https://github.com/nasa/openmct) is a next-generation mission operations data visualization framework. Web-based, for desktop and mobile.

- [**GraphQL**](https://github.com/graphql/graphql-js) is a query language for APIs and a runtime for fulfilling those queries with your existing data.

🛃 All with support for [TypeScript](https://github.com/microsoft/TypeScript).

## 🪐 Installation

You can install the plugin from your favorite package manager:

```bash
# Yarn way
yarn add graphem

# NPM way
npm install graphem
```

Once installed in your project you can integrate it using:

```html
<script src="node_modules/graphem/dist/index.js"></script>
```

Before connecting the GraphQL server you will need a JSON dictionary file. This file contains the structure of the folder, how each subscription is managed, and the naming of the units. This is file is usually stored in the client.

Here is a basic example with the `prop_happiness` object:

```json
// dictionary.json
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

🔌 And finally you can connect the plugin with the necessary information from your GraphQL server.

```js
...

openmct.install(Graphem({
    namespace: "rocket.taxonomy", // Custom namespace
    key: "orion", // Custom Key
    dictionaryPath: "/dictionary.json", // Path of dictionary
    telemetryName: "rocket.telemetry", // Name of telemetry
    subscriptionName: "formatted", // Name of the <GraphQL> subscription for historical telemetry
    urn: "localhost:4000/graphql" // Source URN (Uniform Resource Name)
}));

openmct.start();
```

### 🛰 Create a GraphQL server

In order to use Graphem correctly you can use the server template that we provide.

[Template GraphQL server from Graphem](https://github.com/360macky/basic-graphql-server-open-mct/)

This server has a query available to obtain historical telemetry values, and a subscription to obtain real-time telemetry values.

It has minimal setup in TypeScript, and comes with Nodemon ideal for development on top of it.

## 💻 Development

Graphem's source code is written in TypeScript. This is a file with a default export function called Graphem. This Graphem function returns a function `install`.

```ts
export default function Graphem(configuration: IGraphemConfiguration) {
  ...
  return function install(openmct: IOpenMCT) {
    ...
```

I developed this following the [structure recommended by the NASA Open MCT documentation for plugins](https://nasa.github.io/openmct/plugins-documentation/). So the install function is the function that is executed when importing and using the plugin in a client with Open MCT.

In both cases I use an interface to check the passed parameters. `IGraphemConfiguration` is defined at installation time and contains information about the connection between GraphQL and Open MCT.

`IOpenMCT` instead is an interface to ensure intellisense over Open MCT functions. Since Open MCT is not written in TypeScript.

## 🏛️ History

The development of **Graphem** began by generating a prototype of how to build a plugin that obtains basic GraphQL queries. Although I was able to use the [Apollo client](https://www.apollographql.com/docs/react/), I preferred to use the [fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API) to get more lightness in the plugin.

The structure of Graphem will be the following. It is made up of a part to integrate domain objects with object provider and composition provider. Then require the historical data, to display it on the screen, and finally require the real-time data continuously to link them on the same screen.

I was inspired by [NASA Spacecraft](https://github.com/nasa/openmct-tutorial) tutorial to develop these parts.

Currently NASA Open MCT does not support TypeScript (see [these issues](https://github.com/nasa/openmct/issues?q=is%3Aissue+is%3Aopen+typescript)), but for a better development experience this plugin was built on it.

For better integration with the Graphem package it uses [RollUp](https://rollupjs.org/guide/en/), a module bundler, in the same style as [Open MCT YAMCS](https://github.com/evenstensberg/yamcs-openmct-plugin). Thanks to this same configuration, it will export a file in UMD ([Universal Module Definition](https://github.com/umdjs/umd)) format.

## 🤲 Contributing

Do you would like to contribute? Do you want to be the author of a new feature? Awesome! please fork the repository and make changes as you like. [Pull requests](https://github.com/360macky/project-name/pulls) are warmly welcome.

## 📃 License

Distributed under the Apache 2.0 License.
See [`LICENSE`](./LICENSE) for more information.
