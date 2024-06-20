import * as z from "zod"; // 59.8K (gzipped: 14.6K)
import { CatCategories } from "./common";

const API_KEY = "MjcxMzkw";
const BASE_API = "https://api.thecatapi.com/v1";

const CatCategorySchema = z.enum(CatCategories);
type CatCategory = z.TypeOf<typeof CatCategorySchema>;
type CategoryMap = { [K in CatCategory]: number };
const PartialCategoryMapSchema = z.record(CatCategorySchema, z.number());
function isCompleteCategoryMap(x: Partial<CategoryMap>): x is CategoryMap {
  return Object.keys(x).length === CatCategories.length;
}
const CategoryMapSchema = PartialCategoryMapSchema.refine<CategoryMap>(
  isCompleteCategoryMap,
  {
    message: "Category map is missing some categories",
  }
);

function cache_for<T>({ ms }: { ms: number }, fn: () => Promise<T>) {
  let cache: { value: T; expiry: number } | null = null;
  return async () => {
    if (cache && cache.expiry > Date.now()) {
      return cache.value;
    }
    const value = await fn();
    cache = { value, expiry: Date.now() + ms };
    return value;
  };
}

const CategoryApiSchema = z.array(
  z.object({ id: z.number(), name: CatCategorySchema })
);

const getCategoryMap = cache_for<CategoryMap>({ ms: 1000 * 60 * 15 }, () => {
  return fetchJson(`${BASE_API}/categories?api_key=${API_KEY}`)
    .then(CategoryApiSchema.parseAsync)
    .then((pairs) =>
      CategoryMapSchema.parseAsync(
        Object.fromEntries(pairs.map((c) => [c.name, c.id]))
      )
    );
});

async function categoryToId(cat: CatCategory): Promise<number> {
  const categories = await getCategoryMap();
  return categories[cat];
}

function fetchJson(...args: Parameters<typeof fetch>) {
  return fetch(...args).then((resp) =>
    resp.ok ? resp.json() : Promise.reject("Failed to fetch data")
  );
}

const CatImageSchema = z.object({
  id: z.string(),
  url: z.string(),
  width: z.number(),
  height: z.number(),
});
type CatImage = z.TypeOf<typeof CatImageSchema>;

export async function catImages(
  category: CatCategory
): Promise<CatImage[] | { error: string }> {
  const catId = await categoryToId(category);
  return fetchJson(
    `${BASE_API}/images/search?api_key=${API_KEY}&category_ids=${catId}&limit=20`
  )
    .then(z.array(CatImageSchema).parseAsync)
    .catch((err) => ({ error: err.toString() }));
}
