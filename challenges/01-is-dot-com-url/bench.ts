import { bench } from "vitest";
import { fpTs, vanilla } from "./index";

bench("vanilla", () => {
  vanilla.isDotCom("https://google.com");
  vanilla.isDotCom("https://google");
  vanilla.isDotCom("https://google.org");
});

bench("fp-ts", () => {
  fpTs.isDotCom("https://google.com");
  fpTs.isDotCom("https://google");
  fpTs.isDotCom("https://google.org");
});
