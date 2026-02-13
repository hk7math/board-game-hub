const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

interface BggSearchResult {
  bggId: number;
  name: string;
  yearPublished?: number;
}

interface BggGameDetail {
  bggId: number;
  name: string;
  yearPublished?: number;
  minPlayers?: number;
  maxPlayers?: number;
  playingTime?: number;
  minAge?: number;
  description?: string;
  thumbnail?: string;
  image?: string;
  rating?: number;
  weight?: number;
  categories?: string[];
  mechanics?: string[];
}

function extractText(xml: string, tag: string): string | undefined {
  const regex = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)</${tag}>`);
  const match = xml.match(regex);
  return match ? match[1].trim() : undefined;
}

function extractAttr(xml: string, tag: string, attr: string): string | undefined {
  const regex = new RegExp(`<${tag}[^>]*\\s${attr}="([^"]*)"`, 'i');
  const match = xml.match(regex);
  return match ? match[1] : undefined;
}

function decodeHtmlEntities(text: string): string {
  return text
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#10;/g, '\n')
    .replace(/&mdash;/g, '—')
    .replace(/&ndash;/g, '–')
    .replace(/&rsquo;/g, "'")
    .replace(/&lsquo;/g, "'")
    .replace(/&rdquo;/g, '"')
    .replace(/&ldquo;/g, '"');
}

async function searchBgg(query: string): Promise<BggSearchResult[]> {
  const url = `https://boardgamegeek.com/xmlapi2/search?query=${encodeURIComponent(query)}&type=boardgame`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BGHub/1.0)',
      'Accept': 'application/xml, text/xml, */*',
    },
  });
  const xml = await res.text();

  console.log('BGG search response status:', res.status);
  console.log('BGG search XML (first 500 chars):', xml.substring(0, 500));

  const results: BggSearchResult[] = [];
  const itemRegex = /<item\s+type="boardgame"\s+id="(\d+)">([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const bggId = parseInt(match[1]);
    const block = match[2];

    const nameMatch = block.match(/<name\s+type="primary"\s+value="([^"]*)"/);
    const yearMatch = block.match(/<yearpublished\s+value="([^"]*)"/);

    if (nameMatch) {
      results.push({
        bggId,
        name: decodeHtmlEntities(nameMatch[1]),
        yearPublished: yearMatch ? parseInt(yearMatch[1]) : undefined,
      });
    }
  }

  return results.slice(0, 20);
}

async function getGameDetails(bggIds: number[]): Promise<BggGameDetail[]> {
  if (bggIds.length === 0) return [];

  const idsStr = bggIds.join(',');
  const url = `https://boardgamegeek.com/xmlapi2/thing?id=${idsStr}&stats=1`;
  const res = await fetch(url, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (compatible; BGHub/1.0)',
      'Accept': 'application/xml, text/xml, */*',
    },
  });
  const xml = await res.text();

  const games: BggGameDetail[] = [];
  const itemRegex = /<item\s+type="boardgame"\s+id="(\d+)">([\s\S]*?)<\/item>/g;
  let match;

  while ((match = itemRegex.exec(xml)) !== null) {
    const bggId = parseInt(match[1]);
    const block = match[2];

    const nameMatch = block.match(/<name\s+type="primary"\s+value="([^"]*)"/);
    if (!nameMatch) continue;

    const thumbnail = extractText(block, 'thumbnail');
    const image = extractText(block, 'image');
    const description = extractText(block, 'description');
    const minPlayersMatch = block.match(/<minplayers\s+value="(\d+)"/);
    const maxPlayersMatch = block.match(/<maxplayers\s+value="(\d+)"/);
    const playingTimeMatch = block.match(/<playingtime\s+value="(\d+)"/);
    const minAgeMatch = block.match(/<minage\s+value="(\d+)"/);
    const yearMatch = block.match(/<yearpublished\s+value="([^"]*)"/);

    const ratingMatch = block.match(/<average\s+value="([^"]*)"/);
    const weightMatch = block.match(/<averageweight\s+value="([^"]*)"/);

    const categories: string[] = [];
    const catRegex = /<link\s+type="boardgamecategory"[^>]*value="([^"]*)"/g;
    let catMatch;
    while ((catMatch = catRegex.exec(block)) !== null) {
      categories.push(decodeHtmlEntities(catMatch[1]));
    }

    const mechanics: string[] = [];
    const mechRegex = /<link\s+type="boardgamemechanic"[^>]*value="([^"]*)"/g;
    let mechMatch;
    while ((mechMatch = mechRegex.exec(block)) !== null) {
      mechanics.push(decodeHtmlEntities(mechMatch[1]));
    }

    games.push({
      bggId,
      name: decodeHtmlEntities(nameMatch[1]),
      yearPublished: yearMatch ? parseInt(yearMatch[1]) : undefined,
      minPlayers: minPlayersMatch ? parseInt(minPlayersMatch[1]) : undefined,
      maxPlayers: maxPlayersMatch ? parseInt(maxPlayersMatch[1]) : undefined,
      playingTime: playingTimeMatch ? parseInt(playingTimeMatch[1]) : undefined,
      minAge: minAgeMatch ? parseInt(minAgeMatch[1]) : undefined,
      description: description ? decodeHtmlEntities(description).substring(0, 2000) : undefined,
      thumbnail,
      image,
      rating: ratingMatch && ratingMatch[1] !== '0' ? parseFloat(ratingMatch[1]) : undefined,
      weight: weightMatch && weightMatch[1] !== '0' ? parseFloat(weightMatch[1]) : undefined,
      categories: categories.length > 0 ? categories : undefined,
      mechanics: mechanics.length > 0 ? mechanics : undefined,
    });
  }

  return games;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query, bggIds } = await req.json();

    // Mode 1: Search by query
    if (query) {
      console.log('Searching BGG for:', query);
      const results = await searchBgg(query);
      
      // Fetch details for top results
      const topIds = results.slice(0, 10).map(r => r.bggId);
      const details = await getGameDetails(topIds);

      return new Response(
        JSON.stringify({ success: true, data: details }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Mode 2: Get details by BGG IDs
    if (bggIds && Array.isArray(bggIds)) {
      console.log('Fetching BGG details for IDs:', bggIds);
      const details = await getGameDetails(bggIds);
      return new Response(
        JSON.stringify({ success: true, data: details }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    return new Response(
      JSON.stringify({ success: false, error: 'Provide query or bggIds' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('BGG search error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
