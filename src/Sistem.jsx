import React, { useState } from 'react';
import { ShieldCheck, Lock, KeyRound, LogOut, ShieldAlert } from 'lucide-react';

export default function Sistem({ 
  isAdmin, 
  onOpenLoginModal, 
  onLogout, 
  adminPassword, 
  onUpdatePassword 
}) {
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState({ text: '', isError: false });

  const handlePasswordChange = (e) => {
    e.preventDefault();

    if (oldPassword !== adminPassword) {
      setMessage({ text: 'The old password you entered is incorrect!', isError: true });
      return;
    }

    if (newPassword.length < 6) {
      setMessage({ text: 'New password must be at least 6 characters long!', isError: true });
      return;
    }

    if (newPassword !== confirmPassword) {
      setMessage({ text: 'Password confirmation does not match!', isError: true });
      return;
    }

    onUpdatePassword(newPassword);
    setMessage({ text: 'Admin password has been updated successfully!', isError: false });
    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
  };

  // View for Non-Admin (Guest / Public)
  if (!isAdmin) {
    return (
      <div data-aos="fade-up" className="flex flex-col gap-4">
        <div className="px-1">
          <p className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase">PREFERENCES</p>
          <h2 className="text-xl font-serif font-bold text-neutral-900">System & Security</h2>
        </div>

        <div className="bg-white rounded-3xl p-6 shadow-sm border border-[#EFE8DC] text-center flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 text-amber-700 flex items-center justify-center">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h3 className="font-semibold text-neutral-800 text-base">Restricted Administrator Area</h3>
            <p className="text-xs text-neutral-500 mt-1 max-w-xs mx-auto leading-relaxed">
              This settings panel is restricted to Administrators for managing dashboard credentials and access security.
            </p>
          </div>
          <button
            onClick={onOpenLoginModal}
            className="mt-2 bg-[#1C1A17] text-[#FBBF24] px-5 py-2.5 rounded-xl text-xs font-semibold hover:bg-black transition shadow-sm"
          >
            Sign in as Administrator
          </button>
        </div>
      </div>
    );
  }

  // View for Authenticated Admin
  return (
    <div data-aos="fade-up" className="flex flex-col gap-4">
      {/* Header */}
      <div className="flex justify-between items-center px-1">
        <div>
          <p className="text-[10px] font-bold tracking-widest text-[#B45309] uppercase">PREFERENCES</p>
          <h2 className="text-xl font-serif font-bold text-neutral-900">Admin Settings</h2>
        </div>
        <button
          onClick={onLogout}
          className="flex items-center gap-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 px-3 py-1.5 rounded-xl border border-red-200 transition"
        >
          <LogOut size={14} /> Log Out
        </button>
      </div>

      {/* Account Status Card */}
      <div className="bg-[#1C1A17] text-white p-4 rounded-2xl flex items-center gap-3 shadow">
        <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center">
          <ShieldCheck size={20} />
        </div>
        <div>
          <p className="text-xs font-bold text-neutral-100">Account Role: Administrator</p>
          <p className="text-[11px] text-neutral-400">Full control over revenue logs and student database</p>
        </div>
      </div>

      {/* Change Password Form */}
      <div className="bg-white rounded-3xl p-5 shadow-sm border border-[#EFE8DC]">
        <div className="flex items-center gap-2 mb-4 pb-3 border-b border-neutral-100">
          <KeyRound size={17} className="text-amber-700" />
          <h3 className="text-sm font-bold text-neutral-800">Change Admin Password</h3>
        </div>

        {message.text && (
          <div className={`p-3 mb-4 rounded-xl text-xs ${message.isError ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'}`}>
            {message.text}
          </div>
        )}

        <form onSubmit={handlePasswordChange} className="flex flex-col gap-3">
          <div>
            <label className="text-[11px] font-semibold text-neutral-600">Current Password</label>
            <input
              type="password"
              placeholder="Enter current password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full mt-1 border border-neutral-200 rounded-xl px-3 py-2 text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-600">New Password</label>
            <input
              type="password"
              placeholder="At least 6 characters"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full mt-1 border border-neutral-200 rounded-xl px-3 py-2 text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              required
            />
          </div>

          <div>
            <label className="text-[11px] font-semibold text-neutral-600">Confirm New Password</label>
            <input
              type="password"
              placeholder="Re-type new password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full mt-1 border border-neutral-200 rounded-xl px-3 py-2 text-xs bg-neutral-50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-amber-500/30"
              required
            />
          </div>

          <button
            type="submit"
            className="w-full bg-[#1C1A17] text-[#FBBF24] py-2.5 rounded-xl font-medium text-xs hover:bg-black transition mt-2 shadow"
          >
            Update Password
          </button>
        </form>
      </div>
    </div>
  );
}