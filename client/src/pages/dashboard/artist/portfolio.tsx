import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { Plus, Folder, Image, Trash2, Loader2, GripVertical } from "lucide-react";

interface PortfolioPhoto {
  id: string;
  categoryId: string;
  photoUrl: string;
  description: string | null;
  sortOrder: number | null;
  createdAt: string | null;
}

interface PortfolioCategory {
  id: string;
  artistId: string;
  name: string;
  description: string | null;
  sortOrder: number | null;
  isActive: boolean | null;
  createdAt: string | null;
}

export default function PortfolioPage() {
  const { toast } = useToast();
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [newCategoryDesc, setNewCategoryDesc] = useState("");
  const [newPhotoUrl, setNewPhotoUrl] = useState("");
  const [newPhotoDesc, setNewPhotoDesc] = useState("");
  const [categoryDialogOpen, setCategoryDialogOpen] = useState(false);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);

  const { data: categories = [], isLoading: loadingCategories } = useQuery<PortfolioCategory[]>({
    queryKey: ["/api/artist/portfolio/categories"],
  });

  const { data: photos = [], isLoading: loadingPhotos } = useQuery<PortfolioPhoto[]>({
    queryKey: ["/api/artist/portfolio/categories", selectedCategory, "photos"],
    enabled: !!selectedCategory,
  });

  const createCategoryMutation = useMutation({
    mutationFn: async (data: { name: string; description: string }) => {
      return apiRequest("/api/artist/portfolio/categories", {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artist/portfolio/categories"] });
      setNewCategoryName("");
      setNewCategoryDesc("");
      setCategoryDialogOpen(false);
      toast({ title: "Category created", description: "Your portfolio category has been created." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/artist/portfolio/categories/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artist/portfolio/categories"] });
      if (selectedCategory) setSelectedCategory(null);
      toast({ title: "Category deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const addPhotoMutation = useMutation({
    mutationFn: async (data: { photoUrl: string; description: string }) => {
      return apiRequest(`/api/artist/portfolio/categories/${selectedCategory}/photos`, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artist/portfolio/categories", selectedCategory, "photos"] });
      setNewPhotoUrl("");
      setNewPhotoDesc("");
      setPhotoDialogOpen(false);
      toast({ title: "Photo added", description: "Your photo has been added to the portfolio." });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const deletePhotoMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/artist/portfolio/photos/${id}`, { method: "DELETE" });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/artist/portfolio/categories", selectedCategory, "photos"] });
      toast({ title: "Photo deleted" });
    },
    onError: (error: Error) => {
      toast({ title: "Error", description: error.message, variant: "destructive" });
    },
  });

  const selectedCategoryData = categories.find(c => c.id === selectedCategory);
  const photoCount = photos.length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" data-testid="text-portfolio-title">Portfolio</h1>
          <p className="text-muted-foreground">Manage your tattoo portfolio with categories and photos</p>
        </div>
        
        <Dialog open={categoryDialogOpen} onOpenChange={setCategoryDialogOpen}>
          <DialogTrigger asChild>
            <Button data-testid="button-add-category">
              <Plus className="w-4 h-4 mr-2" />
              New Category
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Portfolio Category</DialogTitle>
              <DialogDescription>Add a new category to organize your tattoo work</DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <label className="text-sm font-medium">Category Name</label>
                <Input
                  placeholder="e.g., Black & Grey, Traditional, Geometric..."
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  data-testid="input-category-name"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Description (optional)</label>
                <Textarea
                  placeholder="Describe this style or category..."
                  value={newCategoryDesc}
                  onChange={(e) => setNewCategoryDesc(e.target.value)}
                  data-testid="input-category-description"
                />
              </div>
            </div>
            <DialogFooter>
              <Button
                onClick={() => createCategoryMutation.mutate({ name: newCategoryName, description: newCategoryDesc })}
                disabled={!newCategoryName || createCategoryMutation.isPending}
                data-testid="button-save-category"
              >
                {createCategoryMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Create Category
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-3">
          <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Categories</h3>
          
          {loadingCategories ? (
            <div className="flex items-center justify-center p-8">
              <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
            </div>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-6 text-center">
                <Folder className="w-12 h-12 text-muted-foreground mb-3" />
                <p className="text-muted-foreground">No categories yet</p>
                <p className="text-sm text-muted-foreground">Create your first category to start organizing your portfolio</p>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {categories.map((category) => (
                <Card
                  key={category.id}
                  className={`cursor-pointer transition-colors ${
                    selectedCategory === category.id ? "ring-2 ring-primary" : "hover-elevate"
                  }`}
                  onClick={() => setSelectedCategory(category.id)}
                  data-testid={`card-category-${category.id}`}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <GripVertical className="w-4 h-4 text-muted-foreground shrink-0" />
                        <div className="truncate">
                          <p className="font-medium truncate">{category.name}</p>
                          {category.description && (
                            <p className="text-xs text-muted-foreground truncate">{category.description}</p>
                          )}
                        </div>
                      </div>
                      {!category.isActive && <Badge variant="secondary" className="shrink-0">Inactive</Badge>}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        <div className="md:col-span-2">
          {selectedCategory ? (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between gap-4 flex-wrap">
                <div>
                  <CardTitle>{selectedCategoryData?.name}</CardTitle>
                  <CardDescription>
                    {photoCount}/20 photos
                    {selectedCategoryData?.description && ` — ${selectedCategoryData.description}`}
                  </CardDescription>
                </div>
                <div className="flex items-center gap-2">
                  <Dialog open={photoDialogOpen} onOpenChange={setPhotoDialogOpen}>
                    <DialogTrigger asChild>
                      <Button size="sm" disabled={photoCount >= 20} data-testid="button-add-photo">
                        <Plus className="w-4 h-4 mr-2" />
                        Add Photo
                      </Button>
                    </DialogTrigger>
                    <DialogContent>
                      <DialogHeader>
                        <DialogTitle>Add Photo</DialogTitle>
                        <DialogDescription>Add a new photo to this category (max 20 photos per category)</DialogDescription>
                      </DialogHeader>
                      <div className="space-y-4 py-4">
                        <div>
                          <label className="text-sm font-medium">Photo URL</label>
                          <Input
                            placeholder="https://example.com/photo.jpg"
                            value={newPhotoUrl}
                            onChange={(e) => setNewPhotoUrl(e.target.value)}
                            data-testid="input-photo-url"
                          />
                        </div>
                        <div>
                          <label className="text-sm font-medium">Description (optional)</label>
                          <Textarea
                            placeholder="Describe this tattoo..."
                            value={newPhotoDesc}
                            onChange={(e) => setNewPhotoDesc(e.target.value)}
                            data-testid="input-photo-description"
                          />
                        </div>
                      </div>
                      <DialogFooter>
                        <Button
                          onClick={() => addPhotoMutation.mutate({ photoUrl: newPhotoUrl, description: newPhotoDesc })}
                          disabled={!newPhotoUrl || addPhotoMutation.isPending}
                          data-testid="button-save-photo"
                        >
                          {addPhotoMutation.isPending && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                          Add Photo
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => deleteCategoryMutation.mutate(selectedCategory)}
                    disabled={deleteCategoryMutation.isPending}
                    data-testid="button-delete-category"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {loadingPhotos ? (
                  <div className="flex items-center justify-center p-12">
                    <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                  </div>
                ) : photos.length === 0 ? (
                  <div className="flex flex-col items-center justify-center p-12 text-center">
                    <Image className="w-12 h-12 text-muted-foreground mb-3" />
                    <p className="text-muted-foreground">No photos in this category</p>
                    <p className="text-sm text-muted-foreground">Add your first photo to showcase your work</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="group relative aspect-square" data-testid={`photo-${photo.id}`}>
                        <img
                          src={photo.photoUrl}
                          alt={photo.description || "Portfolio photo"}
                          className="w-full h-full object-cover rounded-md"
                          loading="lazy"
                        />
                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-md flex items-center justify-center">
                          <Button
                            variant="destructive"
                            size="icon"
                            onClick={() => deletePhotoMutation.mutate(photo.id)}
                            disabled={deletePhotoMutation.isPending}
                            data-testid={`button-delete-photo-${photo.id}`}
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                        {photo.description && (
                          <p className="absolute bottom-0 left-0 right-0 p-2 bg-black/70 text-white text-xs truncate rounded-b-md">
                            {photo.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="flex flex-col items-center justify-center p-12 text-center">
                <Folder className="w-16 h-16 text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Select a Category</h3>
                <p className="text-muted-foreground">
                  Choose a category from the left to view and manage photos
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
