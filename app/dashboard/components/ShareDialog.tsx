"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useClipboard } from "@/hooks/useClipboard";
import { useShareLinks } from "@/hooks/useShareLinks";
import { useShares } from "@/hooks/useShares";
import { CheckCircle2, Copy, FileText, Folder, Info, Share, Trash, Users } from "lucide-react";
import { useEffect, useState } from "react";

type ShareDialogProps = {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  itemType: "file" | "folder";
  itemId: string;
  itemName: string;
};

export default function ShareDialog({ open, onOpenChange, itemType, itemId, itemName }: Readonly<ShareDialogProps>) {
  const [shareEmail, setShareEmail] = useState("");
  const [permission, setPermission] = useState("view");
  const [tab, setTab] = useState("share");

  const { shares, isLoading, shareItem, updatePermission, removeShare } = useShares(itemType, itemId, itemName);
  const { copied: linkCopied, copyToClipboard } = useClipboard();
  const { getShareLink, getInvitationLink } = useShareLinks(itemType, itemId);

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setShareEmail("");
      setPermission("view");
      setTab("share");
    }
  }, [open, itemId]);

  const handleShareItem = async () => {
    const result = await shareItem(shareEmail, permission);
    if (result) {
      const invitationLink = getInvitationLink(result.token);
      await copyToClipboard(invitationLink);
      setShareEmail("");
    }
  };

  const generateShareLink = async () => {
    const shareLink = getShareLink();
    await copyToClipboard(shareLink);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Share className="h-5 w-5" />
            <span>Share {itemType === "file" ? "File" : "Folder"}</span>
          </DialogTitle>
          <DialogDescription>
            Share <span className="font-medium text-foreground">{itemName}</span> with others
          </DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="share" className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              <span>Share with people</span>
            </TabsTrigger>
            <TabsTrigger value="link" className="flex items-center gap-1">
              <Copy className="h-4 w-4" />
              <span>Get link</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="share" className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="flex gap-2 items-center">
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter email address"
                  value={shareEmail}
                  onChange={(e) => setShareEmail(e.target.value)}
                  disabled={isLoading}
                />
                <Select value={permission} onValueChange={setPermission} disabled={isLoading}>
                  <SelectTrigger className="w-28">
                    <SelectValue placeholder="Permission" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="admin">Admin</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Button onClick={handleShareItem} disabled={isLoading ?? !shareEmail} className="w-full">
              {isLoading ? "Sharing..." : "Share"}
            </Button>

            {/* Show current shares */}
            {shares.length > 0 && (
              <div className="mt-4 border-t pt-4">
                <h3 className="text-sm font-medium mb-2">Shared with</h3>
                <div className="space-y-3 max-h-48 overflow-y-auto">
                  {shares.map((share) => (
                    <div key={share.id} className="flex items-center justify-between text-sm">
                      <div className="flex items-center gap-2">
                        <Users className="h-4 w-4 text-muted-foreground" />
                        <span>{share.sharedWithEmail}</span>
                        {share.created && (
                          <Badge variant="outline" className="text-xs">
                            New
                          </Badge>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        <Select
                          value={share.permission}
                          onValueChange={(value) => updatePermission(share.id, value)}
                          disabled={isLoading}
                        >
                          <SelectTrigger className="h-7 w-20 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="view">View</SelectItem>
                            <SelectItem value="edit">Edit</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => removeShare(share.id, share.sharedWithEmail)}
                          disabled={isLoading}
                        >
                          <Trash className="h-4 w-4 text-muted-foreground hover:text-destructive" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </TabsContent>

          <TabsContent value="link" className="space-y-4 mt-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="link">Share link</Label>
                <Badge variant="outline" className="text-xs">
                  Anyone with the link can view
                </Badge>
              </div>
              <div className="flex gap-2 items-center">
                <Input id="link" readOnly value={getShareLink()} className="bg-muted" />
                <Button
                  variant="outline"
                  size="icon"
                  onClick={generateShareLink}
                  disabled={isLoading}
                  className="flex-shrink-0"
                >
                  {linkCopied ? <CheckCircle2 className="h-4 w-4 text-green-500" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                <Info className="h-3 w-3" />
                <span>This link will allow anyone to view this {itemType}</span>
              </p>
            </div>

            <div className="border-t pt-4">
              <div className="flex justify-between items-center">
                <div className="space-y-1">
                  <h4 className="text-sm font-medium">Link settings</h4>
                  <p className="text-xs text-muted-foreground">Control who can access this link</p>
                </div>
                <Select defaultValue="view">
                  <SelectTrigger className="w-28">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="view">View</SelectItem>
                    <SelectItem value="edit">Edit</SelectItem>
                    <SelectItem value="disabled">Disabled</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter className="flex items-center justify-between sm:justify-between">
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            {itemType === "file" ? <FileText className="h-3 w-3" /> : <Folder className="h-3 w-3" />}
            <span>{itemName}</span>
          </div>
          <Button variant="ghost" size="sm" onClick={() => onOpenChange(false)}>
            Done
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
