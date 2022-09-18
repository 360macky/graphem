// DO NOT INSTALL. This are alpha tests for flight.

import { hello } from "hello-world-js";

const testVariable = 10;

(async () => {
  console.log(hello());
  const testApi = 'https://api.spacexdata.com/v5/launches/latest';
  const response = await fetch(testApi);
  const data = await response.json();
  console.log(data);
})();

export default testVariable;
