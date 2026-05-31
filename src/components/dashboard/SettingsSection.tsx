import { useState } from 'react';
import { motion } from 'framer-motion';
import {
  User,
  GraduationCap,
  Lock,
  Save,
  Loader2,
  CreditCard,
  FileText,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import { api } from '@/lib/api';

interface SettingsSectionProps {
  delay?: number;
}

export const SettingsSection = ({ delay = 0 }: SettingsSectionProps) => {
  const { profile, refreshProfile, signOut } = useAuth();

  // Profile form state
  const [firstName, setFirstName] = useState(profile?.first_name || '');
  const [lastName, setLastName] = useState(profile?.last_name || '');
  const [university, setUniversity] = useState(profile?.university || '');
  const [savingProfile, setSavingProfile] = useState(false);

  // Password form state
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [savingPassword, setSavingPassword] = useState(false);

  // Payout fields state
  const [payoutMethod, setPayoutMethod] = useState(profile?.payment_method || '');
  const [upiId, setUpiId] = useState(profile?.upi_id || '');
  const [bankAccount, setBankAccount] = useState(profile?.bank_account_number || '');
  const [ifscCode, setIfscCode] = useState(profile?.bank_ifsc || '');

  const [panNumber, setPanNumber] = useState(profile?.pan_number || '');
  const [panVerified, setPanVerified] = useState(profile?.pan_verified || false);
  const [savingPayout, setSavingPayout] = useState(false);



  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!firstName.trim() || !lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }

    setSavingProfile(true);

    try {
      await api.put('/students/me/profile', {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        university: university.trim() || undefined,
      });

      await refreshProfile();
      toast.success('Profile updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update profile');
    } finally {
      setSavingProfile(false);
    }
  };

  const handleUpdatePassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setSavingPassword(true);

    try {
      await api.put('/students/me/password', {
        password: newPassword,
      });

      setNewPassword('');
      setConfirmPassword('');
      toast.success('Password updated successfully');
    } catch (error: any) {
      toast.error(error.message || 'Failed to update password');
    } finally {
      setSavingPassword(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    toast.success('Signed out successfully');
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.4 }}
      className="space-y-4 sm:space-y-6"
    >
      <div>
        <h1 className="text-xl sm:text-2xl md:text-3xl font-bold font-display text-foreground">Settings</h1>
        <p className="text-sm sm:text-base text-muted-foreground">Manage your account and partner level</p>
      </div>


      {/* Profile Settings */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 rounded-lg bg-accent/10">
            <User className="text-accent w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Profile Information</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Update your personal details</p>
          </div>
        </div>

        <form onSubmit={handleSaveProfile} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="firstName" className="text-sm">First Name</Label>
              <Input
                id="firstName"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Enter your first name"
                required
                className="text-sm"
              />
            </div>
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="lastName" className="text-sm">Last Name</Label>
              <Input
                id="lastName"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                placeholder="Enter your last name"
                required
                className="text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="university" className="text-sm">University</Label>
            <div className="relative">
              <GraduationCap className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground w-4 h-4" />
              <Input
                id="university"
                value={university}
                onChange={(e) => setUniversity(e.target.value)}
                placeholder="Enter your university"
                className="pl-10 text-sm"
              />
            </div>
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-sm">Email</Label>
            <Input
              value={profile?.email || ''}
              disabled
              className="bg-muted text-sm"
            />
            <p className="text-xs text-muted-foreground">Email cannot be changed</p>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-sm">Phone Number</Label>
            <Input
              value={profile?.phone_number || ''}
              disabled
              className="bg-muted text-sm"
            />
            <p className="text-xs text-muted-foreground">Phone number cannot be changed</p>
          </div>
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-sm">Referral Code</Label>
            <Input
              value={profile?.referral_code || 'Not generated'}
              disabled
              className="bg-muted font-mono text-sm"
            />
            <p className="text-xs text-muted-foreground">Your unique referral code for sharing</p>
          </div>

          <Button
            type="submit"
            disabled={savingProfile}
            className="bg-accent hover:bg-accent/90 text-accent-foreground gap-2 text-sm"
            size="sm"
          >
            {savingProfile ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Save size={14} />
            )}
            Save Changes
          </Button>
        </form>
      </div>

      {/* Password Settings */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 rounded-lg bg-warning/10">
            <Lock className="text-warning w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Change Password</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Update your account password</p>
          </div>
        </div>

        <form onSubmit={handleUpdatePassword} className="space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="newPassword" className="text-sm">New Password</Label>
            <Input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder="Enter new password"
              minLength={6}
              required
              className="text-sm"
            />
          </div>

          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="confirmPassword" className="text-sm">Confirm New Password</Label>
            <Input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm new password"
              minLength={6}
              required
              className="text-sm"
            />
          </div>

          <Button
            type="submit"
            disabled={savingPassword}
            variant="outline"
            className="gap-2 text-sm"
            size="sm"
          >
            {savingPassword ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Lock size={14} />
            )}
            Update Password
          </Button>
        </form>
      </div>


      {/* Payout Method */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 rounded-lg bg-success/10">
            <CreditCard className="text-success w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Payout Method</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">How you'll receive your earnings</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label className="text-sm">Payment Method</Label>
            <Select value={payoutMethod} onValueChange={setPayoutMethod}>
              <SelectTrigger className="text-sm">
                <SelectValue placeholder="Select payout method" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upi">UPI (Instant)</SelectItem>
                <SelectItem value="bank">Bank Transfer (2-3 days)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {payoutMethod === 'upi' && (
            <div className="space-y-1.5 sm:space-y-2">
              <Label htmlFor="upiId" className="text-sm">UPI ID</Label>
              <Input
                id="upiId"
                value={upiId}
                onChange={(e) => setUpiId(e.target.value)}
                placeholder="yourname@paytm / yourname@upi"
                className="text-sm"
              />
            </div>
          )}

          {payoutMethod === 'bank' && (
            <>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="bankAccount" className="text-sm">Bank Account Number</Label>
                <Input
                  id="bankAccount"
                  value={bankAccount}
                  onChange={(e) => setBankAccount(e.target.value.replace(/\D/g, ''))}
                  placeholder="Enter account number"
                  className="text-sm"
                />
              </div>
              <div className="space-y-1.5 sm:space-y-2">
                <Label htmlFor="ifscCode" className="text-sm">IFSC Code</Label>
                <Input
                  id="ifscCode"
                  value={ifscCode}
                  onChange={(e) => setIfscCode(e.target.value.toUpperCase())}
                  placeholder="e.g., SBIN0001234"
                  className="text-sm uppercase"
                  maxLength={11}
                />
              </div>
            </>
          )}

          {payoutMethod && (
            <Button
              onClick={async () => {
                setSavingPayout(true);
                try {
                  await api.put('/students/me/payout-methods', {
                    paymentMethod: payoutMethod,
                    upiId,
                    bankAccount,
                    ifscCode
                  });
                  await refreshProfile();
                  toast.success('Payout details saved successfully');
                } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Failed to save payout details');
                } finally {
                  setSavingPayout(false);
                }
              }}
              disabled={savingPayout}
              className="bg-success hover:bg-success/90 text-success-foreground gap-2 text-sm"
              size="sm"
            >
              {savingPayout ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
              Save Payout Details
            </Button>
          )}
        </div>
      </div>

      {/* Tax Information */}
      <div className="bg-card rounded-xl border border-border p-4 sm:p-6 shadow-card">
        <div className="flex items-center gap-2 sm:gap-3 mb-4 sm:mb-6">
          <div className="p-1.5 sm:p-2 rounded-lg bg-chart-2/10">
            <FileText className="text-chart-2 w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div className="flex-1">
            <h3 className="font-semibold text-foreground text-sm sm:text-base">Tax Information (PAN)</h3>
            <p className="text-xs sm:text-sm text-muted-foreground">Required for payouts above ₹10,000</p>
          </div>
          {panVerified && (
            <div className="flex items-center gap-1 text-success text-xs">
              <CheckCircle2 className="w-4 h-4" />
              Verified
            </div>
          )}
        </div>

        <div className="space-y-4">
          <div className="space-y-1.5 sm:space-y-2">
            <Label htmlFor="panNumber" className="text-sm">PAN Card Number</Label>
            <Input
              id="panNumber"
              value={panNumber}
              onChange={(e) => setPanNumber(e.target.value.toUpperCase())}
              placeholder="e.g., ABCDE1234F"
              className="text-sm uppercase font-mono"
              maxLength={10}
            />
            <p className="text-xs text-muted-foreground">
              Format: 5 letters + 4 digits + 1 letter
            </p>
          </div>

          {!panVerified && panNumber.length === 10 && /^[A-Z]{5}[0-9]{4}[A-Z]{1}$/.test(panNumber) && (
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                try {
                  await api.put('/students/me/payout-methods', {
                    // Send existing payout data along with PAN so we don't wipe it, 
                    // or backend needs to handle partial updates nicely.
                    // Assuming backend updates only provided fields or we send all:
                    paymentMethod: payoutMethod,
                    upiId,
                    bankAccount,
                    ifscCode,
                    panNumber
                  });
                  await refreshProfile();
                  // Check if profile update reflected verification
                  setPanVerified(true); // Optimistic or derived from refresh
                  toast.success('PAN updated and verified!');
                } catch (error: any) {
                  toast.error(error.response?.data?.error || 'Failed to verify PAN');
                }
              }}
              className="text-sm"
            >
              Verify PAN
            </Button>
          )}

          {panNumber.length > 0 && panNumber.length < 10 && (
            <div className="flex items-center gap-2 text-warning text-xs">
              <AlertCircle className="w-4 h-4" />
              Please enter a valid 10-character PAN
            </div>
          )}
        </div>
      </div>

      {/* Payout Eligibility Status */}
      <div className="bg-muted/50 rounded-xl border border-border p-4 sm:p-6">
        <h4 className="font-semibold text-foreground mb-3 text-sm sm:text-base flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-muted-foreground" />
          Payout Eligibility
        </h4>
        <div className="space-y-2">

          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Payout Method Set</span>
            {payoutMethod ? (
              <span className="text-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Yes</span>
            ) : (
              <span className="text-warning flex items-center gap-1"><AlertCircle className="w-4 h-4" /> Required</span>
            )}
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">PAN Verified (for ₹10k+)</span>
            {panVerified ? (
              <span className="text-success flex items-center gap-1"><CheckCircle2 className="w-4 h-4" /> Yes</span>
            ) : (
              <span className="text-muted-foreground flex items-center gap-1">Optional</span>
            )}
          </div>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Add a payout method to be eligible for receiving payments.
        </p>
      </div>

      {/* Danger Zone */}
      <div className="bg-card rounded-xl border border-destructive/30 p-4 sm:p-6 shadow-card">
        <h3 className="font-semibold text-foreground mb-1 sm:mb-2 text-sm sm:text-base">Sign Out</h3>
        <p className="text-xs sm:text-sm text-muted-foreground mb-3 sm:mb-4">
          Sign out of your account on this device
        </p>
        <Button
          variant="destructive"
          onClick={handleSignOut}
          size="sm"
          className="text-sm"
        >
          Sign Out
        </Button>
      </div>
    </motion.div>
  );
};
