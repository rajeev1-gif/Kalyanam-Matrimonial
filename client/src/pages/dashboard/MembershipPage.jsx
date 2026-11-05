import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Crown, CheckCircle2, Shield, CreditCard, Sparkles, AlertCircle } from 'lucide-react';
import { membershipService } from '../../services/membershipService';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';

export default function MembershipPage() {
  const { refreshUser } = useAuth();
  const { showToast } = useNotifications();

  const [currentSub, setCurrentSub] = useState(null);
  const [plans, setPlans] = useState([]);
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [upgradingPlanId, setUpgradingPlanId] = useState(null);

  const loadData = async () => {
    try {
      const [subRes, plansRes, payRes] = await Promise.all([
        membershipService.getCurrentSubscription(),
        membershipService.getPlans(),
        membershipService.getPaymentHistory(),
      ]);

      if (subRes.success) setCurrentSub(subRes.data);
      if (plansRes.success) setPlans(plansRes.data || []);
      if (payRes.success) setPayments(payRes.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const handleUpgrade = async (plan) => {
    setUpgradingPlanId(plan.id);
    try {
      const orderRes = await membershipService.createOrder(plan.id);
      if (!orderRes.success) throw new Error(orderRes.message);

      const verifyRes = await membershipService.verifyPayment({
        orderId: orderRes.data.orderId,
        paymentId: `pay_sim_${Date.now()}`,
        signature: 'sandbox_verified_signature',
      });

      if (verifyRes.success) {
        showToast(verifyRes.message || 'Membership upgraded successfully!', 'success');
        await refreshUser();
        loadData();
      }
    } catch (err) {
      showToast(err.message || 'Upgrade failed', 'error');
    } finally {
      setUpgradingPlanId(null);
    }
  };

  if (loading) {
    return <div className="text-center py-20 text-xs text-gray-500">Loading membership details...</div>;
  }

  const currentPlan = currentSub?.plan;

  return (
    <div className="space-y-10 max-w-5xl pb-12">
      
      {/* Header */}
      <div className="border-b border-gold-200/80 pb-4">
        <h1 className="font-serif text-2xl font-bold text-charcoal-900 flex items-center gap-2">
          <Crown className="w-6 h-6 text-gold-600" />
          My Membership & Subscriptions
        </h1>
        <p className="text-xs text-gray-500 mt-0.5">
          Manage your subscription privileges, view remaining contact reveals, and upgrade tiers
        </p>
      </div>

      {/* ACTIVE SUBSCRIPTION HERO CARD */}
      <div className="bg-gradient-to-r from-primary-950 via-primary-900 to-charcoal-950 rounded-3xl p-6 sm:p-8 text-white border-2 border-gold-400 shadow-xl space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <span className="text-[11px] font-bold uppercase tracking-widest text-gold-300">
              Active Tier
            </span>
            <h2 className="font-serif text-3xl font-bold">
              {currentPlan?.name || 'Free Starter'}
            </h2>
          </div>
          {currentSub?.endDate && (
            <div className="bg-white/10 px-4 py-2 rounded-xl border border-white/20 text-xs">
              <span className="text-gray-300 block text-[10px]">Valid Until</span>
              <strong className="text-gold-300">{new Date(currentSub.endDate).toLocaleDateString()}</strong>
            </div>
          )}
        </div>

        {/* Quotas Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-2">
          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[11px] text-gray-300 block">Remaining Interests</span>
            <span className="text-2xl font-serif font-bold text-white">
              {currentSub?.interestsRemaining ?? 10}
            </span>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[11px] text-gray-300 block">Verified Contacts Remaining</span>
            <span className="text-2xl font-serif font-bold text-white">
              {currentSub?.contactsRemaining ?? 2}
            </span>
          </div>

          <div className="bg-white/10 p-4 rounded-2xl border border-white/10 space-y-1">
            <span className="text-[11px] text-gray-300 block">Direct Chat Privileges</span>
            <span className="text-lg font-bold text-gold-300">
              {currentPlan?.canDirectMessage ? 'Active & Unlocked' : 'Mutual Match Only'}
            </span>
          </div>
        </div>
      </div>

      {/* AVAILABLE UPGRADE PLANS */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-charcoal-900">
          Available Membership Tiers
        </h3>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {plans.map((p) => {
            const isSelected = currentPlan?.id === p.id;
            const features = Array.isArray(p.features) ? p.features : (typeof p.features === 'string' ? JSON.parse(p.features) : []);

            return (
              <div
                key={p.id}
                className={`bg-white rounded-3xl p-6 border flex flex-col justify-between space-y-5 transition ${
                  isSelected
                    ? 'border-2 border-green-600 shadow-md'
                    : 'border-gold-200/90 shadow-sm hover:shadow-xl'
                }`}
              >
                <div className="space-y-4">
                  <div>
                    <h4 className="font-serif text-lg font-bold text-charcoal-900">{p.name}</h4>
                    <p className="text-2xl font-serif font-bold text-primary-900 mt-1">
                      ₹{p.price.toLocaleString('en-IN')}
                      <span className="text-xs font-sans text-gray-500 font-normal"> / {p.durationMonths} mo</span>
                    </p>
                  </div>

                  <ul className="space-y-2 text-xs">
                    {features.map((feat, i) => (
                      <li key={i} className="flex items-start gap-2 text-gray-700">
                        <CheckCircle2 className="w-3.5 h-3.5 text-primary-700 shrink-0 mt-0.5" />
                        <span>{feat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="pt-4 border-t border-gold-100">
                  {isSelected ? (
                    <div className="text-center py-2 bg-green-50 text-green-800 text-xs font-bold rounded-xl border border-green-300">
                      Active Plan
                    </div>
                  ) : (
                    <button
                      onClick={() => handleUpgrade(p)}
                      disabled={upgradingPlanId === p.id || p.price === 0}
                      className="w-full py-2.5 rounded-xl bg-primary-850 hover:bg-primary-950 text-white font-bold text-xs uppercase tracking-wider transition disabled:opacity-50"
                    >
                      {upgradingPlanId === p.id ? 'Activating...' : p.price === 0 ? 'Basic' : 'Upgrade'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* BILLING HISTORY TABLE */}
      <div className="space-y-4">
        <h3 className="font-serif text-xl font-bold text-charcoal-900">
          Payment & Transaction History
        </h3>

        {payments.length === 0 ? (
          <div className="bg-white p-8 rounded-2xl border border-gold-200 text-center text-xs text-gray-500">
            No past transactions found.
          </div>
        ) : (
          <div className="bg-white rounded-2xl border border-gold-200 overflow-hidden shadow-sm">
            <table className="w-full text-left text-xs">
              <thead className="bg-gold-50/70 border-b border-gold-200 text-charcoal-900 font-bold uppercase tracking-wider text-[10px]">
                <tr>
                  <th className="p-4">Order ID</th>
                  <th className="p-4">Plan</th>
                  <th className="p-4">Amount</th>
                  <th className="p-4">Status</th>
                  <th className="p-4">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gold-50">
                {payments.map((pay) => (
                  <tr key={pay.id} className="hover:bg-gold-50/40">
                    <td className="p-4 font-mono font-medium">{pay.orderId}</td>
                    <td className="p-4 font-bold">{pay.plan?.name}</td>
                    <td className="p-4">₹{pay.amount.toLocaleString('en-IN')}</td>
                    <td className="p-4">
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-green-100 text-green-800">
                        {pay.status}
                      </span>
                    </td>
                    <td className="p-4 text-gray-500">{new Date(pay.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}

