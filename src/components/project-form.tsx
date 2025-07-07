
"use client";

import * as React from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, Upload } from "lucide-react";
import Image from "next/image";
import imageCompression from "browser-image-compression";

import { cn } from "@/lib/utils";
import type { Project } from "@/types";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const projectSchema = z.object({
  name: z.string().min(1, "Il titolo è obbligatorio"),
  image: z.string().min(1, "L'immagine è obbligatoria").refine(val => val.startsWith('data:image/') || val.startsWith('https://placehold.co'), {
    message: "Carica un'immagine per il progetto."
  }),
  location: z.string().min(1, "La località è obbligatoria"),
  startDate: z.date({ required_error: "La data di inizio è obbligatoria" }),
  endDate: z.date({ required_error: "La data di fine è obbligatoria" }),
  client: z.string().min(1, "Il committente è obbligatorio"),
  service: z.string().min(1, "La prestazione è obbligatoria"),
  amount: z.preprocess(
    (a) => parseFloat(String(a).replace(/[^0-9.-]+/g, "") || '0'),
    z.number({ invalid_type_error: "L'importo deve essere un numero" }).min(0, "L'importo non può essere negativo")
  ),
  status: z.enum(["Completato", "In Corso", "Concettuale", "Da fare"]),
  category: z.string().min(1, "La categoria è obbligatoria"),
  isPublic: z.boolean().default(true),
}).refine(data => data.endDate >= data.startDate, {
  message: "La data di fine non può essere precedente alla data di inizio",
  path: ["endDate"],
});


type ProjectFormValues = z.infer<typeof projectSchema>;

interface ProjectFormProps {
  onAddProject: (project: Omit<Project, 'id'>) => Promise<void>;
  onUpdateProject: (project: Project) => Promise<void>;
  projectToEdit?: Project | null;
  onClose: () => void;
}

