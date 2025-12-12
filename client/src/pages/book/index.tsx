import { useState, useEffect, useRef, useCallback } from "react";
import { useRoute } from "wouter";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Skeleton } from "@/components/ui/skeleton";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Progress } from "@/components/ui/progress";
import { LogoCompact } from "@/components/logo";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Calendar,
  Clock,
  MapPin,
  Instagram,
  ChevronLeft,
  ChevronRight,
  Lock,
  CheckCircle2,
  AlertCircle,
  Shield,
  CreditCard,
  Upload,
  X,
  Image as ImageIcon,
  Sparkles,
  Palette,
  Timer,
  FileText,
  Check,
  ArrowRight,
  User,
  Mail,
  Phone,
  Loader2,
} from "lucide-react";
import { SiWhatsapp, SiStripe, SiRevolut, SiWise } from "react-icons/si";
import { bookingFormSchema, type BookingFormData, type Artist, type Availability, type CitySchedule, type DepositValue } from "@shared/schema";

const DAYS = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sab"];

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -20 },
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.08,
    },
  },
};

const scaleIn = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.9 },
};

type BookingStep = "service" | "references" | "calendar" | "time" | "details" | "payment" | "success";

const STEP_ORDER: BookingStep[] = ["service", "references", "calendar", "time", "details", "payment", "success"];

