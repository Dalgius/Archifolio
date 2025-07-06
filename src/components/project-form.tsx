"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CalendarIcon,
  Loader2,
  Sparkles,
  UploadCloud,
  X,
} from "lucide-react";
import { format } from "date-fns";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import {
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import { generateDescriptionAction } from "@/lib/actions";
import type { Project, ProjectStatus } from "@/types";
import Image from "next/image";

const projectSchema = z.object({
  name: z.string().min(1, "Project name is required"),
  status: z.enum(["Completed", "In Progress", "Conceptual"]),
  location: z.string().min(1, "Location is required"),
  completionDate: z.date({ required_error: "Completion date is required" }),
  description: z.string().min(10, "Description must be at least 10 characters"),
  image: z.any().refine((files) => files?.[0] || typeof files === 'string', "Image is required."),
});

type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  onAddProject: (project: Project) => void;
  onUpdateProject: (project: Project) => void;
  projectToEdit?: Project | null;
  onClose: () => void;
}

export function ProjectForm({ onAddProject, onUpdateProject, projectToEdit, onClose }: ProjectFormProps) {
  const { toast } = useToast();
  const [isGenerating, setIsGenerating] = React.useState(false);
  const [imagePreview, setImagePreview] = React.useState<string | null>(projectToEdit?.image || null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: projectToEdit ? {
        ...projectToEdit,
        completionDate: new Date(projectToEdit.completionDate),
        image: projectToEdit.image,
    } : {
      name: "",
      status: "In Progress",
      location: "",
      description: "",
    },
  });
  
  const watchedImage = form.watch("image");

  React.useEffect(() => {
    if (watchedImage && typeof watchedImage !== 'string' && watchedImage.length > 0) {
      const file = watchedImage[0];
      if (file instanceof File) {
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result as string);
        };
        reader.readAsDataURL(file);
      }
    } else if (typeof watchedImage === 'string') {
        setImagePreview(watchedImage);
    }
  }, [watchedImage]);


  const handleGenerateDescription = async () => {
    const { name, status, location, completionDate } = form.getValues();
    if (!name || !status || !location || !completionDate || !imagePreview) {
      toast({
        variant: "destructive",
        title: "Missing Information",
        description: "Please fill in all project details and upload an image before generating a description.",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const result = await generateDescriptionAction({
        projectName: name,
        projectType: status,
        location,
        completionDate: format(completionDate, "PPP"),
        imageDataUri: imagePreview,
      });

      if (result.success && result.description) {
        form.setValue("description", result.description, { shouldValidate: true });
        toast({ title: "Description generated successfully!" });
      } else {
        throw new Error(result.error);
      }
    } catch (error) {
      console.error(error);
      toast({
        variant: "destructive",
        title: "Generation Failed",
        description: (error as Error).message,
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const onSubmit = (data: ProjectFormValues) => {
    const projectData = {
        ...data,
        id: projectToEdit?.id || new Date().toISOString(),
        completionDate: format(data.completionDate, 'yyyy-MM-dd'),
        image: imagePreview!,
    };
    
    if (projectToEdit) {
        onUpdateProject(projectData);
        toast({ title: "Project updated successfully!" });
    } else {
        onAddProject(projectData);
        toast({ title: "Project added successfully!" });
    }
  };
  
  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-headline">{projectToEdit ? 'Edit Project' : 'Add New Project'}</DialogTitle>
        <DialogDescription>
          Fill in the details of your architectural project.
        </DialogDescription>
      </DialogHeader>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Project Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Modern Lake House" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="status"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Status</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select project status" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Completed">Completed</SelectItem>
                        <SelectItem value="In Progress">In Progress</SelectItem>
                        <SelectItem value="Conceptual">Conceptual</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g., Lake Tahoe, CA" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="completionDate"
                render={({ field }) => (
                  <FormItem className="flex flex-col">
                    <FormLabel>Completion Date</FormLabel>
                    <Popover>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            variant={"outline"}
                            className={cn(
                              "w-full pl-3 text-left font-normal",
                              !field.value && "text-muted-foreground"
                            )}
                          >
                            {field.value ? (
                              format(field.value, "PPP")
                            ) : (
                              <span>Pick a date</span>
                            )}
                            <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto p-0" align="start">
                        <Calendar
                          mode="single"
                          selected={field.value}
                          onSelect={field.onChange}
                          disabled={(date) => date > new Date() || date < new Date("1900-01-01")}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
                <FormLabel>Project Image</FormLabel>
                <FormField
                    control={form.control}
                    name="image"
                    render={({ field }) => (
                    <FormItem>
                        <FormControl>
                        <div className="relative w-full h-48 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground hover:border-primary transition-colors">
                            <Input
                            type="file"
                            accept="image/*"
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            onChange={(e) => field.onChange(e.target.files)}
                            />
                            {imagePreview ? (
                            <>
                                <Image src={imagePreview} alt="Project preview" layout="fill" objectFit="cover" className="rounded-md" />
                                <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 z-10" onClick={() => {
                                    setImagePreview(null);
                                    form.setValue("image", null);
                                }}>
                                    <X className="h-4 w-4"/>
                                </Button>
                            </>
                            ) : (
                            <div className="text-center">
                                <UploadCloud className="mx-auto h-8 w-8" />
                                <p>Click to upload or drag & drop</p>
                            </div>
                            )}
                        </div>
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                    )}
                />
            </div>

          </div>

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <div className="flex items-center justify-between">
                  <FormLabel>Description</FormLabel>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={handleGenerateDescription}
                    disabled={isGenerating}
                  >
                    {isGenerating ? (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    ) : (
                      <Sparkles className="mr-2 h-4 w-4 text-yellow-500" />
                    )}
                    Generate with AI
                  </Button>
                </div>
                <FormControl>
                  <Textarea
                    placeholder="Describe the project's vision, materials, and challenges..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">{projectToEdit ? 'Update Project' : 'Add Project'}</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
