const { getCliClient } = require("@sanity/cli");

const client = getCliClient({ apiVersion: "2024-01-01", useCdn: false });

const DEFAULT_HERO = {
  eyebrow: "Quantized Vision",
  title: "Neon Myth Engine For Visual Worlds",
  body: "Dynamic homepage blocks from Sanity.",
  primaryLabel: "Open Gallery",
  primaryUrl: "/gallery",
  secondaryLabel: "View Posts",
  secondaryUrl: "/posts",
};

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

async function run() {
  const legacyHome = await client.fetch(
    `coalesce(*[_id == "drafts.homePage"][0], *[_id == "homePage"][0]){
      themeVariant,
      design,
      hero,
      sections
    }`
  );

  const existingHomePage = await client.fetch(
    `coalesce(
      *[_id == "drafts.page-home"][0],
      *[_id == "page-home"][0],
      *[_type == "page" && (isHome == true || slug.current == "home")][0]
    ){
      _id,
      title,
      "slug": slug.current,
      isHome
    }`
  );

  const existingSiteSettings = await client.fetch(
    `coalesce(*[_id == "drafts.siteSettings"][0], *[_id == "siteSettings"][0]){
      _id,
      design
    }`
  );

  let pageHomeAction = "skipped";
  let siteSettingsAction = "skipped";

  if (!existingHomePage) {
    const payload = {
      _id: "page-home",
      _type: "page",
      title: "Home",
      slug: { _type: "slug", current: "home" },
      isHome: true,
      themeVariant: isNonEmptyString(legacyHome?.themeVariant) ? legacyHome.themeVariant : "crimson-ice",
      hero: legacyHome?.hero || DEFAULT_HERO,
      sections: Array.isArray(legacyHome?.sections) ? legacyHome.sections : [],
    };
    await client.create(payload);
    pageHomeAction = "created";
  }

  if (!existingSiteSettings) {
    await client.create({
      _id: "siteSettings",
      _type: "siteSettings",
      design: legacyHome?.design || {},
    });
    siteSettingsAction = "created";
  } else if (!existingSiteSettings.design && legacyHome?.design) {
    await client.patch("siteSettings").set({ design: legacyHome.design }).commit();
    siteSettingsAction = "patched";
  }

  const result = {
    legacyHomeFound: Boolean(legacyHome),
    pageHomeAction,
    siteSettingsAction,
    existingHomePage: existingHomePage || null,
    existingSiteSettings: existingSiteSettings ? { _id: existingSiteSettings._id } : null,
  };

  console.log(JSON.stringify(result, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
