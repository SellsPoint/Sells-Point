"use client";

import { useState, useEffect } from "react";
import { X, Upload, Check } from "lucide-react";
import { useApp } from "@/context/AppContext";

async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);
  const res = await fetch("/api/upload", { method: "POST", body: formData });
  if (!res.ok) throw new Error("Upload failed");
  const { url } = await res.json();
  return url;
}

export default function EditProfileModal({ isOpen, onClose, user }) {
  const { updateProfile } = useApp();
  const [submitted, setSubmitted] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [form, setForm] = useState({
    name: user?.name || "",
    bio: user?.bio || "",
    location: user?.location || "",
    avatar: user?.avatar || "",
  });

  useEffect(() => {
    if (isOpen && user) {
      setForm({
        name: user.name || "",
        bio: user.bio || "",
        location: user.location || "",
        avatar: user.avatar || "",
      });
      setSubmitted(false);
      setError("");
    }
  }, [isOpen, user]);

  if (!isOpen || !user) return null;

  const close = () => {
    setSubmitted(false);
    setError("");
    onClose();
  };

  const set = (patch) => setForm((prev) => ({ ...prev, ...patch }));

  const handleAvatar = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError("");
    try {
      const url = await uploadFile(file);
      set({ avatar: url });
    } catch {
      setError("Failed to upload avatar. Please try again.");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!form.name.trim()) {
      setError("Name is required.");
      return;
    }
    setSubmitting(true);
    setError("");
    try {
      const result = await updateProfile(form);
      if (result.success) {
        setSubmitted(true);
      } else {
        setError(result.error || "Failed to save profile. Please try again.");
      }
    } catch {
      setError("Failed to save profile. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-ink-950/60 p-4 animate-fade-in">
      <div className="relative flex max-h-[90vh] w-full max-w-lg flex-col rounded-2xl bg-white shadow-soft animate-slide-up">
        <div className="flex items-center justify-between border-b border-ink-100 px-6 py-4">
          <h2 className="font-display text-lg font-bold text-ink-900">
            {submitted ? "Profile Updated" : "Edit Profile"}
          </h2>
          <button
            onClick={close}
            className="rounded-full p-1.5 text-ink-400 hover:bg-ink-100 hover:text-ink-700"
          >
            <X size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto px-6 py-5">
          {submitted ? (
            <div className="flex flex-col items-center gap-3 py-8 text-center">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-brand-100 text-brand-600">
                <Check size={32} />
              </div>
              <h3 className="font-display text-xl font-bold text-ink-900">
                Profile updated!
              </h3>
              <p className="max-w-sm text-sm text-ink-500">
                Your profile has been updated successfully.
              </p>
              <button onClick={close} className="btn-primary mt-3">
                Close
              </button>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  {error}
                </div>
              )}

              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <img
                    src={form.avatar}
                    alt="Avatar preview"
                    className="h-20 w-20 rounded-full object-cover shadow-soft"
                  />
                  <label className="flex cursor-pointer items-center gap-2 rounded-xl border-2 border-dashed border-ink-200 px-4 py-2 text-sm text-ink-400 hover:border-brand-400 hover:text-brand-500">
                    <Upload size={16} />
                    <span>{uploading ? "Uploading..." : "Change avatar"}</span>
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      disabled={uploading}
                      onChange={handleAvatar}
                    />
                  </label>
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">
                    Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    value={form.name}
                    onChange={(e) => set({ name: e.target.value })}
                    placeholder="Your display name"
                    className="input-field"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">
                    Bio
                  </label>
                  <textarea
                    value={form.bio}
                    onChange={(e) => set({ bio: e.target.value })}
                    rows={3}
                    placeholder="Tell others about yourself..."
                    className="input-field resize-none"
                  />
                </div>

                <div>
                  <label className="mb-1.5 block text-sm font-medium text-ink-700">
                    Location
                  </label>
                  <input
                    value={form.location}
                    onChange={(e) => set({ location: e.target.value })}
                    placeholder="City, Country"
                    className="input-field"
                  />
                </div>
              </div>
            </>
          )}
        </div>

        {!submitted && (
          <div className="flex items-center justify-end gap-3 border-t border-ink-100 px-6 py-4">
            <button onClick={close} className="btn-ghost">
              Cancel
            </button>
            <button
              onClick={handleSubmit}
              disabled={submitting || !form.name.trim()}
              className="btn-primary"
            >
              {submitting ? "Saving..." : "Save Changes"} <Check size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
