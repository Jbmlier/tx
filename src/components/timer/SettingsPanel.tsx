import React from 'react';
import { Switch } from '@/components/ui/switch';

interface SettingsPanelProps {
  audioAlert: boolean;
  voiceAlert: boolean;
  onToggle: (key: 'audioAlert' | 'voiceAlert', value: boolean) => void;
}

const SettingItem: React.FC<{ label: string; icon: string; checked: boolean; onChange: () => void }> = ({
  label, icon, checked, onChange
}) => (
  <div
    className="rounded-xl px-4 py-3 flex justify-between items-center"
    style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
  >
    <span className="text-sm" style={{ color: 'var(--text-main)' }}>
      {icon} {label}
    </span>
    <Switch checked={checked} onCheckedChange={onChange} />
  </div>
);

const SettingsPanel: React.FC<SettingsPanelProps> = ({ audioAlert, voiceAlert, onToggle }) => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
      <SettingItem
        icon="🔊"
        label="电子升盲警报声"
        checked={audioAlert}
        onChange={() => onToggle('audioAlert', !audioAlert)}
      />
      <SettingItem
        icon="🗣️"
        label="中文语音升盲播报"
        checked={voiceAlert}
        onChange={() => onToggle('voiceAlert', !voiceAlert)}
      />
    </div>
  );
};

export default SettingsPanel;
