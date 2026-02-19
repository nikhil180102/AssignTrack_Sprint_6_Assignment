import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import StudentLayout from '../../components/layout/StudentLayout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import { userAPI } from '../../api/user.api';
import { loginSuccess } from '../../features/auth/authSlice';
import { saveAuth } from '../../utils/auth';

const StudentProfile = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    role: '',
  });

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getMyProfile();
        const profile = res?.data?.data || {};
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          email: profile.email || user?.email || '',
          role: profile.role || user?.role || 'STUDENT',
        });
      } catch (err) {
        toast.error('Failed to load profile');
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleProfileSave = async () => {
    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      toast.error('First name and last name are required');
      return;
    }
    try {
      setSaving(true);
      const res = await userAPI.updateMyProfile({
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
      });
      const updated = res?.data?.data || {};
      saveAuth({
        token,
        role: user?.role,
        userId: user?.id,
        firstName: updated.firstName || formData.firstName.trim(),
        lastName: updated.lastName || formData.lastName.trim(),
      });
      dispatch(
        loginSuccess({
          user: {
            ...user,
            firstName: updated.firstName || formData.firstName.trim(),
            lastName: updated.lastName || formData.lastName.trim(),
          },
        })
      );
      toast.success('Profile updated');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update profile');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async () => {
    if (!passwordForm.oldPassword || !passwordForm.newPassword) {
      toast.error('Old and new password are required');
      return;
    }
    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      toast.error('New password and confirm password do not match');
      return;
    }
    try {
      setChangingPassword(true);
      await userAPI.changePassword({
        oldPassword: passwordForm.oldPassword,
        newPassword: passwordForm.newPassword,
      });
      setPasswordForm({
        oldPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      toast.success('Password updated successfully');
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Failed to update password');
    } finally {
      setChangingPassword(false);
    }
  };

  const initial = (
    formData.firstName?.charAt(0) ||
    formData.email?.charAt(0) ||
    'S'
  ).toUpperCase();

  return (
    <StudentLayout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Student Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update your name and password</p>
        </div>

        <Card className="p-6">
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-slate-900 dark:bg-slate-700 flex items-center justify-center text-white font-bold text-xl">
                  {initial}
                </div>
                <div>
                  <p className="text-lg font-semibold text-gray-900 dark:text-gray-100">
                    {formData.firstName} {formData.lastName}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-400">{formData.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="student-first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <Input
                    id="student-first-name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="student-last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <Input
                    id="student-last-name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="student-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <Input id="student-email" value={formData.email} disabled />
                </div>
                <div>
                  <label htmlFor="student-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <Input id="student-role" value={formData.role} disabled />
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  variant="secondary"
                  className="bg-slate-900 text-white hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700"
                  onClick={handleProfileSave}
                  disabled={saving}
                >
                  {saving ? 'Saving...' : 'Save Profile'}
                </Button>
              </div>
            </div>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-4">Reset Password</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Input
              id="student-old-password"
              type="password"
              aria-label="Old password"
              placeholder="Old password"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))
              }
            />
            <Input
              id="student-new-password"
              type="password"
              aria-label="New password"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
            />
            <Input
              id="student-confirm-password"
              type="password"
              aria-label="Confirm password"
              placeholder="Confirm password"
              value={passwordForm.confirmPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, confirmPassword: e.target.value }))
              }
            />
          </div>
          <div className="flex justify-end mt-4">
            <Button
              variant="secondary"
              className="bg-slate-900 text-white hover:bg-black dark:bg-slate-800 dark:hover:bg-slate-700"
              onClick={handlePasswordChange}
              disabled={changingPassword}
            >
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </Card>
      </div>
    </StudentLayout>
  );
};

export default StudentProfile;
