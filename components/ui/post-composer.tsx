"use client";

import { useState, useRef } from "react";
import { Send, Image, Link, Hash, X } from "lucide-react";
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
    setContent(e.target.value);
    
    // Auto-resize textarea
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const characterCount = content.length;
  const isOverLimit = characterCount > 500;

  return (
    <div className={`bg-background/95 backdrop-blur-sm border border-border/50 rounded-xl p-4 ${className}`}>
      <form onSubmit={handleSubmit} className="space-y-3">
        {/* Main content input */}
        <div className="relative">
          <textarea
            ref={textareaRef}
            value={content}
            onChange={handleTextareaChange}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            className="w-full bg-transparent text-foreground placeholder-muted-foreground resize-none outline-none text-sm leading-relaxed min-h-[60px] max-h-[200px]"
            disabled={isSubmitting}
            maxLength={500}
          />
          
          {/* Character count */}
          <div className="absolute bottom-2 right-2 text-xs text-muted-foreground">
            <span className={isOverLimit ? 'text-red-500' : ''}>
              {characterCount}/500
            </span>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {tags.map((tag, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded-full text-xs"
              >
                #{tag}
                <button
                  type="button"
                  onClick={() => removeTag(tag)}
                  className="hover:bg-primary/20 rounded-full p-0.5"
                >
                  <X size={12} />
                </button>
              </span>
            ))}
          </div>
        )}

        {/* Tag input */}
        {showTagInput && (
          <div className="flex items-center gap-2">
            <Hash size={14} className="text-muted-foreground" />
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
              placeholder="Add a tag..."
              className="flex-1 bg-transparent text-foreground placeholder-muted-foreground outline-none text-sm"
              autoFocus
            />
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-2 border-t border-border/30">
          <div className="flex items-center gap-2">
            <button
              type="button"
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              title="Add image (coming soon)"
              disabled
            >
              <Image size={16} />
            </button>
            
            <button
              type="button"
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              title="Add link (coming soon)"
              disabled
            >
              <Link size={16} />
            </button>
            
            <button
              type="button"
              onClick={() => setShowTagInput(true)}
              className="p-2 hover:bg-muted rounded-full transition-colors text-muted-foreground hover:text-foreground"
              title="Add tags"
            >
              <Hash size={16} />
            </button>
          </div>

          <button
            type="submit"
            disabled={!content.trim() || isSubmitting || isOverLimit}
            className="bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 disabled:from-gray-400 disabled:to-gray-500 text-white px-4 py-2 rounded-lg transition-all duration-200 disabled:cursor-not-allowed disabled:opacity-50 flex items-center gap-2 text-sm font-medium"
          >
            {isSubmitting ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Send size={16} />
            )}
            Post
          </button>
        </div>
      </form>
    </div>
  );
}
