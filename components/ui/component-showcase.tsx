"use client";

import { useState } from "react";
import { Palette, Sparkles, Accessibility, Smartphone, Rocket } from "lucide-react";
import { PostCard } from "./post-card";
import { PostComposer } from "./post-composer";
import { PostsFeed } from "./posts-feed";
import { SearchPosts } from "./search-posts";
import type { Id } from "@/convex/_generated/dataModel";

// Mock data for demonstration
const mockUserId = "user_123" as Id<"users">;

const mockPost = {
  _id: "post_123" as Id<"posts">,
  content: "Just redesigned the entire posts module with modern UI components! The new design features glass morphism effects, improved accessibility, and smooth micro-interactions. What do you think of the new look?",
  authorId: "author_123" as Id<"users">,
  author: {
    _id: "author_123" as Id<"users">,
    username: "design_guru",
    avatar: undefined,
  },
  type: "text",
  metadata: {
    imageUrls: [],
    linkUrl: "https://example.com/design-system",
    linkTitle: "Modern UI Design System",
    pollOptions: [],
    pollVotes: [],
  },
  likes: ["user_456" as Id<"users">, "user_789" as Id<"users">],
  tags: ["design", "ui", "ux", "react"],
  isPublic: true,
  createdAt: Date.now() - 3600000, // 1 hour ago
  updatedAt: Date.now() - 3600000,
};

export function ComponentShowcase() {
  const [activeTab, setActiveTab] = useState("overview");

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background/95 to-muted/20 p-6">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 text-primary rounded-full text-sm font-medium">
            <span className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            UI Design Showcase
          </div>
          <h1 className="text-4xl font-bold bg-gradient-to-r from-foreground via-primary to-foreground bg-clip-text text-transparent">
            Ani Posts Module Redesign
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Modern, accessible, and intuitive UI components for the social posts functionality
          </p>
        </div>

        {/* Simple Navigation */}
        <div className="flex flex-wrap gap-2 justify-center">
          {[
            { id: "overview", label: "Overview" },
            { id: "postcard", label: "PostCard" },
            { id: "composer", label: "Composer" },
            { id: "feed", label: "Feed" },
            { id: "search", label: "Search" }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 ${
                activeTab === tab.id
                  ? "bg-primary text-primary-foreground shadow-lg"
                  : "bg-muted/60 text-muted-foreground hover:bg-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="space-y-6">
          {activeTab === "overview" && (
            <div className="grid gap-6">
              {/* Design Improvements */}
              <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-xl">
                 <h2 className="text-2xl font-bold text-foreground mb-4 flex items-center gap-2">
                   <Palette size={24} className="text-primary" />
                   Design Improvements
                 </h2>
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-primary rounded-full" />
                      Visual Design
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Glass morphism effects with backdrop blur</li>
                      <li>• Enhanced gradients and shadow systems</li>
                      <li>• Improved typography hierarchy</li>
                      <li>• Modern rounded corners and spacing</li>
                      <li>• Consistent color system with semantic meanings</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-green-500 rounded-full" />
                      User Experience
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Smooth micro-interactions and animations</li>
                      <li>• Enhanced hover and focus states</li>
                      <li>• Loading states with skeleton screens</li>
                      <li>• Intuitive navigation patterns</li>
                      <li>• Progressive disclosure of information</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-blue-500 rounded-full" />
                      Accessibility
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• WCAG 2.1 AA compliance</li>
                      <li>• Full keyboard navigation support</li>
                      <li>• Screen reader friendly markup</li>
                      <li>• High contrast ratios maintained</li>
                      <li>• Focus management and indicators</li>
                    </ul>
                  </div>

                  <div className="space-y-3">
                    <h3 className="font-semibold text-foreground flex items-center gap-2">
                      <span className="w-2 h-2 bg-purple-500 rounded-full" />
                      Responsive Design
                    </h3>
                    <ul className="space-y-2 text-sm text-muted-foreground">
                      <li>• Mobile-first approach</li>
                      <li>• Adaptive layouts for all screen sizes</li>
                      <li>• Touch-friendly interaction targets</li>
                      <li>• Optimized content hierarchy</li>
                      <li>• Performance-conscious animations</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Feature Highlights */}
              <div className="grid md:grid-cols-3 gap-6">
                 <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                   <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                     <Sparkles size={20} className="text-primary" />
                     Modern Aesthetics
                   </h3>
                  <p className="text-sm text-muted-foreground">
                    Contemporary design with glass effects, gradients, and smooth animations that create a premium user experience.
                  </p>
                </div>

                 <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                   <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                     <Accessibility size={20} className="text-primary" />
                     Inclusive Design
                   </h3>
                  <p className="text-sm text-muted-foreground">
                    Built with accessibility at the core, ensuring all users can navigate and interact with the interface effectively.
                  </p>
                </div>

                 <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl p-6 hover:border-primary/30 transition-colors">
                   <h3 className="text-lg font-semibold text-foreground mb-2 flex items-center gap-2">
                     <Smartphone size={20} className="text-primary" />
                     Adaptive Layouts
                   </h3>
                  <p className="text-sm text-muted-foreground">
                    Responsive design that works seamlessly across all devices, from mobile phones to desktop computers.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "postcard" && (
            <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">PostCard Component</h2>
              <p className="text-muted-foreground mb-6">
                Enhanced post display with modern card design, improved interactions, and better content hierarchy
              </p>
              <div className="border border-border/50 rounded-2xl p-6 bg-muted/20">
                <PostCard
                  post={mockPost}
                  currentUserId={mockUserId}
                  onEdit={(post) => console.log("Edit post:", post)}
                  onDelete={(postId) => console.log("Delete post:", postId)}
                />
              </div>
            </div>
          )}

          {activeTab === "composer" && (
            <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">PostComposer Component</h2>
              <p className="text-muted-foreground mb-6">
                Intuitive post creation interface with enhanced input controls and visual feedback
              </p>
              <div className="border border-border/50 rounded-2xl p-6 bg-muted/20">
                <PostComposer
                  currentUserId={mockUserId}
                  onPostCreated={() => console.log("Post created")}
                  placeholder="Share your thoughts with the community..."
                />
              </div>
            </div>
          )}

          {activeTab === "feed" && (
            <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">PostsFeed Component</h2>
              <p className="text-muted-foreground mb-6">
                Comprehensive feed interface with modern navigation and content organization
              </p>
              <div className="h-96 border border-border/50 rounded-2xl overflow-hidden bg-muted/20">
                <PostsFeed currentUserId={mockUserId} />
              </div>
            </div>
          )}

          {activeTab === "search" && (
            <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl p-6 shadow-xl">
              <h2 className="text-2xl font-bold text-foreground mb-4">SearchPosts Component</h2>
              <p className="text-muted-foreground mb-6">
                Advanced search interface with filtering, trending topics, and user discovery
              </p>
              <div className="h-96 border border-border/50 rounded-2xl overflow-hidden bg-muted/20">
                <SearchPosts
                  currentUserId={mockUserId}
                  onPostSelect={(post) => console.log("Selected post:", post)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="bg-background/95 backdrop-blur-md border border-border/60 rounded-2xl p-6 bg-gradient-to-r from-primary/5 to-secondary/5">
          <div className="text-center space-y-2">
            <h3 className="font-semibold text-foreground">Ready for Implementation</h3>
            <p className="text-sm text-muted-foreground">
              These components are production-ready and follow modern design principles and accessibility standards.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}