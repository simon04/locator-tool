/**
 * Extracts the Commons user linked by the HTML of the author (the Artist of the extmetadata)
 */
export function authorUser(author: string | undefined): string | undefined {
  if (!author) return;
  // a red link points to index.php?title=User:…&action=edit
  const link = author.match(
    /href="(?:https:)?\/\/commons\.wikimedia\.org\/(?:wiki\/|w\/index\.php\?title=)User:([^"&/#]+)/
  )?.[1];
  if (link) return decodeURIComponent(link).replaceAll('_', ' ');
  // such as "Simon Legner (User:simon04)", where the link may point to another wiki
  const text = author.replace(/<[^>]*>/g, ' ').match(/(?:^|[\s(])User:([^\s<>()[\],|;]+)/)?.[1];
  // user names start with a capital letter
  return text && text[0].toUpperCase() + text.slice(1);
}
