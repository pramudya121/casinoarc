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

    const { tournamentId } = await req.json()

    // Get tournament details
    const { data: tournament, error: tournamentError } = await supabase
      .from('tournaments')
      .select('*')
      .eq('id', tournamentId)
      .single()

    if (tournamentError) throw tournamentError

    // Check if tournament has ended
    const now = new Date()
    const endTime = new Date(tournament.end_time)
    
    if (now < endTime) {
      return new Response(
        JSON.stringify({ error: 'Tournament has not ended yet' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Check if already finalized
    if (tournament.status === 'completed') {
      return new Response(
        JSON.stringify({ message: 'Tournament already finalized' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Get top players sorted by total_score
    const { data: entries, error: entriesError } = await supabase
      .from('tournament_entries')
      .select('*')
      .eq('tournament_id', tournamentId)
      .order('total_score', { ascending: false })
      .limit(10)

    if (entriesError) throw entriesError

    if (!entries || entries.length === 0) {
      return new Response(
        JSON.stringify({ error: 'No entries found for this tournament' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
      )
    }

    // Prize distribution (example: 50%, 30%, 20% for top 3)
    const prizeDistribution = [0.5, 0.3, 0.2]
    const results = []

    for (let i = 0; i < Math.min(entries.length, 3); i++) {
      const entry = entries[i]
      const prizeAmount = tournament.prize_pool * prizeDistribution[i]

      results.push({
        tournament_id: tournamentId,
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

    if (resultsError) throw resultsError

    // Update tournament status
    const { error: updateError } = await supabase
      .from('tournaments')
      .update({ status: 'completed' })
      .eq('id', tournamentId)

    if (updateError) throw updateError

    return new Response(
      JSON.stringify({ 
        message: 'Tournament finalized successfully',
        winners: results 
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