"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import {
  CalendarIcon,
  UploadCloud,
  X,
} from "lucide-react";
import { format } from "date-fns";
import { it } from "date-fns/locale";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
  DialogFooter,
} from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import Image from "next/image";
import { Switch } from "@/components/ui/switch";

const projectSchema = z.object({
  name: z.string().min(1, "Il nome del progetto è obbligatorio"),
  status: z.enum(["Completato", "In Corso", "Concettuale"]),
  location: z.string().min(1, "La località è obbligatoria"),
  completionDate: z.date({ required_error: "La data di completamento è obbligatoria" }),
  description: z.string().min(10, "La descrizione deve contenere almeno 10 caratteri"),
  image: z.any().refine((files) => files?.[0] || typeof files === 'string', "L'immagine è obbligatoria."),
  isPublic: z.boolean().default(true),
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
  const [imagePreview, setImagePreview] = React.useState<string | null>(projectToEdit?.image || null);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: projectToEdit ? {
        ...projectToEdit,
        completionDate: new Date(projectToEdit.completionDate),
        image: projectToEdit.image,
    } : {
      name: "",
      status: "In Corso",
      location: "",
      description: "",
      isPublic: true,
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

  const onSubmit = (data: ProjectFormValues) => {
    const projectData: Project = {
        ...data,
        id: projectToEdit?.id || new Date().toISOString(),
        completionDate: format(data.completionDate, 'yyyy-MM-dd'),
        image: imagePreview!,
    };
    
    if (projectToEdit) {
        onUpdateProject(projectData);
        toast({ title: "Progetto aggiornato con successo!" });
    } else {
        onAddProject(projectData);
        toast({ title: "Progetto aggiunto con successo!" });
    }
    onClose();
  };
  
  return (
    <DialogContent className="sm:max-w-2xl">
      <DialogHeader>
        <DialogTitle className="font-headline">{projectToEdit ? 'Modifica Progetto' : 'Aggiungi Nuovo Progetto'}</DialogTitle>
        <DialogDescription>
          Compila i dettagli del tuo progetto di architettura.
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
                    <FormLabel>Nome Progetto</FormLabel>
                    <FormControl>
                      <Input placeholder="es. Villa Moderna sul Lago" {...field} />
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
                    <FormLabel>Stato</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleziona lo stato del progetto" />
                        </Trigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="Completato">Completato</SelectItem>
                        <SelectItem value="In Corso">In Corso</SelectItem>
                        <SelectItem value="Concettuale">Concettuale</SelectItem>
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
                    <FormLabel>Località</FormLabel>
                    <FormControl>
                      <Input placeholder="es. Lago di Como, IT" {...field} />
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
                    <FormLabel>Data di Completamento</FormLabel>
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
                              format(field.value, "PPP", { locale: it })
                            ) : (
                              <span>Scegli una data</span>
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
                          locale={it}
                        />
                      </PopoverContent>
                    </Popover>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <div className="space-y-2">
                <FormLabel>Immagine del Progetto</FormLabel>
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
                                <p>Clicca per caricare o trascina e rilascia</p>
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
                <FormLabel>Descrizione</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Descrivi la visione del progetto, i materiali e le sfide..."
                    rows={6}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="isPublic"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                <div className="space-y-0.5">
                  <FormLabel>Visibilità Pubblica</FormLabel>
                  <FormDescription>
                    Rendi questo progetto visibile sul tuo portfolio pubblico.
                  </FormDescription>
                </div>
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                </FormControl>
              </FormItem>
            )}
          />
          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Annulla
            </Button>
            <Button type="submit">{projectToEdit ? 'Aggiorna Progetto' : 'Aggiungi Progetto'}</Button>
          </DialogFooter>
        </form>
      </Form>
    </DialogContent>
  );
}
