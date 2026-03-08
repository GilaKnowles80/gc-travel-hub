import React, { useState } from "react";
import { base44 } from "@/api/base44Client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Shield, Lock, Database, Download, Upload, AlertTriangle, CheckCircle2, Key } from "lucide-react";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";

export default function AdminSecurityCenter() {
  const [masterPassword, setMasterPassword] = useState("");
  const [isVerified, setIsVerified] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [backing, setBacking] = useState(false);
  const [restoring, setRestoring] = useState(false);
  const [restoreMode, setRestoreMode] = useState("merge");
  const [backupFile, setBackupFile] = useState(null);

  const handleVerifyPassword = async () => {
    if (!masterPassword) {
      toast.error("Please enter master password");
      return;
    }

    setVerifying(true);
    try {
      const { data } = await base44.functions.invoke('verifyAdminPassword', { password: masterPassword });
      
      if (data.success) {
        setIsVerified(true);
        toast.success("Access granted! You can now perform secure operations.");
      } else {
        toast.error("Invalid master password");
        setMasterPassword("");
      }
    } catch (error) {
      toast.error(error.message || "Verification failed");
    } finally {
      setVerifying(false);
    }
  };

  const handleCreateBackup = async () => {
    setBacking(true);
    try {
      const response = await base44.functions.invoke('createDatabaseBackup', { masterPassword });
      
      // Download the backup file
      const blob = new Blob([JSON.stringify(response.data, null, 2)], { type: 'application/json' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `gc-travel-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();

      toast.success("Database backup created and downloaded successfully!");
    } catch (error) {
      toast.error(error.message || "Backup failed");
    } finally {
      setBacking(false);
    }
  };

  const handleRestoreBackup = async () => {
    if (!backupFile) {
      toast.error("Please select a backup file");
      return;
    }

    setRestoring(true);
    try {
      const fileText = await backupFile.text();
      const backupData = JSON.parse(fileText);

      const { data } = await base44.functions.invoke('restoreDatabaseBackup', {
        masterPassword,
        backupData,
        mode: restoreMode
      });

      toast.success(data.message || "Backup restored successfully!");
      console.log("Restore details:", data.details);
      setBackupFile(null);
    } catch (error) {
      toast.error(error.message || "Restore failed");
    } finally {
      setRestoring(false);
    }
  };

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.type === 'application/json') {
      setBackupFile(file);
      toast.success(`Selected: ${file.name}`);
    } else {
      toast.error("Please select a valid JSON backup file");
    }
  };

  if (!isVerified) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardHeader className="text-center">
            <div className="mx-auto w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mb-4">
              <Shield className="w-8 h-8 text-amber-600" />
            </div>
            <CardTitle className="text-2xl">Admin Security Center</CardTitle>
            <CardDescription>Enter master password to access secure operations</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <Key className="w-4 h-4" />
              <AlertDescription>
                This area contains sensitive operations including database backup and recovery.
                Master password authentication is required.
              </AlertDescription>
            </Alert>
            
            <div className="space-y-2">
              <Label htmlFor="password">Master Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter master password"
                value={masterPassword}
                onChange={(e) => setMasterPassword(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleVerifyPassword()}
              />
            </div>

            <Button 
              onClick={handleVerifyPassword} 
              disabled={verifying || !masterPassword}
              className="w-full bg-amber-600 hover:bg-amber-700"
            >
              {verifying ? "Verifying..." : "Unlock Security Center"}
            </Button>

            <p className="text-xs text-slate-500 text-center">
              Contact system administrator if you've forgotten the master password.
            </p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="bg-slate-900 py-16 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <Shield className="w-10 h-10 text-amber-400" />
            <h1 className="text-3xl md:text-4xl font-bold text-white">Security Center</h1>
          </div>
          <p className="text-slate-400">Secure admin operations and database management</p>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 py-10 space-y-6">
        <Alert className="border-green-200 bg-green-50">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <AlertDescription className="text-green-800">
            Master password verified. You have access to all secure operations.
          </AlertDescription>
        </Alert>

        {/* Database Backup */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="w-5 h-5" />
              Database Backup
            </CardTitle>
            <CardDescription>
              Create a complete backup of all database entities for disaster recovery
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert>
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              <AlertDescription>
                Backup includes all tours, flights, hotels, bookings, users, and system data.
                Store backup files securely in a safe location.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3">
              <Button 
                onClick={handleCreateBackup} 
                disabled={backing}
                className="bg-blue-600 hover:bg-blue-700 flex-1"
              >
                <Download className="w-4 h-4 mr-2" />
                {backing ? "Creating Backup..." : "Create & Download Backup"}
              </Button>
            </div>

            <div className="bg-slate-50 p-4 rounded-lg text-sm">
              <p className="font-semibold mb-2">Backup includes:</p>
              <ul className="list-disc list-inside space-y-1 text-slate-600">
                <li>All booking records (flights, tours, hotels, etc.)</li>
                <li>Customer data and saved travelers</li>
                <li>Pricing rules and loyalty accounts</li>
                <li>Reviews, favorites, and itineraries</li>
                <li>System configuration and supplier credentials</li>
              </ul>
            </div>
          </CardContent>
        </Card>

        {/* Database Restore */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Database Restore
            </CardTitle>
            <CardDescription>
              Restore database from a previous backup file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert className="border-red-200 bg-red-50">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <AlertDescription className="text-red-800">
                <strong>WARNING:</strong> Replace mode will delete all existing data before restoring.
                Use with extreme caution. Always create a current backup first.
              </AlertDescription>
            </Alert>

            <div className="space-y-3">
              <div>
                <Label htmlFor="backup-file">Select Backup File</Label>
                <Input
                  id="backup-file"
                  type="file"
                  accept=".json"
                  onChange={handleFileSelect}
                  className="mt-1"
                />
                {backupFile && (
                  <p className="text-sm text-green-600 mt-1">✓ {backupFile.name} selected</p>
                )}
              </div>

              <div className="space-y-2">
                <Label>Restore Mode</Label>
                <div className="flex gap-3">
                  <Button
                    variant={restoreMode === 'merge' ? 'default' : 'outline'}
                    onClick={() => setRestoreMode('merge')}
                    className={restoreMode === 'merge' ? 'bg-blue-600' : ''}
                  >
                    Merge (Add New)
                  </Button>
                  <Button
                    variant={restoreMode === 'replace' ? 'default' : 'outline'}
                    onClick={() => setRestoreMode('replace')}
                    className={restoreMode === 'replace' ? 'bg-red-600' : ''}
                  >
                    Replace (Delete All)
                  </Button>
                </div>
                <p className="text-xs text-slate-500">
                  {restoreMode === 'merge' 
                    ? "Merge: Adds backup data without deleting existing records"
                    : "Replace: Deletes all existing data, then restores backup (DESTRUCTIVE)"}
                </p>
              </div>

              <Button 
                onClick={handleRestoreBackup}
                disabled={restoring || !backupFile}
                variant="destructive"
                className="w-full"
              >
                <Upload className="w-4 h-4 mr-2" />
                {restoring ? "Restoring..." : `Restore Database (${restoreMode} mode)`}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Security Best Practices */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" />
              Security Best Practices
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2 text-sm text-slate-600">
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Store backup files in multiple secure locations (cloud storage, external drives)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Create regular backups (daily or weekly recommended)</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Test restore procedures periodically to ensure backups work</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>Never share the master password. Change it periodically.</span>
              </li>
              <li className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                <span>API keys and credentials are stored securely in environment variables</span>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}