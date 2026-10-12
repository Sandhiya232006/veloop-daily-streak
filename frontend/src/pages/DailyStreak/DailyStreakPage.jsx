import { useState, useCallback, useEffect, useRef } from 'react';
import { useStreakData } from '../../hooks/useStreakData';
import StreakHeader from '../../components/StreakHeader';
import HeroBanner from '../../components/HeroBanner';
import StreakStats from '../../components/StreakStats';
import UltimateReward from '../../components/UltimateReward';
import RewardGrid from '../../components/RewardGrid';
import WhyStreak from '../../components/WhyStreak';
import TrustFooter from '../../components/TrustFooter';
import StreakLoader from '../../components/StreakLoader';
import StreakSkeleton from '../../components/StreakSkeleton';
import ErrorBanner from '../../components/ErrorBanner';
import CpaDemo from '../../components/CpaDemo';
import * as streakApi from '../../services/streakApi';
import styles from './DailyStreakPage.module.css';

export default function DailyStreakPage() {
  const { data, loading, error, refresh } = useStreakData();
  const [claimingDay, setClaimingDay] = useState(null);
  const [showCpaDemo, setShowCpaDemo] = useState(false);
  const [claimError, setClaimError] = useState(null);
  const [gemBalance, setGemBalance] = useState(0);
  // Holds the in-flight claim request so the CPA demo can wait for the real result.
  const claimPromiseRef = useRef(null);

  const loadWallet = useCallback(async () => {
    try {
      const wallet = await streakApi.getWallet();
      setGemBalance(wallet.balances?.VES || 0);
    } catch {
      // Non-critical; header just keeps its previous value.
    }
  }, []);

  useEffect(() => {
    loadWallet();
  }, [loadWallet]);

  const handleClaim = useCallback((day) => {
    if (claimPromiseRef.current) return; // UX guard only; the backend is the real protection
    setClaimError(null);
    setClaimingDay(day);
    setShowCpaDemo(true);

    // The backend call starts now. The CPA demo is visual only and grants nothing.
    // Note: we send NO day/reward/amount; the backend derives everything itself.
    claimPromiseRef.current = streakApi
      .claimStreak()
      .then((result) => ({ ok: true, result }))
      .catch((err) => ({ ok: false, message: err.message || 'Unable to process your reward. Please try again.' }));
  }, []);

  const handleCpaFinished = useCallback(async () => {
    const outcome = await claimPromiseRef.current;
    claimPromiseRef.current = null;

    setShowCpaDemo(false);
    setClaimingDay(null);
    if (outcome && !outcome.ok) setClaimError(outcome.message);

    // Never trust local state: always re-fetch the truth from the backend.
    await refresh().catch(() => {});
    await loadWallet();
  }, [refresh, loadWallet]);

  const handleCountdownComplete = useCallback(() => {
    refresh().catch(() => {});
  }, [refresh]);

  if (loading) return <StreakLoader />;

  if (error && !data) {
    return (
      <div className={styles.page}>
        <ErrorBanner message={error} />
      </div>
    );
  }

  const ultimateCard = data?.rewards?.find((r) => r.reward?.isUltimate);
  const ultimateUnlocked = ultimateCard?.status === 'CLAIMED';

  return (
    <div className={styles.page}>
      <StreakHeader gemBalance={gemBalance} />

      {!data ? (
        <StreakSkeleton />
      ) : (
        <>
          <ErrorBanner message={claimError} onDismiss={() => setClaimError(null)} />
          <HeroBanner />
          <StreakStats
            currentStreak={data.streak.currentStreak}
            totalRewards={data.streak.totalRewards}
            checkedIn={data.streak.checkedIn}
            nextReward={data.streak.nextReward}
          />
          <UltimateReward
            reward={ultimateCard?.reward && { ...ultimateCard.reward, day: ultimateCard.day }}
            unlocked={ultimateUnlocked}
          />
          <RewardGrid
            rewards={data.rewards}
            serverTime={data.serverTime}
            onClaim={handleClaim}
            claimingDay={claimingDay}
            onCountdownComplete={handleCountdownComplete}
          />
          <WhyStreak />
          <TrustFooter />
        </>
      )}

      {showCpaDemo && <CpaDemo onFinished={handleCpaFinished} />}
    </div>
  );
}
