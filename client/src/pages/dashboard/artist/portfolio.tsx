/**
 * ARTIST PORTFOLIO MANAGEMENT
 * Complete portfolio gallery with image management, categories, reordering
 * 
 * Features:
 * - Grid gallery with lightbox view
 * - Drag & drop reordering
 * - Multi-image upload
 * - Category organization
 * - Image details & editing
 * - Bulk actions
 * - Thumbnail optimization
 * - Cover image selection
 * - Style tagging
 * - Analytics per image
 */

import { useState, useCallback, useRef, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/hooks/useAuth";
import DashboardLayout from "@/components/dashboard-layout";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { motion, AnimatePresence, Reorder } from "framer-motion";
import {
  Image as ImageIcon,
  Upload,
  Trash2,
  Edit,
  Eye,
  Star,
  StarOff,
  MoreVertical,
  Grid,
  LayoutGrid,
  List,
  Search,
  Filter,
  Download,
  Copy,
  ExternalLink,
  X,
  ChevronLeft,
  ChevronRight,
  Plus,
  GripVertical,
  Bookmark,
  Tag,
  BarChart2,
  Heart,
  MessageCircle,
  Share2,
  Maximize2,
  CheckCircle,
  AlertCircle,
  Loader2,
  Folder,
  FolderPlus
} from "lucide-react";

// =============================================================================
// TYPES
// =============================================================================

interface PortfolioImage {
  id: string;
  url: string;
  thumbnailUrl: string;
  publicId: string;
  category: string;
  description?: string;
  tags: string[];
  order: number;
  isFeatured: boolean;
  isCoverImage: boolean;
  views: number;
  likes: number;
  saves: number;
  createdAt: string;
}

interface ImageCategory {
  id: string;
  name: string;
  slug: string;
  imageCount: number;
}

interface UploadProgress {
  fileName: string;
  progress: number;
  status: "uploading" | "processing" | "complete" | "error";
  error?: string;
}

type ViewMode = "grid" | "masonry" | "list";

// =============================================================================
// CONSTANTS
// =============================================================================

const TATTOO_STYLES = [
  "Fineline", "Blackwork", "Traditional", "Neo-Traditional", "Realism",
  "Watercolor", "Dotwork", "Geometric", "Minimalist", "Japanese",
  "Tribal", "Script/Lettering", "Portrait", "Ornamental", "Trash Polka"
];

const DEFAULT_CATEGORIES: ImageCategory[] = [
  { id: "all", name: "All Work", slug: "all", imageCount: 0 },
  { id: "fineline", name: "Fineline", slug: "fineline", imageCount: 0 },
  { id: "blackwork", name: "Blackwork", slug: "blackwork", imageCount: 0 },
  { id: "color", name: "Color", slug: "color", imageCount: 0 },
  { id: "cover-ups", name: "Cover-ups", slug: "cover-ups", imageCount: 0 }
];

// =============================================================================
// MOCK DATA
// =============================================================================

const mockImages: PortfolioImage[] = Array.from({ length: 24 }, (_, i) => ({
  id: `IMG${String(i + 1).padStart(3, "0")}`,
  url: `https://picsum.photos/800/1000?random=${i + 1}`,
  thumbnailUrl: `https://picsum.photos/400/500?random=${i + 1}`,
  publicId: `portfolio/img_${i + 1}`,
  category: DEFAULT_CATEGORIES[Math.floor(Math.random() * 4) + 1].slug,
  description: i % 3 === 0 ? "Beautiful fineline butterfly design on the shoulder blade area." : undefined,
  tags: TATTOO_STYLES.slice(0, Math.floor(Math.random() * 3) + 1),
  order: i,
  isFeatured: i < 3,
  isCoverImage: i === 0,
  views: Math.floor(Math.random() * 1000) + 100,
  likes: Math.floor(Math.random() * 100) + 10,
  saves: Math.floor(Math.random() * 50) + 5,
  createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000).toISOString()
}));

// =============================================================================
// UTILITY FUNCTIONS
// =============================================================================

const formatNumber = (num: number): string => {
  if (num >= 1000) return `${(num / 1000).toFixed(1)}k`;
  return num.toString();
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric"
  });
};

// =============================================================================
// COMPONENTS
// =============================================================================

