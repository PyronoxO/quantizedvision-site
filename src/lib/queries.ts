export const artworkQuery = `
*[_type == "artwork"] | order(date desc) {
  title,
  "slug": slug.current,
  date,
  "collectionRef": collectionRef->{title, "slug": slug.current},
  "categoryRefs": categoryRefs[]->{title, "slug": slug.current},
  "tagRefs": tagRefs[]->{title, "slug": slug.current},
  tools,
  description,
  mediaType,
  externalUrl,
  externalThumbnail,
  "cover": cover{
    asset->{
      _id,
      url
    }
  },
  "galleryImages": galleryImages[]{
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
  "collectionRef": collectionRef->{title, "slug": slug.current},
  "categoryRefs": categoryRefs[]->{title, "slug": slug.current},
  "tagRefs": tagRefs[]->{title, "slug": slug.current},
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
  featured,
  workflowStatus,
  readTimeMinutes,
  "authorRef": authorRef->{name, "slug": slug.current},
  "tagRefs": tagRefs[]->{title, "slug": slug.current},
  "cover": cover{
    asset->{
      _id,
      url
    }
  }
}
`;

export const siteSettingsQuery = `
*[_type == "siteSettings" && _id == "siteSettings"][0]{
  design{
    headingFont,
    bodyFont,
    uiFont,
    h1Size,
    h2Size,
    h3Size,
    h4Size,
    h5Size,
    h6Size,
    bodySize,
    textColor,
    mutedColor,
    accentColor,
    linkColor,
    sectionDividerOpacity,
    seamLeftTintOpacity,
    seamRightTintOpacity,
    seamTopEdgeOpacity,
    seamBottomEdgeOpacity,
    aboutHeroGap,
    aboutFirstModuleHeadingSize,
    aboutFirstModuleBodySize
  },
  navigation[]{
    label,
    url,
    openInNewTab,
    "page": pageRef->{
      title,
      "slug": slug.current,
      isHome
    }
  }
}
`;

export const homePageQuery = `
*[_type == "homePage" && _id == "homePage"][0]{
  themeVariant,
  design{
    headingFont,
    bodyFont,
    uiFont,
    h1Size,
    h2Size,
    h3Size,
    h4Size,
    h5Size,
    h6Size,
    bodySize,
    textColor,
    mutedColor,
    accentColor,
    linkColor,
    sectionDividerOpacity,
    seamLeftTintOpacity,
    seamRightTintOpacity,
    seamTopEdgeOpacity,
    seamBottomEdgeOpacity,
    aboutHeroGap,
    aboutFirstModuleHeadingSize,
    aboutFirstModuleBodySize
  },
  hero{
    eyebrow,
    title,
    body,
    primaryLabel,
    primaryUrl,
    secondaryLabel,
    secondaryUrl,
    enableSlider,
    autoplay,
    autoplayMs,
    transitionMs,
    showArrows,
    showDots,
    "mediaItems": mediaItems[]{
      alt,
      "imageUrl": image.asset->url
    }
  },
  sections[]{
    _type,
    options{
      hidden,
      anchorId,
      startAt,
      endAt
    },
    style{
      dividerOpacity,
      leftTintOpacity,
      rightTintOpacity,
      topEdgeOpacity,
      bottomEdgeOpacity,
      headingSize,
      bodySize,
      gapTop
    },
    heading,
    alignment,
    iconSize,
    enableFilters,
    description,
    styleVariant,
    limit,
    accent,
    body,
    recipientEmail,
    subjectLabel,
    emailLabel,
    phoneLabel,
    messageLabel,
    submitLabel,
    subjectPlaceholder,
    emailPlaceholder,
    phonePlaceholder,
    messagePlaceholder,
    successRedirectUrl,
    placeholder,
    emptyMessage,
    tagline,
    brand,
    buttonLabel,
    buttonUrl,
    links[]{
      platform,
      label,
      url
    },
    "sourceCollection": sourceCollection->title,
    items[]{
      value,
      label
    }
  }
}
`;

export const pageSlugsQuery = `
*[_type == "page" && defined(slug.current)]{
  "slug": slug.current,
  isHome,
  is404
}
`;

export const pagesQuery = `
*[_type == "page"] | order(isHome desc, title asc){
  title,
  "slug": slug.current,
  isHome,
  is404,
  themeVariant,
  seo{
    metaTitle,
    metaDescription,
    canonicalUrl,
    ogTitle,
    ogDescription,
    "ogImage": ogImage{
      asset->{
        _id,
        url
      }
    },
    noIndex
  },
  hero{
    eyebrow,
    title,
    body,
    primaryLabel,
    primaryUrl,
    secondaryLabel,
    secondaryUrl,
    enableSlider,
    autoplay,
    autoplayMs,
    transitionMs,
    showArrows,
    showDots,
    "mediaItems": mediaItems[]{
      alt,
      "imageUrl": image.asset->url
    }
  },
  sections[]{
    _type,
    options{
      hidden,
      anchorId,
      startAt,
      endAt
    },
    style{
      dividerOpacity,
      leftTintOpacity,
      rightTintOpacity,
      topEdgeOpacity,
      bottomEdgeOpacity,
      headingSize,
      bodySize,
      gapTop
    },
    heading,
    alignment,
    iconSize,
    enableFilters,
    description,
    styleVariant,
    limit,
    accent,
    body,
    recipientEmail,
    subjectLabel,
    emailLabel,
    phoneLabel,
    messageLabel,
    submitLabel,
    subjectPlaceholder,
    emailPlaceholder,
    phonePlaceholder,
    messagePlaceholder,
    successRedirectUrl,
    placeholder,
    emptyMessage,
    tagline,
    brand,
    buttonLabel,
    buttonUrl,
    links[]{
      platform,
      label,
      url
    },
    "sourceCollection": sourceCollection->title,
    items[]{
      value,
      label
    }
  }
}
`;

export const globalModulesQuery = `
*[_type == "globalModule" && enabled == true] | order(_createdAt asc){
  title,
  enabled,
  placement,
  scope,
  paths,
  sections[]{
    _type,
    options{
      hidden,
      anchorId,
      startAt,
      endAt
    },
    style{
      dividerOpacity,
      leftTintOpacity,
      rightTintOpacity,
      topEdgeOpacity,
      bottomEdgeOpacity,
      headingSize,
      bodySize,
      gapTop
    },
    heading,
    alignment,
    iconSize,
    enableFilters,
    description,
    styleVariant,
    limit,
    accent,
    body,
    recipientEmail,
    subjectLabel,
    emailLabel,
    phoneLabel,
    messageLabel,
    submitLabel,
    subjectPlaceholder,
    emailPlaceholder,
    phonePlaceholder,
    messagePlaceholder,
    successRedirectUrl,
    placeholder,
    emptyMessage,
    tagline,
    brand,
    buttonLabel,
    buttonUrl,
    links[]{
      platform,
      label,
      url
    },
    "sourceCollection": sourceCollection->title,
    items[]{
      value,
      label
    }
  }
}
`;

export const redirectsQuery = `
*[_type == "redirect" && enabled == true]{
  from,
  to,
  statusCode
}
`;
