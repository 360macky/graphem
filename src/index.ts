/**
 * @file Manages connection for real-time and historical data with GraphQL.
 * @author Marcelo Arias
 */

type GraphemConfiguration = {
  namespace: string;
  key: string;
};

const Graphem = (configuration: GraphemConfiguration) => {
  return function install(openmct: any) {
    console.log("Graphem is installed! (Alpha)");
  };
};

export default Graphem;
