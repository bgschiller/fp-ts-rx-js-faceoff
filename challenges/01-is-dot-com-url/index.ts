import * as O from "fp-ts/Option"; // 10.5K
import * as RA from "fp-ts/ReadonlyArray"; // 21.8K
import { pipe } from "fp-ts/function"; // 637B

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

export namespace vanilla {
  export function isDotCom(url: string): boolean {
    try {
      return new URL(url).hostname.endsWith(".com");
    } catch {
      return false;
    }
  }
}
