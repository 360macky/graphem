// DO NOT INSTALL.
import { hello } from "hello-world-js";

export default function Graphem(configuration: any) {
  return function install() {
    console.log("Graphem installed");
    console.log(hello());
  };
}
