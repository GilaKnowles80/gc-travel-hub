import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Plus, Edit, Trash2, ExternalLink, TrendingUp, Eye } from 'lucide-react';
import { toast } from 'react-hot-toast';
import moment from 'moment';

export default function AdminAds() {
  const [open, setOpen] = useState(false);
  const [editingAd, setEditingAd] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    ad_type: 'internal_banner',
    placement: 'sidebar',
    target_pages: [],
    banner_image_url: '',
    banner_link: '',
    banner_text: '',
    external_script: '',
    is_active: true,
    priority: 0,
    start_date: '',
    end_date: ''
  });

  const queryClient = useQueryClient();

  const { data: ads = [] } = useQuery({
    queryKey: ['all-advertisements'],
    queryFn: () => base44.entities.Advertisement.list('-priority'),
  });

  const createAdMutation = useMutation({
    mutationFn: (data) => base44.entities.Advertisement.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-advertisements']);
      setOpen(false);
      resetForm();
      toast.success('Advertisement created successfully');
    },
  });

  const updateAdMutation = useMutation({
    mutationFn: ({ id, data }) => base44.entities.Advertisement.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-advertisements']);
      setOpen(false);
      resetForm();
      toast.success('Advertisement updated successfully');
    },
  });

  const deleteAdMutation = useMutation({
    mutationFn: (id) => base44.entities.Advertisement.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries(['all-advertisements']);
      toast.success('Advertisement deleted successfully');
    },
  });

  const resetForm = () => {
    setFormData({
      title: '',
      ad_type: 'internal_banner',
      placement: 'sidebar',
      target_pages: [],
      banner_image_url: '',
      banner_link: '',
      banner_text: '',
      external_script: '',
      is_active: true,
      priority: 0,
      start_date: '',
      end_date: ''
    });
    setEditingAd(null);
  };

  const handleEdit = (ad) => {
    setEditingAd(ad);
    setFormData({
      title: ad.title,
      ad_type: ad.ad_type,
      placement: ad.placement,
      target_pages: ad.target_pages || [],
      banner_image_url: ad.banner_image_url || '',
      banner_link: ad.banner_link || '',
      banner_text: ad.banner_text || '',
      external_script: ad.external_script || '',
      is_active: ad.is_active,
      priority: ad.priority || 0,
      start_date: ad.start_date || '',
      end_date: ad.end_date || ''
    });
    setOpen(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingAd) {
      updateAdMutation.mutate({ id: editingAd.id, data: formData });
    } else {
      createAdMutation.mutate(formData);
    }
  };

  const handleTargetPagesChange = (value) => {
    const pages = value.split(',').map(p => p.trim()).filter(Boolean);
    setFormData({ ...formData, target_pages: pages });
  };

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-slate-900">Advertisement Management</h1>
          <p className="text-slate-600 mt-1">Manage promotional banners and external ads</p>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={resetForm} className="bg-gradient-to-r from-amber-500 to-orange-600">
              <Plus className="w-4 h-4 mr-2" />
              Create Ad
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingAd ? 'Edit Advertisement' : 'Create Advertisement'}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label>Title (for reference)</Label>
                <Input
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Ad Type</Label>
                  <Select value={formData.ad_type} onValueChange={(v) => setFormData({ ...formData, ad_type: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="internal_banner">Internal Banner</SelectItem>
                      <SelectItem value="external_script">External Script</SelectItem>
                      <SelectItem value="google_adsense">Google AdSense</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label>Placement</Label>
                  <Select value={formData.placement} onValueChange={(v) => setFormData({ ...formData, placement: v })}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top_banner">Top Banner</SelectItem>
                      <SelectItem value="sidebar">Sidebar</SelectItem>
                      <SelectItem value="in_content">In Content</SelectItem>
                      <SelectItem value="bottom_banner">Bottom Banner</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label>Target Pages (comma-separated, e.g. Flights,Hotels or "all")</Label>
                <Input
                  value={formData.target_pages.join(', ')}
                  onChange={(e) => handleTargetPagesChange(e.target.value)}
                  placeholder="Flights, Hotels, Tours, or leave empty for all pages"
                />
              </div>

              {(formData.ad_type === 'internal_banner') && (
                <>
                  <div>
                    <Label>Banner Image URL</Label>
                    <Input
                      type="url"
                      value={formData.banner_image_url}
                      onChange={(e) => setFormData({ ...formData, banner_image_url: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Banner Link</Label>
                    <Input
                      type="url"
                      value={formData.banner_link}
                      onChange={(e) => setFormData({ ...formData, banner_link: e.target.value })}
                    />
                  </div>
                  <div>
                    <Label>Banner Text/CTA</Label>
                    <Input
                      value={formData.banner_text}
                      onChange={(e) => setFormData({ ...formData, banner_text: e.target.value })}
                    />
                  </div>
                </>
              )}

              {(formData.ad_type === 'external_script' || formData.ad_type === 'google_adsense') && (
                <div>
                  <Label>External Ad Script</Label>
                  <Textarea
                    value={formData.external_script}
                    onChange={(e) => setFormData({ ...formData, external_script: e.target.value })}
                    rows={6}
                    placeholder="Paste your ad script code here (e.g., Google AdSense code)"
                  />
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Start Date (optional)</Label>
                  <Input
                    type="date"
                    value={formData.start_date}
                    onChange={(e) => setFormData({ ...formData, start_date: e.target.value })}
                  />
                </div>
                <div>
                  <Label>End Date (optional)</Label>
                  <Input
                    type="date"
                    value={formData.end_date}
                    onChange={(e) => setFormData({ ...formData, end_date: e.target.value })}
                  />
                </div>
              </div>

              <div>
                <Label>Priority (higher = shown first)</Label>
                <Input
                  type="number"
                  value={formData.priority}
                  onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })}
                />
              </div>

              <div className="flex items-center gap-2">
                <Switch
                  checked={formData.is_active}
                  onCheckedChange={(checked) => setFormData({ ...formData, is_active: checked })}
                />
                <Label>Active</Label>
              </div>

              <Button type="submit" className="w-full">
                {editingAd ? 'Update' : 'Create'} Advertisement
              </Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {ads.map((ad) => (
          <Card key={ad.id}>
            <CardContent className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-bold text-slate-900">{ad.title}</h3>
                    <Badge variant={ad.is_active ? 'default' : 'secondary'}>
                      {ad.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                    <Badge variant="outline">{ad.ad_type}</Badge>
                    <Badge variant="outline">{ad.placement}</Badge>
                  </div>

                  <div className="grid grid-cols-3 gap-4 mt-4 text-sm">
                    <div>
                      <div className="flex items-center gap-1 text-slate-500 mb-1">
                        <Eye className="w-4 h-4" />
                        <span>Impressions</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{ad.impression_count || 0}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-slate-500 mb-1">
                        <TrendingUp className="w-4 h-4" />
                        <span>Clicks</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">{ad.click_count || 0}</p>
                    </div>
                    <div>
                      <div className="flex items-center gap-1 text-slate-500 mb-1">
                        <span>CTR</span>
                      </div>
                      <p className="text-2xl font-bold text-slate-900">
                        {ad.impression_count > 0 
                          ? ((ad.click_count / ad.impression_count) * 100).toFixed(1)
                          : 0}%
                      </p>
                    </div>
                  </div>

                  {ad.target_pages?.length > 0 && (
                    <p className="text-sm text-slate-600 mt-2">
                      Pages: {ad.target_pages.join(', ')}
                    </p>
                  )}
                  {ad.start_date && (
                    <p className="text-xs text-slate-500 mt-1">
                      {moment(ad.start_date).format('MMM DD, YYYY')} - {ad.end_date ? moment(ad.end_date).format('MMM DD, YYYY') : 'No end date'}
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {ad.banner_link && (
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => window.open(ad.banner_link, '_blank')}
                    >
                      <ExternalLink className="w-4 h-4" />
                    </Button>
                  )}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleEdit(ad)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm('Delete this advertisement?')) {
                        deleteAdMutation.mutate(ad.id);
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}