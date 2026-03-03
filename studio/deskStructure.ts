import type { StructureResolver } from "sanity/structure";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Quantized Vision")
    .items([
      S.listItem()
        .title("Pages")
        .child(
          S.list()
            .title("Pages")
            .items([
              S.listItem()
                .title("All Pages")
                .child(S.documentTypeList("page").title("All Pages")),
              S.listItem()
                .title("Global Modules")
                .child(S.documentTypeList("globalModule").title("Global Modules")),
            ])
        ),
      S.listItem()
        .title("Settings")
        .child(
          S.list()
            .title("Settings")
            .items([
              S.listItem()
                .title("Site Settings")
                .child(S.document().schemaType("siteSettings").documentId("siteSettings")),
            ])
        ),
      S.listItem()
        .title("Content")
        .child(
          S.list()
            .title("Content")
            .items([
              S.documentTypeListItem("artwork").title("Artwork"),
              S.documentTypeListItem("project").title("Projects"),
              S.documentTypeListItem("note").title("Posts"),
            ])
        ),
      S.listItem()
        .title("Taxonomies")
        .child(
          S.list()
            .title("Taxonomies")
            .items([
              S.documentTypeListItem("collection").title("Collections"),
              S.documentTypeListItem("category").title("Categories"),
              S.documentTypeListItem("tag").title("Tags"),
              S.documentTypeListItem("author").title("Authors"),
            ])
        ),
      S.listItem()
        .title("Utilities")
        .child(
          S.list()
            .title("Utilities")
            .items([
              S.documentTypeListItem("redirect").title("Redirects"),
            ])
        ),
      ...S.documentTypeListItems().filter(
        (item) =>
          !["artwork", "project", "note", "collection", "category", "tag", "author", "redirect", "page", "globalModule", "siteSettings"].includes(
            item.getId() || ""
          )
      ),
    ]);
