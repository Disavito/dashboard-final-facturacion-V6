import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import ResumenDiarioForm from "@/components/invoicing/ResumenDiarioForm";
import ResumenesAnteriores from "@/components/invoicing/ResumenesAnteriores";
import { Separator } from "@/components/ui/separator";
import { FilePlus2, History } from "lucide-react";

const ResumenDiarioPage = () => {
  return (
    <div className="space-y-8">
      <header className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-foreground">Resúmenes y Bajas</h2>
          <p className="text-muted-foreground mt-1">
            Genera resúmenes diarios de boletas y consulta el historial de envíos a SUNAT.
          </p>
        </div>
      </header>

      <Card className="bg-card border-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-primary">
            <FilePlus2 className="h-6 w-6" />
            Generar Nuevo Resumen Diario
          </CardTitle>
          <CardDescription>
            Selecciona una fecha para agrupar todas las boletas emitidas en ese día y enviarlas a SUNAT.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResumenDiarioForm />
        </CardContent>
      </Card>

      <Separator />

      <Card className="bg-card border-border shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-3 text-xl text-primary">
            <History className="h-6 w-6" />
            Historial de Resúmenes Enviados
          </CardTitle>
          <CardDescription>
            Consulta el estado de los resúmenes diarios enviados previamente a SUNAT.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <ResumenesAnteriores />
        </CardContent>
      </Card>
    </div>
  );
};

export default ResumenDiarioPage;
