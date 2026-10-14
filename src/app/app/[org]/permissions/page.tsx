"use client";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import { useParams } from "next/navigation";
import { useUserContext } from "@/contexts/user";
import { getApiUrl } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "react-smooth-input";
import {
  ShieldCheckIcon,
  PlusIcon,
  TrashIcon,
  LockIcon,
  CheckIcon,
  SparkleIcon,
  InfoIcon,
  CrownIcon,
  BriefcaseIcon,
  PencilSimpleIcon,
  EyeIcon,
  UserIcon,
  SlidersHorizontalIcon,
  MagnifyingGlassIcon,
  CheckCircleIcon,
  XIcon,
  GearSixIcon,
  BroadcastIcon,
  BrowsersIcon,
  PlugsConnectedIcon,
  ChartLineUpIcon,
  CopySimpleIcon,
} from "@phosphor-icons/react";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { Spinner } from "@/components/ui/spinner";
import { Switch } from "@/components/ui/switch";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";

interface PermissionDef {
  key: string;
  name: string;
  category: string;
  description: string;
  bitmask: string;
}

interface SystemPreset {
  role: string;
  name: string;
  isSystem: boolean;
  permissions: string;
  grantedKeys: string[];
}

interface CustomPreset {
  id: string;
  name: string;
  description: string | null;
  color: string;
  permissions: string;
  createdAt: string;
}

const PRESET_COLORS = [
  { name: "Purple", border: "border-purple-500/30", bg: "bg-purple-500/10", text: "text-purple-400", dot: "bg-purple-400" },
  { name: "Blue", border: "border-blue-500/30", bg: "bg-blue-500/10", text: "text-blue-400", dot: "bg-blue-400" },
  { name: "Emerald", border: "border-emerald-500/30", bg: "bg-emerald-500/10", text: "text-emerald-400", dot: "bg-emerald-400" },
  { name: "Amber", border: "border-amber-500/30", bg: "bg-amber-500/10", text: "text-amber-400", dot: "bg-amber-400" },
  { name: "Rose", border: "border-rose-500/30", bg: "bg-rose-500/10", text: "text-rose-400", dot: "bg-rose-400" },
  { name: "Cyan", border: "border-cyan-500/30", bg: "bg-cyan-500/10", text: "text-cyan-400", dot: "bg-cyan-400" },
];

const CATEGORY_META: Record<string, { icon: React.ReactNode; color: string }> = {
  "Organization Administration": {
    icon: <GearSixIcon size={16} weight="bold" />,
    color: "text-purple-400 bg-purple-500/10 border-purple-500/20",
  },
  "Streamer Channels": {
    icon: <BroadcastIcon size={16} weight="bold" />,
    color: "text-blue-400 bg-blue-500/10 border-blue-500/20",
  },
  "Widgets & Overlays": {
    icon: <BrowsersIcon size={16} weight="bold" />,
    color: "text-emerald-400 bg-emerald-500/10 border-emerald-500/20",
  },
  "Integrations & Gateways": {
    icon: <PlugsConnectedIcon size={16} weight="bold" />,
    color: "text-amber-400 bg-amber-500/10 border-amber-500/20",
  },
  "Analytics & Finance": {
    icon: <ChartLineUpIcon size={16} weight="bold" />,
    color: "text-rose-400 bg-rose-500/10 border-rose-500/20",
  },
};

