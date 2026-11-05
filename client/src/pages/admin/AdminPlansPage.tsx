import React, { useState, useEffect } from 'react';
import { Crown, Check, Edit2, Save } from 'lucide-react';
import { membershipService } from '../../services/membershipService';
import { adminService } from '../../services/adminService';
import { useNotifications } from '../../context/NotificationContext';

export default function AdminPlansPage() {
  const { showToast } = useNotifications();
  const [plans, setPlans] = useState([]);
  const [editingPlanId, setEditingPlanId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState<any>({});
  const [loading, setLoading] = useState(true);

  const fetchPlans = async () => {
    try {
      const res = await membershipService.getPlans();
      if (res.success) setPlans(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPlans();
  }, []);

  const handleStartEdit = (p) => {
    setEditingPlanId(p.id);
    setEditFormData({
      price: p.price,
      interestLimit: p.interestLimit,
      profileViewLimit: p.profileViewLimit,
      contactViewLimit: p.contactViewLimit,
      isActive: p.isActive,
    });
  };

  const handleSavePlan = async (planId) => {
    try {
      const res = await adminService.updatePlan(planId, editFormData);
      if (res.success) {
        showToast('Membership plan updated successfully', 'success');
        setEditingPlanId(null);
        fetchPlans();
      }
    } catch (err) {
      showToast(err.message || 'Failed to update plan', 'error');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="font-serif text-2xl font-bold text-slate-900">
          Membership Plans & Quota Configuration
        </h1>
        <p className="text-xs text-slate-500 mt-0.5">
          Configure prices, monthly limits, and features dynamically
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((p) => {
          const isEditing = editingPlanId === p.id;

          return (
            <div
              key={p.id}
              className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-serif font-bold text-lg text-slate-900">{p.name}</h3>
                  <span className="text-[10px] font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                    {p.planCode}
                  </span>
                </div>

                {isEditing ? (
                  <div className="space-y-2 text-xs">
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500">Price (INR)</label>
                      <input
                        type="number"
                        value={editFormData.price}
                        onChange={(e) => setEditFormData({ ...editFormData, price: e.target.value })}
                        className="w-full h-9 px-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500">Interest Limit</label>
                      <input
                        type="number"
                        value={editFormData.interestLimit}
                        onChange={(e) => setEditFormData({ ...editFormData, interestLimit: e.target.value })}
                        className="w-full h-9 px-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold uppercase text-slate-500">Contact Reveals</label>
                      <input
                        type="number"
                        value={editFormData.contactViewLimit}
                        onChange={(e) => setEditFormData({ ...editFormData, contactViewLimit: e.target.value })}
                        className="w-full h-9 px-2 rounded-lg border border-slate-300 text-xs"
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-2 text-xs text-slate-600">
                    <p className="text-2xl font-serif font-bold text-slate-900">
                      ₹{p.price.toLocaleString('en-IN')}
                    </p>
                    <div className="flex justify-between border-t border-slate-100 pt-1.5">
                      <span>Interests:</span>
                      <strong>{p.interestLimit}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1.5">
                      <span>Contact Reveals:</span>
                      <strong>{p.contactViewLimit}</strong>
                    </div>
                    <div className="flex justify-between border-t border-slate-100 pt-1.5">
                      <span>Profile Views:</span>
                      <strong>{p.profileViewLimit}</strong>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-3 border-t border-slate-100">
                {isEditing ? (
                  <div className="flex gap-2">
                    <button
                      onClick={() => setEditingPlanId(null)}
                      className="flex-1 py-2 text-xs border border-slate-300 rounded-xl"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSavePlan(p.id)}
                      className="flex-1 py-2 text-xs bg-slate-900 text-white font-bold rounded-xl flex items-center justify-center gap-1"
                    >
                      <Save className="w-3.5 h-3.5" />
                      Save
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => handleStartEdit(p)}
                    className="w-full py-2 rounded-xl border border-slate-300 hover:bg-slate-50 text-xs font-semibold flex items-center justify-center gap-1.5"
                  >
                    <Edit2 className="w-3.5 h-3.5 text-slate-500" />
                    Configure Plan
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

