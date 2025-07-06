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
import { Textarea } from "@/components/ui/textarea";

const projectSchema = z.object({
  name: z.string().min(1, "Il titolo è obbligatorio"),
  status: z.enum(["Completato", "In Corso", "Concettuale", "Da fare"]),
  location: z.string().min(1, "La località è obbligatoria"),
  completionDate: z.date({ required_error: "La data è obbligatoria" }),
  classification: z.string().min(1, "La classificazione è obbligatoria"),
  category: z.string().min(1, "La categoria è obbligatoria"),
  typology: z.string().min(1, "La tipologia è obbligatoria"),
  intervention: z.string().min(1, "L'intervento è obbligatorio"),
  client: z.string().min(1, "Il committente è obbligatorio"),
  service: z.string().min(1, "La prestazione è obbligatoria"),
  amount: z.preprocess(
    (a) => parseFloat(String(a).replace(/[^0-9.-]+/g, "")),
    z.number({ invalid_type_error: "L'importo deve essere un numero" }).min(0, "L'importo non può essere negativo")
  ),
  works: z.string().optional(),
  description: z.string().optional(),
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
      works: projectToEdit.works.join('\\n'),
      description: projectToEdit.description || '',
      amount: projectToEdit.amount || 0,
    } : {
      name: "",
      status: "In Corso",
      location: "",
      completionDate: new Date(),
      classification: "",
      category: "",
      typology: "",
      intervention: "",
      client: "",
      service: "",
      amount: 0,
      works: "",
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
      works: data.works ? data.works.split('\\n').filter(line => line.trim() !== '') : [],
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">

          <div className="space-y-4 col-span-1">
             <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Titolo</FormLabel>
                  <FormControl>
                    <Input placeholder="es. Intervento Sicurezza Sismica" {...field} />
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
              name="completionDate"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Data</FormLabel>
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
          </div>

          <div className="space-y-4 col-span-1">
            <FormField
              control={form.control}
              name="classification"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Classificazione</FormLabel>
                  <FormControl>
                    <Input placeholder="es. Enti pubblici" {...field} />
                  </FormControl>
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
                    <Input placeholder="es. E.22" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="typology"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipologia</FormLabel>
                  <FormControl>
                    <Input placeholder="es. Chiesa" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
             <FormField
              control={form.control}
              name="intervention"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Intervento</FormLabel>
                  <FormControl>
                    <Input placeholder="es. Ristrutturazione" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <div className="space-y-4 col-span-1">
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
            <div className="space-y-2">
              <FormLabel>Immagine del Progetto</FormLabel>
              <FormField
                control={form.control}
                name="image"
                render={({ field }) => (
                  <FormItem>
                    <FormControl>
                      <div className="relative w-full h-24 border-2 border-dashed rounded-md flex items-center justify-center text-muted-foreground hover:border-primary transition-colors">
                        <Input
                          type="file"
                          accept="image/*"
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                          onChange={(e) => field.onChange(e.target.files)}
                        />
                        {imagePreview ? (
                          <>
                            <Image src={imagePreview} alt="Anteprima" fill className="object-cover rounded-md" />
                            <Button type="button" variant="destructive" size="icon" className="absolute top-1 right-1 h-6 w-6 z-10" onClick={() => {
                              setImagePreview(null);
                              form.setValue("image", null);
                            }}>
                              <X className="h-4 w-4" />
                            </Button>
                          </>
                        ) : (
                          <div className="text-center text-xs">
                            <UploadCloud className="mx-auto h-6 w-6" />
                            <p>Carica immagine</p>
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
        </div>

        <FormField
          control={form.control}
          name="works"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Lavori</FormLabel>
              <FormDescription>
                Elenca i lavori principali, uno per riga.
              </FormDescription>
              <FormControl>
                <Textarea
                  placeholder="es. Rifacimento copertura&#x0a;Consolidamento strutturale"
                  rows={4}
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Note / Descrizione</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Aggiungi qui eventuali note o una descrizione dettagliata del progetto..."
                  rows={4}
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
