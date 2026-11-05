import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Crown, CheckCircle2, Sparkles, Shield, Star, Zap } from 'lucide-react';
import { membershipService } from '../../services/membershipService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function MembershipPlansPage() {
  const { isAuthenticated, refreshUser } = useAuth();
  const { showToast } = useNotifications();
  const navigate = useNavigate();

  const [plans, setPlans] = useState([]);
  const [currentSub, setCurrentSub] = useState(null);
  const [loading, setLoading] = useState(true);
  const [processingPlanId, setProcessingPlanId] = useState(null);

  useEffect(() => {
    async function loadData() {
      try {
        const [plansRes, subRes] = await Promise.all([
          membershipService.getPlans(),
          isAuthenticated ? membershipService.getCurrentSubscription() : Promise.resolve({ success: false, data: null } as any),
        ]);

        if (plansRes.success) setPlans(plansRes.data || []);
        if (subRes.success && subRes.data) setCurrentSub(subRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [isAuthenticated]);

  const handleSelectPlan = async (plan) => {
    if (!isAuthenticated) {
      navigate('/login?redirect=membership-plans');
      return;
    }

    if (plan.price === 0) {
      showToast('You are already eligible for the Free Starter tier', 'info');
      return;
    }

    setProcessingPlanId(plan.id);
    try {
      // 1. Create order
      const orderRes = await membershipService.createOrder(plan.id);
      if (!orderRes.success) {
        throw new Error(orderRes.message);
      }

      // 2. Simulate Razorpay verification (or live keys if available)
      const verifyRes = await membershipService.verifyPayment({
        orderId: orderRes.data.orderId,
        paymentId: `pay_sim_${Date.now()}`,
        signature: 'sandbox_verified_signature',
      });

      if (verifyRes.success) {
        showToast(verifyRes.message || `Activated ${plan.name} successfully!`, 'success');
        await refreshUser();
        // Refresh subscription
        const updatedSub = await membershipService.getCurrentSubscription();
        if (updatedSub.success) setCurrentSub(updatedSub.data);
        navigate('/dashboard/membership');
      }
    } catch (err) {
      showToast(err.message || 'Payment initiation failed', 'error');
    } finally {
      setProcessingPlanId(null);
    }
  };

  return (
    <div className="py-16 space-y-16">
      
      {/* Header */}
      <div className="max-w-4xl mx-auto px-4 text-center space-y-4">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-gold-100 text-gold-800 text-xs font-bold tracking-wider uppercase">
          <Crown className="w-3.5 h-3.5 text-gold-600" />
          VIP Membership Privileges
        </div>
        <h1 className="font-serif text-4xl sm:text-5xl font-extrabold text-charcoal-900">
          Find Your Soulmate Faster with Premium
        </h1>
        <p className="text-sm text-gray-600 max-w-xl mx-auto leading-relaxed">
          Upgrade your membership to unlock direct messaging, verified contact phone numbers, priority search placement, and dedicated concierge support.
        </p>
      </div>

      {/* Plans Grid */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="text-center py-20 text-sm text-gray-500">Loading plans...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
            {plans.map((plan) => {
              const isGold = plan.planCode === 'GOLD';
              const isPlatinum = plan.planCode === 'PLATINUM';
              const isCurrent = currentSub?.plan?.id === plan.id;
              const features = Array.isArray(plan.features) ? plan.features : (typeof plan.features === 'string' ? JSON.parse(plan.features) : []);

              return (
                <div
                  key={plan.id}
                  className={`rounded-3xl p-6 flex flex-col justify-between transition-all duration-300 relative ${
                    isGold
                      ? 'bg-gradient-to-b from-primary-950 via-primary-900 to-charcoal-950 text-white shadow-2xl border-2 border-gold-400 scale-[1.03]'
                      : isPlatinum
                      ? 'bg-gradient-to-b from-charcoal-900 to-black text-white shadow-xl border-2 border-amber-300'
                      : 'bg-white text-charcoal-900 border border-gold-200/90 shadow-md hover:shadow-xl'
                  }`}
                >
                  {isGold && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-gradient-to-r from-gold-400 to-gold-500 text-charcoal-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      Best Value
                    </div>
                  )}

                  {isPlatinum && (
                    <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-white text-charcoal-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full shadow-md">
                      Elite Concierge
                    </div>
                  )}

                  <div className="space-y-5">
                    <div>
                      <h3 className={`font-serif text-xl font-bold ${isGold || isPlatinum ? 'text-gold-300' : 'text-primary-950'}`}>
                        {plan.name}
                      </h3>
                      <p className={`text-xs mt-1 ${isGold || isPlatinum ? 'text-gray-300' : 'text-gray-500'}`}>
                        Valid for {plan.durationMonths} Month{plan.durationMonths > 1 ? 's' : ''}
                      </p>
                    </div>

                    <div className="flex items-baseline gap-1">
                      <span className="text-3xl font-extrabold font-serif">
                        ₹{plan.price.toLocaleString('en-IN')}
                      </span>
                      <span className={`text-xs ${isGold || isPlatinum ? 'text-gray-300' : 'text-gray-500'}`}>
                        {plan.price > 0 ? `for ${plan.durationMonths} mo` : 'forever free'}
                      </span>
                    </div>

                    {/* Limits summary */}
                    <div className={`p-3 rounded-2xl text-xs space-y-1.5 ${isGold || isPlatinum ? 'bg-white/10' : 'bg-gold-50/70 border border-gold-200/50'}`}>
                      <div className="flex justify-between">
                        <span className="opacity-80">Interests Limit:</span>
                        <strong>{plan.interestLimit >= 999 ? 'Unlimited' : plan.interestLimit}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-80">Contact Phone Reveals:</span>
                        <strong>{plan.contactViewLimit >= 200 ? 'Unlimited' : plan.contactViewLimit}</strong>
                      </div>
                      <div className="flex justify-between">
                        <span className="opacity-80">Direct Messaging:</span>
                        <strong>{plan.canDirectMessage ? 'Included' : 'Requires Match'}</strong>
                      </div>
                    </div>

                    {/* Features List */}
                    <ul className="space-y-2.5 text-xs">
                      {features.map((feat, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${isGold || isPlatinum ? 'text-gold-400' : 'text-primary-700'}`} />
                          <span className={isGold || isPlatinum ? 'text-gray-200' : 'text-gray-700'}>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="pt-6">
                    {isCurrent ? (
                      <div className="text-center py-2.5 rounded-xl bg-green-600/30 text-green-300 text-xs font-bold border border-green-500">
                        Current Active Plan
                      </div>
                    ) : (
                      <button
                        onClick={() => handleSelectPlan(plan)}
                        disabled={processingPlanId === plan.id}
                        className={`w-full py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition ${
                          isGold
                            ? 'bg-gradient-to-r from-gold-400 to-gold-500 hover:from-gold-300 hover:to-gold-400 text-charcoal-950 shadow-gold-glow'
                            : isPlatinum
                            ? 'bg-white text-charcoal-950 hover:bg-gray-100'
                            : 'bg-primary-800 text-white hover:bg-primary-900'
                        }`}
                      >
                        {processingPlanId === plan.id
                          ? 'Processing...'
                          : plan.price === 0
                          ? 'Included'
                          : 'Upgrade Now'}
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

    </div>
  );
}