export default function OrgPermissionsPage() {
  const routeParams = useParams();
  const { activeOrg, authFetch } = useUserContext();
  const orgTarget = activeOrg?.id || activeOrg?.slug || (routeParams?.org as string);

  const [definitions, setDefinitions] = useState<PermissionDef[]>([]);
  const [systemPresets, setSystemPresets] = useState<SystemPreset[]>([]);
  const [customPresets, setCustomPresets] = useState<CustomPreset[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"presets" | "directory">("presets");
  const [searchQuery, setSearchQuery] = useState("");

  // Preset Editor Modal state (handles both Create and Edit)
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editingPresetId, setEditingPresetId] = useState<string | null>(null);
  const [presetName, setPresetName] = useState("");
  const [presetDesc, setPresetDesc] = useState("");
  const [presetColorName, setPresetColorName] = useState("Purple");
  const [selectedKeys, setSelectedKeys] = useState<Set<string>>(new Set());
  const [modalSearch, setModalSearch] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  // Delete modal state
  const [deletingPreset, setDeletingPreset] = useState<CustomPreset | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const activeColorObj = useMemo(() => {
    return PRESET_COLORS.find((c) => c.name === presetColorName) || PRESET_COLORS[0];
  }, [presetColorName]);

  const fetchPermissions = useCallback(() => {
    if (!orgTarget) return;
    authFetch(getApiUrl(`/api/v1/org/${orgTarget}/permissions`))
      .then((r) => (r.ok ? r.json() : null))
      .then((data) => {
        if (data) {
          setDefinitions(data.definitions || []);
          setSystemPresets(data.systemPresets || []);
          setCustomPresets(data.customPresets || []);
        }
      })
      .catch(() => toast.error("Failed to load permissions"))
      .finally(() => setLoading(false));
  }, [orgTarget, authFetch]);

  useEffect(() => {
    fetchPermissions();
  }, [fetchPermissions]);

  // Group definitions by category
  const categories = useMemo(() => {
    const map = new Map<string, PermissionDef[]>();
    for (const def of definitions) {
      const list = map.get(def.category) || [];
      list.push(def);
      map.set(def.category, list);
    }
    return Array.from(map.entries());
  }, [definitions]);

  // Filtered categories for Directory
  const filteredCategories = useMemo(() => {
    if (!searchQuery.trim()) return categories;
    const q = searchQuery.toLowerCase();
    return categories
      .map(([cat, defs]) => {
        const matchingDefs = defs.filter(
          (d) =>
            d.name.toLowerCase().includes(q) ||
            d.key.toLowerCase().includes(q) ||
            d.description.toLowerCase().includes(q) ||
            cat.toLowerCase().includes(q)
        );
        return [cat, matchingDefs] as [string, PermissionDef[]];
      })
      .filter(([, defs]) => defs.length > 0);
  }, [categories, searchQuery]);

  // Compute bitmask from selectedKeys
  const computedBitmask = useMemo(() => {
    let mask = BigInt(0);
    for (const def of definitions) {
      if (selectedKeys.has(def.key)) {
        mask |= BigInt(def.bitmask);
      }
    }
    return mask.toString();
  }, [definitions, selectedKeys]);

  const togglePermission = (key: string) => {
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const toggleCategory = (defs: PermissionDef[]) => {
    const allChecked = defs.every((d) => selectedKeys.has(d.key));
    setSelectedKeys((prev) => {
      const next = new Set(prev);
      for (const d of defs) {
        if (allChecked) next.delete(d.key);
        else next.add(d.key);
      }
      return next;
    });
  };

  const applyTemplate = (roleName: string) => {
    const found = systemPresets.find((p) => p.role === roleName);
    if (found) {
      setSelectedKeys(new Set(found.grantedKeys));
      toast.info(`Applied ${roleName} template (${found.grantedKeys.length} capabilities)`);
    }
  };

  const openCreateModal = () => {
    setEditingPresetId(null);
    setPresetName("");
    setPresetDesc("");
    setPresetColorName("Purple");
    setModalSearch("");
    const editorPreset = systemPresets.find((p) => p.role === "EDITOR");
    setSelectedKeys(new Set(editorPreset?.grantedKeys || []));
    setIsEditorOpen(true);
  };

  const openEditModal = (preset: CustomPreset) => {
    setEditingPresetId(preset.id);
    setPresetName(preset.name);
    setPresetDesc(preset.description || "");
    const matchedColor = PRESET_COLORS.find((c) => preset.color?.includes(c.text.replace("text-", "")));
    setPresetColorName(matchedColor ? matchedColor.name : "Purple");
    setModalSearch("");

    const maskBigInt = BigInt(preset.permissions);
    const activeKeys = definitions
      .filter((d) => {
        const bit = BigInt(d.bitmask);
        return (maskBigInt & bit) === bit;
      })
      .map((d) => d.key);

    setSelectedKeys(new Set(activeKeys));
    setIsEditorOpen(true);
  };

  const handleSavePreset = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!presetName.trim() || !orgTarget) return;
    if (selectedKeys.size === 0) {
      toast.error("Please enable at least one permission");
      return;
    }

    setIsSaving(true);
    const colorClass = `${activeColorObj.text} ${activeColorObj.bg} ${activeColorObj.border}`;
    const payload = {
      name: presetName.trim(),
      description: presetDesc.trim() || null,
      color: colorClass,
      permissions: computedBitmask,
    };

    try {
      const url = editingPresetId
        ? getApiUrl(`/api/v1/org/${orgTarget}/permissions/presets/${editingPresetId}`)
        : getApiUrl(`/api/v1/org/${orgTarget}/permissions/presets`);

      const res = await authFetch(url, {
        method: editingPresetId ? "PATCH" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        toast.success(
          editingPresetId
            ? `Preset "${presetName.trim()}" updated successfully!`
            : `Custom preset "${presetName.trim()}" created!`
        );
        setIsEditorOpen(false);
        fetchPermissions();
      } else {
        const msg = await res.text();
        toast.error(msg || "Failed to save preset");
      }
    } catch {
      toast.error("Network error saving preset");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeletePreset = async () => {
    if (!deletingPreset || !orgTarget) return;
    setIsDeleting(true);
    try {
      const res = await authFetch(
        getApiUrl(`/api/v1/org/${orgTarget}/permissions/presets/${deletingPreset.id}`),
        { method: "DELETE" }
      );
      if (res.ok) {
        toast.success(`Preset "${deletingPreset.name}" deleted`);
        setDeletingPreset(null);
        fetchPermissions();
      } else {
        toast.error("Failed to delete preset");
      }
    } catch {
      toast.error("Network error deleting preset");
    } finally {
      setIsDeleting(false);
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "OWNER":
        return <CrownIcon size={16} weight="fill" className="text-purple-400" />;
      case "ADMIN":
        return <ShieldCheckIcon size={16} weight="bold" className="text-blue-400" />;
      case "MANAGER":
        return <BriefcaseIcon size={16} weight="bold" className="text-emerald-400" />;
      case "EDITOR":
        return <PencilSimpleIcon size={16} weight="bold" className="text-amber-400" />;
      case "VIEWER":
        return <EyeIcon size={16} weight="bold" className="text-cyan-400" />;
      default:
        return <UserIcon size={16} weight="bold" className="text-zinc-400" />;
    }
  };

  const getSystemRoleBadge = (role: string) => {
    switch (role) {
      case "OWNER":
        return "text-purple-400 bg-purple-500/10 border-purple-500/20";
      case "ADMIN":
        return "text-blue-400 bg-blue-500/10 border-blue-500/20";
      case "MANAGER":
        return "text-emerald-400 bg-emerald-500/10 border-emerald-500/20";
      case "EDITOR":
        return "text-amber-400 bg-amber-500/10 border-amber-500/20";
      case "VIEWER":
        return "text-cyan-400 bg-cyan-500/10 border-cyan-500/20";
      default:
        return "text-zinc-400 bg-zinc-500/10 border-zinc-500/20";
    }
  };

  return (
    <div className="flex flex-col gap-6 max-w-6xl w-full py-4">
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center p-1 bg-secondary/60 rounded-2xl border border-border/60 self-start">
          <button
            onClick={() => setActiveTab("presets")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2",
              activeTab === "presets"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <SlidersHorizontalIcon size={14} weight="bold" />
            <span>Presets Overview</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-secondary text-muted-foreground font-mono">
              {systemPresets.length + customPresets.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab("directory")}
            className={cn(
              "px-3.5 py-1.5 text-xs font-semibold rounded-xl transition-all cursor-pointer flex items-center gap-2",
              activeTab === "directory"
                ? "bg-card text-foreground shadow-xs border border-border/60"
                : "text-muted-foreground hover:text-foreground"
            )}
          >
            <ShieldCheckIcon size={14} weight="bold" />
            <span>Permissions Directory</span>
            <span className="text-[10px] px-1.5 py-0.2 rounded-md bg-secondary text-muted-foreground font-mono">
              {definitions.length}
            </span>
          </button>
        </div>

        {activeTab === "directory" && (
          <div className="relative w-full sm:w-64">
            <MagnifyingGlassIcon
              size={15}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground"
            />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter capabilities..."
              className="w-full pl-9 pr-3 py-1.5 text-xs rounded-xl border border-input bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
            />
          </div>
        )}
      </div>

      {/* Main Content Area */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-24 gap-3">
          <Spinner className="size-7 text-primary" />
          <p className="text-xs text-muted-foreground">Loading permission definitions & presets...</p>
        </div>
      ) : activeTab === "presets" ? (
        <div className="flex flex-col gap-10">
          {/* Custom Presets Section */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                  <SparkleIcon size={18} weight="fill" className="text-primary" />
                  Custom Organization Presets
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Presets created specifically for this organization with tailored names, badge colors, and exact bitmasks.
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={openCreateModal}
                className="gap-1.5 text-xs rounded-xl cursor-pointer"
              >
                <PlusIcon size={13} weight="bold" />
                <span>New Preset</span>
              </Button>
            </div>

            {customPresets.length === 0 ? (
              <div className="p-8 border border-dashed border-border rounded-2xl bg-card/40 flex flex-col items-center justify-center text-center gap-3">
                <div className="size-12 rounded-2xl bg-secondary/80 flex items-center justify-center text-muted-foreground">
                  <SlidersHorizontalIcon size={24} />
                </div>
                <div className="max-w-md">
                  <p className="text-sm font-semibold text-foreground">No Custom Presets Yet</p>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Define custom roles such as &ldquo;Production Crew&rdquo;, &ldquo;Event Moderator&rdquo;, or &ldquo;Design Specialist&rdquo; to streamline staff onboarding.
                  </p>
                </div>
                <Button
                  size="sm"
                  onClick={openCreateModal}
                  className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer mt-1 bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  <PlusIcon size={13} weight="bold" />
                  <span>Create First Preset</span>
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {customPresets.map((preset) => {
                  const maskBigInt = BigInt(preset.permissions);
                  const activeDefs = definitions.filter((d) => {
                    const bit = BigInt(d.bitmask);
                    return (maskBigInt & bit) === bit;
                  });
                  const percentage = Math.round((activeDefs.length / (definitions.length || 1)) * 100);

                  return (
                    <div
                      key={preset.id}
                      className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md flex flex-col justify-between hover:border-primary/40 hover:shadow-md transition-all gap-4 group"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-2">
                          <span
                            className={cn(
                              "text-xs font-bold px-2.5 py-1 rounded-lg border inline-flex items-center gap-1.5 shadow-xs",
                              preset.color || "text-primary bg-primary/10 border-primary/20"
                            )}
                          >
                            <span className="size-1.5 rounded-full bg-current" />
                            {preset.name}
                          </span>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition-opacity">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openEditModal(preset)}
                              className="size-7 p-0 text-muted-foreground hover:text-foreground cursor-pointer rounded-lg"
                              title="Edit preset"
                            >
                              <PencilSimpleIcon size={14} />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => setDeletingPreset(preset)}
                              className="size-7 p-0 text-muted-foreground hover:text-destructive hover:bg-destructive/10 cursor-pointer rounded-lg"
                              title="Delete preset"
                            >
                              <TrashIcon size={14} />
                            </Button>
                          </div>
                        </div>

                        {preset.description && (
                          <p className="text-xs text-muted-foreground mt-2.5 leading-relaxed line-clamp-2">
                            {preset.description}
                          </p>
                        )}

                        {/* Progress Meter */}
                        <div className="mt-4">
                          <div className="flex items-center justify-between text-[11px] mb-1.5">
                            <span className="text-muted-foreground font-medium">Granted Capabilities</span>
                            <span className="font-mono font-bold text-foreground">
                              {activeDefs.length} / {definitions.length} ({percentage}%)
                            </span>
                          </div>
                          <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all duration-300"
                              style={{ width: `${percentage}%` }}
                            />
                          </div>

                          <div className="flex flex-wrap gap-1.5 mt-3 max-h-32 overflow-y-auto pr-1">
                            {activeDefs.map((d) => (
                              <span
                                key={d.key}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border/50"
                              >
                                {d.name}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[10px] text-muted-foreground font-mono">
                        <span>Created {new Date(preset.createdAt).toLocaleDateString()}</span>
                        <span>ID: {preset.id}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* System Presets Section */}
          <div className="flex flex-col gap-4">
            <div>
              <h2 className="text-base font-bold text-foreground flex items-center gap-2">
                <LockIcon size={18} weight="bold" className="text-muted-foreground" />
                Standard Platform Presets
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Built-in platform presets based on standard enterprise RBAC guidelines. Immutable defaults.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {systemPresets.map((preset) => {
                const isOwner = preset.role === "OWNER";
                const grantedDefs = definitions.filter((d) => preset.grantedKeys.includes(d.key));
                const percentage = isOwner
                  ? 100
                  : Math.round((preset.grantedKeys.length / (definitions.length || 1)) * 100);

                return (
                  <div
                    key={preset.role}
                    className="p-5 rounded-2xl border border-border/80 bg-card/80 backdrop-blur-md flex flex-col justify-between hover:border-border transition-all gap-4 shadow-xs"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 rounded-lg bg-secondary/80">
                            {getRoleIcon(preset.role)}
                          </div>
                          <span
                            className={cn(
                              "text-xs font-bold px-2.5 py-0.5 rounded-lg border",
                              getSystemRoleBadge(preset.role)
                            )}
                          >
                            {preset.role}
                          </span>
                        </div>
                        <span className="text-[10px] text-muted-foreground/80 flex items-center gap-1 font-mono uppercase tracking-wider font-semibold">
                          <LockIcon size={11} />
                          System
                        </span>
                      </div>

                      {/* Progress Meter */}
                      <div className="mt-4">
                        <div className="flex items-center justify-between text-[11px] mb-1.5">
                          <span className="text-muted-foreground font-medium">Granted Capabilities</span>
                          <span className="font-mono font-bold text-foreground">
                            {isOwner ? "17 / 17 (100%)" : `${preset.grantedKeys.length} / ${definitions.length} (${percentage}%)`}
                          </span>
                        </div>
                        <div className="h-1.5 w-full bg-secondary rounded-full overflow-hidden">
                          <div
                            className={cn(
                              "h-full rounded-full transition-all duration-300",
                              isOwner ? "bg-purple-400" : "bg-primary"
                            )}
                            style={{ width: `${percentage}%` }}
                          />
                        </div>

                        <div className="flex flex-wrap gap-1.5 mt-3 max-h-32 overflow-y-auto pr-1">
                          {isOwner ? (
                            <span className="text-[10px] font-semibold px-2 py-0.5 rounded-md bg-purple-500/10 text-purple-300 border border-purple-500/20">
                              Root Authority · All 17 Capabilities
                            </span>
                          ) : (
                            grantedDefs.map((d) => (
                              <span
                                key={d.key}
                                className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-secondary text-foreground border border-border/50"
                              >
                                {d.name}
                              </span>
                            ))
                          )}
                        </div>
                      </div>
                    </div>

                    <div className="pt-3 border-t border-border/50 flex items-center justify-between text-[11px]">
                      <span className="text-muted-foreground font-mono text-[10px]">
                        Mask: {preset.permissions.slice(0, 8)}...
                      </span>
                      <button
                        onClick={() => {
                          setEditingPresetId(null);
                          setPresetName(`${preset.role} (Custom)`);
                          setPresetDesc(`Derived from system ${preset.role} preset.`);
                          setSelectedKeys(new Set(preset.grantedKeys));
                          setIsEditorOpen(true);
                        }}
                        className="text-primary hover:underline cursor-pointer font-semibold inline-flex items-center gap-1"
                      >
                        <CopySimpleIcon size={12} weight="bold" />
                        <span>Clone as Custom</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      ) : (
        /* Granular Directory Table */
        <div className="flex flex-col gap-6">
          <div className="p-4 rounded-2xl border border-blue-500/20 bg-blue-500/5 text-xs text-blue-400 flex items-start gap-3">
            <InfoIcon size={18} className="shrink-0 mt-0.5" />
            <div className="space-y-0.5">
              <p className="font-semibold">Granular Platform Capability Directory</p>
              <p className="text-muted-foreground leading-relaxed">
                Permissions are evaluated as atomic bitwise flags. Each organization member or invite token contains a 64-bit integer bitmask stored in MySQL.
              </p>
            </div>
          </div>

          <div className="flex flex-col gap-6">
            {filteredCategories.map(([category, defs]) => {
              const meta = CATEGORY_META[category];
              return (
                <div key={category} className="flex flex-col gap-2.5">
                  <div className="flex items-center gap-2 px-1">
                    <span className={cn("p-1 rounded-lg border", meta?.color || "text-muted-foreground")}>
                      {meta?.icon || <GearSixIcon size={15} />}
                    </span>
                    <h3 className="text-xs font-bold uppercase tracking-wider text-foreground">
                      {category}
                    </h3>
                    <span className="text-[10px] text-muted-foreground font-mono">
                      ({defs.length})
                    </span>
                  </div>

                  <div className="rounded-2xl border border-border/80 overflow-hidden bg-card/80 divide-y divide-border/60 shadow-xs">
                    {defs.map((def) => {
                      const activeSystemRoles = systemPresets
                        .filter((p) => p.grantedKeys.includes(def.key))
                        .map((p) => p.role);

                      return (
                        <div
                          key={def.key}
                          className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 hover:bg-secondary/30 transition-colors"
                        >
                          <div className="max-w-xl">
                            <div className="flex items-center gap-2">
                              <span className="text-sm font-bold text-foreground">
                                {def.name}
                              </span>
                              <span className="font-mono text-[10px] text-muted-foreground/80 bg-secondary px-2 py-0.5 rounded-md border border-border/50">
                                {def.key}
                              </span>
                            </div>
                            <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                              {def.description}
                            </p>
                          </div>

                          <div className="flex items-center gap-1.5 flex-wrap shrink-0">
                            {activeSystemRoles.map((role) => (
                              <span
                                key={role}
                                className={cn(
                                  "text-[10px] font-semibold px-2.5 py-0.5 rounded-md border",
                                  getSystemRoleBadge(role)
                                )}
                              >
                                {role}
                              </span>
                            ))}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Modal: Create / Edit Custom Preset */}
      <Dialog open={isEditorOpen} onOpenChange={setIsEditorOpen}>
        <DialogContent className="max-w-3xl max-h-[92vh] flex flex-col p-6 rounded-3xl" showCloseButton={false}>
          <DialogHeader className="flex flex-row items-center justify-between border-b border-border/60 pb-4">
            <div>
              <DialogTitle className="flex items-center gap-2 text-xl font-bold">
                <SparkleIcon size={20} weight="fill" className="text-primary" />
                <span>{editingPresetId ? "Edit Custom Preset" : "Create Custom Permission Preset"}</span>
              </DialogTitle>
              <DialogDescription className="text-xs text-muted-foreground mt-0.5">
                Configure customized preset name, color theme, and toggle exact capability switches.
              </DialogDescription>
            </div>
            <button
              type="button"
              onClick={() => setIsEditorOpen(false)}
              className="p-1 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary cursor-pointer transition-colors"
            >
              <XIcon size={18} weight="bold" />
            </button>
          </DialogHeader>

          <form onSubmit={handleSavePreset} className="flex flex-col gap-5 overflow-y-auto pr-1 py-2">
            {/* 2-Column Desktop Grid for Inputs & Live Preview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Left 2 Cols: Form Inputs */}
              <div className="md:col-span-2 flex flex-col gap-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Preset Name <span className="text-destructive">*</span>
                    </label>
                    <Input
                      type="text"
                      value={presetName}
                      onChange={(e) => setPresetName(e.target.value)}
                      placeholder="e.g. Community Moderator"
                      required
                      className="w-full text-xs"
                      classNames={{ base: "h-9 rounded-xl" }}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="text-xs font-semibold text-foreground">
                      Description <span className="text-[10px] text-muted-foreground font-normal">(Optional)</span>
                    </label>
                    <Input
                      type="text"
                      value={presetDesc}
                      onChange={(e) => setPresetDesc(e.target.value)}
                      placeholder="Brief role summary..."
                      className="w-full text-xs"
                      classNames={{ base: "h-9 rounded-xl" }}
                    />
                  </div>
                </div>

                {/* Color Theme Selector */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">Badge Accent Color</label>
                  <div className="flex items-center gap-2 flex-wrap">
                    {PRESET_COLORS.map((c) => {
                      const isSelected = presetColorName === c.name;
                      return (
                        <button
                          key={c.name}
                          type="button"
                          onClick={() => setPresetColorName(c.name)}
                          className={cn(
                            "px-3 py-1.5 rounded-xl text-xs font-medium border transition-all cursor-pointer flex items-center gap-2",
                            c.text,
                            c.bg,
                            c.border,
                            isSelected
                              ? "ring-2 ring-primary ring-offset-2 ring-offset-background font-bold shadow-xs scale-102"
                              : "opacity-75 hover:opacity-100"
                          )}
                        >
                          <span className={cn("size-2 rounded-full", c.dot)} />
                          <span>{c.name}</span>
                          {isSelected && <CheckIcon size={12} weight="bold" />}
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Template Baseline Shortcuts */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Quick Template Baseline
                  </label>
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {["MEMBER", "VIEWER", "EDITOR", "MANAGER", "ADMIN"].map((role) => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => applyTemplate(role)}
                        className="text-[11px] px-2.5 py-1 rounded-lg bg-secondary hover:bg-secondary/80 text-foreground border border-border/70 transition-colors cursor-pointer font-medium"
                      >
                        Clone {role}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* Right 1 Col: Live Badge Preview Card */}
              <div className="p-4 rounded-2xl border border-border bg-card/60 flex flex-col justify-between">
                <div className="space-y-2">
                  <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    Live Role Badge Preview
                  </span>
                  <div className="p-3 rounded-xl border border-dashed border-border/80 bg-background/50 flex flex-col gap-1.5">
                    <span
                      className={cn(
                        "text-xs font-bold px-2.5 py-1 rounded-lg border w-fit inline-flex items-center gap-1.5",
                        activeColorObj.text,
                        activeColorObj.bg,
                        activeColorObj.border
                      )}
                    >
                      <span className={cn("size-1.5 rounded-full", activeColorObj.dot)} />
                      {presetName.trim() || "Preset Name"}
                    </span>
                    <span className="text-[11px] text-muted-foreground/80 line-clamp-2">
                      {presetDesc.trim() || "No description provided."}
                    </span>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-border/40 text-[11px] flex items-center justify-between text-muted-foreground">
                  <span>Selected</span>
                  <span className="font-mono font-bold text-foreground">
                    {selectedKeys.size} / {definitions.length}
                  </span>
                </div>
              </div>
            </div>

            {/* Granular Capabilities Checklist */}
            <div className="space-y-3 pt-3 border-t border-border/60">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <label className="text-xs font-bold text-foreground uppercase tracking-wider">
                    Granular Capabilities
                  </label>
                  <span className="text-xs font-mono font-bold text-primary px-2 py-0.5 rounded-md bg-primary/10">
                    {selectedKeys.size} Active
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <div className="relative w-48">
                    <input
                      type="text"
                      value={modalSearch}
                      onChange={(e) => setModalSearch(e.target.value)}
                      placeholder="Search capability..."
                      className="w-full px-2.5 py-1 text-[11px] rounded-lg border border-input bg-card text-foreground placeholder:text-muted-foreground outline-none focus:border-primary/50"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedKeys(new Set(definitions.map((d) => d.key)))}
                    className="text-[11px] text-primary hover:underline cursor-pointer font-medium"
                  >
                    Select All
                  </button>
                  <span className="text-muted-foreground text-xs">·</span>
                  <button
                    type="button"
                    onClick={() => setSelectedKeys(new Set())}
                    className="text-[11px] text-muted-foreground hover:underline cursor-pointer font-medium"
                  >
                    Clear All
                  </button>
                </div>
              </div>

              {/* Categorized List with Group Toggles */}
              <div className="flex flex-col gap-4 max-h-80 overflow-y-auto pr-2 divide-y divide-border/40">
                {categories.map(([category, defs]) => {
                  const matchingDefs = modalSearch.trim()
                    ? defs.filter(
                      (d) =>
                        d.name.toLowerCase().includes(modalSearch.toLowerCase()) ||
                        d.key.toLowerCase().includes(modalSearch.toLowerCase()) ||
                        d.description.toLowerCase().includes(modalSearch.toLowerCase())
                    )
                    : defs;

                  if (matchingDefs.length === 0) return null;

                  const meta = CATEGORY_META[category];
                  const allCategoryChecked = matchingDefs.every((d) => selectedKeys.has(d.key));

                  return (
                    <div key={category} className="pt-3 first:pt-0 space-y-2">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5">
                          <span className={cn("p-1 rounded-md text-xs", meta?.color)}>
                            {meta?.icon || <GearSixIcon size={12} />}
                          </span>
                          <span className="text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
                            {category}
                          </span>
                        </div>
                        <button
                          type="button"
                          onClick={() => toggleCategory(matchingDefs)}
                          className="text-[10px] text-primary hover:underline cursor-pointer font-semibold"
                        >
                          {allCategoryChecked ? "Deselect Group" : "Select Group"}
                        </button>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        {matchingDefs.map((def) => {
                          const isChecked = selectedKeys.has(def.key);
                          return (
                            <div
                              key={def.key}
                              onClick={() => togglePermission(def.key)}
                              className={cn(
                                "flex items-start justify-between p-3 rounded-xl border transition-all cursor-pointer gap-2 select-none",
                                isChecked
                                  ? "border-primary/50 bg-primary/5 shadow-2xs"
                                  : "border-border/70 bg-card/40 hover:bg-secondary/40"
                              )}
                            >
                              <div className="pr-2 space-y-0.5">
                                <p className="text-xs font-semibold text-foreground">{def.name}</p>
                                <p className="text-[10px] text-muted-foreground leading-tight line-clamp-2">
                                  {def.description}
                                </p>
                              </div>
                              <Switch
                                checked={isChecked}
                                onCheckedChange={() => togglePermission(def.key)}
                                size="sm"
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <DialogFooter className="pt-4 border-t border-border flex items-center justify-between">
              <span className="text-[11px] text-muted-foreground font-mono">
                Mask: {computedBitmask.slice(0, 12)}...
              </span>
              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditorOpen(false)}
                  disabled={isSaving}
                  className="text-xs rounded-xl cursor-pointer"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  size="sm"
                  disabled={isSaving || !presetName.trim()}
                  className="gap-2 text-xs font-semibold rounded-xl cursor-pointer bg-primary text-primary-foreground hover:bg-primary/90"
                >
                  {isSaving ? <Spinner className="size-3.5" /> : <CheckCircleIcon size={15} weight="bold" />}
                  <span>{editingPresetId ? "Update Preset" : "Save Preset"}</span>
                </Button>
              </div>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* Modal: Delete Confirmation */}
      <Dialog open={!!deletingPreset} onOpenChange={(open) => !open && setDeletingPreset(null)}>
        <DialogContent className="max-w-md p-6 rounded-3xl" showCloseButton={false}>
          <DialogHeader>
            <div className="size-11 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-2">
              <TrashIcon size={20} weight="bold" />
            </div>
            <DialogTitle className="text-lg font-bold text-foreground">
              Delete Custom Preset?
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground mt-1 leading-relaxed">
              Are you sure you want to delete preset <strong>&ldquo;{deletingPreset?.name}&rdquo;</strong>? Existing organization members with this bitmask will keep their current access unless updated.
            </DialogDescription>
          </DialogHeader>

          <DialogFooter className="mt-5 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setDeletingPreset(null)}
              disabled={isDeleting}
              className="text-xs rounded-xl cursor-pointer"
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeletePreset}
              disabled={isDeleting}
              className="gap-1.5 text-xs font-semibold rounded-xl cursor-pointer"
            >
              {isDeleting && <Spinner className="size-3.5" />}
              <span>Delete Preset</span>
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
