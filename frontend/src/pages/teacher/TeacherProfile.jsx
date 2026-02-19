import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import Layout from '../../components/layout/Layout';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import toast from 'react-hot-toast';
import { userAPI } from '../../api/user.api';
import { loginSuccess } from '../../features/auth/authSlice';
import { saveAuth } from '../../utils/auth';

const TeacherProfile = () => {
  const dispatch = useDispatch();
  const { token, user } = useSelector((state) => state.auth);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    expertise: '',
    experienceYears: '',
    email: '',
    role: '',
    certificationFileName: '',
  });
  const [certificationFile, setCertificationFile] = useState(null);

  const [passwordForm, setPasswordForm] = useState({
    oldPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const roleDisplayValue = String(formData.role || '').toUpperCase() === 'TEACHER'
    ? 'INSTRUCTOR'
    : formData.role;

  useEffect(() => {
    const loadProfile = async () => {
      try {
        setLoading(true);
        const res = await userAPI.getMyProfile();
        const profile = res?.data?.data || {};
        setFormData({
          firstName: profile.firstName || '',
          lastName: profile.lastName || '',
          expertise: profile.expertise || '',
          experienceYears:
            profile.experienceYears != null ? String(profile.experienceYears) : '',
          email: profile.email || user?.email || '',
          role: profile.role || user?.role || 'TEACHER',
          certificationFileName: profile.certificationFileName || '',
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
      const fd = new FormData();
      fd.append('firstName', formData.firstName.trim());
      fd.append('lastName', formData.lastName.trim());
      fd.append('expertise', formData.expertise.trim());
      if (formData.experienceYears !== '') {
        fd.append('experienceYears', String(formData.experienceYears));
      }
      if (certificationFile) {
        const name = certificationFile.name?.toLowerCase() || '';
        if (!(name.endsWith('.pdf') || name.endsWith('.doc') || name.endsWith('.docx'))) {
          toast.error('Only PDF, DOC, DOCX are allowed for certification');
          setSaving(false);
          return;
        }
        if (certificationFile.size > 10 * 1024 * 1024) {
          toast.error('Certification file must be <= 10 MB');
          setSaving(false);
          return;
        }
        fd.append('certificationFile', certificationFile);
      }

      const res = await userAPI.updateTeacherProfile(fd);
      const updated = res?.data?.data || {};
      setFormData((prev) => ({
        ...prev,
        firstName: updated.firstName || prev.firstName,
        lastName: updated.lastName || prev.lastName,
        expertise: updated.expertise || prev.expertise,
        experienceYears:
          updated.experienceYears != null
            ? String(updated.experienceYears)
            : prev.experienceYears,
        certificationFileName:
          updated.certificationFileName || prev.certificationFileName,
      }));
      setCertificationFile(null);
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
    'T'
  ).toUpperCase();

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">Instructor Profile</h1>
          <p className="text-gray-600 dark:text-gray-400 mt-1">Update your name and password</p>
        </div>

        <Card className="p-6">
          {loading ? (
            <p className="text-gray-600 dark:text-gray-400">Loading profile...</p>
          ) : (
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white font-bold text-xl">
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
                  <label htmlFor="teacher-first-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    First Name
                  </label>
                  <Input
                    id="teacher-first-name"
                    value={formData.firstName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, firstName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="teacher-last-name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Last Name
                  </label>
                  <Input
                    id="teacher-last-name"
                    value={formData.lastName}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, lastName: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="teacher-expertise" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Expertise
                  </label>
                  <select
                    id="teacher-expertise"
                    value={formData.expertise}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, expertise: e.target.value }))
                    }
                    className="w-full px-4 py-2.5 rounded-xl bg-white/60 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200 shadow-inner backdrop-blur-md focus:ring-2 focus:ring-indigo-500"
                  >
                    <option value="">Select expertise</option>
                    <option value="JAVA">Java</option>
                    <option value="SPRING_BOOT">Spring Boot</option>
                    <option value="MICROSERVICES">Microservices</option>
                    <option value="REACT">React</option>
                    <option value="NODE_JS">Node.js</option>
                    <option value="DATA_STRUCTURES">Data Structures</option>
                    <option value="DATABASES">Databases</option>
                    <option value="DEVOPS">DevOps</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="teacher-experience" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Experience (Years)
                  </label>
                  <Input
                    id="teacher-experience"
                    type="number"
                    min="0"
                    max="40"
                    value={formData.experienceYears}
                    onChange={(e) =>
                      setFormData((prev) => ({ ...prev, experienceYears: e.target.value }))
                    }
                  />
                </div>
                <div>
                  <label htmlFor="teacher-email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Email
                  </label>
                  <Input id="teacher-email" value={formData.email} disabled />
                </div>
                <div>
                  <label htmlFor="teacher-role" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Role
                  </label>
                  <Input id="teacher-role" value={roleDisplayValue} disabled />
                </div>
                <div className="md:col-span-2">
                  <label htmlFor="teacher-certification" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Certification Document (PDF/DOC/DOCX)
                  </label>
                  <input
                    id="teacher-certification"
                    type="file"
                    accept=".pdf,.doc,.docx"
                    onChange={(e) => setCertificationFile(e.target.files?.[0] || null)}
                    className="w-full px-4 py-2.5 rounded-xl bg-white/60 dark:bg-gray-700/50 border border-gray-300 dark:border-gray-600 text-gray-900 dark:text-gray-200"
                  />
                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Current: {formData.certificationFileName || 'Not uploaded'}
                  </p>
                </div>
              </div>

              <div className="flex justify-end">
                <Button onClick={handleProfileSave} disabled={saving}>
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
              id="teacher-old-password"
              type="password"
              aria-label="Old password"
              placeholder="Old password"
              value={passwordForm.oldPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, oldPassword: e.target.value }))
              }
            />
            <Input
              id="teacher-new-password"
              type="password"
              aria-label="New password"
              placeholder="New password"
              value={passwordForm.newPassword}
              onChange={(e) =>
                setPasswordForm((prev) => ({ ...prev, newPassword: e.target.value }))
              }
            />
            <Input
              id="teacher-confirm-password"
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
            <Button onClick={handlePasswordChange} disabled={changingPassword}>
              {changingPassword ? 'Updating...' : 'Update Password'}
            </Button>
          </div>
        </Card>
      </div>
    </Layout>
  );
};

export default TeacherProfile;
