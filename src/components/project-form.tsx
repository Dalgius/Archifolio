
"use client";

import * as React from "react";
import Image from "next/image";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { format } from "date-fns";
import { it } from "date-fns/locale";
import { CalendarIcon, UploadCloud, X } from "lucide-react";

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
  image: z.any().refine((files) => files?.[0] || typeof files === 'string', "L'immagine è obbligatoria."),
  isPublic: z.boolean().default(true),
}).refine(data => data.endDate >= data.startDate, {
  message: "La data di fine non può essere precedente alla data di inizio",
  path: ["endDate"],
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
      startDate: new Date(projectToEdit.startDate),
      endDate: new Date(projectToEdit.endDate),
      image: projectToEdit.image,
      amount: projectToEdit.amount || 0,
    } : {
      name: "",
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
    // Keep fields that are not in the form but exist in the project type
    const existingData = projectToEdit ? {
      classification: projectToEdit.classification,
      typology: projectToEdit.typology,
      intervention: projectToEdit.intervention,
      works: projectToEdit.works,
      description: projectToEdit.description,
    } : {
      classification: "",
      typology: "",
      intervention: "",
      works: [],
      description: "",
    };

    const projectData: Project = {
      ...existingData,
      ...data,
      id: projectToEdit?.id || new Date().toISOString(),
      startDate: format(data.startDate, 'yyyy-MM-dd'),
      endDate: format(data.endDate, 'yyyy-MM-dd'),
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
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6 pt-4">
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
                        <Image src={imagePreview} alt="Anteprima" layout="fill" className="object-cover rounded-md" />
                        <Button type="button" variant="destructive" size="icon" className="absolute top-2 right-2 h-6 w-6 z-10" onClick={() => {
                            setImagePreview(null);
                            form.setValue("image", null);
                        }}>
                            <X className="h-4 w-4" />
                        </Button>
                        </>
                    ) : (
                        <div className="text-center">
                        <UploadCloud className="mx-auto h-8 w-8" />
                        <p>Carica o trascina un'immagine</p>
                        </div>
                    )}
                    </div>
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
          <Button type="submit">{projectToEdit ? 'Aggiorna Progetto' : 'Aggiungi Progetto'}</Button>
        </div>
      </form>
    </Form>
  );
}
