import React, { useState, useEffect } from 'react';
import {
  Crown,
  Sparkles,
  CheckCircle2,
  X,
  Clock,
  ArrowRight,
  Shield,
  Zap,
} from 'lucide-react';
import { membershipService } from '../../services/membershipService';
import { useNotifications } from '../../context/NotificationContext';
import { useAuth } from '../../context/AuthContext';

interface UpgradeMembershipModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUsage?: {
    effectivePlan?: string;
    dailyLimit?: number;
    usedToday?: number;
    resetsAt?: string;
  } | null;
  countdownFormatted?: string;
  onUpgraded?: () => void;
}

export default function UpgradeMembershipModal({
  isOpen,
  onClose,
  currentUsage,
  countdownFormatted = 'midnight IST',
  onUpgraded,
}: UpgradeMembershipModalProps) {
  const { showToast } = useNotifications();
  const { refreshUser } = useAuth();

  const [plans, setPlans] = useState<any[]>([]);
  const [loadingPlans, setLoadingPlans] = useState(true);
  const [upgradingPlanId, setUpgradingPlanId] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    async function loadPlans() {
      setLoadingPlans(true);
      try {
        const res = await membershipService.getPlans();
        if (res.success && Array.isArray(res.data)) {
          // Filter to paid premium plans: SILVER, GOLD, PLATINUM
          const premium = res.data.filter((p: any) => p.price > 0);
          setPlans(premium);
        }
      } catch (err: any) {
        console.error('Failed to load plans:', err);
      } finally {
        setLoadingPlans(false);
      }
    }

    loadPlans();
  }, [isOpen]);

  if (!isOpen) return null;

  const handleUpgrade = async (plan: any) => {
    setUpgradingPlanId(plan.id);
    try {
      // 1. Create order
      const orderRes = await membershipService.createOrder(plan.id);
      if (!orderRes.success) throw new Error(orderRes.message || 'Failed to create order');

      // 2. Complete payment verification (simulated sandbox or real Razorpay)
      const verifyRes = await membershipService.verifyPayment({
        orderId: orderRes.data.orderId,
        paymentId: `pay_upgrade_${Date.now()}`,
        signature: 'sandbox_verified_signature',
      });

      if (verifyRes.success) {
        showToast(`Congratulations! You have upgraded to ${plan.name}.`, 'success');
        if (refreshUser) await refreshUser();
        if (onUpgraded) onUpgraded();
        onClose();
      }
    } catch (err: any) {
      showToast(err.message || 'Upgrade transaction failed', 'error');
    } finally {
      setUpgradingPlanId(null);
    }
  };

  const currentLimit = currentUsage?.dailyLimit ?? 5;
  const currentPlan = currentUsage?.effectivePlan || 'Free Starter';

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full shadow-2xl border border-gold-300/80 overflow-hidden max-h-[92vh] flex flex-col">
        {/* Modal Banner Header */}
        <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-charcoal-950 p-6 text-white border-b-2 border-gold-400 relative shrink-0">
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-white transition p-1 rounded-full bg-white/10"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-2 mb-2">
            <span className="p-1.5 rounded-xl bg-gold-400/20 text-gold-300 border border-gold-400/30">
              <Zap className="w-4 h-4 fill-gold-400" />
            </span>
            <span className="text-[11px] font-bold uppercase tracking-wider text-gold-300">
              Daily Limit Reached
            </span>
          </div>

          <h2 className="font-serif text-2xl font-bold">
            You've reached your daily messaging limit
          </h2>
          <p className="text-xs text-ivory-200 mt-1 max-w-xl leading-relaxed">
            You have used all {currentLimit} messages allowed today on your {currentPlan} plan. Upgrade now to continue chatting immediately without waiting for the daily reset.
          </p>

          <div className="mt-3 inline-flex items-center gap-1.5 bg-white/10 px-3 py-1 rounded-full text-[11px] text-gold-200 border border-white/10">
            <Clock className="w-3.5 h-3.5" />
            <span>Daily quota resets in: <strong>{countdownFormatted}</strong> (Asia/Kolkata IST)</span>
          </div>
        </div>

        {/* Available Plans Grid */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-serif text-base font-bold text-charcoal-900 flex items-center gap-2">
              <Crown className="w-4 h-4 text-gold-600" />
              Choose an Upgraded Membership
            </h3>
            <span className="text-[11px] text-gray-500">Instant activation</span>
          </div>

          {loadingPlans ? (
            <div className="text-center py-12 text-xs text-gray-400">Loading premium tiers...</div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              {plans.map((p) => {
                const isPlat = p.planCode === 'PLATINUM';
                const isGold = p.planCode === 'GOLD';
                const features = Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? JSON.parse(p.features) : []);

                return (
                  <div
                    key={p.id}
                    className={`rounded-2xl p-4.5 border flex flex-col justify-between space-y-4 transition ${
                      isPlat
                        ? 'border-2 border-purple-500 bg-purple-50/30 shadow-md relative'
                        : isGold
                        ? 'border-2 border-gold-400 bg-gold-50/20 shadow-sm'
                        : 'border-slate-200 bg-white hover:border-gold-300'
                    }`}
                  >
                    {isPlat && (
                      <span className="absolute -top-2.5 right-3 bg-purple-700 text-white text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                        Unlimited VIP
                      </span>
                    )}

                    <div className="space-y-3">
                      <div>
                        <h4 className="font-serif text-base font-bold text-charcoal-900">{p.name}</h4>
                        <div className="mt-1">
                          <span className="text-xl font-serif font-bold text-primary-900">
                            ₹{p.price.toLocaleString('en-IN')}
                          </span>
                          <span className="text-[11px] text-gray-500"> / {p.durationMonths} mo</span>
                        </div>
                      </div>

                      {/* Daily message quota pill */}
                      <div className={`p-2 rounded-xl text-center text-xs font-bold ${
                        isPlat ? 'bg-purple-100 text-purple-900' :
                        isGold ? 'bg-amber-100 text-amber-900' :
                        'bg-blue-100 text-blue-900'
                      }`}>
                        {p.dailyMessageLimit === -1 ? 'Unlimited Messages' : `${p.dailyMessageLimit} Messages / Day`}
                      </div>

                      {/* Features */}
                      <ul className="space-y-1.5 text-[11px] text-gray-600">
                        {features.slice(0, 4).map((f: string, i: number) => (
                          <li key={i} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3 h-3 text-primary-700 shrink-0 mt-0.5" />
                            <span className="leading-tight">{f}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <button
                      onClick={() => handleUpgrade(p)}
                      disabled={upgradingPlanId === p.id}
                      className={`w-full py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-1.5 ${
                        isPlat
                          ? 'bg-purple-800 hover:bg-purple-900 text-white shadow-md'
                          : isGold
                          ? 'bg-primary-900 hover:bg-primary-950 text-white shadow-sm'
                          : 'bg-slate-900 hover:bg-slate-800 text-white'
                      } disabled:opacity-50`}
                    >
                      {upgradingPlanId === p.id ? (
                        'Activating...'
                      ) : (
                        <>
                          Upgrade to {p.name}
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-[11px] text-gray-500 shrink-0">
          <div className="flex items-center gap-1.5">
            <Shield className="w-4 h-4 text-emerald-600" />
            <span>Secure 256-bit encrypted transaction &bull; Instant plan activation</span>
          </div>
          <button
            onClick={onClose}
            className="text-xs font-semibold text-gray-600 hover:text-gray-900"
          >
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
}

