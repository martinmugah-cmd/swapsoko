import React from 'react';
import { ShieldAlert, AlertTriangle, Gavel, FileText, Trash2, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';

export interface ModerationNoticeProps {
  entityType: 'listing' | 'community' | 'account' | 'message';
  entityTitle: string;
  status: string;
  reason: string;
  details: string;
  canAppeal?: boolean;
  onAppeal?: () => void;
  onDelete?: () => void;
}

export function ModerationNotice({
  entityType,
  entityTitle,
  status,
  reason,
  details,
  canAppeal = true,
  onAppeal,
  onDelete,
}: ModerationNoticeProps) {
  return (
    <Card className="w-full max-w-2xl mx-auto border-red-200 shadow-sm overflow-hidden">
      <div className="bg-red-500 h-1.5 w-full"></div>
      <CardHeader className="bg-red-50/50 pb-4">
        <div className="flex items-center gap-2 mb-2">
          <ShieldAlert className="w-5 h-5 text-red-600" />
          <span className="text-xs font-bold uppercase tracking-wider text-red-600">Official Moderation Notice</span>
        </div>
        <CardTitle className="text-xl font-semibold text-gray-900">
          {entityType.charAt(0).toUpperCase() + entityType.slice(1)} {status}
        </CardTitle>
        <CardDescription className="text-gray-600 font-medium">
          {entityTitle}
        </CardDescription>
      </CardHeader>
      
      <CardContent className="pt-6 space-y-6">
        <div className="grid gap-4">
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Violation Reason</span>
            <div className="flex items-start gap-2 bg-gray-50 p-3 rounded-md border border-gray-100">
              <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0 mt-0.5" />
              <span className="font-medium text-gray-900">{reason}</span>
            </div>
          </div>
          
          <div className="flex flex-col gap-1.5">
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wide">Details & Context</span>
            <div className="bg-gray-50 p-3.5 rounded-md border border-gray-100 text-sm text-gray-700 leading-relaxed">
              {details}
            </div>
          </div>
        </div>
        
        <Alert className="bg-blue-50/50 border-blue-200">
          <Gavel className="w-4 h-4 text-blue-600" />
          <AlertTitle className="text-blue-800 font-semibold text-sm">Transparency & Fairness</AlertTitle>
          <AlertDescription className="text-blue-700/80 text-xs mt-1">
            We are committed to maintaining a safe platform. If you believe this decision was made in error by our automated systems or moderation team, you have the right to request a secondary review.
          </AlertDescription>
        </Alert>
      </CardContent>
      
      <CardFooter className="bg-gray-50/80 border-t border-gray-100 px-6 py-4 flex flex-wrap gap-3 sm:justify-between items-center">
        <div className="text-xs text-gray-500 font-medium">
          Reference ID: <span className="font-mono bg-gray-200/50 px-1.5 py-0.5 rounded text-gray-600">CASE-{Math.random().toString(36).substring(2, 8).toUpperCase()}</span>
        </div>
        <div className="flex flex-wrap gap-2 w-full sm:w-auto">
          {onDelete && (
            <Button variant="outline" size="sm" onClick={onDelete} className="text-gray-600 flex-1 sm:flex-none">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete {entityType}
            </Button>
          )}
          {canAppeal && onAppeal && (
            <Button variant="default" size="sm" onClick={onAppeal} className="bg-gray-900 hover:bg-gray-800 flex-1 sm:flex-none">
              <FileText className="w-4 h-4 mr-2" />
              Appeal Decision
              <ArrowRight className="w-3 h-3 ml-1.5 opacity-70" />
            </Button>
          )}
        </div>
      </CardFooter>
    </Card>
  );
}
