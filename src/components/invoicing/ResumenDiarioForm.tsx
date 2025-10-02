import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { ResumenDiarioSchema, ResumenDiarioFormValues, SummaryData } from '@/lib/types/invoicing';
import { createDailySummary, sendSummaryToSunat, saveDailySummaryResult } from '@/lib/api/invoicingApi';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';
import { Loader2, Send, CheckCircle, AlertTriangle } from 'lucide-react';
import ResumenDiarioResult from './ResumenDiarioResult';
import { Card, CardContent, CardFooter } from '../ui/card';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';

function ResumenDiarioForm() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
  const [finalMessage, setFinalMessage] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const form = useForm<ResumenDiarioFormValues>({
    resolver: zodResolver(ResumenDiarioSchema),
    defaultValues: {
      fecha_resumen: new Date().toISOString().split('T')[0],
    },
  });

  const handleCreateSummary = async (values: ResumenDiarioFormValues) => {
    setIsLoading(true);
    setSummaryData(null);
    setFinalMessage(null);
    try {
      const response = await createDailySummary(values.fecha_resumen);
      if (response.success) {
        setSummaryData(response.data);
        toast({
          title: "Resumen Generado",
          description: "El resumen diario ha sido creado. Revise y proceda a enviarlo.",
          variant: "default",
        });
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
      toast({
        title: "Error al Generar Resumen",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendSummary = async () => {
    if (!summaryData) return;
    setIsSending(true);
    setFinalMessage(null);
    try {
      const response = await sendSummaryToSunat(summaryData.id);
      if (response.success) {
        // --- INICIO: Guardar en Supabase ---
        try {
          await saveDailySummaryResult(response.data);
          toast({
            title: "Éxito",
            description: "Resumen enviado a SUNAT y registrado en la base de datos.",
            className: "bg-success text-white",
          });
          setFinalMessage({ type: 'success', message: `Resumen enviado con éxito. Ticket: ${response.data.ticket}` });
        } catch (dbError) {
          // Error al guardar en BD, pero el envío a SUNAT fue exitoso
          const dbErrorMessage = dbError instanceof Error ? dbError.message : 'Error desconocido en la base de datos.';
          console.error("Error al guardar en Supabase:", dbErrorMessage);
          toast({
            title: "Envío Exitoso, Error al Guardar",
            description: `El resumen se envió a SUNAT (Ticket: ${response.data.ticket}) pero falló al guardarlo localmente. Contacte a soporte.`,
            variant: "destructive",
            duration: 10000,
          });
          setFinalMessage({ type: 'error', message: `Envío a SUNAT correcto, pero no se pudo registrar. Ticket: ${response.data.ticket}. Por favor, guarde este ticket.` });
        }
        // --- FIN: Guardar en Supabase ---
        
        setSummaryData(null); // Limpiar el resultado para un nuevo envío
      } else {
        throw new Error(response.message);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Ocurrió un error desconocido.';
      toast({
        title: "Error al Enviar a SUNAT",
        description: errorMessage,
        variant: "destructive",
      });
      setFinalMessage({ type: 'error', message: `Error al enviar a SUNAT: ${errorMessage}` });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleCreateSummary)} className="space-y-4">
          <FormField
            control={form.control}
            name="fecha_resumen"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Fecha del Resumen</FormLabel>
                <FormControl>
                  <Input type="date" {...field} className="max-w-sm" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isLoading || !!summaryData}>
            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
            Generar Resumen
          </Button>
        </form>
      </Form>

      {summaryData && (
        <Card className="mt-6 border-primary shadow-lg animate-fade-in">
          <CardContent className="pt-6">
            <ResumenDiarioResult data={summaryData} />
          </CardContent>
          <CardFooter className="flex justify-end">
            <Button onClick={handleSendSummary} disabled={isSending} variant="default" className="bg-success hover:bg-success/90">
              {isSending ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Send className="mr-2 h-4 w-4" />}
              Enviar Resumen a SUNAT
            </Button>
          </CardFooter>
        </Card>
      )}

      {finalMessage && (
        <Alert variant={finalMessage.type === 'success' ? 'default' : 'destructive'} className={`mt-6 ${finalMessage.type === 'success' ? 'bg-success/10 border-success' : ''}`}>
          {finalMessage.type === 'success' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
          <AlertTitle>{finalMessage.type === 'success' ? 'Operación Completada' : 'Ocurrió un Problema'}</AlertTitle>
          <AlertDescription>
            {finalMessage.message}
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}

export default ResumenDiarioForm;
