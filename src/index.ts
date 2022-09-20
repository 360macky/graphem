// DO NOT INSTALL.
import { createClient } from "graphql-ws";

/**
 * Graphem connector configuration fields.
 *
 * @interface IGraphemConfiguration
 * @field {string} Custom namespace
 * @field {string} Key
 * @field {string} Path of dictionary (for example: `/dictionary.json`)
 * @field {string} Name of telemetry
 * @field {string} Name of the GraphQL-WS subscription for historical telemetry
 * @field {string} Source URN (for example: `localhost:4000/graphql`)
 */
interface IGraphemConfiguration {
  namespace: string;
  key: string;
  dictionaryPath: string;
  telemetryName: string;
  subscriptionName: string;
  urn: string;
}

type DomainObjectIdentifier = {
  namespace: string;
  key: string;
};

type DomainObject = {
  identifier: DomainObjectIdentifier;
  type: string;
};

type ObjectTypeSpecification = {
  name: string;
  description: string;
  initialize?: any;
  creatable?: boolean;
  cssClass: string;
};

type HistoricalRequestOptions = {
  size: number;
  strategy: "minmax" | "latest";
  start: number;
  end: number;
  domain: string;
  signal: any;
};

type GraphQLGetQuery = {
  query: string;
  variables?: object;
};

type ObjectProvider = {
  get: (identifier: DomainObjectIdentifier) => any;
};

/**
 * The Open MCT team has a /issue related to typing so the following types will be updated.
 * https://github.com/nasa/openmct/issues/5781
 */
interface IOpenMCT {
  objects: {
    addRoot: (domainObjectIdentifier: DomainObjectIdentifier) => any;
    addProvider: (namespace: string, objectProvider: ObjectProvider) => any;
  };
  composition: {
    addProvider: ({}: any) => any;
  };
  types: {
    addType: (
      telemetryName: string,
      objectTypeSpecification: ObjectTypeSpecification
    ) => any;
  };
  telemetry: {
    addProvider: any;
  };
}

enum OBJECT_TYPE {
  FOLDER = "folder",
}

type Measurement = {
  name: string;
  key: string;
  values: [];
};

type DictionaryMeasurements = Measurement[];

interface IDictionary {
  name: string;
  key: string;
  measurements: DictionaryMeasurements;
}

export default function Graphem(configuration: IGraphemConfiguration) {
  // GraphQL client for subscriptions.
  const client = createClient({
    webSocketImpl: WebSocket,
    url: `ws://${configuration.urn}`,
  });

  return function install(openmct: IOpenMCT) {
    // Configuration of folder with telemetry point items.
    const objectRoot = {
      namespace: configuration.namespace,
      key: configuration.key,
    };
    openmct.objects.addRoot(objectRoot);
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

    openmct.types.addType(configuration.telemetryName, {
      name: "Telemetry Point",
      description: "Telemetry point with GraphQL server",
      cssClass: "icon-telemetry",
    });

    // Historical Telemetry provider
    const historicalProvider = {
      supportsRequest: (domainObject: DomainObject) =>
        domainObject.type === configuration.telemetryName,
      request: async (
        domainObject: DomainObject,
        options: HistoricalRequestOptions
      ) => {
        const graphqlQuery: GraphQLGetQuery = {
          query: `{ ${configuration.subscriptionName} (domainObjectKey: "${domainObject.identifier.key}", start: "${options.start}", end: "${options.end}") }`,
        };
        const graphqlQueryBody = JSON.stringify(graphqlQuery);
        const historicalResponse = await fetch(`http://${configuration.urn}`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: graphqlQueryBody,
          redirect: "follow",
        });
        const historicalData = await historicalResponse.json();
        return JSON.parse(historicalData.data[configuration.subscriptionName]);
      },
    };

    openmct.telemetry.addProvider(historicalProvider);

    // Realtime telemetry provider
    const listener: any = {};

    const onNextValue = (value: any, key: string) => {
      const telemetryPoint = JSON.parse(value.data[key]);
      if (listener[telemetryPoint.id]) {
        listener[telemetryPoint.id](telemetryPoint);
      }
    };

    const realtimeProvider = {
      supportsSubscribe: (domainObject: DomainObject) =>
        domainObject.type === configuration.telemetryName,
      subscribe: (domainObject: DomainObject, callback: any) => {
        /* tslint:disable:no-empty */
        let unsubscribeTelemetry = () => {};
        (async () => {
          await new Promise((resolve, reject) => {
            unsubscribeTelemetry = client.subscribe(
              {
                query: `subscription { ${domainObject.identifier.key} }`,
              },
              {
                next: (value: any) =>
                  onNextValue(value, domainObject.identifier.key),
                error: reject,
                complete: () => {},
              }
            );
          });
        })();

        listener[domainObject.identifier.key] = callback;
        return function unsubscribe() {
          unsubscribeTelemetry();
          delete listener[domainObject.identifier.key];
        };
      },
    };
    openmct.telemetry.addProvider(realtimeProvider);
  };
}