export function ProjectForm({ onAddProject, onUpdateProject, projectToEdit, onClose }: ProjectFormProps) {
  const { toast } = useToast();
  const [isCompressing, setIsCompressing] = React.useState(false);
  const [isSubmitting, setIsSubmitting] = React.useState(false);

  const form = useForm<ProjectFormValues>({
    resolver: zodResolver(projectSchema),
    defaultValues: projectToEdit ? {
      ...projectToEdit,
      startDate: new Date(projectToEdit.startDate),
      endDate: new Date(projectToEdit.endDate),
      amount: projectToEdit.amount || 0,
    } : {
      name: "",
      image: "https://placehold.co/600x400.png",
      location: "",
      startDate: new Date(),
      endDate: new Date(),
      client: "",
      service: "",
      amount: 0,
      status: "In Corso",
      category: "",
      isPublic: true,
    },
  });

  const handleImageUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsCompressing(true);
    toast({ title: "Compressione immagine...", description: "Attendere prego, potrebbe richiedere un momento." });

    const options = {
      maxSizeMB: 0.9,
      maxWidthOrHeight: 1920,
      useWebWorker: true,
    };

    try {
      const compressedFile = await imageCompression(file, options);

      const reader = new FileReader();
      reader.onloadend = () => {
        form.setValue("image", reader.result as string, { shouldValidate: true });
        toast({ title: "Immagine caricata e compressa!" });
        setIsCompressing(false);
      };
      reader.readAsDataURL(compressedFile);
    } catch (error) {
      console.error("Error compressing image:", error);
      toast({
        variant: "destructive",
        title: "Errore di compressione",
        description: "Impossibile comprimere l'immagine. Prova con un file diverso.",
      });
      setIsCompressing(false);
    }
  };


  const onSubmit = async (data: ProjectFormValues) => {
    setIsSubmitting(true);
    const projectData = {
      ...data,
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      endDate: format(data.endDate, 'yyyy-MM-dd'),
      classification: projectToEdit?.classification || "",
      typology: projectToEdit?.typology || "",
      intervention: projectToEdit?.intervention || "",
      works: projectToEdit?.works || [],
      description: projectToEdit?.description || "",
    };

    try {
      if (projectToEdit) {
        await onUpdateProject({ ...projectData, id: projectToEdit.id });
        toast({ title: "Progetto aggiornato con successo!" });
      } else {
        await onAddProject(projectData);
        toast({ title: "Progetto aggiunto con successo!" });
      }
      onClose();
    } catch (error) {
        // Error toast is handled in the useProjects hook
    } finally {
        setIsSubmitting(false);
    }
  };
  
  const imageValue = form.watch('image');

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4 max-h-[80vh] overflow-y-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-6">
            <div className="md:col-span-2 space-y-6">
                <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                        <FormItem>
                        <FormLabel>Titolo del Progetto</FormLabel>
                        <FormControl>
                            <Input placeholder="es. Intervento Sicurezza Sismica su Villa Storica" {...field} />
                        </FormControl>
                        <FormMessage />
                        </FormItem>
                    )}
                />
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                        control={form.control}
                        name="location"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Località</FormLabel>
                            <FormControl>
                            <Input placeholder="es. Castelnuovo (IS)" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                    <FormField
                        control={form.control}
                        name="client"
                        render={({ field }) => (
                        <FormItem>
                            <FormLabel>Committente</FormLabel>
                            <FormControl>
                            <Input placeholder="es. Diocesi di Isernia" {...field} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                        )}
                    />
                </div>
            </div>

            <div className="md:col-span-1 space-y-2">
                 <FormLabel>Immagine Progetto</FormLabel>
                 <div className="relative w-full aspect-[4/3] rounded-md overflow-hidden border bg-muted">
                      {imageValue && (
                        <Image 
                          src={imageValue} 
                          alt="Anteprima progetto" 
                          fill={true}
                          sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                          style={{ objectFit: 'cover' }}
                          data-ai-hint="architecture design"
                          />
                      )}
                      <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity">
                         <Button type="button" variant="secondary" asChild>
                             <label htmlFor="image-upload" className="cursor-pointer">
                                 <Upload className="mr-2" />
                                 <span>{isCompressing ? "Comprimo..." : "Cambia"}</span>
                                 <Input id="image-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} disabled={isCompressing} />
                             </label>
                         </Button>
                      </div>
                 </div>
                 <FormField
                  control={form.control}
                  name="image"
                  render={() => (
                    <FormItem>
                      <FormMessage className="mt-2" />
                    </FormItem>
                  )}
                />
            </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <FormField
            control={form.control}
            name="startDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Inizio</FormLabel>
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
                      initialFocus
                      locale={it}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="endDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Data Fine</FormLabel>
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
                      initialFocus
                      locale={it}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="service"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Prestazione</FormLabel>
                <FormControl>
                  <Input placeholder="es. Progetto Esecutivo e DL" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="amount"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Importo Lavori (€)</FormLabel>
                <FormControl>
                  <Input type="number" placeholder="es. 530000" {...field} />
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
                <FormLabel>Avanzamento</FormLabel>
                <Select onValueChange={field.onChange} defaultValue={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Seleziona lo stato" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Da fare">Da fare</SelectItem>
                    <SelectItem value="In Corso">In Corso</SelectItem>
                    <SelectItem value="Completato">Completato</SelectItem>
                    <SelectItem value="Concettuale">Concettuale</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
           <FormField
            control={form.control}
            name="category"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Categoria Opere</FormLabel>
                <FormControl>
                  <Input placeholder="es. E.22 - Edifici di culto" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

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
        <div className="flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2 pt-4">
          <Button type="button" variant="outline" onClick={onClose}>
            Annulla
          </Button>
          <Button type="submit" disabled={isCompressing || isSubmitting}>{isSubmitting ? 'Salvataggio...' : projectToEdit ? 'Aggiorna Progetto' : 'Aggiungi Progetto'}</Button>
        </div>
      </form>
    </Form>
  );
}
