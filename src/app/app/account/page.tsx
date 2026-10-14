"use client";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { useUserContext } from "@/contexts/user";
import { coreStore } from "@/hooks/store/core";
import { getFallbackInitial } from "@/lib/utils";
import {
  CameraIcon,
  PencilSimpleIcon,
  UserIcon,
} from "@phosphor-icons/react";
import { useRef, useState } from "react";
import { Input } from "react-smooth-input";
import { toast } from "sonner";
import { useStore } from "zustand";
import { getApiUrl } from "@/lib/api";
import { ImageCropperModal } from "@/components/image-cropper-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

function Page() {
  const lang = useStore(coreStore, (state) => state.lang);
  const { userInfo, patchUserInfo, authFetch } = useUserContext();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isNameDialogOpen, setIsNameDialogOpen] = useState(false);
  const [newName, setNewName] = useState("");

  const [cropperOpen, setCropperOpen] = useState(false);
  const [imageToCrop, setImageToCrop] = useState<string | null>(null);

  const avatarInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => {
        setImageToCrop(reader.result as string);
        setCropperOpen(true);
        e.target.value = "";
      };
      reader.readAsDataURL(file);
    }
  };

  const onCropComplete = async (croppedImage: Blob) => {
    try {
      const formData = new FormData();
      formData.append("avatar", croppedImage, "avatar.webp");

      const res = await authFetch(getApiUrl("/api/v1/me"), {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        patchUserInfo(updatedUser);
        toast.success(lang.data.app.account.success);
      } else if (res.status === 451) {
        const detail = await res.text().catch(() => "");
        toast.error(
          detail
            ? `${detail}. ${lang.data.app.account.illegal_content}`
            : lang.data.app.account.illegal_content,
        );
      } else {
        toast.error(lang.data.app.account.error);
      }
    } catch (err) {
      console.error(err);
      toast.error(lang.data.app.account.fatal);
    }
  };

  const handleUpdateName = async () => {
    if (!newName.trim()) return;
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append("name", newName.trim());

      const res = await authFetch(getApiUrl("/api/v1/me"), {
        method: "PATCH",
        body: formData,
      });

      if (res.ok) {
        const updatedUser = await res.json();
        patchUserInfo(updatedUser);
        toast.success(lang.data.app.account.success);
        setIsNameDialogOpen(false);
      } else if (res.status === 451) {
        const detail = await res.text().catch(() => "");
        toast.error(
          detail
            ? `${detail}. ${lang.data.app.account.illegal_content}`
            : lang.data.app.account.illegal_content,
        );
      } else {
        toast.error(lang.data.app.account.error);
      }
    } catch (err) {
      console.error(err);
      toast.error(lang.data.app.account.fatal);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <div className="w-full flex flex-col gap-6">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-2xl bg-foreground/5 text-foreground/70">
            <UserIcon size={24} weight="fill" />
          </div>
          <div>
            <h1 className="text-xl font-bold">{lang.data.app.account.title}</h1>
            <p className="text-xs text-foreground/40">Manage your user account profile and settings</p>
          </div>
        </div>

        <div className="w-full bg-card p-6 rounded-3xl border border-foreground/5 shadow-xs flex flex-col sm:flex-row items-center sm:items-start gap-6">
          <div
            className="group relative size-28 rounded-full overflow-hidden border-4 border-background shadow-md active:scale-98 cursor-pointer select-none shrink-0"
            onClick={() => avatarInputRef.current?.click()}
          >
            <Avatar className="size-full rounded-none group-hover:blur-xs transition-all">
              {userInfo?.avatar && (
                <AvatarImage src={userInfo.avatar} alt={userInfo?.name || "User"} />
              )}
              <AvatarFallback className="text-3xl font-bold">
                {getFallbackInitial(userInfo?.name || "?")}
              </AvatarFallback>
            </Avatar>
            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
              <div className="flex flex-col items-center gap-1">
                <CameraIcon size={24} weight="fill" className="text-white" />
                <span className="text-[9px] text-white font-bold uppercase tracking-wider">
                  {lang.data.app.account.change_avatar}
                </span>
              </div>
            </div>
            <input
              type="file"
              ref={avatarInputRef}
              className="hidden"
              accept="image/*"
              onChange={handleFileChange}
            />
          </div>

          <div className="flex flex-col items-center sm:items-start gap-2 flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-2xl truncate">
                {userInfo?.name || "User"}
              </h2>
              <Button
                size={"icon"}
                variant="ghost"
                onClick={() => {
                  setNewName(userInfo?.name || "");
                  setIsNameDialogOpen(true);
                }}
                className="size-8 rounded-lg bg-foreground/5 hover:bg-foreground/10 text-foreground/70 transition-colors"
                title={lang.data.app.account.edit_display_name}
              >
                <PencilSimpleIcon weight="fill" className="size-4" />
              </Button>
            </div>
            {userInfo?.email && (
              <span className="text-foreground/50 text-sm font-medium">
                {userInfo.email}
              </span>
            )}
            <div className="mt-2 flex flex-wrap gap-2 text-xs text-foreground/40">
              <span className="px-2.5 py-1 rounded-lg bg-foreground/5 font-mono">
                ID: {userInfo?.id}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ImageCropperModal
        open={cropperOpen}
        onClose={() => setCropperOpen(false)}
        image={imageToCrop}
        onCropComplete={onCropComplete}
        cropShape="round"
        aspect={1}
        title={lang.data.app.account.crop_avatar}
        applyLabel={lang.data.app.account.crop_apply}
        cancelLabel={lang.data.app.account.crop_cancel}
        zoomLabel={lang.data.app.account.zoom}
        className="sm:max-w-xl"
      />

      <Dialog open={isNameDialogOpen} onOpenChange={setIsNameDialogOpen}>
        <DialogContent
          className="max-w-sm rounded-4xl p-6"
          showCloseButton={false}
        >
          <DialogHeader>
            <div className="bg-blue-500/10 p-2 size-12 rounded-xl text-primary flex items-center justify-center mb-2">
              <PencilSimpleIcon
                weight="fill"
                className="text-blue-500"
                size={20}
              />
            </div>
            <DialogTitle className="text-xl font-bold">
              {lang.data.app.account.display_name_dialog_title}
            </DialogTitle>
            <DialogDescription className="text-foreground/40 text-sm">
              {lang.data.app.account.display_name_dialog_description}
            </DialogDescription>
          </DialogHeader>
          <div className="mt-2">
            <Input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder={lang.data.app.account.display_name_placeholder}
              maxLength={64}
              fontStyle={{
                fontFamily: "var(--font-baijamjuree)",
                fontSize: "14px",
              }}
              classNames={{
                base: "h-12 rounded-xl",
                container: "w-full",
              }}
            />
          </div>
          <DialogFooter className="mt-6 gap-2">
            <Button
              variant="secondary"
              onClick={() => setIsNameDialogOpen(false)}
              className="rounded-xl p-4"
            >
              {lang.data.app.account.crop_cancel}
            </Button>
            <Button
              onClick={handleUpdateName}
              disabled={isSubmitting || !newName.trim()}
              className="rounded-xl p-4"
            >
              {isSubmitting ? <Spinner /> : lang.data.app.account.save}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}

export default Page;
