import React, { useState, useCallback } from 'react';
import type { ClubConfig, ClubTheme, TournamentTemplate, BlindLevel } from '@/types';
import { getAllClubs, saveClub, deleteClub, generateClubId, saveTournamentTemplate, deleteTournamentTemplate, generateTemplateId } from '@/config/clubs';
import { BLIND_PRESETS } from '@/config/presets';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
// Tournament template management for clubs
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useNavigate } from 'react-router-dom';

const defaultTheme: ClubTheme = {
  primaryColor: '#fbbf24',
  primaryGlow: 'rgba(251, 191, 36, 0.35)',
  accentColor: '#10b981',
  accentGlow: 'rgba(16, 185, 129, 0.3)',
  dangerColor: '#ef4444',
  dangerGlow: 'rgba(239, 68, 68, 0.3)',
  bgGradient: 'radial-gradient(circle at 50% 30%, #1e1b4b 0%, #070a13 75%)',
};

const AdminPage: React.FC = () => {
  const navigate = useNavigate();
  const [clubs, setClubs] = useState<ClubConfig[]>(getAllClubs());
  const [editingClub, setEditingClub] = useState<ClubConfig | null>(null);
  const [selectedClubId, setSelectedClubId] = useState<string>('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [clubToDelete, setClubToDelete] = useState<string | null>(null);
  const [copySuccess, setCopySuccess] = useState<string | null>(null);
  
  // 赛事模板管理状态
  const [isTemplateDialogOpen, setIsTemplateDialogOpen] = useState(false);
  const [isDeleteTemplateDialogOpen, setIsDeleteTemplateDialogOpen] = useState(false);
  const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
  const [editingTemplate, setEditingTemplate] = useState<TournamentTemplate | null>(null);
  const [templateLevelsText, setTemplateLevelsText] = useState('');

  const refresh = useCallback(() => setClubs(getAllClubs()), []);

  const handleNew = () => {
    const now = new Date().toISOString();
    setEditingClub({
      id: '',
      name: '',
      logoEmoji: '\u2660',
      theme: { ...defaultTheme },
      defaultBlindStructure: JSON.parse(JSON.stringify(BLIND_PRESETS[0].levels)),
      defaultStats: { entries: 10, playersLeft: 10, startingChips: 10000 },
      footer: { authorName: '', contact: '', copyright: '' },
      defaultSettings: { audioAlert: true, voiceAlert: true },
      tournamentTemplates: [],
      createdAt: now,
      updatedAt: now,
    });
    setSelectedClubId('');
    setIsDialogOpen(true);
  };

  const handleEdit = (club: ClubConfig) => {
    setEditingClub(JSON.parse(JSON.stringify(club)));
    setSelectedClubId(club.id);
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setClubToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (clubToDelete) {
      deleteClub(clubToDelete);
      refresh();
    }
    setIsDeleteDialogOpen(false);
    setClubToDelete(null);
  };

  const handleSave = () => {
    if (!editingClub) return;
    if (!editingClub.name.trim()) {
      alert('请输入俱乐部名称');
      return;
    }
    const clubToSave = { ...editingClub };
    if (!clubToSave.id) {
      clubToSave.id = generateClubId(clubToSave.name);
    }
    saveClub(clubToSave);
    refresh();
    setIsDialogOpen(false);
    setEditingClub(null);
  };

  const getClubUrl = (id: string) => {
    const base = window.location.origin + window.location.pathname;
    return `${base}?club=${id}`;
  };

  const copyUrl = async (id: string) => {
    try {
      await navigator.clipboard.writeText(getClubUrl(id));
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(null), 2000);
    } catch {
      const input = document.createElement('input');
      input.value = getClubUrl(id);
      document.body.appendChild(input);
      input.select();
      document.execCommand('copy');
      document.body.removeChild(input);
      setCopySuccess(id);
      setTimeout(() => setCopySuccess(null), 2000);
    }
  };

  const updateEditing = (updates: Partial<ClubConfig>) => {
    setEditingClub(prev => prev ? { ...prev, ...updates } : prev);
  };

  const updateTheme = (updates: Partial<ClubTheme>) => {
    setEditingClub(prev => prev ? { ...prev, theme: { ...prev.theme, ...updates } } : prev);
  };

  // ============ 赛事模板管理 ============
  const handleNewTemplate = () => {
    const now = new Date().toISOString();
    setEditingTemplate({
      id: '',
      name: '',
      description: '',
      levels: JSON.parse(JSON.stringify(BLIND_PRESETS[0].levels)),
      createdAt: now,
      updatedAt: now,
    });
    setTemplateLevelsText(levelsToText(BLIND_PRESETS[0].levels));
    setIsTemplateDialogOpen(true);
  };

  const handleEditTemplate = (template: TournamentTemplate) => {
    setEditingTemplate(JSON.parse(JSON.stringify(template)));
    setTemplateLevelsText(levelsToText(template.levels));
    setIsTemplateDialogOpen(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    setTemplateToDelete(templateId);
    setIsDeleteTemplateDialogOpen(true);
  };

  const confirmDeleteTemplate = () => {
    if (templateToDelete && selectedClubId) {
      deleteTournamentTemplate(selectedClubId, templateToDelete);
      refresh();
    }
    setIsDeleteTemplateDialogOpen(false);
    setTemplateToDelete(null);
  };

  const handleSaveTemplate = () => {
    if (!editingTemplate || !selectedClubId) return;
    if (!editingTemplate.name.trim()) {
      alert('请输入赛事名称');
      return;
    }
    
    // 解析盲注结构文本
    const parsedLevels = textToLevels(templateLevelsText);
    if (!parsedLevels || parsedLevels.length === 0) {
      alert('盲注结构格式错误，请检查输入');
      return;
    }
    
    const templateToSave = { 
      ...editingTemplate, 
      levels: parsedLevels 
    };
    if (!templateToSave.id) {
      templateToSave.id = generateTemplateId(templateToSave.name);
    }
    
    saveTournamentTemplate(selectedClubId, templateToSave);
    refresh();
    setIsTemplateDialogOpen(false);
    setEditingTemplate(null);
  };

  const loadPresetToTemplate = (presetId: string) => {
    const preset = BLIND_PRESETS.find(p => p.id === presetId);
    if (!preset) return;
    setTemplateLevelsText(levelsToText(preset.levels));
  };

  // 盲注结构文本转换工具
  const levelsToText = (levels: BlindLevel[]): string => {
    return levels.map((l, i) => {
      if (l.isBreak) {
        return `${i + 1}\t休息\t0\t0\t0\t${l.duration}`;
      }
      return `${i + 1}\t${l.sb}\t${l.bb}\t${l.ante}\t${l.duration}`;
    }).join('\n');
  };

  const textToLevels = (text: string): BlindLevel[] | null => {
    const lines = text.trim().split('\n').filter(l => l.trim());
    const levels: BlindLevel[] = [];
    let realLevelNum = 0;
    
    for (const line of lines) {
      const parts = line.split(/[\t,\s]+/).filter(p => p.trim());
      if (parts.length < 6) continue;
      
      const isBreak = parts[1] === '休息' || parts[1].toLowerCase() === 'break';
      if (isBreak) {
        levels.push({
          id: '休息',
          sb: 0,
          bb: 0,
          ante: 0,
          duration: parseInt(parts[5]) || 10,
          isBreak: true,
        });
      } else {
        realLevelNum++;
        levels.push({
          id: realLevelNum,
          sb: parseInt(parts[1]) || 100,
          bb: parseInt(parts[2]) || 200,
          ante: parseInt(parts[3]) || 0,
          duration: parseInt(parts[4]) || 15,
          isBreak: false,
        });
      }
    }
    return levels.length > 0 ? levels : null;
  };

  const currentClubForTemplates = clubs.find(c => c.id === selectedClubId);

  return (
    <div className="min-h-screen p-4 md:p-8" style={{ background: '#070a13', color: '#f8fafc' }}>
      <div className="max-w-6xl mx-auto">
        {/* 头部 */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <span className="text-3xl">⚙️</span>
              撒巴客户管理后台
            </h1>
            <p className="text-sm mt-1" style={{ color: 'var(--text-muted)' }}>
              管理您的德州扑克计时器客户，每个客户拥有独立的定制配置和访问链接。
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => navigate('/')} style={{ border: '1px solid var(--border-color)' }}>
              ⏮ 返回计时器
            </Button>
            <Button onClick={handleNew} style={{ background: '#fbbf24', color: '#000' }}>
              + 新增客户
            </Button>
          </div>
        </div>

        {/* 客户列表 */}
        <div
          className="rounded-2xl overflow-hidden mb-8"
          style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}
        >
          <Table>
            <TableHeader>
              <TableRow style={{ background: '#0f172a', borderBottom: '1px solid var(--border-color)' }}>
                <TableHead className="text-white font-semibold">ID</TableHead>
                <TableHead className="text-white font-semibold">俱乐部名称</TableHead>
                <TableHead className="text-white font-semibold">Logo</TableHead>
                <TableHead className="text-white font-semibold">主题色</TableHead>
                <TableHead className="text-white font-semibold">赛事模板</TableHead>
                <TableHead className="text-white font-semibold text-right">操作</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clubs.map(club => (
                <TableRow 
                  key={club.id} 
                  className={selectedClubId === club.id ? 'bg-white/5' : ''}
                  style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', cursor: 'pointer' }}
                  onClick={() => setSelectedClubId(club.id)}
                >
                  <TableCell className="font-mono text-xs" style={{ color: 'var(--text-muted)' }}>
                    {club.id}
                  </TableCell>
                  <TableCell className="font-semibold">{club.name}</TableCell>
                  <TableCell className="text-xl">{club.logoEmoji}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span
                        className="w-4 h-4 rounded-full inline-block"
                        style={{ background: club.theme.primaryColor, boxShadow: `0 0 8px ${club.theme.primaryGlow}` }}
                      />
                      <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{club.theme.primaryColor}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="text-xs px-2 py-1 rounded-full" style={{ background: 'rgba(251,191,36,0.15)', color: '#fbbf24' }}>
                      {club.tournamentTemplates?.length || 0} 个模板
                    </span>
                  </TableCell>
                  <TableCell className="text-right" onClick={e => e.stopPropagation()}>
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => copyUrl(club.id)}
                      >
                        {copySuccess === club.id ? '✅ 已复制' : '📋 复制链接'}
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => window.open(getClubUrl(club.id), '_blank')}
                      >
                        🔗 访问
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8"
                        onClick={() => handleEdit(club)}
                      >
                        ✏️ 编辑
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="text-xs h-8 text-red-400 hover:text-red-300"
                        onClick={() => handleDelete(club.id)}
                      >
                        🗑️ 删除
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {clubs.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-12" style={{ color: 'var(--text-muted)' }}>
                    暂无客户，点击「+ 新增客户」开始创建。
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        {/* 赛事模板管理区域 */}
        {selectedClubId && currentClubForTemplates && (
          <div className="rounded-2xl p-6 mb-8" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold flex items-center gap-2">
                  🏆 {currentClubForTemplates.name} - 赛事模板管理
                </h2>
                <p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
                  为该俱乐部创建不同赛事的盲注结构模板，前台可直接选用
                </p>
              </div>
              <Button onClick={handleNewTemplate} style={{ background: '#fbbf24', color: '#000' }}>
                + 新建赛事模板
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {(currentClubForTemplates.tournamentTemplates || []).map(template => (
                <div
                  key={template.id}
                  className="rounded-xl p-4 transition-all hover:border-yellow-500/30"
                  style={{ background: 'var(--bg-card)', border: '1px solid var(--border-color)' }}
                >
                  <div className="flex justify-between items-start mb-2">
                    <h3 className="font-semibold text-sm">{template.name}</h3>
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ background: 'rgba(16,185,129,0.15)', color: '#10b981' }}>
                      {template.levels.length} 级
                    </span>
                  </div>
                  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>{template.description}</p>
                  <div className="text-xs mb-3" style={{ color: 'var(--text-dim)' }}>
                    盲注范围: {template.levels[0]?.sb || 0}/{template.levels[0]?.bb || 0} → {(() => {
                      const lastReal = [...template.levels].reverse().find(l => !l.isBreak);
                      return lastReal ? `${lastReal.sb}/${lastReal.bb}` : 'N/A';
                    })()}
                  </div>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="flex-1 text-xs h-8"
                      onClick={() => handleEditTemplate(template)}
                    >
                      ✏️ 编辑
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-xs h-8 text-red-400"
                      onClick={() => handleDeleteTemplate(template.id)}
                    >
                      🗑️ 删除
                    </Button>
                  </div>
                </div>
              ))}
              
              {(currentClubForTemplates.tournamentTemplates || []).length === 0 && (
                <div className="col-span-full text-center py-12 rounded-xl" style={{ background: 'var(--bg-card)', border: '1px dashed var(--border-color)' }}>
                  <p style={{ color: 'var(--text-muted)' }}>暂无赛事模板，点击「+ 新建赛事模板」创建</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* 使用说明 */}
        <div className="p-6 rounded-2xl" style={{ background: 'var(--bg-panel)', border: '1px solid var(--border-color)' }}>
          <h2 className="text-lg font-bold mb-3">使用说明</h2>
          <div className="space-y-2 text-sm" style={{ color: 'var(--text-muted)' }}>
            <p>1. <strong className="text-white">创建客户</strong>：点击「+ 新增客户」，填写俱乐部信息，保存后自动生成独立的访问链接。</p>
            <p>2. <strong className="text-white">管理赛事模板</strong>：点击客户行选中，在下方「赛事模板管理」区域为该俱乐部创建不同的赛事盲注结构（如周一常规赛、周三快速赛等）。</p>
            <p>3. <strong className="text-white">分发链接</strong>：点击「复制链接」按钮，将客户专属链接发给对应的俱乐部。每个链接都是独立的，包含该俱乐部的所有定制配置。</p>
            <p>4. <strong className="text-white">前台选用模板</strong>：俱乐部打开自己的链接后，在盲注编辑区域可以直接选用预设的赛事模板，也可以在此基础上微调。</p>
            <p>5. <strong className="text-white">数据隔离</strong>：每个客户的计时数据（剩余时间、级别、筹码统计等）都独立存储，互不干扰。</p>
          </div>
        </div>
      </div>

      {/* ============ 编辑/创建客户弹窗 ============ */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent
          className="sm:max-w-2xl max-h-[90vh] overflow-y-auto"
          style={{ background: '#0f172a', border: '1px solid var(--border-color)', color: '#f8fafc' }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              {editingClub?.id ? '编辑客户' : '新建客户'}
            </DialogTitle>
          </DialogHeader>

          {editingClub && (
            <div className="space-y-6 py-4">
              {/* 基本信息 */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>基本信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>俱乐部名称 *</Label>
                    <Input
                      value={editingClub.name}
                      onChange={e => updateEditing({ name: e.target.value })}
                      placeholder="例如：3 Bet Poker Club"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>Logo 符号</Label>
                    <Input
                      value={editingClub.logoEmoji}
                      onChange={e => updateEditing({ logoEmoji: e.target.value })}
                      placeholder="例如：♣"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
                    />
                  </div>
                </div>
              </div>

              {/* 主题设置 */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>主题配色</h3>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>主色</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editingClub.theme.primaryColor}
                        onChange={e => updateTheme({ primaryColor: e.target.value, primaryGlow: e.target.value + '59' })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input value={editingClub.theme.primaryColor} readOnly className="flex-1 text-xs" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>强调色</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editingClub.theme.accentColor}
                        onChange={e => updateTheme({ accentColor: e.target.value, accentGlow: e.target.value + '59' })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input value={editingClub.theme.accentColor} className="flex-1 text-xs" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>危险色</Label>
                    <div className="flex gap-2">
                      <input
                        type="color"
                        value={editingClub.theme.dangerColor}
                        onChange={e => updateTheme({ dangerColor: e.target.value, dangerGlow: e.target.value + '59' })}
                        className="w-10 h-10 rounded cursor-pointer"
                      />
                      <Input value={editingClub.theme.dangerColor} className="flex-1 text-xs" style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }} />
                    </div>
                  </div>
                </div>
              </div>

              {/* 默认统计 */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>默认筹码设置</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>总买入人次</Label>
                    <Input
                      type="number"
                      value={editingClub.defaultStats.entries}
                      onChange={e => updateEditing({ defaultStats: { ...editingClub.defaultStats, entries: parseInt(e.target.value) || 1 } })}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>剩余人数</Label>
                    <Input
                      type="number"
                      value={editingClub.defaultStats.playersLeft}
                      onChange={e => updateEditing({ defaultStats: { ...editingClub.defaultStats, playersLeft: parseInt(e.target.value) || 1 } })}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>初始筹码</Label>
                    <Input
                      type="number"
                      value={editingClub.defaultStats.startingChips}
                      onChange={e => updateEditing({ defaultStats: { ...editingClub.defaultStats, startingChips: parseInt(e.target.value) || 1 } })}
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
                    />
                  </div>
                </div>
              </div>

              {/* 底部信息 */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>底部版权信息</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>作者名称</Label>
                    <Input
                      value={editingClub.footer.authorName}
                      onChange={e => updateEditing({ footer: { ...editingClub.footer, authorName: e.target.value } })}
                      placeholder="例如：eden.deng"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>联系方式</Label>
                    <Input
                      value={editingClub.footer.contact}
                      onChange={e => updateEditing({ footer: { ...editingClub.footer, contact: e.target.value } })}
                      placeholder="例如：Tel: 123-4567-8900"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
                    />
                  </div>
                  <div>
                    <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>版权声明</Label>
                    <Input
                      value={editingClub.footer.copyright}
                      onChange={e => updateEditing({ footer: { ...editingClub.footer, copyright: e.target.value } })}
                      placeholder="例如：© 2026 Club Name"
                      style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
                    />
                  </div>
                </div>
              </div>

              {/* 默认设置 */}
              <div className="space-y-4">
                <h3 className="text-sm font-bold" style={{ color: 'var(--color-gold)' }}>默认开关</h3>
                <div className="flex gap-8">
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={editingClub.defaultSettings.audioAlert}
                      onCheckedChange={v => updateEditing({ defaultSettings: { ...editingClub.defaultSettings, audioAlert: v } })}
                    />
                    <Label className="text-sm" style={{ color: 'var(--text-muted)' }}>电子升盲警报声</Label>
                  </div>
                  <div className="flex items-center gap-3">
                    <Switch
                      checked={editingClub.defaultSettings.voiceAlert}
                      onCheckedChange={v => updateEditing({ defaultSettings: { ...editingClub.defaultSettings, voiceAlert: v } })}
                    />
                    <Label className="text-sm" style={{ color: 'var(--text-muted)' }}>中文语音升盲播报</Label>
                  </div>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsDialogOpen(false); setEditingClub(null); }}>取消</Button>
            <Button style={{ background: '#fbbf24', color: '#000' }} onClick={handleSave}>保存</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ 赛事模板编辑弹窗 ============ */}
      <Dialog open={isTemplateDialogOpen} onOpenChange={setIsTemplateDialogOpen}>
        <DialogContent
          className="sm:max-w-3xl max-h-[90vh] overflow-y-auto"
          style={{ background: '#0f172a', border: '1px solid var(--border-color)', color: '#f8fafc' }}
        >
          <DialogHeader>
            <DialogTitle className="text-xl text-white">
              {editingTemplate?.id ? '编辑赛事模板' : '新建赛事模板'}
            </DialogTitle>
          </DialogHeader>

          {editingTemplate && (
            <div className="space-y-5 py-4">
              {/* 基本信息 */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>赛事名称 *</Label>
                  <Input
                    value={editingTemplate.name}
                    onChange={e => setEditingTemplate(prev => prev ? { ...prev, name: e.target.value } : prev)}
                    placeholder="例如：周一常规赛"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
                  />
                </div>
                <div>
                  <Label className="text-xs mb-1 block" style={{ color: 'var(--text-muted)' }}>描述</Label>
                  <Input
                    value={editingTemplate.description}
                    onChange={e => setEditingTemplate(prev => prev ? { ...prev, description: e.target.value } : prev)}
                    placeholder="例如：15分钟/级，标准MTT结构"
                    style={{ background: 'rgba(0,0,0,0.3)', border: '1px solid var(--border-color)', color: 'white' }}
                  />
                </div>
              </div>

              {/* 加载预设 */}
              <div>
                <Label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)' }}>快速加载预设</Label>
                <div className="flex gap-2 flex-wrap">
                  {BLIND_PRESETS.map(preset => (
                    <Button
                      key={preset.id}
                      variant="outline"
                      size="sm"
                      className="text-xs"
                      onClick={() => loadPresetToTemplate(preset.id)}
                      style={{ border: '1px solid var(--border-color)' }}
                    >
                      📁 {preset.name}
                    </Button>
                  ))}
                </div>
              </div>

              {/* 盲注结构编辑 */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <Label className="text-xs block" style={{ color: 'var(--text-muted)' }}>
                    盲注结构（格式：序号 [Tab] 小盲 [Tab] 大盲 [Tab] 前注 [Tab] 时长分钟）
                  </Label>
                  <span className="text-xs" style={{ color: 'var(--text-dim)' }}>
                    用「休息」代替小盲表示休息级别
                  </span>
                </div>
                <textarea
                  value={templateLevelsText}
                  onChange={e => setTemplateLevelsText(e.target.value)}
                  className="w-full h-64 rounded-lg p-3 text-sm font-mono resize-y"
                  style={{ 
                    background: 'rgba(0,0,0,0.3)', 
                    border: '1px solid var(--border-color)', 
                    color: 'white',
                    lineHeight: '1.8'
                  }}
                  placeholder={`1	100	200	0	15
2	200	400	0	15
3	400	800	0	15
4	休息	0	0	0	10
5	600	1200	0	15`}
                />
              </div>

              {/* 预览 */}
              <div>
                <Label className="text-xs mb-2 block" style={{ color: 'var(--text-muted)' }}>预览</Label>
                <div className="rounded-lg overflow-auto max-h-40" style={{ border: '1px solid var(--border-color)' }}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr style={{ background: '#0f172a' }}>
                        <th className="py-1 px-2 text-left">级</th>
                        <th className="py-1 px-2 text-left">小盲</th>
                        <th className="py-1 px-2 text-left">大盲</th>
                        <th className="py-1 px-2 text-left">前注</th>
                        <th className="py-1 px-2 text-left">时长</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const levels = textToLevels(templateLevelsText);
                        if (!levels) return <tr><td colSpan={5} className="py-2 px-2 text-center" style={{ color: 'var(--text-muted)' }}>格式错误，无法解析</td></tr>;
                        return levels.map((l, i) => (
                          <tr key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)', background: l.isBreak ? 'rgba(16,185,129,0.05)' : 'transparent' }}>
                            <td className="py-1 px-2" style={{ color: l.isBreak ? '#10b981' : 'inherit' }}>{l.id}</td>
                            <td className="py-1 px-2">{l.sb}</td>
                            <td className="py-1 px-2">{l.bb}</td>
                            <td className="py-1 px-2">{l.ante}</td>
                            <td className="py-1 px-2">{l.duration}min</td>
                          </tr>
                        ));
                      })()}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => { setIsTemplateDialogOpen(false); setEditingTemplate(null); }}>取消</Button>
            <Button style={{ background: '#fbbf24', color: '#000' }} onClick={handleSaveTemplate}>保存模板</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ 删除客户确认 ============ */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent style={{ background: '#0f172a', border: '1px solid var(--border-color)', color: '#f8fafc' }}>
          <DialogHeader>
            <DialogTitle className="text-white">⚠️ 确认删除</DialogTitle>
          </DialogHeader>
          <p className="text-sm py-2" style={{ color: 'var(--text-muted)' }}>
            删除后该客户的配置和计时数据将无法恢复，确定继续吗？
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)}>取消</Button>
            <Button style={{ background: '#ef4444', color: '#fff' }} onClick={confirmDelete}>确定删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ============ 删除赛事模板确认 ============ */}
      <Dialog open={isDeleteTemplateDialogOpen} onOpenChange={setIsDeleteTemplateDialogOpen}>
        <DialogContent style={{ background: '#0f172a', border: '1px solid var(--border-color)', color: '#f8fafc' }}>
          <DialogHeader>
            <DialogTitle className="text-white">⚠️ 确认删除赛事模板</DialogTitle>
          </DialogHeader>
          <p className="text-sm py-2" style={{ color: 'var(--text-muted)' }}>
            删除后该赛事模板将无法恢复，确定继续吗？
          </p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteTemplateDialogOpen(false)}>取消</Button>
            <Button style={{ background: '#ef4444', color: '#fff' }} onClick={confirmDeleteTemplate}>确定删除</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AdminPage;