function ImageCard({
  image,
  selected,
  onSelect,
  onView,
  onEdit,
  onDelete,
  onSetCover,
  onToggleFeatured,
  viewMode
}: {
  image: PortfolioImage;
  selected: boolean;
  onSelect: () => void;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
  onSetCover: () => void;
  onToggleFeatured: () => void;
  viewMode: ViewMode;
}) {
  const [isHovered, setIsHovered] = useState(false);

  if (viewMode === "list") {
    return (
      <div className={`flex items-center gap-4 p-4 rounded-lg border transition-all ${selected ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5" : "border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/30"
        }`}>
        <Checkbox checked={selected} onCheckedChange={onSelect} />
        <img
          src={image.thumbnailUrl}
          alt=""
          className="w-16 h-16 rounded-lg object-cover"
        />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="font-medium text-[var(--text-primary)] truncate">
              {image.description || `Image ${image.id}`}
            </p>
            {image.isFeatured && <Star className="w-4 h-4 text-[var(--brand-gold)] fill-current" />}
            {image.isCoverImage && <Badge className="badge-success text-xs">Cover</Badge>}
          </div>
          <div className="flex flex-wrap gap-1 mt-1">
            {image.tags.slice(0, 3).map(tag => (
              <Badge key={tag} variant="secondary" className="text-xs">{tag}</Badge>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-4 text-sm text-[var(--text-muted)]">
          <span className="flex items-center gap-1"><Eye className="w-4 h-4" /> {formatNumber(image.views)}</span>
          <span className="flex items-center gap-1"><Heart className="w-4 h-4" /> {formatNumber(image.likes)}</span>
          <span>{formatDate(image.createdAt)}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={onView}><Eye className="w-4 h-4 mr-2" /> View</DropdownMenuItem>
            <DropdownMenuItem onClick={onEdit}><Edit className="w-4 h-4 mr-2" /> Edit</DropdownMenuItem>
            <DropdownMenuItem onClick={onToggleFeatured}>
              {image.isFeatured ? <StarOff className="w-4 h-4 mr-2" /> : <Star className="w-4 h-4 mr-2" />}
              {image.isFeatured ? "Unfeature" : "Feature"}
            </DropdownMenuItem>
            <DropdownMenuItem onClick={onSetCover}><ImageIcon className="w-4 h-4 mr-2" /> Set as Cover</DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={onDelete} className="text-[var(--signal-error)]">
              <Trash2 className="w-4 h-4 mr-2" /> Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      className={`relative group rounded-xl overflow-hidden border-2 transition-all ${selected ? "border-[var(--brand-primary)]" : "border-transparent hover:border-[var(--brand-primary)]/30"
        }`}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="aspect-[4/5] relative">
        <img
          src={image.thumbnailUrl}
          alt={image.description || "Portfolio image"}
          className="w-full h-full object-cover"
          loading="lazy"
        />

        {/* Badges */}
        <div className="absolute top-2 left-2 flex flex-col gap-1">
          {image.isCoverImage && (
            <Badge className="badge-success text-xs">Cover</Badge>
          )}
          {image.isFeatured && (
            <Badge className="bg-[var(--brand-gold)] text-white text-xs">Featured</Badge>
          )}
        </div>

        {/* Selection checkbox */}
        <div className={`absolute top-2 right-2 transition-opacity ${isHovered || selected ? "opacity-100" : "opacity-0"
          }`}>
          <Checkbox
            checked={selected}
            onCheckedChange={onSelect}
            className="w-6 h-6 bg-white/90 border-2"
          />
        </div>

        {/* Hover overlay */}
        <AnimatePresence>
          {isHovered && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 flex flex-col justify-end p-4"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-3 text-white text-sm">
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" /> {formatNumber(image.views)}
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-4 h-4" /> {formatNumber(image.likes)}
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onView}>
                    <Maximize2 className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onEdit}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20" onClick={onToggleFeatured}>
                    <Star className={`w-4 h-4 ${image.isFeatured ? "fill-current text-[var(--brand-gold)]" : ""}`} />
                  </Button>
                </div>
              </div>
              {image.description && (
                <p className="text-white text-sm line-clamp-2">{image.description}</p>
              )}
              <div className="flex flex-wrap gap-1 mt-2">
                {image.tags.slice(0, 3).map(tag => (
                  <span key={tag} className="px-2 py-0.5 rounded text-xs bg-white/20 text-white">
                    {tag}
                  </span>
                ))}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  );
}

function UploadModal({
  open,
  onOpenChange,
  onUpload
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpload: (files: File[], category: string, tags: string[]) => void;
}) {
  const [files, setFiles] = useState<File[]>([]);
  const [category, setCategory] = useState("fineline");
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    const droppedFiles = Array.from(e.dataTransfer.files).filter(
      f => f.type.startsWith("image/")
    );
    setFiles(prev => [...prev, ...droppedFiles].slice(0, 20));
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      setFiles(prev => [...prev, ...selectedFiles].slice(0, 20));
    }
  };

  const removeFile = (index: number) => {
    setFiles(prev => prev.filter((_, i) => i !== index));
  };

  const toggleTag = (tag: string) => {
    setSelectedTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = () => {
    if (files.length > 0) {
      onUpload(files, category, selectedTags);
      setFiles([]);
      setSelectedTags([]);
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Upload Images</DialogTitle>
          <DialogDescription>
            Add new images to your portfolio (max 20 at a time)
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Drop zone */}
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 transition-colors ${dragActive
                ? "border-[var(--brand-primary)] bg-[var(--brand-primary)]/5"
                : "border-[var(--border-subtle)] hover:border-[var(--brand-primary)]/50"
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <div className="text-center">
              <Upload className="w-12 h-12 mx-auto mb-4 text-[var(--text-muted)]" />
              <p className="text-lg font-medium text-[var(--text-primary)]">
                Drag & drop images here
              </p>
              <p className="text-sm text-[var(--text-muted)] mb-4">
                or click to browse
              </p>
              <Button variant="outline" onClick={() => fileInputRef.current?.click()}>
                Select Files
              </Button>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                className="hidden"
                onChange={handleFileSelect}
              />
            </div>
          </div>

          {/* Selected files */}
          {files.length > 0 && (
            <div className="space-y-2">
              <Label>Selected Files ({files.length}/20)</Label>
              <div className="grid grid-cols-4 gap-2 max-h-40 overflow-y-auto">
                {files.map((file, index) => (
                  <div key={index} className="relative group">
                    <img
                      src={URL.createObjectURL(file)}
                      alt=""
                      className="w-full aspect-square object-cover rounded-lg"
                    />
                    <button
                      onClick={() => removeFile(index)}
                      className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Category */}
          <div className="space-y-2">
            <Label>Category</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {DEFAULT_CATEGORIES.slice(1).map(cat => (
                  <SelectItem key={cat.id} value={cat.slug}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Tags */}
          <div className="space-y-2">
            <Label>Style Tags</Label>
            <div className="flex flex-wrap gap-2">
              {TATTOO_STYLES.map(tag => (
                <Badge
                  key={tag}
                  variant={selectedTags.includes(tag) ? "default" : "outline"}
                  className={`cursor-pointer transition-colors ${selectedTags.includes(tag) ? "bg-[var(--brand-primary)]" : ""
                    }`}
                  onClick={() => toggleTag(tag)}
                >
                  {tag}
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={files.length === 0} className="btn-primary">
            <Upload className="w-4 h-4 mr-2" />
            Upload {files.length} {files.length === 1 ? "Image" : "Images"}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

function ImageDetailModal({
  image,
  open,
  onOpenChange,
  onSave,
  onDelete,
  onPrev,
  onNext,
  hasPrev,
  hasNext
}: {
  image: PortfolioImage | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (id: string, data: Partial<PortfolioImage>) => void;
  onDelete: (id: string) => void;
  onPrev: () => void;
  onNext: () => void;
  hasPrev: boolean;
  hasNext: boolean;
}) {
  const [editMode, setEditMode] = useState(false);
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [tags, setTags] = useState<string[]>([]);

  useEffect(() => {
    if (image) {
      setDescription(image.description || "");
      setCategory(image.category);
      setTags(image.tags);
      setEditMode(false);
    }
  }, [image]);

  if (!image) return null;

  const handleSave = () => {
    onSave(image.id, { description, category, tags });
    setEditMode(false);
  };

  const toggleTag = (tag: string) => {
    setTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl p-0 overflow-hidden">
        <div className="grid md:grid-cols-2">
          {/* Image */}
          <div className="relative bg-black flex items-center justify-center min-h-[400px]">
            <img
              src={image.url}
              alt={image.description || "Portfolio image"}
              className="max-w-full max-h-[80vh] object-contain"
            />

            {/* Navigation */}
            {hasPrev && (
              <button
                onClick={onPrev}
                className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white"
              >
                <ChevronLeft className="w-6 h-6" />
              </button>
            )}
            {hasNext && (
              <button
                onClick={onNext}
                className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/20 hover:bg-white/40 flex items-center justify-center text-white"
              >
                <ChevronRight className="w-6 h-6" />
              </button>
            )}
          </div>

          {/* Details */}
          <div className="p-6 space-y-6 max-h-[80vh] overflow-y-auto">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-[var(--text-primary)]">Image Details</h3>
              <Button variant="ghost" size="icon" onClick={() => setEditMode(!editMode)}>
                <Edit className="w-4 h-4" />
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-3 rounded-lg bg-[var(--bg-surface)]">
                <Eye className="w-5 h-5 mx-auto mb-1 text-[var(--text-muted)]" />
                <p className="font-semibold text-[var(--text-primary)]">{formatNumber(image.views)}</p>
                <p className="text-xs text-[var(--text-muted)]">Views</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--bg-surface)]">
                <Heart className="w-5 h-5 mx-auto mb-1 text-[var(--signal-error)]" />
                <p className="font-semibold text-[var(--text-primary)]">{formatNumber(image.likes)}</p>
                <p className="text-xs text-[var(--text-muted)]">Likes</p>
              </div>
              <div className="text-center p-3 rounded-lg bg-[var(--bg-surface)]">
                <Bookmark className="w-5 h-5 mx-auto mb-1 text-[var(--brand-primary)]" />
                <p className="font-semibold text-[var(--text-primary)]">{formatNumber(image.saves)}</p>
                <p className="text-xs text-[var(--text-muted)]">Saves</p>
              </div>
            </div>

            {/* Description */}
            <div className="space-y-2">
              <Label>Description</Label>
              {editMode ? (
                <Textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Add a description..."
                  rows={3}
                />
              ) : (
                <p className="text-[var(--text-secondary)]">
                  {image.description || "No description"}
                </p>
              )}
            </div>

            {/* Category */}
            <div className="space-y-2">
              <Label>Category</Label>
              {editMode ? (
                <Select value={category} onValueChange={setCategory}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DEFAULT_CATEGORIES.slice(1).map(cat => (
                      <SelectItem key={cat.id} value={cat.slug}>
                        {cat.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Badge variant="secondary">{image.category}</Badge>
              )}
            </div>

            {/* Tags */}
            <div className="space-y-2">
              <Label>Style Tags</Label>
              {editMode ? (
                <div className="flex flex-wrap gap-2">
                  {TATTOO_STYLES.map(tag => (
                    <Badge
                      key={tag}
                      variant={tags.includes(tag) ? "default" : "outline"}
                      className={`cursor-pointer ${tags.includes(tag) ? "bg-[var(--brand-primary)]" : ""}`}
                      onClick={() => toggleTag(tag)}
                    >
                      {tag}
                    </Badge>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {image.tags.map(tag => (
                    <Badge key={tag} variant="secondary">{tag}</Badge>
                  ))}
                </div>
              )}
            </div>

            {/* Created */}
            <div className="pt-4 border-t border-[var(--border-subtle)]">
              <p className="text-sm text-[var(--text-muted)]">
                Uploaded on {formatDate(image.createdAt)}
              </p>
            </div>

            {/* Actions */}
            <div className="flex gap-2 pt-4">
              {editMode ? (
                <>
                  <Button variant="outline" onClick={() => setEditMode(false)} className="flex-1">
                    Cancel
                  </Button>
                  <Button onClick={handleSave} className="flex-1 btn-primary">
                    Save Changes
                  </Button>
                </>
              ) : (
                <>
                  <Button variant="outline" className="flex-1" onClick={() => window.open(image.url, "_blank")}>
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </Button>
                  <Button variant="outline" className="flex-1 text-[var(--signal-error)]" onClick={() => onDelete(image.id)}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function UploadProgress({ uploads }: { uploads: UploadProgress[] }) {
  if (uploads.length === 0) return null;

  return (
    <Card className="card-white">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium">Uploading Images</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {uploads.map((upload, index) => (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="truncate max-w-[200px] text-[var(--text-secondary)]">
                {upload.fileName}
              </span>
              {upload.status === "complete" && <CheckCircle className="w-4 h-4 text-[var(--signal-success)]" />}
              {upload.status === "error" && <AlertCircle className="w-4 h-4 text-[var(--signal-error)]" />}
              {(upload.status === "uploading" || upload.status === "processing") && (
                <Loader2 className="w-4 h-4 animate-spin text-[var(--brand-primary)]" />
              )}
            </div>
            <Progress value={upload.progress} className="h-1" />
          </div>
        ))}
      </CardContent>
    </Card>
  );
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

export default function ArtistPortfolio() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // State
  const [images, setImages] = useState<PortfolioImage[]>(mockImages);
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<ViewMode>("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [detailImage, setDetailImage] = useState<PortfolioImage | null>(null);
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [uploads, setUploads] = useState<UploadProgress[]>([]);

  // Filtered images
  const filteredImages = useMemo(() => {
    return images.filter(img => {
      const matchesSearch = !searchQuery ||
        img.description?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        img.tags.some(t => t.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesCategory = categoryFilter === "all" || img.category === categoryFilter;
      return matchesSearch && matchesCategory;
    }).sort((a, b) => a.order - b.order);
  }, [images, searchQuery, categoryFilter]);

  // Categories with counts
  const categories = useMemo(() => {
    return DEFAULT_CATEGORIES.map(cat => ({
      ...cat,
      imageCount: cat.id === "all" ? images.length : images.filter(i => i.category === cat.slug).length
    }));
  }, [images]);

  // Handlers
  const handleSelect = (id: string) => {
    setSelectedIds(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSelectAll = () => {
    if (selectedIds.size === filteredImages.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(filteredImages.map(i => i.id)));
    }
  };

  const handleUpload = async (files: File[], category: string, tags: string[]) => {
    // Simulate upload progress
    const newUploads: UploadProgress[] = files.map(f => ({
      fileName: f.name,
      progress: 0,
      status: "uploading"
    }));
    setUploads(newUploads);

    for (let i = 0; i < files.length; i++) {
      // Simulate progress
      for (let p = 0; p <= 100; p += 20) {
        await new Promise(r => setTimeout(r, 100));
        setUploads(prev => prev.map((u, idx) =>
          idx === i ? { ...u, progress: p } : u
        ));
      }

      // Mark complete
      setUploads(prev => prev.map((u, idx) =>
        idx === i ? { ...u, status: "complete" } : u
      ));

      // Add to images
      const newImage: PortfolioImage = {
        id: `IMG${Date.now()}_${i}`,
        url: URL.createObjectURL(files[i]),
        thumbnailUrl: URL.createObjectURL(files[i]),
        publicId: `portfolio/${Date.now()}_${i}`,
        category,
        tags,
        order: images.length + i,
        isFeatured: false,
        isCoverImage: false,
        views: 0,
        likes: 0,
        saves: 0,
        createdAt: new Date().toISOString()
      };
      setImages(prev => [...prev, newImage]);
    }

    // Clear uploads after delay
    setTimeout(() => setUploads([]), 2000);
  };

  const handleViewImage = (image: PortfolioImage) => {
    setDetailImage(image);
    setDetailModalOpen(true);
  };

  const handleEditImage = (image: PortfolioImage) => {
    setDetailImage(image);
    setDetailModalOpen(true);
  };

  const handleDeleteImage = (id: string) => {
    setImages(prev => prev.filter(i => i.id !== id));
    setSelectedIds(prev => {
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
    setDetailModalOpen(false);
  };

  const handleDeleteSelected = () => {
    setImages(prev => prev.filter(i => !selectedIds.has(i.id)));
    setSelectedIds(new Set());
  };

  const handleSaveImage = (id: string, data: Partial<PortfolioImage>) => {
    setImages(prev => prev.map(i => i.id === id ? { ...i, ...data } : i));
  };

  const handleSetCover = (id: string) => {
    setImages(prev => prev.map(i => ({ ...i, isCoverImage: i.id === id })));
  };

  const handleToggleFeatured = (id: string) => {
    setImages(prev => prev.map(i =>
      i.id === id ? { ...i, isFeatured: !i.isFeatured } : i
    ));
  };

  const handlePrevImage = () => {
    const currentIndex = filteredImages.findIndex(i => i.id === detailImage?.id);
    if (currentIndex > 0) {
      setDetailImage(filteredImages[currentIndex - 1]);
    }
  };

  const handleNextImage = () => {
    const currentIndex = filteredImages.findIndex(i => i.id === detailImage?.id);
    if (currentIndex < filteredImages.length - 1) {
      setDetailImage(filteredImages[currentIndex + 1]);
    }
  };

  const currentImageIndex = detailImage ? filteredImages.findIndex(i => i.id === detailImage.id) : -1;

  return (
    <DashboardLayout title="Portfolio" subtitle="Manage your work gallery">
      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Card className="stat-card">
          <CardContent className="p-4">
            <ImageIcon className="w-5 h-5 text-[var(--brand-primary)] mb-2" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">{images.length}</p>
            <p className="text-sm text-[var(--text-muted)]">Total Images</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <Star className="w-5 h-5 text-[var(--brand-gold)] mb-2" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {images.filter(i => i.isFeatured).length}
            </p>
            <p className="text-sm text-[var(--text-muted)]">Featured</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <Eye className="w-5 h-5 text-[var(--text-muted)] mb-2" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {formatNumber(images.reduce((sum, i) => sum + i.views, 0))}
            </p>
            <p className="text-sm text-[var(--text-muted)]">Total Views</p>
          </CardContent>
        </Card>
        <Card className="stat-card">
          <CardContent className="p-4">
            <Heart className="w-5 h-5 text-[var(--signal-error)] mb-2" />
            <p className="text-2xl font-bold text-[var(--text-primary)]">
              {formatNumber(images.reduce((sum, i) => sum + i.likes, 0))}
            </p>
            <p className="text-sm text-[var(--text-muted)]">Total Likes</p>
          </CardContent>
        </Card>
      </div>

      {/* Upload Progress */}
      <UploadProgress uploads={uploads} />

      {/* Toolbar */}
      <Card className="card-white mb-6">
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex items-center gap-4 flex-wrap">
              {/* Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
                <Input
                  placeholder="Search images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10 w-64"
                />
              </div>

              {/* Category Filter */}
              <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                <SelectTrigger className="w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name} ({cat.imageCount})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* View Mode */}
              <div className="flex items-center border border-[var(--border-subtle)] rounded-lg p-1">
                <Button
                  variant={viewMode === "grid" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("grid")}
                >
                  <Grid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "masonry" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("masonry")}
                >
                  <LayoutGrid className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === "list" ? "default" : "ghost"}
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => setViewMode("list")}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <>
                  <span className="text-sm text-[var(--text-muted)]">
                    {selectedIds.size} selected
                  </span>
                  <Button variant="outline" size="sm" onClick={handleDeleteSelected}>
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => setSelectedIds(new Set())}>
                    Clear
                  </Button>
                </>
              )}
              <Button onClick={() => setUploadModalOpen(true)} className="btn-primary">
                <Upload className="w-4 h-4 mr-2" />
                Upload
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Gallery */}
      {filteredImages.length === 0 ? (
        <Card className="card-white">
          <CardContent className="py-16 text-center">
            <ImageIcon className="w-16 h-16 mx-auto mb-4 text-[var(--text-muted)]" />
            <h3 className="text-lg font-semibold text-[var(--text-primary)] mb-2">
              No images found
            </h3>
            <p className="text-[var(--text-secondary)] mb-4">
              {searchQuery || categoryFilter !== "all"
                ? "Try adjusting your filters"
                : "Upload your first portfolio images"
              }
            </p>
            <Button onClick={() => setUploadModalOpen(true)} className="btn-primary">
              <Upload className="w-4 h-4 mr-2" />
              Upload Images
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className={
          viewMode === "list" ? "space-y-2" :
            viewMode === "masonry" ? "columns-2 md:columns-3 lg:columns-4 gap-4" :
              "grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
        }>
          <AnimatePresence>
            {filteredImages.map((image) => (
              <ImageCard
                key={image.id}
                image={image}
                selected={selectedIds.has(image.id)}
                onSelect={() => handleSelect(image.id)}
                onView={() => handleViewImage(image)}
                onEdit={() => handleEditImage(image)}
                onDelete={() => handleDeleteImage(image.id)}
                onSetCover={() => handleSetCover(image.id)}
                onToggleFeatured={() => handleToggleFeatured(image.id)}
                viewMode={viewMode}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Modals */}
      <UploadModal
        open={uploadModalOpen}
        onOpenChange={setUploadModalOpen}
        onUpload={handleUpload}
      />

      <ImageDetailModal
        image={detailImage}
        open={detailModalOpen}
        onOpenChange={setDetailModalOpen}
        onSave={handleSaveImage}
        onDelete={handleDeleteImage}
        onPrev={handlePrevImage}
        onNext={handleNextImage}
        hasPrev={currentImageIndex > 0}
        hasNext={currentImageIndex < filteredImages.length - 1}
      />
    </DashboardLayout>
  );
}
