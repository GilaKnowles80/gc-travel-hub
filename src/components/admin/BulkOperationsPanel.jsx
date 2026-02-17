import React, { useState } from 'react';
import { base44 } from '@/api/base44Client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Upload, Zap, CheckCircle, AlertCircle, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function BulkOperationsPanel() {
  const [processing, setProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState(null);
  const [operationType, setOperationType] = useState('bookings');
  const [batchSize, setBatchSize] = useState(100);

  const handleBulkUpload = async (file) => {
    setProcessing(true);
    setProgress(0);
    setResults(null);

    try {
      // Upload file
      const { data: uploadData } = await base44.integrations.Core.UploadFile({ file });
      setProgress(20);

      // Fetch file content
      const response = await fetch(uploadData.file_url);
      const content = await response.text();
      setProgress(40);

      let records = [];
      if (file.name.endsWith('.json')) {
        records = JSON.parse(content);
      } else if (file.name.endsWith('.csv')) {
        const lines = content.split('\n');
        const headers = lines[0].split(',').map(h => h.trim());
        for (let i = 1; i < lines.length; i++) {
          if (!lines[i].trim()) continue;
          const values = lines[i].split(',').map(v => v.trim());
          const record = {};
          headers.forEach((header, idx) => {
            record[header] = values[idx];
          });
          records.push(record);
        }
      }
      setProgress(60);

      // Process in batches
      const { data } = await base44.functions.invoke('bulkBookingProcessor', {
        bookings: records,
        bookingType: operationType,
        chunkSize: batchSize
      });
      setProgress(100);

      setResults(data.results);
      toast.success(`Processed ${data.results.processed} records successfully!`);
    } catch (error) {
      console.error('Bulk upload error:', error);
      toast.error('Bulk upload failed: ' + error.message);
    } finally {
      setProcessing(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="w-5 h-5 text-amber-500" />
          Bulk Operations Manager
        </CardTitle>
        <p className="text-sm text-slate-600">Process large volumes efficiently with batching and queuing</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <Label>Operation Type</Label>
            <Select value={operationType} onValueChange={setOperationType}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="flight">Flight Bookings</SelectItem>
                <SelectItem value="hotel">Hotel Bookings</SelectItem>
                <SelectItem value="tour">Tour Bookings</SelectItem>
                <SelectItem value="bulk">Bulk Corporate Bookings</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label>Batch Size</Label>
            <Input
              type="number"
              value={batchSize}
              onChange={(e) => setBatchSize(parseInt(e.target.value))}
              min="10"
              max="500"
            />
          </div>
        </div>

        <div>
          <Label>Upload File (CSV or JSON)</Label>
          <Input
            type="file"
            accept=".csv,.json"
            onChange={(e) => {
              if (e.target.files[0]) {
                handleBulkUpload(e.target.files[0]);
              }
            }}
            disabled={processing}
          />
        </div>

        {processing && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-600">Processing...</span>
              <span className="font-medium">{progress}%</span>
            </div>
            <Progress value={progress} />
          </div>
        )}

        {results && (
          <div className="bg-slate-50 rounded-lg p-4 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Total Records:</span>
              <Badge variant="outline">{results.totalBookings}</Badge>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600 flex items-center gap-1">
                <CheckCircle className="w-4 h-4 text-green-600" />
                Processed:
              </span>
              <Badge className="bg-green-100 text-green-700">{results.processed}</Badge>
            </div>
            {results.failed > 0 && (
              <div className="flex items-center justify-between">
                <span className="text-sm text-slate-600 flex items-center gap-1">
                  <AlertCircle className="w-4 h-4 text-red-600" />
                  Failed:
                </span>
                <Badge className="bg-red-100 text-red-700">{results.failed}</Badge>
              </div>
            )}
            <div className="flex items-center justify-between">
              <span className="text-sm text-slate-600">Chunks Processed:</span>
              <Badge variant="outline">{results.totalChunks}</Badge>
            </div>
          </div>
        )}

        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-xs space-y-1">
          <p className="font-semibold text-blue-900">Performance Optimizations:</p>
          <ul className="list-disc pl-4 text-blue-700 space-y-0.5">
            <li>Batch processing prevents database congestion</li>
            <li>Queue system handles large volumes efficiently</li>
            <li>Automatic retry on failures</li>
            <li>Rate limiting prevents system overload</li>
          </ul>
        </div>
      </CardContent>
    </Card>
  );
}