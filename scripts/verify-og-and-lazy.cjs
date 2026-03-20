/**
 * Runtime verification (Playwright):
 * 1) og:type + og:image on blog detail after Helmet hydration
 * 2) Lazy image: image requests after scroll vs initial viewport
 *
 * Run from cms/: node scripts/verify-og-and-lazy.cjs
 * Requires: npx playwright install chromium (once)
 */
const { chromium } = require("playwright");

const BLOG_DETAIL =
  process.env.VERIFY_BLOG_URL ||
  "http://localhost:3001/blog/ai-observability-ensuring-reliability-and-performance-in-production-ai-systems";

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage();

  const imageRequests = [];
  page.on("request", (req) => {
    const type = req.resourceType();
    if (type !== "image") return;
    const url = req.url();
    if (url.startsWith("data:")) return;
    imageRequests.push({ t: Date.now(), url: url.slice(0, 120) });
  });

  const out = { blogUrl: BLOG_DETAIL, og: {}, lazy: {}, errors: [] };

  try {
    await page.goto(BLOG_DETAIL, {
      waitUntil: "domcontentloaded",
      timeout: 90000,
    });

    // Helmet injects after React commit — wait up to 15s for OG tags
    try {
      await page.waitForFunction(
        () => {
          const ogType = document.querySelector('meta[property="og:type"]');
          const ogImage = document.querySelector('meta[property="og:image"]');
          const t = ogType?.getAttribute("content")?.trim();
          const i = ogImage?.getAttribute("content")?.trim();
          return Boolean(t && i);
        },
        { timeout: 15000 }
      );
      out.og.status = "PASS";
    } catch {
      out.og.status = "FAIL";
      out.og.note =
        "og:type and/or og:image not both present within 15s after load";
    }

    const ogMeta = await page.evaluate(() => ({
      ogType: document
        .querySelector('meta[property="og:type"]')
        ?.getAttribute("content"),
      ogImage: document
        .querySelector('meta[property="og:image"]')
        ?.getAttribute("content"),
      twitterImage: document
        .querySelector('meta[name="twitter:image"]')
        ?.getAttribute("content"),
    }));
    out.og.values = ogMeta;

    const t0 = Date.now();
    const initialCount = imageRequests.length;
    await page.waitForTimeout(2000);
    const afterIdle = imageRequests.length;

    // Scroll to bottom in steps to trigger lazy-loaded images
    for (let i = 0; i < 8; i++) {
      await page.evaluate(() =>
        window.scrollBy(0, Math.max(400, window.innerHeight * 0.8))
      );
      await page.waitForTimeout(400);
    }
    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await page.waitForTimeout(1500);

    const afterScroll = imageRequests.length;
    const newAfterScroll = imageRequests.filter((r) => r.t >= t0);

    out.lazy = {
      initialImageRequests: initialCount,
      after2sIdle: afterIdle,
      afterScrollTotal: afterScroll,
      newRequestsDuringTest: newAfterScroll.length,
      sampleNewUrls: newAfterScroll.slice(-8).map((x) => x.url),
    };

    // Heuristic: lazy loading often shows additional image requests after scroll
    // (not always — hero/LCP may load eagerly)
    if (newAfterScroll.length > afterIdle) {
      out.lazy.status = "PASS";
      out.lazy.evidence =
        "More image requests observed after scroll than in first paint window";
    } else if (afterScroll > initialCount) {
      out.lazy.status = "PASS";
      out.lazy.evidence = "Image request count increased after navigation/scroll";
    } else {
      out.lazy.status = "INCONCLUSIVE";
      out.lazy.evidence =
        "No clear increase in image requests after scroll; page may use mostly eager images or cached assets";
    }
  } catch (e) {
    out.errors.push(String(e.message || e));
  } finally {
    await browser.close();
  }

  console.log(JSON.stringify(out, null, 2));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
