import { describe, it, expect } from "vitest";
import {
  imageUrl,
  extractImagePaths,
  rewriteImagesToCid,
  fitWidth,
} from "./images";

describe("imageUrl", () => {
  it("kodiert den Speicherpfad", () => {
    expect(imageUrl("abc/logo.png")).toBe("/api/email/image/abc%2Flogo.png");
  });
});

describe("extractImagePaths", () => {
  it("findet einen eigenen Bild-Pfad", () => {
    const html = `<p>Hi</p><img src="/api/email/image/abc%2Flogo.png" alt="">`;
    expect(extractImagePaths(html)).toEqual(["abc/logo.png"]);
  });

  it("liefert jeden Pfad nur einmal", () => {
    const html = `<img src="/api/email/image/x%2Fa.png"><img src="/api/email/image/x%2Fa.png">`;
    expect(extractImagePaths(html)).toEqual(["x/a.png"]);
  });

  it("ignoriert fremde Bild-URLs", () => {
    const html = `<img src="https://fremd.de/tracker.png">`;
    expect(extractImagePaths(html)).toEqual([]);
  });

  it("findet auch absolute eigene Bild-Adressen", () => {
    const html = `<img src="https://crm-gc.vercel.app/api/email/image/x%2Fa.png">`;
    expect(extractImagePaths(html)).toEqual(["x/a.png"]);
  });

  it("liefert leere Liste ohne Bilder", () => {
    expect(extractImagePaths("<p>nur Text</p>")).toEqual([]);
  });
});

describe("rewriteImagesToCid", () => {
  it("ersetzt bekannte Bild-Adressen durch cid-Verweise", () => {
    const html = `<img src="/api/email/image/abc%2Flogo.png">`;
    const map = new Map([["abc/logo.png", "img1@crm"]]);
    expect(rewriteImagesToCid(html, map)).toBe(`<img src="cid:img1@crm">`);
  });

  it("lässt unbekannte Pfade unverändert", () => {
    const html = `<img src="/api/email/image/unbekannt.png">`;
    expect(rewriteImagesToCid(html, new Map())).toBe(html);
  });

  it("ersetzt auch absolute eigene Bild-Adressen komplett durch cid", () => {
    const html = `<img src="https://crm-gc.vercel.app/api/email/image/x%2Fa.png">`;
    const map = new Map([["x/a.png", "img9@crm"]]);
    expect(rewriteImagesToCid(html, map)).toBe(`<img src="cid:img9@crm">`);
  });
});

describe("fitWidth", () => {
  it("verkleinert breite Bilder proportional", () => {
    expect(fitWidth(2000, 1000, 1000)).toEqual({ width: 1000, height: 500 });
  });

  it("lässt kleine Bilder unverändert", () => {
    expect(fitWidth(800, 600, 1000)).toEqual({ width: 800, height: 600 });
  });
});
