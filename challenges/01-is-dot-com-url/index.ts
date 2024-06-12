// Write a function that takes a string and returns true if the string is a
// valid .com URL. The function should not throw an exception if the string
// is not a valid URL.

import * as O from "fp-ts/Option"; // 10.5K (gzipped: 3K)
import * as RA from "fp-ts/ReadonlyArray"; // 21.8K (gzipped: 5.6k)
import { pipe } from "fp-ts/function"; // 637B (gzipped: 333B)

export namespace fpTs {
  export function isDotCom(url: string): boolean {
    return pipe(
      O.tryCatch(() => new URL(url)),
      O.map((p) => p.hostname),
      O.chain((r) => RA.last(r.split("."))),
      O.exists((tld) => tld === "com")
    );
  }
}

import parse from "core-js/stable/url/parse"; // 42.3K (gzipped: 15.4k)

export namespace vanilla {
  export function isDotCom(url: string): boolean {
    return parse(url)?.hostname?.endsWith?.(".com") ?? false;
  }
}
