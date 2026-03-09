# CSV Templates

## Input CSV Columns
`sourceId,title,sourceUrl,rawExcerpt,sourceName,_updatedAt,rewriteTitle,rewriteExcerpt,rewriteBody,approval`

## Input Example Row
`abc123,New AI coding model launched,https://example.com/post,Model improves completion quality,Example Source,2026-03-06T12:00:00Z,,,,,`

## Output CSV Columns
`sourceId,rewriteTitle,rewriteExcerpt,rewriteBody,approval`

## Output Example Row
`abc123,New Coding Model Targets Real Developer Bottlenecks,"A new AI coding model is aiming to reduce repetitive engineering work with stronger context handling and cleaner completions.","The latest coding model launch focuses less on flashy demos and more on practical day-to-day development speed. Early positioning suggests better long-context behavior and fewer low-quality suggestions in common workflows. For teams, the key question is not raw benchmark numbers but how much review overhead this removes. If completion quality holds in production, this could shift AI coding tools from occasional helper to default co-pilot.",approved`
