import {
  afterAll,
  afterEach,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from "vitest";
import { CatCategory, CatImage } from "./common";
import { categories, images } from "./fixtures";
import * as vanilla from "./vanilla";
import * as fpTs from "./fp-ts";
import { HttpResponse, http } from "msw";
import { setupServer } from "msw/node";

const idForCategory = (category: CatCategory) =>
  categories.find((c) => c.name === category)?.id.toString() ?? "";

const restHandlers = [
  http.get("https://api.thecatapi.com/v1/categories", () =>
    HttpResponse.json(categories)
  ),
  http.get("https://api.thecatapi.com/v1/images/search", ({ request }) => {
    const url = new URL(request.url);
    const categoryIds = url.searchParams.get("category_ids");
    if (categoryIds === idForCategory("network-error")) {
      return HttpResponse.error();
    }
    if (categoryIds === idForCategory("empty-response")) {
      return new HttpResponse();
    }
    if (categoryIds === idForCategory("missing-widths")) {
      return HttpResponse.json(
        images.map(({ id, url, height }) => ({ id, url, height }))
      ); // missing width and height
    }

    return HttpResponse.json(images);
  }),
];
function testSuite(
  implementation: (c: CatCategory) => Promise<CatImage[] | { error: string }>
) {
  let server = setupServer(...restHandlers);
  beforeAll(() => server.listen({ onUnhandledRequest: "error" }));
  afterAll(() => server.close());
  afterEach(() => server.resetHandlers());

  test("fetches cat images", async () => {
    const result = await implementation("sunglasses");
    expect(result).toEqual(images);
  });

  test("handles network error", async () => {
    const result = await implementation("network-error");
    expect(result).toEqual({ error: "TypeError: Failed to fetch" });
  });

  test("handles empty response", async () => {
    const result = await implementation("empty-response");
    expect(result).toEqual({
      error: "SyntaxError: Unexpected end of JSON input",
    });
  });

  test("handles missing widths", async () => {
    const result = await implementation("missing-widths");
    expect(result).toEqual({ error: expect.anything() });
  });
}

describe('vanilla "catImages"', () => {
  testSuite(vanilla.catImages);
});

describe('fp-ts "catImages"', () => {
  testSuite(fpTs.catImages);
});
