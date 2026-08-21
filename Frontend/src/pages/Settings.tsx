import { useState } from 'react';
import { TabGroup, TabList, Tab, TabPanels, TabPanel } from '@headlessui/react';
import clsx from 'clsx';
import { useAppDispatch, useAppSelector } from '../app/hooks';
import { Card, CardBody, CardHeader } from '../components/ui/Card';
import Button from '../components/ui/Button';
import { pushToast } from '../features/ui/uiSlice';

export default function Settings() {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const [fullName, setFullName] = useState(user?.fullName ?? '');
  const [email, setEmail] = useState(user?.email ?? '');
  const [emailNotif, setEmailNotif] = useState(true);
  const [pushNotif, setPushNotif] = useState(true);

  if (!user) return null;

  return (
    <div className="max-w-3xl">
      <h1 className="text-2xl mb-1">Settings</h1>
      <p className="text-sm text-ink-400 mb-5">Manage your profile, security, and notification preferences.</p>

      <TabGroup>
        <TabList className="flex gap-1.5 mb-5 border-b border-ink-100">
          {['Profile', 'Security', 'Notifications'].map((t) => (
            <Tab key={t} className={({ selected }) => clsx(
              'px-4 py-2.5 text-sm font-medium outline-none border-b-2 -mb-px transition-colors',
              selected ? 'border-brand-700 text-brand-700' : 'border-transparent text-ink-500 hover:text-ink-800',
            )}>
              {t}
            </Tab>
          ))}
        </TabList>
        <TabPanels>
          <TabPanel>
            <Card>
              <CardHeader><h3 className="text-sm font-semibold">Profile Information</h3></CardHeader>
              <CardBody className="space-y-4">
                <div className="flex items-center gap-4">
                  <div className="size-16 rounded-full flex items-center justify-center text-white text-xl font-semibold" style={{ backgroundColor: user.avatarColor }}>
                    {user.fullName.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-ink-800">{user.title}</p>
                    <p className="text-xs text-ink-400">{user.department} · {user.role}</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">Full Name</label>
                    <input value={fullName} onChange={(e) => setFullName(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-ink-700 mb-1.5">Email</label>
                    <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500" />
                  </div>
                </div>
                <Button onClick={() => dispatch(pushToast('Profile updated successfully.', 'success'))}>Save Changes</Button>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card>
              <CardHeader><h3 className="text-sm font-semibold">Security</h3></CardHeader>
              <CardBody className="space-y-4 max-w-md">
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">Current Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-ink-700 mb-1.5">New Password</label>
                  <input type="password" placeholder="••••••••" className="w-full px-3 py-2.5 rounded-lg border border-ink-200 text-sm outline-none focus:border-brand-500" />
                </div>
                <Button onClick={() => dispatch(pushToast('Password updated.', 'success'))}>Update Password</Button>
              </CardBody>
            </Card>
          </TabPanel>

          <TabPanel>
            <Card>
              <CardHeader><h3 className="text-sm font-semibold">Notification Preferences</h3></CardHeader>
              <CardBody className="space-y-4">
                <label className="flex items-center justify-between cursor-pointer">
                  <div><p className="text-sm font-medium text-ink-700">Email notifications</p><p className="text-xs text-ink-400">Receive memo and approval updates via email.</p></div>
                  <input type="checkbox" checked={emailNotif} onChange={(e) => setEmailNotif(e.target.checked)} className="rounded border-ink-300 text-brand-700 size-4" />
                </label>
                <label className="flex items-center justify-between cursor-pointer">
                  <div><p className="text-sm font-medium text-ink-700">Push / in-app notifications</p><p className="text-xs text-ink-400">Show notification badge and alerts in the app.</p></div>
                  <input type="checkbox" checked={pushNotif} onChange={(e) => setPushNotif(e.target.checked)} className="rounded border-ink-300 text-brand-700 size-4" />
                </label>
                <Button onClick={() => dispatch(pushToast('Notification preferences saved.', 'success'))}>Save Preferences</Button>
              </CardBody>
            </Card>
          </TabPanel>
        </TabPanels>
      </TabGroup>
    </div>
  );
}
