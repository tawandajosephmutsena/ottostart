"use client";

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronLeft, ChevronRight, Check, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export interface FormField {
  label: string;
  type: "text" | "email" | "number" | "tel" | "textarea" | "select" | "radio" | "checkbox";
  name: string;
  required?: boolean;
  placeholder?: string;
  options?: string[];
}

export interface FormStep {
  id: string;
  title: string;
  description?: string;
  fields: FormField[];
}

interface OnboardingFormProps {
  steps: FormStep[];
  submitText?: string;
  onSuccess?: (data: any) => void;
}

const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

const contentVariants = {
  hidden: { opacity: 0, x: 50 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, x: -50, transition: { duration: 0.2 } },
};

const OnboardingForm = ({ steps, submitText = "Submit", onSuccess }: OnboardingFormProps) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Initialize formData dynamically based on steps
  const initialData = useMemo(() => {
    const data: Record<string, any> = {};
    steps.forEach((step) => {
      step.fields.forEach((field) => {
        data[field.name] = field.type === "checkbox" ? [] : "";
      });
    });
    return data;
  }, [steps]);

  const [formData, setFormData] = useState<Record<string, any>>(initialData);

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const toggleCheckboxValue = (field: string, value: string) => {
    setFormData((prev) => {
      const currentValues = Array.isArray(prev[field]) ? prev[field] : [];
      if (currentValues.includes(value)) {
        return { ...prev, [field]: currentValues.filter((v: string) => v !== value) };
      } else {
        return { ...prev, [field]: [...currentValues, value] };
      }
    });
  };

  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep((prev) => prev + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep((prev) => prev - 1);
    }
  };

  const handleSubmit = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    setIsSubmitting(true);

    import('@inertiajs/react').then(({ router }) => {
      router.post('/contact', formData, {
        onSuccess: () => {
          toast.success("Form submitted successfully!");
          setIsSubmitting(false);
          if (onSuccess) onSuccess(formData);
        },
        onError: (errors) => {
          setIsSubmitting(false);
          const firstError = Object.values(errors)[0];
          toast.error(typeof firstError === 'string' ? firstError : "Submission failed. Please check the form.");
        }
      });
    });
  };

  const isStepValid = () => {
    const currentFields = steps[currentStep]?.fields || [];
    return currentFields.every((field) => {
      if (!field.required) return true;
      const value = formData[field.name];
      if (field.type === "checkbox") {
        return Array.isArray(value) && value.length > 0;
      }
      return value !== undefined && value !== null && value.toString().trim() !== "";
    });
  };

  if (!steps || steps.length === 0) return null;

  const currentStepData = steps[currentStep];

  return (
    <div className="w-full max-w-lg mx-auto py-8">
      {/* Progress indicator */}
      {steps.length > 1 && (
        <motion.div
          className="mb-8"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex justify-between mb-2">
            {steps.map((step, index) => (
              <motion.div
                key={step.id || index}
                className="flex flex-col items-center"
                whileHover={{ scale: 1.1 }}
              >
                <motion.div
                  className={cn(
                    "w-4 h-4 rounded-full cursor-pointer transition-colors duration-300",
                    index < currentStep
                      ? "bg-primary"
                      : index === currentStep
                        ? "bg-primary ring-4 ring-primary/20"
                        : "bg-muted",
                  )}
                  onClick={() => {
                    if (index <= currentStep) {
                      setCurrentStep(index);
                    }
                  }}
                  whileTap={{ scale: 0.95 }}
                />
                <motion.span
                  className={cn(
                    "text-xs mt-1.5 hidden sm:block",
                    index === currentStep
                      ? "text-primary font-medium"
                      : "text-muted-foreground",
                  )}
                >
                  {step.title}
                </motion.span>
              </motion.div>
            ))}
          </div>
          <div className="w-full bg-muted h-1.5 rounded-full overflow-hidden mt-2">
            <motion.div
              className="h-full bg-primary"
              initial={{ width: 0 }}
              animate={{ width: `${(currentStep / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.3 }}
            />
          </div>
        </motion.div>
      )}

      {/* Form card */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <Card className="border shadow-md rounded-3xl overflow-hidden">
          <AnimatePresence mode="wait">
            <motion.div
              key={currentStepData.id || currentStep}
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              <CardHeader>
                <CardTitle>{currentStepData.title}</CardTitle>
                {currentStepData.description && (
                  <CardDescription>{currentStepData.description}</CardDescription>
                )}
              </CardHeader>
              <CardContent className="space-y-4">
                {currentStepData.fields.map((field, index) => (
                  <motion.div 
                    key={field.name} 
                    variants={fadeInUp} 
                    custom={index}
                    className="space-y-2"
                  >
                    <Label htmlFor={field.name}>{field.label}</Label>
                    
                    {field.type === "textarea" ? (
                      <Textarea
                        id={field.name}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) => updateFormData(field.name, e.target.value)}
                        className="min-h-[80px] transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    ) : field.type === "select" ? (
                      <Select
                        value={formData[field.name] || ""}
                        onValueChange={(value) => updateFormData(field.name, value)}
                      >
                        <SelectTrigger
                          id={field.name}
                          className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                        >
                          <SelectValue placeholder={field.placeholder || "Select an option"} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.options?.map((option) => (
                            <SelectItem key={option} value={option.toLowerCase().replace(/\s+/g, '-')}>
                              {option}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : field.type === "radio" ? (
                      <RadioGroup
                        value={formData[field.name] || ""}
                        onValueChange={(value) => updateFormData(field.name, value)}
                        className="space-y-2"
                      >
                        {field.options?.map((option, i) => (
                          <motion.div
                            key={option}
                            className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                          >
                            <RadioGroupItem
                              value={option.toLowerCase().replace(/\s+/g, '-')}
                              id={`${field.name}-${i}`}
                            />
                            <Label
                              htmlFor={`${field.name}-${i}`}
                              className="cursor-pointer w-full"
                            >
                              {option}
                            </Label>
                          </motion.div>
                        ))}
                      </RadioGroup>
                    ) : field.type === "checkbox" ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {field.options?.map((option, i) => (
                          <motion.div
                            key={option}
                            className="flex items-center space-x-2 rounded-md border p-3 cursor-pointer hover:bg-accent transition-colors"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            transition={{ duration: 0.2 }}
                            onClick={() => toggleCheckboxValue(field.name, option.toLowerCase().replace(/\s+/g, '-'))}
                          >
                            <Checkbox
                              id={`${field.name}-${i}`}
                              checked={(formData[field.name] || []).includes(option.toLowerCase().replace(/\s+/g, '-'))}
                              onCheckedChange={() => toggleCheckboxValue(field.name, option.toLowerCase().replace(/\s+/g, '-'))}
                            />
                            <Label
                              htmlFor={`${field.name}-${i}`}
                              className="cursor-pointer w-full"
                            >
                              {option}
                            </Label>
                          </motion.div>
                        ))}
                      </div>
                    ) : (
                      <Input
                        id={field.name}
                        type={field.type}
                        placeholder={field.placeholder}
                        value={formData[field.name] || ""}
                        onChange={(e) => updateFormData(field.name, e.target.value)}
                        className="transition-all duration-300 focus:ring-2 focus:ring-primary/20 focus:border-primary"
                      />
                    )}
                  </motion.div>
                ))}
              </CardContent>
            </motion.div>
          </AnimatePresence>

          <CardFooter className="flex justify-between pt-6 pb-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 0}
                className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
              >
                <ChevronLeft className="h-4 w-4" /> Back
              </Button>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                type="button"
                onClick={
                  currentStep === steps.length - 1 ? () => handleSubmit() : nextStep
                }
                disabled={!isStepValid() || isSubmitting}
                className="flex items-center gap-1 transition-all duration-300 rounded-2xl"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                  </>
                ) : (
                  <>
                    {currentStep === steps.length - 1 ? submitText : "Next"}
                    {currentStep === steps.length - 1 ? (
                      <Check className="h-4 w-4" />
                    ) : (
                      <ChevronRight className="h-4 w-4" />
                    )}
                  </>
                )}
              </Button>
            </motion.div>
          </CardFooter>
        </Card>
      </motion.div>

      {/* Step indicator */}
      {steps.length > 1 && (
        <motion.div
          className="mt-4 text-center text-sm text-muted-foreground"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          Step {currentStep + 1} of {steps.length}: {currentStepData.title}
        </motion.div>
      )}
    </div>
  );
};

export default OnboardingForm;
