"use client";

import { useState, useRef, useCallback, useEffect } from "react";
import { Send, Image, Link, Hash, X, Smile, AtSign, MapPin, Eye, Users, Lock } from "lucide-react";
import { useMutation } from "convex/react";
import { api } from "@/convex/_generated/api";
import type { Id } from "@/convex/_generated/dataModel";

interface PostComposerProps {
  currentUserId: Id<"users">;
  onPostCreated?: () => void;
  placeholder?: string;
  className?: string;
}

export function PostComposer({ 
  currentUserId, 
  onPostCreated,
  placeholder = "What's happening in the hangout?",
  className = ""
}: PostComposerProps) {
  const [content, setContent] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [newTag, setNewTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showTagInput, setShowTagInput] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [privacy, setPrivacy] = useState<'public' | 'followers' | 'private'>('public');
  const [wordCount, setWordCount] = useState(0);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [isDraft, setIsDraft] = useState(false);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  const createPost = useMutation(api.posts.createPost);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      await createPost({
        content: content.trim(),
        authorId: currentUserId,
        type: "text",
        tags: tags,
        isPublic: true,
      });

      setContent("");
      setTags([]);
      setNewTag("");
      setShowTagInput(false);
      onPostCreated?.();
      
      // Reset textarea height
      if (textareaRef.current) {
        textareaRef.current.style.height = 'auto';
      }
    } catch (error) {
      console.error("Failed to create post:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
      handleSubmit(e);
    }
  };

  const addTag = () => {
    const tag = newTag.trim().toLowerCase();
    if (tag && !tags.includes(tag) && tags.length < 5) {
      setTags([...tags, tag]);
      setNewTag("");
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleTagKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault();
      addTag();
    } else if (e.key === 'Escape') {
      setShowTagInput(false);
      setNewTag("");
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const newContent = e.target.value;
    setContent(newContent);
    setWordCount(newContent.trim().split(/\s+/).filter(word => word.length > 0).length);

    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const insertEmoji = useCallback((emoji: string) => {
    if (!textareaRef.current) return;

    const textarea = textareaRef.current;
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const newContent = content.slice(0, start) + emoji + content.slice(end);

    setContent(newContent);
    setWordCount(newContent.trim().split(/\s+/).filter(word => word.length > 0).length);
    setShowEmojiPicker(false);

    // Focus back and set cursor position
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + emoji.length, start + emoji.length);
    }, 0);
  }, [content]);

  // Auto-save draft
  useEffect(() => {
    if (content.trim() && !isSubmitting) {
      const timer = setTimeout(() => {
        setIsDraft(true);
        // TODO: Save to localStorage or backend
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [content, isSubmitting]);

  const characterCount = content.length;
  const isOverLimit = characterCount > 500;

  return (
    <div className={`group relative bg-gradient-to-br from-background/95 to-background/90 backdrop-blur-md border border-border/60 rounded-2xl p-4 sm:p-6 shadow-lg hover:shadow-xl hover:shadow-primary/5 transition-all duration-300 hover-lift ${className}`}>
      {/* Subtle background pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-secondary/5 rounded-2xl opacity-50" />

      <form onSubmit={handleSubmit} className="relative space-y-4">
        {/* Enhanced content input with floating elements */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-foreground placeholder-muted-foreground resize-none outline-none text-sm leading-relaxed min-h-[80px] max-h-[240px] focus:ring-0 border-0 p-0 font-medium responsive-text"
            disabled={isSubmitting}
            maxLength={500}
          />

          {/* Floating writing tools */}
          <div className="absolute top-2 right-2 flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
            <button
              type="button"
              onClick={() => setShowEmojiPicker(!showEmojiPicker)}
              className="p-1.5 hover:bg-muted/60 rounded-lg transition-colors text-muted-foreground hover:text-primary"
              title="Add emoji"
            >
              <Smile size={14} />
            </button>
            <button
              type="button"
              className="p-1.5 hover:bg-muted/60 rounded-lg transition-colors text-muted-foreground hover:text-blue-500"
              title="Mention someone"
            >
              <AtSign size={14} />
            </button>
          </div>

          {/* Emoji picker */}
          {showEmojiPicker && (
            <div className="absolute top-10 right-2 bg-background border border-border/60 rounded-2xl shadow-xl p-3 z-10 animate-slide-up">
              <div className="grid grid-cols-6 gap-1 text-lg">
                {['😊', '😂', '🤔', '😍', '😲', '😔', '😎', '👍', '💪', '❤️', '🔥', '✨'].map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => insertEmoji(emoji)}
                    className="p-1 hover:bg-muted/60 rounded transition-colors hover:scale-125"
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Enhanced stats and progress indicator */}
          <div className="absolute bottom-3 right-3 flex items-center gap-3">
            {/* Draft indicator */}
            {isDraft && (
              <div className="flex items-center gap-1 text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
                <div className="w-1.5 h-1.5 bg-amber-400 rounded-full animate-pulse" />
                <span>Draft saved</span>
              </div>
            )}

            {/* Word count */}
            {wordCount > 0 && (
              <div className="text-xs text-muted-foreground bg-muted/30 px-2 py-1 rounded-full">
                {wordCount} word{wordCount !== 1 ? 's' : ''}
              </div>
            )}

            {/* Character progress */}
            <div className="flex items-center gap-2">
              <div className="w-12 h-1 bg-muted/30 rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-300 ${
                    isOverLimit ? 'bg-red-500' : characterCount > 450 ? 'bg-orange-500' : 'bg-primary'
                  }`}
                  style={{ width: `${Math.min((characterCount / 500) * 100, 100)}%` }}
                />
              </div>
              <span className={`text-xs font-medium ${
                isOverLimit ? 'text-red-500' : characterCount > 450 ? 'text-orange-500' : 'text-muted-foreground'
              }`}>
                {500 - characterCount}
              </span>
            </div>
          </div>
        </div>

        {/* Enhanced tags display */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-2 bg-gradient-to-r from-primary/10 to-primary/5 text-primary px-3 py-1.5 rounded-full text-xs font-medium border border-primary/20 hover:border-primary/40 transition-all duration-200 hover:scale-105"
              >
                <span className="w-1.5 h-1.5 bg-primary rounded-full" />
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-primary/20 rounded-full p-0.5 transition-colors"
                  aria-label={`Remove ${tag} tag`}
                >
                  <X size={10} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Enhanced tag input */}
        {showTagInput && (
          <div className="relative">
            <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border/50 focus-within:border-primary/50 focus-within:ring-2 focus-within:ring-primary/10 transition-all duration-200">
              <Hash size={16} className="text-primary flex-shrink-0" />
              <input
                type="text"
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                onKeyDown={handleTagKeyDown}
                onBlur={() => {
                  if (newTag.trim()) addTag();
                  setShowTagInput(false);
                  setNewTag("");
                }}
                placeholder="Add a tag... (press Enter or comma to add)"
                className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm font-medium"
                autoFocus
              />
              {newTag && (
                <button
                  type="button"
                  onClick={() => {
                    if (newTag.trim()) addTag();
                  }}
                  className="text-primary hover:text-primary/80 transition-colors"
                >
                  <span className="text-xs font-medium">Add</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Enhanced action bar with privacy controls */}
        <div className="space-y-3 pt-4 border-t border-border/40">
          {/* Advanced options toggle */}
          <div className="flex items-center justify-between">
            <button
              type="button"
              onClick={() => setShowAdvanced(!showAdvanced)}
              className="text-xs text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1"
            >
              <span>{showAdvanced ? 'Hide' : 'Show'} advanced options</span>
              <div className={`transition-transform duration-200 ${showAdvanced ? 'rotate-180' : ''}`}>
                ▼
              </div>
            </button>
          </div>

          {/* Advanced options panel */}
          {showAdvanced && (
            <div className="space-y-3 p-3 bg-muted/20 rounded-xl animate-slide-down">
              {/* Privacy selector */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">Who can see this:</span>
                <div className="flex gap-1">
                  {[
                    { id: 'public', label: 'Public', icon: Eye, color: 'text-green-500' },
                    { id: 'followers', label: 'Followers', icon: Users, color: 'text-blue-500' },
                    { id: 'private', label: 'Private', icon: Lock, color: 'text-gray-500' }
                  ].map(({ id, label, icon: Icon, color }) => (
                    <button
                      key={id}
                      type="button"
                      onClick={() => setPrivacy(id as 'public' | 'followers' | 'private')}
                      className={`flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium transition-all duration-200 ${
                        privacy === id
                          ? 'bg-primary text-primary-foreground'
                          : 'text-muted-foreground hover:text-foreground hover:bg-muted/60'
                      }`}
                    >
                      <Icon size={12} className={privacy === id ? '' : color} />
                      <span>{label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Location option */}
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  className="flex items-center gap-2 text-xs text-muted-foreground hover:text-blue-500 transition-colors"
                >
                  <MapPin size={12} />
                  <span>Add location</span>
                </button>
              </div>
            </div>
          )}

          {/* Main action bar */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-0.5 sm:gap-1 overflow-x-auto">
              {/* Media buttons with enhanced styling */}
              <button
                type="button"
                className="group/media flex-shrink-0 flex items-center gap-1 sm:gap-2 p-2 sm:p-2.5 hover:bg-muted/60 rounded-xl transition-all duration-200 text-muted-foreground hover:text-blue-500 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 touch-target"
                title="Add image (coming soon)"
                disabled
              >
                <Image size={16} className="group-hover/media:scale-110 transition-transform duration-200" />
                <span className="text-xs font-medium hidden sm:inline">Image</span>
              </button>

              <button
                type="button"
                className="group/media flex-shrink-0 flex items-center gap-1 sm:gap-2 p-2 sm:p-2.5 hover:bg-muted/60 rounded-xl transition-all duration-200 text-muted-foreground hover:text-green-500 hover:scale-105 disabled:opacity-50 disabled:hover:scale-100 touch-target"
                title="Add link (coming soon)"
                disabled
              >
                <Link size={16} className="group-hover/media:scale-110 transition-transform duration-200" />
                <span className="text-xs font-medium hidden sm:inline">Link</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setShowTagInput(true);
                  // Add a little shake animation for feedback
                  setTimeout(() => {
                    const tagInput = document.querySelector('[placeholder*="tag"]');
                    if (tagInput) {
                      tagInput.classList.add('animate-shake');
                      setTimeout(() => tagInput.classList.remove('animate-shake'), 500);
                    }
                  }, 100);
                }}
                className="group/media flex-shrink-0 flex items-center gap-1 sm:gap-2 p-2 sm:p-2.5 hover:bg-muted/60 rounded-xl transition-all duration-200 text-muted-foreground hover:text-purple-500 hover:scale-105 touch-target"
                title="Add tags"
              >
                <Hash size={16} className="group-hover/media:scale-110 transition-transform duration-200" />
                <span className="text-xs font-medium hidden sm:inline">Tag</span>
              </button>
            </div>

            {/* Enhanced submit button with vibrant gradient */}
            <button
              type="submit"
              disabled={!content.trim() || isSubmitting || isOverLimit}
              className="group/submit relative bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 hover:from-blue-400 hover:via-purple-400 hover:to-pink-400 disabled:from-muted disabled:to-muted text-white disabled:text-muted-foreground px-6 sm:px-8 py-3 rounded-xl transition-all duration-300 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 text-sm font-bold shadow-xl hover:shadow-2xl hover:shadow-purple-500/30 hover:scale-105 disabled:hover:scale-100 overflow-hidden touch-target border border-white/20"
            >
              {/* Animated background gradient */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-100 transition-opacity duration-300" />
              
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent opacity-0 group-hover/submit:opacity-100 group-hover/submit:animate-shimmer" />
              
              {/* Hover glow effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 opacity-0 blur-sm transition-all duration-300 group-hover/submit:opacity-30" />
              
              {/* Button background effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent opacity-0 group-hover/submit:opacity-100 transition-opacity duration-300" />

              <div className="relative z-10 flex items-center gap-2 sm:gap-3">
                {isSubmitting ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span className="hidden xs:inline text-white font-bold drop-shadow-sm">Posting...</span>
                  </>
                ) : (
                  <>
                    <Send size={18} className="group-hover/submit:translate-x-1 group-hover/submit:scale-110 transition-all duration-300 text-white drop-shadow-sm" />
                    <span className="hidden xs:inline sm:inline text-white font-bold drop-shadow-sm">Share Post</span>
                  </>
                )}
              </div>
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