export default function BookingPage() {
  const [, params] = useRoute("/book/:subdomain");
  const subdomain = params?.subdomain;
  const { toast } = useToast();
  
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedTime, setSelectedTime] = useState<string | null>(null);
  const [step, setStep] = useState<BookingStep>("service");
  const [lockId, setLockId] = useState<string | null>(null);
  const [lockExpiresAt, setLockExpiresAt] = useState<Date | null>(null);
  const [countdown, setCountdown] = useState(600);
  const [showEmailDialog, setShowEmailDialog] = useState(false);
  const [quickEmail, setQuickEmail] = useState("");
  const [selectedDepositValue, setSelectedDepositValue] = useState<DepositValue | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"stripe" | "revolut" | "wise">("stripe");
  const [referenceImages, setReferenceImages] = useState<{ file: File; preview: string }[]>([]);
  const [tattooDescription, setTattooDescription] = useState("");
  const [isPageLoaded, setIsPageLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const timer = setTimeout(() => setIsPageLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const { data: artist, isLoading: artistLoading, error: artistError } = useQuery<Artist>({
    queryKey: ["/api/public/artist", subdomain],
    enabled: !!subdomain,
  });

  const { data: availability } = useQuery<Availability[]>({
    queryKey: ["/api/public/artist", subdomain, "availability"],
    enabled: !!subdomain && !!artist,
  });

  const { data: citySchedules } = useQuery<CitySchedule[]>({
    queryKey: ["/api/public/artist", subdomain, "city-schedules"],
    enabled: !!subdomain && !!artist?.tourModeEnabled,
  });

  const { data: depositValues = [] } = useQuery<DepositValue[]>({
    queryKey: [`/api/public/artist/${subdomain}/deposit-values`],
    enabled: !!subdomain && !!artist,
  });

  const form = useForm<BookingFormData>({
    resolver: zodResolver(bookingFormSchema),
    defaultValues: {
      customerName: "",
      customerEmail: "",
      customerPhone: "",
      customerInstagram: "",
      slotDatetime: "",
      notes: "",
    },
  });

  useEffect(() => {
    if (!lockExpiresAt) return;
    
    const interval = setInterval(() => {
      const remaining = Math.max(0, Math.floor((lockExpiresAt.getTime() - Date.now()) / 1000));
      setCountdown(remaining);
      
      if (remaining <= 0) {
        setLockId(null);
        setLockExpiresAt(null);
        setStep("calendar");
        toast({
          title: "Tempo esgotado",
          description: "Sua reserva expirou. Por favor, selecione um novo horario.",
          variant: "destructive",
        });
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [lockExpiresAt, toast]);

  const createLockMutation = useMutation({
    mutationFn: async (data: { slotDatetime: string; customerEmail: string; customerName: string; customerPhone: string }) => {
      const response = await apiRequest("POST", `/api/public/artist/${subdomain}/lock`, data);
      return response.json();
    },
    onSuccess: (data) => {
      setLockId(data.lockId);
      setLockExpiresAt(new Date(data.expiresAt));
      setShowEmailDialog(false);
      setStep("details");
      toast({
        title: "Horario reservado!",
        description: "Voce tem 10 minutos para finalizar o agendamento.",
      });
    },
    onError: () => {
      toast({
        title: "Horario indisponivel",
        description: "Este horario nao esta mais disponivel. Por favor, escolha outro.",
        variant: "destructive",
      });
      setShowEmailDialog(false);
    },
  });

  const createBookingMutation = useMutation({
    mutationFn: async (data: BookingFormData) => {
      const response = await apiRequest("POST", `/api/public/artist/${subdomain}/book`, {
        ...data,
        lockId,
        depositValueId: selectedDepositValue?.id,
        paymentMethod: selectedPaymentMethod,
        referenceImages: referenceImages.map(img => img.preview),
        tattooDescription,
      });
      return response.json();
    },
    onSuccess: (data) => {
      if (data.checkoutUrl) {
        window.location.href = data.checkoutUrl;
      } else {
        setStep("success");
      }
    },
    onError: () => {
      toast({
        title: "Erro no agendamento",
        description: "Nao foi possivel concluir o agendamento. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const days = [];

    for (let i = 0; i < firstDay.getDay(); i++) {
      days.push(null);
    }

    for (let i = 1; i <= lastDay.getDate(); i++) {
      days.push(new Date(year, month, i));
    }

    return days;
  };

  const isDateAvailable = (date: Date) => {
    if (!availability) return false;
    const dayOfWeek = date.getDay();
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    
    if (date < today) return false;
    
    return availability.some((a) => a.dayOfWeek === dayOfWeek && a.isActive);
  };

  const getTimeSlots = (date: Date) => {
    if (!availability) return [];
    const dayOfWeek = date.getDay();
    const dayAvail = availability.find((a) => a.dayOfWeek === dayOfWeek && a.isActive);
    
    if (!dayAvail) return [];

    const slots: string[] = [];
    const [startHour, startMin] = (dayAvail.startTime || "09:00").split(":").map(Number);
    const [endHour, endMin] = (dayAvail.endTime || "18:00").split(":").map(Number);
    const duration = dayAvail.slotDurationMinutes || 60;

    let current = startHour * 60 + startMin;
    const end = endHour * 60 + endMin;

    while (current + duration <= end) {
      const hours = Math.floor(current / 60);
      const mins = current % 60;
      slots.push(`${hours.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}`);
      current += duration;
    }

    return slots;
  };

  const formatCountdown = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const getInitials = (name: string) => {
    return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2);
  };

  const handleTimeSelect = (time: string) => {
    setSelectedTime(time);
    const datetime = new Date(selectedDate!);
    const [hours, mins] = time.split(":").map(Number);
    datetime.setHours(hours, mins, 0, 0);
    form.setValue("slotDatetime", datetime.toISOString());
  };

  const handleProceedToDetails = () => {
    if (!selectedDate || !selectedTime) return;
    setShowEmailDialog(true);
  };

  const handleCreateLock = () => {
    if (!selectedDate || !selectedTime || !quickEmail) return;
    
    const datetime = new Date(selectedDate);
    const [hours, mins] = selectedTime.split(":").map(Number);
    datetime.setHours(hours, mins, 0, 0);

    form.setValue("customerEmail", quickEmail);
    
    createLockMutation.mutate({
      slotDatetime: datetime.toISOString(),
      customerEmail: quickEmail,
      customerName: "Guest",
      customerPhone: "",
    });
  };

  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

  const handleImageUpload = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const remaining = 5 - referenceImages.length;
    const newFiles = Array.from(files).slice(0, remaining);

    newFiles.forEach((file) => {
      if (!ALLOWED_TYPES.includes(file.type)) {
        toast({
          title: "Formato invalido",
          description: "Use apenas imagens JPG, PNG, WebP ou GIF.",
          variant: "destructive",
        });
        return;
      }

      if (file.size > MAX_FILE_SIZE) {
        toast({
          title: "Arquivo muito grande",
          description: "O tamanho maximo por imagem e 5MB.",
          variant: "destructive",
        });
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        if (event.target?.result) {
          setReferenceImages((prev) => [
            ...prev,
            { file, preview: event.target!.result as string },
          ]);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, [referenceImages.length, toast]);

  const removeImage = (index: number) => {
    setReferenceImages((prev) => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: BookingFormData) => {
    if (!selectedDepositValue) {
      toast({
        title: "Servico nao selecionado",
        description: "Por favor, volte e selecione um servico.",
        variant: "destructive",
      });
      return;
    }
    setStep("payment");
  };

  const handlePayment = () => {
    if (!selectedDepositValue) {
      toast({
        title: "Servico nao selecionado",
        description: "Por favor, selecione um servico antes de prosseguir.",
        variant: "destructive",
      });
      return;
    }
    if (!selectedPaymentMethod) {
      toast({
        title: "Metodo de pagamento",
        description: "Por favor, selecione um metodo de pagamento.",
        variant: "destructive",
      });
      return;
    }
    const formData = form.getValues();
    createBookingMutation.mutate(formData);
  };

  const goToStep = (targetStep: BookingStep) => {
    setStep(targetStep);
  };

  const getStepIndex = (s: BookingStep) => STEP_ORDER.indexOf(s);
  const currentStepIndex = getStepIndex(step);

  const getProgressPercent = () => {
    const index = getStepIndex(step);
    return ((index + 1) / STEP_ORDER.length) * 100;
  };

  if (artistLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <motion.div 
          className="text-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <div className="relative">
            <Skeleton className="w-24 h-24 rounded-full mx-auto mb-4" />
            <motion.div
              className="absolute inset-0 rounded-full border-2 border-primary/30"
              animate={{ scale: [1, 1.2, 1], opacity: [1, 0, 1] }}
              transition={{ duration: 1.5, repeat: Infinity }}
            />
          </div>
          <Skeleton className="w-48 h-6 mx-auto mb-2" />
          <Skeleton className="w-32 h-4 mx-auto" />
        </motion.div>
      </div>
    );
  }

  if (artistError || !artist) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <motion.div {...fadeInUp}>
          <Card className="max-w-md w-full">
            <CardContent className="p-8 text-center">
              <AlertCircle className="w-12 h-12 text-destructive mx-auto mb-4" />
              <h1 className="text-xl font-semibold mb-2">Artista nao encontrado</h1>
              <p className="text-muted-foreground">
                Esta pagina de agendamento nao existe ou nao esta disponivel.
              </p>
            </CardContent>
          </Card>
        </motion.div>
      </div>
    );
  }

  const themeColor = artist.themeColor || "#C9A227";
  const days = getDaysInMonth(currentMonth);
  const timeSlots = selectedDate ? getTimeSlots(selectedDate) : [];
  const currencySymbol = artist.currency === "BRL" ? "R$" : (artist.currency === "EUR" ? "EUR" : artist.currency);

  const activeCitySchedule = citySchedules?.find((cs) => {
    const now = new Date();
    return new Date(cs.startDate) <= now && new Date(cs.endDate) >= now && cs.isActive;
  });

  return (
    <div className="min-h-screen bg-background">
      <motion.header 
        className="sticky top-0 z-50 glass bg-background/90 border-b border-border/50"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
      >
        <div className="max-w-2xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                <Avatar className="w-10 h-10 border-2" style={{ borderColor: themeColor }}>
                  <AvatarImage src={artist.coverImageUrl || undefined} />
                  <AvatarFallback style={{ backgroundColor: themeColor + "20", color: themeColor }}>
                    {getInitials(artist.displayName)}
                  </AvatarFallback>
                </Avatar>
              </motion.div>
              <div>
                <p className="font-semibold text-sm">{artist.displayName}</p>
                <p className="text-xs text-muted-foreground">@{artist.subdomain}</p>
              </div>
            </div>
            {artist.instagram && (
              <Button variant="ghost" size="icon" asChild>
                <a
                  href={`https://instagram.com/${artist.instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  data-testid="link-instagram"
                >
                  <Instagram className="w-5 h-5" />
                </a>
              </Button>
            )}
          </div>
        </div>

        <div className="px-4 pb-3">
          <Progress value={getProgressPercent()} className="h-1" style={{ "--progress-background": themeColor } as React.CSSProperties} />
        </div>
      </motion.header>

      <AnimatePresence mode="wait">
        {lockExpiresAt && step !== "success" && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <div className="bg-primary/10 border-b border-primary/30 py-2">
              <div className="max-w-2xl mx-auto px-4 flex items-center justify-center gap-2 text-sm">
                <Timer className="w-4 h-4 text-primary animate-pulse" />
                <span>Horario reservado por</span>
                <span className="font-mono font-bold text-primary">
                  {formatCountdown(countdown)}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <main className="max-w-2xl mx-auto px-4 py-6 pb-24 safe-bottom">
        <AnimatePresence mode="wait">
          {step === "service" && (
            <motion.div
              key="service"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mb-6">
                <motion.div 
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Palette className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Escolha o servico</h1>
                    <p className="text-sm text-muted-foreground">Selecione a duracao e tamanho da sua tatuagem</p>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                className="grid gap-3"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                {depositValues.length === 0 ? (
                  <motion.div variants={fadeInUp}>
                    <Card>
                      <CardContent className="py-12 text-center">
                        <Clock className="w-12 h-12 mx-auto mb-4 text-muted-foreground/50" />
                        <p className="text-muted-foreground">Nenhuma opcao de preco disponivel.</p>
                        <p className="text-sm text-muted-foreground mt-1">Entre em contato com o artista para orcamentos.</p>
                      </CardContent>
                    </Card>
                  </motion.div>
                ) : (
                  depositValues.map((service, index) => (
                    <motion.div
                      key={service.id}
                      variants={fadeInUp}
                      transition={{ delay: index * 0.05 }}
                    >
                      <Card
                        className={`cursor-pointer transition-all duration-300 ${
                          selectedDepositValue?.id === service.id 
                            ? "ring-2 shadow-lg" 
                            : "hover:shadow-md"
                        }`}
                        style={{
                          borderColor: selectedDepositValue?.id === service.id ? themeColor : undefined,
                          boxShadow: selectedDepositValue?.id === service.id 
                            ? `0 8px 30px ${themeColor}20` 
                            : undefined,
                        }}
                        onClick={() => setSelectedDepositValue(service)}
                        data-testid={`service-card-${service.id}`}
                      >
                        <CardContent className="p-4">
                          <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                              <motion.div 
                                className={`w-12 h-12 rounded-xl flex items-center justify-center transition-colors ${
                                  selectedDepositValue?.id === service.id 
                                    ? "bg-primary text-primary-foreground" 
                                    : "bg-muted"
                                }`}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                              >
                                {selectedDepositValue?.id === service.id ? (
                                  <Check className="w-6 h-6" />
                                ) : (
                                  <Clock className="w-6 h-6 text-muted-foreground" />
                                )}
                              </motion.div>
                              <div>
                                <p className="font-semibold">{service.name}</p>
                                <p className="text-sm text-muted-foreground">
                                  {Number(service.durationHours)}h de sessao
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold" style={{ color: themeColor }}>
                                {currencySymbol} {Number(service.depositAmount)}
                              </p>
                              <p className="text-xs text-muted-foreground">sinal</p>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  ))
                )}
              </motion.div>

              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
              >
                <Button
                  className="w-full h-12 text-base font-semibold"
                  onClick={() => goToStep("references")}
                  disabled={!selectedDepositValue}
                  style={{ backgroundColor: selectedDepositValue ? themeColor : undefined }}
                  data-testid="button-continue-to-references"
                >
                  Continuar
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === "references" && (
            <motion.div
              key="references"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => goToStep("service")} 
                  className="-ml-2 mb-3"
                  data-testid="button-back-to-service"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <motion.div 
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <ImageIcon className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Referencias visuais</h1>
                    <p className="text-sm text-muted-foreground">Envie imagens que inspiram seu projeto (ate 5)</p>
                  </div>
                </motion.div>
              </div>

              <motion.div
                variants={fadeInUp}
                initial="initial"
                animate="animate"
              >
                <Card>
                  <CardContent className="p-4">
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handleImageUpload}
                      className="hidden"
                      data-testid="input-reference-images"
                    />

                    <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                      <AnimatePresence mode="popLayout">
                        {referenceImages.map((img, index) => (
                          <motion.div
                            key={img.preview}
                            layout
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="relative aspect-square rounded-lg overflow-hidden group"
                          >
                            <img
                              src={img.preview}
                              alt={`Referencia ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                            <motion.button
                              whileHover={{ scale: 1.1 }}
                              whileTap={{ scale: 0.9 }}
                              onClick={() => removeImage(index)}
                              className="absolute top-1 right-1 p-1 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                              data-testid={`button-remove-image-${index}`}
                            >
                              <X className="w-4 h-4" />
                            </motion.button>
                          </motion.div>
                        ))}
                      </AnimatePresence>

                      {referenceImages.length < 5 && (
                        <motion.button
                          layout
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => fileInputRef.current?.click()}
                          className="aspect-square rounded-lg border-2 border-dashed border-muted-foreground/30 flex flex-col items-center justify-center gap-2 hover:border-primary/50 hover:bg-muted/50 transition-colors"
                          data-testid="button-add-image"
                        >
                          <Upload className="w-6 h-6 text-muted-foreground" />
                          <span className="text-xs text-muted-foreground">Adicionar</span>
                        </motion.button>
                      )}
                    </div>

                    <p className="text-xs text-muted-foreground mt-4 text-center">
                      {5 - referenceImages.length} imagem(ns) restante(s)
                    </p>
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div 
                className="mt-6"
                variants={fadeInUp}
                initial="initial"
                animate="animate"
                transition={{ delay: 0.1 }}
              >
                <Card>
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <FileText className="w-5 h-5 text-muted-foreground" />
                      <div>
                        <p className="font-medium">Descreva seu projeto</p>
                        <p className="text-xs text-muted-foreground">Estilo, tamanho, local do corpo, detalhes especificos...</p>
                      </div>
                    </div>
                    <Textarea
                      placeholder="Gostaria de uma tatuagem no estilo blackwork, aproximadamente 15cm, no antebraco direito. Quero incorporar elementos geometricos com..."
                      className="min-h-[120px] resize-none"
                      value={tattooDescription}
                      onChange={(e) => setTattooDescription(e.target.value)}
                      data-testid="input-tattoo-description"
                    />
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div 
                className="mt-8"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <Button
                  className="w-full h-12 text-base font-semibold"
                  onClick={() => goToStep("calendar")}
                  style={{ backgroundColor: themeColor }}
                  data-testid="button-continue-to-calendar"
                >
                  Continuar para Agenda
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          )}

          {step === "calendar" && (
            <motion.div
              key="calendar"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => goToStep("references")} 
                  className="-ml-2 mb-3"
                  data-testid="button-back-to-references"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <motion.div 
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Calendar className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Escolha a data</h1>
                    <p className="text-sm text-muted-foreground">Selecione um dia disponivel na agenda</p>
                  </div>
                </motion.div>
              </div>

              <motion.div variants={fadeInUp} initial="initial" animate="animate">
                <Card>
                  <CardHeader className="pb-2">
                    <div className="flex items-center justify-between">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1))}
                        data-testid="button-prev-month"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </Button>
                      <CardTitle className="text-base font-semibold">
                        {currentMonth.toLocaleDateString("pt-BR", { month: "long", year: "numeric" })}
                      </CardTitle>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1))}
                        data-testid="button-next-month"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </Button>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-7 gap-1 mb-2">
                      {DAYS.map((day) => (
                        <div key={day} className="text-center text-xs font-medium text-muted-foreground py-2">
                          {day}
                        </div>
                      ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                      {days.map((date, i) => {
                        if (!date) {
                          return <div key={i} className="aspect-square" />;
                        }

                        const available = isDateAvailable(date);
                        const isSelected = selectedDate?.toDateString() === date.toDateString();
                        const isToday = new Date().toDateString() === date.toDateString();

                        return (
                          <motion.button
                            key={i}
                            whileHover={available ? { scale: 1.1 } : {}}
                            whileTap={available ? { scale: 0.95 } : {}}
                            onClick={() => available && setSelectedDate(date)}
                            disabled={!available}
                            className={`
                              aspect-square rounded-lg flex items-center justify-center
                              text-sm font-medium transition-all
                              ${isToday && !isSelected ? "ring-2 ring-primary/30" : ""}
                              ${isSelected ? "text-primary-foreground" : ""}
                              ${available && !isSelected ? "hover:bg-muted" : ""}
                              ${!available ? "opacity-30 cursor-not-allowed" : "cursor-pointer"}
                            `}
                            style={{
                              backgroundColor: isSelected ? themeColor : undefined,
                            }}
                            data-testid={`calendar-day-${date.getDate()}`}
                          >
                            {date.getDate()}
                          </motion.button>
                        );
                      })}
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <AnimatePresence>
                {selectedDate && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6"
                  >
                    <Button
                      className="w-full h-12 text-base font-semibold"
                      style={{ backgroundColor: themeColor }}
                      onClick={() => goToStep("time")}
                      data-testid="button-continue-to-time"
                    >
                      Ver horarios disponiveis
                      <ArrowRight className="w-5 h-5 ml-2" />
                    </Button>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === "time" && selectedDate && (
            <motion.div
              key="time"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => goToStep("calendar")} 
                  className="-ml-2 mb-3"
                  data-testid="button-back-to-calendar"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <motion.div 
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <Clock className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Escolha o horario</h1>
                    <p className="text-sm text-muted-foreground">
                      {selectedDate.toLocaleDateString("pt-BR", {
                        weekday: "long",
                        day: "numeric",
                        month: "long",
                      })}
                    </p>
                  </div>
                </motion.div>
              </div>

              <motion.div variants={fadeInUp} initial="initial" animate="animate">
                <Card>
                  <CardContent className="p-4">
                    {timeSlots.length > 0 ? (
                      <motion.div 
                        className="grid grid-cols-3 sm:grid-cols-4 gap-2"
                        variants={staggerContainer}
                        initial="initial"
                        animate="animate"
                      >
                        {timeSlots.map((time, index) => (
                          <motion.button
                            key={time}
                            variants={scaleIn}
                            transition={{ delay: index * 0.03 }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={() => handleTimeSelect(time)}
                            className={`
                              p-3 rounded-lg text-sm font-medium transition-all
                              ${selectedTime === time 
                                ? "text-primary-foreground shadow-lg" 
                                : "bg-muted hover:bg-muted/80"
                              }
                            `}
                            style={{
                              backgroundColor: selectedTime === time ? themeColor : undefined,
                              boxShadow: selectedTime === time ? `0 4px 20px ${themeColor}40` : undefined,
                            }}
                            data-testid={`time-slot-${time}`}
                          >
                            {time}
                          </motion.button>
                        ))}
                      </motion.div>
                    ) : (
                      <div className="text-center py-8">
                        <Clock className="w-10 h-10 text-muted-foreground mx-auto mb-3" />
                        <p className="text-muted-foreground">Sem horarios disponiveis nesta data</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <AnimatePresence>
                {selectedTime && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -20 }}
                    className="mt-6"
                  >
                    <Button
                      className="w-full h-12 text-base font-semibold"
                      style={{ backgroundColor: themeColor }}
                      onClick={handleProceedToDetails}
                      data-testid="button-continue-to-details"
                    >
                      <Lock className="w-4 h-4 mr-2" />
                      Reservar horario
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-2">
                      Voce tera 10 minutos para finalizar
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          )}

          {step === "details" && (
            <motion.div
              key="details"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => goToStep("time")} 
                  className="-ml-2 mb-3"
                  data-testid="button-back-to-time"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <motion.div 
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <User className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Seus dados</h1>
                    <p className="text-sm text-muted-foreground">Preencha seus dados de contato</p>
                  </div>
                </motion.div>
              </div>

              <motion.div variants={fadeInUp} initial="initial" animate="animate">
                <Card>
                  <CardContent className="p-4">
                    <Form {...form}>
                      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                        <FormField
                          control={form.control}
                          name="customerName"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Nome completo
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="Seu nome" 
                                  {...field} 
                                  data-testid="input-name"
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerEmail"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Mail className="w-4 h-4" />
                                Email
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="email" 
                                  placeholder="seu@email.com" 
                                  {...field} 
                                  data-testid="input-email"
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerPhone"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Phone className="w-4 h-4" />
                                Telefone / WhatsApp
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  type="tel" 
                                  placeholder="+55 11 99999-9999" 
                                  {...field} 
                                  data-testid="input-phone"
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="customerInstagram"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel className="flex items-center gap-2">
                                <Instagram className="w-4 h-4" />
                                Instagram (opcional)
                              </FormLabel>
                              <FormControl>
                                <Input 
                                  placeholder="@seuusuario" 
                                  {...field} 
                                  data-testid="input-instagram"
                                  className="h-11"
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <motion.div
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ delay: 0.2 }}
                          className="pt-4"
                        >
                          <Button
                            type="submit"
                            className="w-full h-12 text-base font-semibold"
                            style={{ backgroundColor: themeColor }}
                            data-testid="button-continue-to-payment"
                          >
                            Continuar para Pagamento
                            <ArrowRight className="w-5 h-5 ml-2" />
                          </Button>
                        </motion.div>
                      </form>
                    </Form>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          )}

          {step === "payment" && (
            <motion.div
              key="payment"
              initial={{ opacity: 0, x: 50 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -50 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
            >
              <div className="mb-6">
                <Button 
                  variant="ghost" 
                  size="sm" 
                  onClick={() => goToStep("details")} 
                  className="-ml-2 mb-3"
                  data-testid="button-back-to-details"
                >
                  <ChevronLeft className="w-4 h-4 mr-1" />
                  Voltar
                </Button>
                <motion.div 
                  className="flex items-center gap-3 mb-2"
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.1 }}
                >
                  <div className="p-2 rounded-lg bg-primary/10">
                    <CreditCard className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold">Pagamento do sinal</h1>
                    <p className="text-sm text-muted-foreground">Finalize o agendamento com o pagamento</p>
                  </div>
                </motion.div>
              </div>

              <motion.div 
                className="space-y-4"
                variants={staggerContainer}
                initial="initial"
                animate="animate"
              >
                <motion.div variants={fadeInUp}>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Resumo do agendamento</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center gap-3 text-sm">
                        <Palette className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedDepositValue?.name} - {Number(selectedDepositValue?.durationHours)}h</span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Calendar className="w-4 h-4 text-muted-foreground" />
                        <span>
                          {selectedDate?.toLocaleDateString("pt-BR", {
                            weekday: "long",
                            day: "numeric",
                            month: "long",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm">
                        <Clock className="w-4 h-4 text-muted-foreground" />
                        <span>{selectedTime}</span>
                      </div>
                      {activeCitySchedule && (
                        <div className="flex items-center gap-3 text-sm">
                          <MapPin className="w-4 h-4 text-muted-foreground" />
                          <span>{activeCitySchedule.city}, {activeCitySchedule.country}</span>
                          <Badge variant="secondary" className="text-xs">
                            <Lock className="w-3 h-3 mr-1" />
                            Endereco apos pagamento
                          </Badge>
                        </div>
                      )}
                      {referenceImages.length > 0 && (
                        <div className="flex items-center gap-3 text-sm">
                          <ImageIcon className="w-4 h-4 text-muted-foreground" />
                          <span>{referenceImages.length} referencia(s) enviada(s)</span>
                        </div>
                      )}

                      <div className="pt-3 mt-3 border-t">
                        <div className="flex items-center justify-between">
                          <span className="font-medium">Sinal (nao reembolsavel)</span>
                          <span className="text-2xl font-bold" style={{ color: themeColor }}>
                            {currencySymbol} {Number(selectedDepositValue?.depositAmount)}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-base">Metodo de pagamento</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { id: "stripe", icon: SiStripe, color: "#635BFF", name: "Cartao" },
                          { id: "revolut", icon: SiRevolut, color: "#0075EB", name: "Revolut" },
                          { id: "wise", icon: SiWise, color: "#9FE870", name: "Wise" },
                        ].map((method) => (
                          <motion.button
                            key={method.id}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            type="button"
                            className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                              selectedPaymentMethod === method.id
                                ? "border-primary bg-primary/5"
                                : "border-border hover:border-muted-foreground/30"
                            }`}
                            onClick={() => setSelectedPaymentMethod(method.id as typeof selectedPaymentMethod)}
                            data-testid={`payment-${method.id}`}
                          >
                            <method.icon className="w-8 h-8" style={{ color: method.color }} />
                            <span className="text-xs font-medium">{method.name}</span>
                          </motion.button>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground py-2">
                    <div className="flex items-center gap-1">
                      <Shield className="w-4 h-4" />
                      Pagamento seguro
                    </div>
                    <div className="flex items-center gap-1">
                      <Lock className="w-4 h-4" />
                      Dados protegidos
                    </div>
                  </div>
                </motion.div>

                <motion.div variants={fadeInUp}>
                  <Button
                    className="w-full h-14 text-base font-semibold"
                    style={{ backgroundColor: themeColor }}
                    onClick={handlePayment}
                    disabled={createBookingMutation.isPending}
                    data-testid="button-confirm-payment"
                  >
                    {createBookingMutation.isPending ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Processando...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-5 h-5 mr-2" />
                        Pagar {currencySymbol} {Number(selectedDepositValue?.depositAmount)}
                      </>
                    )}
                  </Button>
                </motion.div>
              </motion.div>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ type: "spring", stiffness: 300, damping: 30 }}
              className="text-center"
            >
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.2 }}
                className="w-20 h-20 rounded-full mx-auto mb-6 flex items-center justify-center"
                style={{ backgroundColor: themeColor + "20" }}
              >
                <motion.div
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.4 }}
                >
                  <CheckCircle2 className="w-10 h-10" style={{ color: themeColor }} />
                </motion.div>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-2xl font-bold mb-2"
              >
                Agendamento confirmado!
              </motion.h1>

              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-muted-foreground mb-8"
              >
                Sua sessao com {artist.displayName} esta marcada.
                Voce recebera um email de confirmacao em breve.
              </motion.p>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
              >
                <Card>
                  <CardContent className="p-6 text-left space-y-3">
                    <div className="flex items-center gap-3 text-sm">
                      <Palette className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedDepositValue?.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Calendar className="w-4 h-4 text-muted-foreground" />
                      <span>
                        {selectedDate?.toLocaleDateString("pt-BR", {
                          weekday: "long",
                          day: "numeric",
                          month: "long",
                          year: "numeric",
                        })}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm">
                      <Clock className="w-4 h-4 text-muted-foreground" />
                      <span>{selectedTime}</span>
                    </div>
                    {activeCitySchedule && (
                      <div className="flex items-center gap-3 text-sm">
                        <MapPin className="w-4 h-4 text-muted-foreground" />
                        <span>{activeCitySchedule.fullAddress}</span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="mt-8"
              >
                <Button 
                  variant="outline" 
                  onClick={() => window.location.reload()}
                  data-testid="button-book-another"
                >
                  Agendar outro horario
                </Button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <Dialog open={showEmailDialog} onOpenChange={setShowEmailDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Lock className="w-5 h-5" style={{ color: themeColor }} />
              Reservar seu horario
            </DialogTitle>
            <DialogDescription>
              Informe seu email para reservar este horario por 10 minutos.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Email</label>
              <Input
                type="email"
                placeholder="seu@email.com"
                value={quickEmail}
                onChange={(e) => setQuickEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreateLock()}
                className="h-11"
                data-testid="input-quick-email"
              />
            </div>
            <div className="flex items-start gap-2 text-xs text-muted-foreground">
              <Timer className="w-4 h-4 mt-0.5 shrink-0" />
              <span>
                Seu horario ficara reservado por 10 minutos enquanto voce finaliza o agendamento.
              </span>
            </div>
          </div>
          <div className="flex gap-3">
            <Button 
              variant="outline" 
              onClick={() => setShowEmailDialog(false)} 
              className="flex-1"
              data-testid="button-cancel-dialog"
            >
              Cancelar
            </Button>
            <Button
              onClick={handleCreateLock}
              disabled={!quickEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(quickEmail) || createLockMutation.isPending}
              className="flex-1"
              style={{ backgroundColor: themeColor }}
              data-testid="button-reserve-slot"
            >
              {createLockMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                "Reservar"
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      <footer className="border-t border-border/50 py-6 mt-8">
        <div className="max-w-2xl mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-3 text-sm text-muted-foreground">
            <span>Powered by</span>
            <LogoCompact />
          </div>
        </div>
      </footer>
    </div>
  );
}
