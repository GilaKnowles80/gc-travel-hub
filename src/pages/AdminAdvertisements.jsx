import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Eye, EyeOff, TrendingUp, MousePointer } from 'lucide-react';
import moment from 'moment';

export default function AdminAdvertisements() {
  const [showDialog, setShowDialog] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const queryClient = useQueryClient();

  const { data: ads = [] } = useQuery({
    queryKey: ['admin-ads'],
    queryFn: () => base44.entities.Advertisement.list('-created_date')
  });

  const createMutation = useMutation({
    mutationFn: (data) => base44.entities.Advertisement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-ads']);
      setShowDialog(false);
      setEditingAd(null);
    }
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Advertisement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-ads']);
      setShowDialog(false);
      setEditingAd(null);
    }
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => base44.entities.Advertisement.delete(id),
    onSuccess: () => queryClient.invalidateQueries(['admin-ads'])
  });

  const toggleActiveMutation = useMutation({
    mutationFn: ({ id, is_active }) => base44.entities.Advertisement.update(id, { is_active }),
    onSuccess: () => queryClient.invalidateQueries(['admin-ads'])
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const data = {
      title: formData.get('title'),
      description: formData.get('description'),
      ad_type: formData.get('ad_type'),
      placement: formData.get('placement'),
      target_pages: formData.getAll('target_pages'),
      image_url: formData.get('image_url'),
      link_url: formData.get('link_url'),
      link_text: formData.get('link_text'),
      background_color: formData.get('background_color'),
      text_color: formData.get('text_color'),
      external_code: formData.get('external_code'),
      priority: parseInt(formData.get('priority')) || 0,
      start_date: formData.get('start_date') || null,
      end_date: formData.get('end_date') || null,
      is_active: true
    };

    if (editingAd) {
      updateMutation.mutate({ id: editingAd.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const calculateCTR = (ad) => {
    if (ad.impressions === 0) return 0;
    return ((ad.clicks / ad.impressions) * 100).toFixed(2);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Advertisement Management</h1>
          <p className="text-slate-600">Manage promotional banners and external ads</p>
        </div>
        <Button onClick={() => { setEditingAd(null); setShowDialog(true); }} className="bg-amber-600">
          <Plus className="w-4 h-4 mr-2" />
          Create Ad
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Ads</p>
                <p className="text-3xl font-bold">{ads.length}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-amber-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Impressions</p>
                <p className="text-3xl font-bold">{ads.reduce((sum, ad) => sum + (ad.impressions || 0), 0).toLocaleString()}</p>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Clicks</p>
                <p className="text-3xl font-bold">{ads.reduce((sum, ad) => sum + (ad.clicks || 0), 0).toLocaleString()}</p>
              </div>
              <MousePointer className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4">
        {ads.map((ad) => (
          <Card key={ad.id} className={!ad.is_active ? 'opacity-60' : ''}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-bold">{ad.title}</h3>
                    <Badge variant={ad.ad_type === 'internal_promotion' ? 'default' : 'secondary'}>
                      {ad.ad_type === 'internal_promotion' ? 'Internal' : 'External'}
                    </Badge>
                    <Badge variant="outline">{ad.placement}</Badge>
                    {!ad.is_active && <Badge variant="destructive">Inactive</Badge>}
                  </div>

                  {ad.description && <p className="text-sm text-slate-600 mb-2">{ad.description}</p>}

                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-3">
                    <span>Pages: {ad.target_pages.join(', ')}</span>
                    <span>Priority: {ad.priority}</span>
                    {ad.start_date && <span>Start: {moment(ad.start_date).format('MMM DD, YYYY')}</span>}
                    {ad.end_date && <span>End: {moment(ad.end_date).format('MMM DD, YYYY')}</span>}
                  </div>

                  <div className="flex items-center gap-6 text-sm">
                    <div>
                      <span className="text-slate-600">Impressions:</span>
                      <span className="ml-2 font-bold">{ad.impressions || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">Clicks:</span>
                      <span className="ml-2 font-bold">{ad.clicks || 0}</span>
                    </div>
                    <div>
                      <span className="text-slate-600">CTR:</span>
                      <span className="ml-2 font-bold">{calculateCTR(ad)}%</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleActiveMutation.mutate({ id: ad.id, is_active: !ad.is_active })}
                  >
                    {ad.is_active ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => { setEditingAd(ad); setShowDialog(true); }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => confirm('Delete this ad?') && deleteMutation.mutate(ad.id)}
                  >
                    <Trash2 className="w-4 h-4 text-red-600" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingAd ? 'Edit Advertisement' : 'Create Advertisement'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label>Title *</Label>
              <Input name="title" defaultValue={editingAd?.title} required />
            </div>

            <div>
              <Label>Description</Label>
              <Textarea name="description" defaultValue={editingAd?.description} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Ad Type *</Label>
                <Select name="ad_type" defaultValue={editingAd?.ad_type || 'internal_promotion'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="internal_promotion">Internal Promotion</SelectItem>
                    <SelectItem value="external_ad">External Ad</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Placement *</Label>
                <Select name="placement" defaultValue={editingAd?.placement || 'banner_top'}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="banner_top">Banner Top</SelectItem>
                    <SelectItem value="banner_bottom">Banner Bottom</SelectItem>
                    <SelectItem value="sidebar">Sidebar</SelectItem>
                    <SelectItem value="inline">Inline</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label>Target Pages *</Label>
              <div className="grid grid-cols-3 gap-2 mt-2">
                {['all', 'home', 'flights', 'hotels', 'tours', 'bookings'].map(page => (
                  <label key={page} className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      name="target_pages" 
                      value={page}
                      defaultChecked={editingAd?.target_pages?.includes(page) || page === 'all'}
                    />
                    <span className="text-sm capitalize">{page}</span>
                  </label>
                ))}
              </div>
            </div>

            <div>
              <Label>Image URL</Label>
              <Input name="image_url" defaultValue={editingAd?.image_url} placeholder="https://..." />
            </div>

            <div>
              <Label>Link URL</Label>
              <Input name="link_url" defaultValue={editingAd?.link_url} placeholder="/flights or https://..." />
            </div>

            <div>
              <Label>Link Button Text</Label>
              <Input name="link_text" defaultValue={editingAd?.link_text} placeholder="Book Now" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label>Background Color</Label>
                <Input name="background_color" type="color" defaultValue={editingAd?.background_color || '#f59e0b'} />
              </div>

              <div>
                <Label>Text Color</Label>
                <Input name="text_color" type="color" defaultValue={editingAd?.text_color || '#ffffff'} />
              </div>
            </div>

            <div>
              <Label>External Ad Code (HTML/JavaScript)</Label>
              <Textarea name="external_code" defaultValue={editingAd?.external_code} rows={4} placeholder="<script>...</script>" />
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label>Priority</Label>
                <Input name="priority" type="number" defaultValue={editingAd?.priority || 0} />
              </div>

              <div>
                <Label>Start Date</Label>
                <Input name="start_date" type="datetime-local" defaultValue={editingAd?.start_date?.slice(0, 16)} />
              </div>

              <div>
                <Label>End Date</Label>
                <Input name="end_date" type="datetime-local" defaultValue={editingAd?.end_date?.slice(0, 16)} />
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit" className="bg-amber-600">
                {editingAd ? 'Update' : 'Create'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}