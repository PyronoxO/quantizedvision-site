export const artworkQuery = `
*[_type == "artwork"] | order(date desc) {
  title,
  "slug": slug.current,
  date,
  lane,
  tools,
  tags,
  description,
  mediaType,
  externalUrl,
  "cover": cover{
    asset->{
      _id,
      url
    }
  }
}
`;

export const projectQuery = `
*[_type == "project"] | order(date desc) {
  title,
  "slug": slug.current,
  date,
  summary,
  stack,
  externalUrl,
  "cover": cover{
    asset->{
      _id,
      url
    }
  }
}
`;

export const noteQuery = `
*[_type == "note"] | order(date desc) {
  title,
  "slug": slug.current,
  date,
  excerpt,
  tags
}
`;
