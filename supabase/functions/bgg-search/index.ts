const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { query } = await req.json();

    if (!query) {
      return new Response(
        JSON.stringify({ success: false, error: 'Provide a search query' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(
        JSON.stringify({ success: false, error: 'LOVABLE_API_KEY not configured' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Searching board games via AI for:', query);

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-3-flash-preview',
        messages: [
          {
            role: 'system',
            content: `You are a board game database expert. When asked to search for board games, use the search_board_games tool to return accurate results. Include real BoardGameGeek IDs (bggId) when you know them. Return up to 10 results sorted by relevance. For each game, provide as much accurate data as possible including player counts, playing time, year published, BGG rating, weight/complexity, categories and mechanics. Use English names for game titles.`,
          },
          {
            role: 'user',
            content: `Search for board games matching: "${query}"`,
          },
        ],
        tools: [
          {
            type: 'function',
            function: {
              name: 'search_board_games',
              description: 'Return a list of board games matching the search query',
              parameters: {
                type: 'object',
                properties: {
                  games: {
                    type: 'array',
                    items: {
                      type: 'object',
                      properties: {
                        bggId: { type: 'number', description: 'BoardGameGeek ID' },
                        name: { type: 'string', description: 'Game name in English' },
                        yearPublished: { type: 'number', description: 'Year published' },
                        minPlayers: { type: 'number', description: 'Minimum players' },
                        maxPlayers: { type: 'number', description: 'Maximum players' },
                        playingTime: { type: 'number', description: 'Average playing time in minutes' },
                        minAge: { type: 'number', description: 'Minimum recommended age' },
                        description: { type: 'string', description: 'Brief game description (1-2 sentences)' },
                        rating: { type: 'number', description: 'BGG average rating (1-10)' },
                        weight: { type: 'number', description: 'Complexity weight (1-5)' },
                        categories: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Game categories',
                        },
                        mechanics: {
                          type: 'array',
                          items: { type: 'string' },
                          description: 'Game mechanics',
                        },
                      },
                      required: ['bggId', 'name'],
                      additionalProperties: false,
                    },
                  },
                },
                required: ['games'],
                additionalProperties: false,
              },
            },
          },
        ],
        tool_choice: { type: 'function', function: { name: 'search_board_games' } },
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ success: false, error: '搜尋請求過於頻繁，請稍後再試' }),
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ success: false, error: 'AI 額度已用完，請至設定頁面加值' }),
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      const errText = await response.text();
      console.error('AI gateway error:', response.status, errText);
      return new Response(
        JSON.stringify({ success: false, error: 'AI 搜尋服務暫時無法使用' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const aiData = await response.json();
    console.log('AI response received');

    // Extract tool call result
    const toolCall = aiData.choices?.[0]?.message?.tool_calls?.[0];
    if (!toolCall || toolCall.function.name !== 'search_board_games') {
      console.error('Unexpected AI response format:', JSON.stringify(aiData));
      return new Response(
        JSON.stringify({ success: false, error: '搜尋結果格式異常' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const parsed = JSON.parse(toolCall.function.arguments);
    const games = parsed.games || [];

    console.log(`Found ${games.length} games for query: ${query}`);

    return new Response(
      JSON.stringify({ success: true, data: games }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Search error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
