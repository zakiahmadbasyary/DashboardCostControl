"use client";

import { useState, useEffect } from "react";
import { authService } from "@/services/authService";
import { UserSession } from "@/types/auth";
import { Shield, KeyRound, Eye, EyeOff, CheckCircle2, AlertCircle, UserCheck, Lock } from "lucide-react";

export default function AdminAccountPage() {
  const [user, setUser] = useState<UserSession | null>(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);

  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const currentUser = authService.getCurrentUser();
    if (currentUser) {
      setUser(currentUser);
    }
  }, []);

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    if (!currentPassword || !newPassword || !confirmPassword) {
      setErrorMsg("Semua kolom password wajib diisi.");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMsg("Password baru minimal 6 karakter.");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMsg("Konfirmasi password baru tidak cocok.");
      return;
    }

    if (currentPassword === newPassword) {
      setErrorMsg("Password baru harus berbeda dengan password saat ini.");
      return;
    }

    setLoading(true);

    try {
      const username = user?.username || "admin";
      const res = await authService.changePassword({
        username,
        currentPassword,
        newPassword,
      });

      if (res.success) {
        setSuccessMsg(res.message);
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      } else {
        setErrorMsg(res.message);
      }
    } catch {
      setErrorMsg("Terjadi kesalahan saat memproses perubahan password.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl">
      {/* Header */}
      <div>
        <h1 className="text-xl font-extrabold text-[#17231B]">Pengaturan Akun Admin</h1>
        <p className="text-xs text-[#5F6B63] mt-1">
          Kelola informasi profil admin dan perbarui kata sandi akun Anda secara aman.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Profile Card */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 shadow-xs flex flex-col items-center text-center relative overflow-hidden">
            <div className="absolute -top-12 -right-12 w-28 h-28 bg-[#16823B]/10 rounded-full blur-xl pointer-events-none" />
            
            <div className="w-20 h-20 rounded-2xl bg-[#16823B] text-[#A8D437] flex items-center justify-center font-black text-2xl shadow-lg shadow-[#16823B]/20 mb-4 border-2 border-white">
              <UserCheck className="w-10 h-10" />
            </div>

            <h2 className="font-extrabold text-base text-[#17231B]">{user?.name || "Admin User"}</h2>
            <p className="text-xs text-[#5F6B63] mt-0.5 font-mono">@{user?.username || "admin"}</p>

            <div className="mt-4 pt-4 border-t border-[#DDE5DF] w-full flex flex-col gap-2.5 text-xs text-left">
              <div className="flex items-center justify-between">
                <span className="text-[#5F6B63]">Role Akses:</span>
                <span className="px-2.5 py-0.5 rounded-full bg-[#16823B]/10 text-[#16823B] font-bold uppercase text-[10px]">
                  {user?.role || "ADMIN"}
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5F6B63]">Status Akun:</span>
                <span className="flex items-center gap-1.5 font-semibold text-emerald-600">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  Aktif
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-[#5F6B63]">Sistem Panel:</span>
                <span className="font-semibold text-[#17231B]">GGF AgroMetric</span>
              </div>
            </div>
          </div>

          <div className="bg-[#16823B]/5 border border-[#16823B]/20 rounded-2xl p-5 space-y-2">
            <div className="flex items-center gap-2 text-[#16823B] font-bold text-xs">
              <Shield className="w-4 h-4 shrink-0" />
              <span>Keamanan Akun</span>
            </div>
            <p className="text-[11px] text-[#5F6B63] leading-relaxed">
              Gunakan kombinasi password yang kuat dan jangan bagikan kredensial login admin kepada pihak yang tidak berwenang.
            </p>
          </div>
        </div>

        {/* Right Column: Change Password Form */}
        <div className="lg:col-span-2">
          <div className="bg-white border border-[#DDE5DF] rounded-2xl p-6 sm:p-7 shadow-xs">
            <div className="flex items-center gap-2.5 mb-6 pb-4 border-b border-[#DDE5DF]">
              <div className="p-2 rounded-xl bg-[#16823B]/10 text-[#16823B]">
                <KeyRound className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-[#17231B]">Ubah Kata Sandi (Password)</h3>
                <p className="text-xs text-[#5F6B63]">Perbarui password akun admin Anda secara berkala</p>
              </div>
            </div>

            <form onSubmit={handleChangePassword} className="space-y-5">
              {errorMsg && (
                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-start gap-3">
                  <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                  <div className="font-medium">{errorMsg}</div>
                </div>
              )}

              {successMsg && (
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-start gap-3">
                  <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5 text-emerald-600" />
                  <div className="font-medium">{successMsg}</div>
                </div>
              )}

              {/* Password Saat Ini */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wider">
                  Password Saat Ini <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#89938D] absolute left-3.5 top-3" />
                  <input
                    type={showCurrentPw ? "text" : "password"}
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="Masukkan password saat ini"
                    className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowCurrentPw(!showCurrentPw)}
                    className="absolute right-3 top-2.5 text-[#89938D] hover:text-[#17231B] transition-colors cursor-pointer"
                  >
                    {showCurrentPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Password Baru */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wider">
                  Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#89938D] absolute left-3.5 top-3" />
                  <input
                    type={showNewPw ? "text" : "password"}
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Masukkan password baru (min 6 karakter)"
                    className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPw(!showNewPw)}
                    className="absolute right-3 top-2.5 text-[#89938D] hover:text-[#17231B] transition-colors cursor-pointer"
                  >
                    {showNewPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Konfirmasi Password Baru */}
              <div>
                <label className="block text-xs font-bold text-[#17231B] mb-1.5 uppercase tracking-wider">
                  Konfirmasi Password Baru <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#89938D] absolute left-3.5 top-3" />
                  <input
                    type={showConfirmPw ? "text" : "password"}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Ulangi password baru Anda"
                    className="w-full bg-[#F7F9F7] border border-[#DDE5DF] rounded-xl pl-10 pr-10 py-2.5 text-sm text-[#17231B] focus:outline-none focus:border-[#16823B] transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPw(!showConfirmPw)}
                    className="absolute right-3 top-2.5 text-[#89938D] hover:text-[#17231B] transition-colors cursor-pointer"
                  >
                    {showConfirmPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full sm:w-auto px-6 py-2.5 rounded-xl bg-[#16823B] hover:bg-[#0B6B32] text-white font-bold text-xs transition-all shadow-xs active:scale-98 disabled:opacity-50 cursor-pointer flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      <span>Memproses Perubahan...</span>
                    </>
                  ) : (
                    <>
                      <KeyRound className="w-4 h-4" />
                      <span>Simpan Password Baru</span>
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
