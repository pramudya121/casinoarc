import { supabase } from "@/integrations/supabase/client";

export const useReferralSystem = () => {
  const generateReferralCode = (walletAddress: string): string => {
    // Generate a unique referral code from wallet address
    const shortAddress = walletAddress.slice(2, 8).toUpperCase();
    const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
    return `${shortAddress}${randomPart}`;
  };

  const getOrCreateReferralCode = async (walletAddress: string) => {
    try {
      // Check if user already has a referral code
      const { data: existingCode } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('wallet_address', walletAddress)
        .maybeSingle();

      if (existingCode) {
        return existingCode;
      }

      // Create new referral code
      const newCode = generateReferralCode(walletAddress);
      const { data: newReferralCode, error } = await supabase
        .from('referral_codes')
        .insert({
          wallet_address: walletAddress,
          referral_code: newCode,
        })
        .select()
        .single();

      if (error) throw error;
      return newReferralCode;
    } catch (error) {
      console.error('Error getting/creating referral code:', error);
      return null;
    }
  };

  const applyReferralCode = async (walletAddress: string, referralCode: string) => {
    try {
      // Check if user was already referred
      const { data: existingReferral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_address', walletAddress)
        .maybeSingle();

      if (existingReferral) {
        return { success: false, message: 'You have already used a referral code' };
      }

      // Find the referrer
      const { data: referrerCode } = await supabase
        .from('referral_codes')
        .select('*')
        .eq('referral_code', referralCode.toUpperCase())
        .maybeSingle();

      if (!referrerCode) {
        return { success: false, message: 'Invalid referral code' };
      }

      // Can't refer yourself
      if (referrerCode.wallet_address === walletAddress) {
        return { success: false, message: 'You cannot use your own referral code' };
      }

      // Create referral record
      const { error: referralError } = await supabase.from('referrals').insert({
        referrer_address: referrerCode.wallet_address,
        referred_address: walletAddress,
        referral_code: referralCode.toUpperCase(),
      });

      if (referralError) throw referralError;

      // Update referrer's total referrals
      await supabase
        .from('referral_codes')
        .update({
          total_referrals: referrerCode.total_referrals + 1,
        })
        .eq('wallet_address', referrerCode.wallet_address);

      return { success: true, message: 'Referral code applied successfully!' };
    } catch (error) {
      console.error('Error applying referral code:', error);
      return { success: false, message: 'Failed to apply referral code' };
    }
  };

  const updateReferralCommission = async (walletAddress: string, betAmount: number) => {
    try {
      // Check if this user was referred
      const { data: referral } = await supabase
        .from('referrals')
        .select('*')
        .eq('referred_address', walletAddress)
        .maybeSingle();

      if (!referral) return;

      // Get referrer's commission rate
      const { data: referrerCode } = await supabase
        .from('referral_codes')
        .select('commission_rate')
        .eq('wallet_address', referral.referrer_address)
        .maybeSingle();

      const commissionRate = referrerCode?.commission_rate || 5;
      const commission = (betAmount * commissionRate) / 100;

      // Update referral record
      await supabase
        .from('referrals')
        .update({
          commission_earned: referral.commission_earned + commission,
          games_by_referred: referral.games_by_referred + 1,
          updated_at: new Date().toISOString(),
        })
        .eq('id', referral.id);

      // Update referrer's total commission
      const { data: currentTotal } = await supabase
        .from('referral_codes')
        .select('total_commission')
        .eq('wallet_address', referral.referrer_address)
        .maybeSingle();

      await supabase
        .from('referral_codes')
        .update({
          total_commission: (currentTotal?.total_commission || 0) + commission,
        })
        .eq('wallet_address', referral.referrer_address);
    } catch (error) {
      console.error('Error updating referral commission:', error);
    }
  };

  const claimCommission = async (walletAddress: string) => {
    try {
      // Get all referrals where this wallet is the referrer
      const { data: referrals } = await supabase
        .from('referrals')
        .select('*')
        .eq('referrer_address', walletAddress);

      if (!referrals || referrals.length === 0) {
        return { success: false, amount: 0, message: 'No referral commissions to claim' };
      }

      let totalUnclaimed = 0;
      for (const referral of referrals) {
        const unclaimed = referral.commission_earned - referral.commission_claimed;
        totalUnclaimed += unclaimed;

        // Mark as claimed
        await supabase
          .from('referrals')
          .update({
            commission_claimed: referral.commission_earned,
            updated_at: new Date().toISOString(),
          })
          .eq('id', referral.id);
      }

      if (totalUnclaimed <= 0) {
        return { success: false, amount: 0, message: 'No unclaimed commissions' };
      }

      return { success: true, amount: totalUnclaimed, message: `Claimed ${totalUnclaimed.toFixed(4)} USDC in commissions!` };
    } catch (error) {
      console.error('Error claiming commission:', error);
      return { success: false, amount: 0, message: 'Failed to claim commission' };
    }
  };

  return {
    getOrCreateReferralCode,
    applyReferralCode,
    updateReferralCommission,
    claimCommission,
  };
};
