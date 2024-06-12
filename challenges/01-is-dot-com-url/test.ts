import { expect, test, describe } from "vitest";
import { fpTs, vanilla } from ".";

function testSuite(implementation: (url: string) => boolean) {
  test("valid .com URL", () => {
    expect(implementation("https://google.com")).toBe(true);
  });

  test("invalid URL", () => {
    expect(implementation("https://google")).toBe(false);
  });

  test("valid .org URL", () => {
    expect(implementation("https://google.org")).toBe(false);
  });
}

describe("fp-ts", () => {
  testSuite(fpTs.isDotCom);
});

describe("vanilla", () => {
  testSuite(vanilla.isDotCom);
});
