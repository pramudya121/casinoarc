import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const supabase = createClient(supabaseUrl, supabaseKey)

    const now = new Date().toISOString()

    // Get all active tournaments that have ended
    const { data: tournaments, error: tournamentsError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('status', 'active')
      .lt('end_time', now)

    if (tournamentsError) throw tournamentsError

    if (!tournaments || tournaments.length === 0) {
      return new Response(
        JSON.stringify({ message: 'No tournaments to finalize' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const finalizedTournaments = []

    for (const tournament of tournaments) {
      // Get top players
      const { data: entries, error: entriesError } = await supabase
        .from('tournament_entries')
        .select('*')
        .eq('tournament_id', tournament.id)
        .order('total_score', { ascending: false })
        .limit(10)

      if (entriesError) {
        console.error(`Error getting entries for tournament ${tournament.id}:`, entriesError)
        continue
      }

      if (!entries || entries.length === 0) continue

      // Prize distribution
      const prizeDistribution = [0.5, 0.3, 0.2]
      const results = []

      for (let i = 0; i < Math.min(entries.length, 3); i++) {
        const entry = entries[i]
        const prizeAmount = tournament.prize_pool * prizeDistribution[i]

        results.push({
          tournament_id: tournament.id,
          wallet_address: entry.wallet_address,
          username: entry.username,
          rank: i + 1,
          final_score: entry.total_score,
          prize_amount: prizeAmount,
        })
      }

      // Insert tournament results
      const { error: resultsError } = await supabase
        .from('tournament_results')
        .insert(results)

      if (resultsError) {
        console.error(`Error inserting results for tournament ${tournament.id}:`, resultsError)
        continue
      }

      // Update tournament status
      const { error: updateError } = await supabase
        .from('tournaments')
        .update({ status: 'completed' })
        .eq('id', tournament.id)

      if (updateError) {
        console.error(`Error updating tournament ${tournament.id}:`, updateError)
        continue
      }

      finalizedTournaments.push({
        id: tournament.id,
        name: tournament.name,
        winners: results
      })
    }

    return new Response(
      JSON.stringify({ 
        message: `Successfully finalized ${finalizedTournaments.length} tournaments`,
        tournaments: finalizedTournaments 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Error:', error)
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 500 }
    )
  }
})