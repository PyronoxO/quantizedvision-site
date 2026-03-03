const { getCliClient } = require("@sanity/cli");

const RECIPIENT_EMAIL = "quantizedvision@gmail.com";
const client = getCliClient({ apiVersion: "2024-01-01", useCdn: false });

function normalizeContactSection(section) {
  if (!section || section._type !== "homeContactSection") return section;
  return {
    ...section,
    heading: section.heading || "Contact",
    recipientEmail: RECIPIENT_EMAIL,
    subjectLabel: section.subjectLabel || "Subject",
    emailLabel: section.emailLabel || "Email",
    phoneLabel: section.phoneLabel || "Phone",
    messageLabel: section.messageLabel || "Message",
    submitLabel: section.submitLabel || "Submit",
    subjectPlaceholder: section.subjectPlaceholder || "Select a project subject",
    emailPlaceholder: section.emailPlaceholder || "your@email.com",
    phonePlaceholder: section.phonePlaceholder || "+1 555 123 4567",
    messagePlaceholder: section.messagePlaceholder || "Tell me about your project...",
  };
}

function makeDefaultContactSection() {
  return {
    _type: "homeContactSection",
    _key: `contact-${Date.now().toString(36)}`,
    heading: "Contact",
    body: "Use this form to send your inquiry.",
    recipientEmail: RECIPIENT_EMAIL,
    subjectLabel: "Subject",
    emailLabel: "Email",
    phoneLabel: "Phone",
    messageLabel: "Message",
    submitLabel: "Submit",
    subjectPlaceholder: "Select a project subject",
    emailPlaceholder: "your@email.com",
    phonePlaceholder: "+1 555 123 4567",
    messagePlaceholder: "Tell me about your project...",
  };
}

async function run() {
  const docs = await client.fetch(`
    *[_type == "page"]{
      _id,
      title,
      "slug": slug.current,
      sections
    }
  `);

  let updated = 0;
  let insertedOn = null;

  for (const doc of docs) {
    const currentSections = Array.isArray(doc.sections) ? doc.sections : [];
    const hasContact = currentSections.some((s) => s && s._type === "homeContactSection");
    let nextSections = currentSections.map(normalizeContactSection);

    if (!hasContact && (doc.slug === "contacts" || doc.slug === "contact")) {
      nextSections = [...nextSections, makeDefaultContactSection()];
      insertedOn = doc._id;
    }

    const changed = JSON.stringify(currentSections) !== JSON.stringify(nextSections);
    if (!changed) continue;

    await client.patch(doc._id).set({ sections: nextSections }).commit({ autoGenerateArrayKeys: false });
    updated += 1;
  }

  const verify = await client.fetch(`
    *[_type == "page" && slug.current in ["contacts", "contact", "home"]]{
      _id,
      title,
      "slug": slug.current,
      "contacts": sections[_type == "homeContactSection"]{
        heading,
        recipientEmail,
        subjectLabel,
        emailLabel,
        phoneLabel,
        messageLabel,
        submitLabel
      }
    }
  `);

  console.log(JSON.stringify({ updated, insertedOn, recipientEmail: RECIPIENT_EMAIL, verify }, null, 2));
}

run().catch((error) => {
  console.error(error);
  process.exit(1);
});
