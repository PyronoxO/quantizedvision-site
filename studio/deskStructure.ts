import type { StructureResolver } from "sanity/structure";
import { NewsApprovalPane } from "./components/NewsApprovalPane";
import { NewsImportPane } from "./components/NewsImportPane";
import { BulkPublishPane } from "./components/BulkPublishPane";
import { BulkOperationsPane } from "./components/BulkOperationsPane";

export const structure: StructureResolver = (S) =>
  S.list()
    .title("Quantized Vision")
    .items([
      S.listItem()
        .title("Approval Board")
        .child(S.component(NewsApprovalPane).title("Approval Board")),
      S.listItem()
        .title("Bulk Operations")
        .child(S.component(BulkOperationsPane).title("Bulk Operations")),
      S.listItem()
        .title("News Importer")
        .child(S.component(NewsImportPane).title("News Importer")),
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
                .title("Music Production Content")
                .child(S.documentTypeList("musicTrack").title("Music Production Content")),
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
              S.documentTypeListItem("musicTrack").title("Music Production"),
              S.listItem()
                .title("Posts")
                .child(
                  S.list()
                    .title("Posts")
                    .items([
                      S.listItem()
                        .title("All Posts")
                        .child(S.documentTypeList("note").title("All Posts")),
                      S.listItem()
                        .title("Draft Posts")
                        .child(
                          S.documentTypeList("note")
                            .title("Draft Posts")
                            .filter('_type == "note" && workflowStatus == "draft"')
                        ),
                      S.listItem()
                        .title("Review Posts")
                        .child(
                          S.documentTypeList("note")
                            .title("Review Posts")
                            .filter('_type == "note" && workflowStatus == "review"')
                        ),
                      S.listItem()
                        .title("Bulk Publish")
                        .child(S.component(BulkPublishPane).title("Bulk Publish")),
                    ])
                ),
              S.listItem()
                .title("News Queue")
                .child(
                  S.list()
                    .title("News Queue")
                    .items([
                      S.listItem()
                        .title("Active Queue")
                        .child(
                          S.documentTypeList("sourceNewsItem")
                            .title("Active Queue")
                            .filter('_type == "sourceNewsItem" && (!defined(status) || status != "archived")')
                        ),
                      S.listItem()
                        .title("Archived Queue")
                        .child(
                          S.documentTypeList("sourceNewsItem")
                            .title("Archived Queue")
                            .filter('_type == "sourceNewsItem" && status == "archived"')
                        ),
                    ])
                ),
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
          ![
            "artwork",
            "project",
            "musicTrack",
            "note",
            "sourceNewsItem",
            "collection",
            "category",
            "tag",
            "author",
            "redirect",
            "page",
            "globalModule",
            "siteSettings",
          ].includes(
            item.getId() || ""
          )
      ),
    ]);
