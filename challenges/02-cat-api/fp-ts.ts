import * as E from "fp-ts/Either"; // 12.6K
import * as O from "fp-ts/Option"; // 10.5K
import * as RA from "fp-ts/ReadonlyArray"; // 21.8K
import * as TE from "fp-ts/TaskEither"; // 20.3K
import { flow, pipe } from "fp-ts/function"; // 1.3K
import * as t from "io-ts"; // 20K
import { failure } from "io-ts/PathReporter"; // 8.5K
import { CatCategories, CatCategory, CatImage } from "./common";

const API_KEY = "MjcxMzkw";
const BASE_API = "https://api.thecatapi.com/v1";

const imagesCodec = t.readonlyArray(
  t.readonly(
    t.type({ id: t.string, url: t.string, width: t.number, height: t.number })
  )
);
export type Images = t.TypeOf<typeof imagesCodec>;

const categoryNameCodec = t.union(
  // This cast is necessary because t.union insists on
  // having at least two arguments and TypeScript can't
  // statically verify that the array is not empty.
  CatCategories.map((c) => t.literal(c)) as unknown as [
    t.Mixed,
    t.Mixed,
    ...t.Mixed[]
  ]
);
type CateogoryName = t.TypeOf<typeof categoryNameCodec>;

const categoryCodec = t.readonly(
  t.type({ id: t.number, name: categoryNameCodec })
);
type Category = t.TypeOf<typeof categoryCodec>;

type CategoryMap = ReadonlyMap<CateogoryName, Category>;

interface CategoryCache {
  readonly expirationTimestamp: number;
  readonly categories: CategoryMap;
}

export function searchCatApiFactory(): (
  category: CateogoryName,
  count?: number
) => TE.TaskEither<String, Images> {
  let cache: CategoryCache = {
    expirationTimestamp: 0,
    categories: new Map(),
  };

  return (category, count = 20) =>
    pipe(
      getCategoriesCache(cache),
      TE.chain((newCache) => {
        cache = newCache;
        return pipe(
          O.fromNullable(newCache.categories.get(category)?.id),
          TE.fromOption(() => `Unknown category`)
        );
      }),
      TE.chain((id) =>
        httpGet(
          `${BASE_API}/images/search?limit=${count}&category_ids=${id}&size=full&api_key=${API_KEY}`
        )
      ),
      TE.chain(decodeWith(imagesCodec))
    );
}

function getCategoriesCache(
  cache: CategoryCache
): TE.TaskEither<string, CategoryCache> {
  return Date.now() >= cache.expirationTimestamp
    ? pipe(
        httpGet(`${BASE_API}/categories?api_key=${API_KEY}`),
        TE.chain(decodeWith(t.readonlyArray(categoryCodec))),
        TE.map((categories) => ({
          expirationTimestamp: Date.now() + 15 * 60 * 1000,
          categories: new Map(categories.map((c) => [c.name, c])),
        }))
      )
    : TE.of(cache);
}

function httpGet(url: string) {
  return pipe(
    TE.tryCatch(
      () =>
        fetch(url).then((r) =>
          r.ok ? r.json() : Promise.reject(`Failed to fetch ${url}`)
        ),
      String
    )
  );
}

function decodeWith<A>(decoder: t.Decoder<unknown, A>) {
  return flow(
    decoder.decode,
    E.mapLeft((errors) => failure(errors).join("\n")),
    TE.fromEither
  );
}

const searchCatApi = searchCatApiFactory();

export function catImages(
  category: CatCategory
): Promise<CatImage[] | { error: string }> {
  return searchCatApi(category)().then(
    E.fold(
      (e) => ({ error: e } as { error: string } | CatImage[]),
      (i) => i as CatImage[]
    )
  );
}
