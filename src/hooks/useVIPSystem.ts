import { supabase } from "@/integrations/supabase/client";

interface VIPLevel {
  id: string;
  level: number;
  name: string;
  min_wagered: number;
  cashback_rate: number;
  bonus_multiplier: number;
}

export const useVIPSystem = () => {
  const updateVIPProgress = async (
    walletAddress: string,
    betAmount: number,
    isWin: boolean
  ) => {
    try {
      // Fetch user's VIP data
      const { data: userVip } = await supabase
        .from('user_vip')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      // Fetch all VIP levels
      const { data: vipLevels } = await supabase
        .from('vip_levels')
        .select('*')
        .order('level', { ascending: true });

      if (!vipLevels) return;

      // Get current level info
      const currentLevelInfo = vipLevels.find(
        l => l.level === (userVip?.current_level || 1)
      );

      // Calculate cashback based on current level
      const cashbackRate = currentLevelInfo?.cashback_rate || 0;
      const cashbackEarned = (betAmount * cashbackRate) / 100;

      if (userVip) {
        // Update existing VIP record
        const newTotalWagered = (userVip.total_wagered || 0) + betAmount;
        const newCashbackEarned = (userVip.cashback_earned || 0) + cashbackEarned;

        // Check if user should level up
        let newLevel = userVip.current_level;
        for (const level of vipLevels) {
          if (newTotalWagered >= level.min_wagered) {
            newLevel = level.level;
          }
        }

        await supabase
          .from('user_vip')
          .update({
            total_wagered: newTotalWagered,
            cashback_earned: newCashbackEarned,
            current_level: newLevel,
            updated_at: new Date().toISOString(),
          })
          .eq('wallet_address', walletAddress);

        // Return if user leveled up
        if (newLevel > userVip.current_level) {
          const newLevelInfo = vipLevels.find(l => l.level === newLevel);
          return {
            leveledUp: true,
            newLevel: newLevelInfo,
            cashbackEarned,
          };
        }
      } else {
        // Create new VIP record
        await supabase.from('user_vip').insert({
          wallet_address: walletAddress,
          current_level: 1,
          total_wagered: betAmount,
          cashback_earned: cashbackEarned,
          cashback_claimed: 0,
        });
      }

      return {
        leveledUp: false,
        cashbackEarned,
      };
    } catch (error) {
      console.error('Error updating VIP progress:', error);
      return null;
    }
  };

  const getBonusMultiplier = async (walletAddress: string): Promise<number> => {
    try {
      const { data: userVip } = await supabase
        .from('user_vip')
        .select('current_level')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (!userVip) return 1;

      const { data: levelInfo } = await supabase
        .from('vip_levels')
        .select('bonus_multiplier')
        .eq('level', userVip.current_level)
        .maybeSingle();

      return levelInfo?.bonus_multiplier || 1;
    } catch (error) {
      console.error('Error getting bonus multiplier:', error);
      return 1;
    }
  };

  return {
    updateVIPProgress,
    getBonusMultiplier,
  };
};
