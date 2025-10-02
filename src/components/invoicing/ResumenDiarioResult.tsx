import { SummaryData } from '@/lib/types/invoicing';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { FileText, Calendar, Hash, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface ResumenDiarioResultProps {
  data: SummaryData;
}

const StatusBadge = ({ status }: { status: string }) => {
  const lowerStatus = status.toLowerCase();
  let variant: 'default' | 'secondary' | 'destructive' | 'outline' = 'secondary';
  let icon = <Clock className="mr-1 h-3 w-3" />;

  if (lowerStatus === 'generado' || lowerStatus === 'aceptado') {
    variant = 'default';
    icon = <CheckCircle className="mr-1 h-3 w-3" />;
  } else if (lowerStatus === 'rechazado') {
    variant = 'destructive';
    icon = <AlertCircle className="mr-1 h-3 w-3" />;
  }

  return (
    <Badge variant={variant} className="capitalize">
      {icon}
      {status}
    </Badge>
  );
};

function ResumenDiarioResult({ data }: ResumenDiarioResultProps) {
  return (
    <Card className="bg-background border-border animate-fade-in">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-xl text-primary">
          <FileText />
          Resumen Diario Generado
        </CardTitle>
        <CardDescription>
          Se ha creado el siguiente resumen. Revise los detalles antes de enviarlo a la SUNAT.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
          <div className="flex items-center gap-2 bg-surface p-3 rounded-md">
            <Hash className="h-5 w-5 text-primary" />
            <div>
              <p className="text-textSecondary">ID del Resumen</p>
              <p className="font-bold text-text">{data.id}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-surface p-3 rounded-md">
            <FileText className="h-5 w-5 text-primary" />
            <div>
              <p className="text-textSecondary">Número Completo</p>
              <p className="font-bold text-text">{data.numero_completo}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-surface p-3 rounded-md">
            <Calendar className="h-5 w-5 text-primary" />
            <div>
              <p className="text-textSecondary">Fecha del Resumen</p>
              <p className="font-bold text-text">
                {format(new Date(data.fecha_resumen), "PPP", { locale: es })}
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="flex items-center justify-between bg-surface p-3 rounded-md">
                <span className="text-textSecondary">Estado del Proceso:</span>
                <StatusBadge status={data.estado_proceso} />
            </div>
            <div className="flex items-center justify-between bg-surface p-3 rounded-md">
                <span className="text-textSecondary">Estado SUNAT:</span>
                <StatusBadge status={data.estado_sunat} />
            </div>
        </div>

        <div>
          <h4 className="mb-2 font-semibold text-text">Boletas Incluidas ({data.boletas.length})</h4>
          <div className="border rounded-lg border-border max-h-60 overflow-y-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Número</TableHead>
                  <TableHead>Fecha Emisión</TableHead>
                  <TableHead className="text-right">Monto</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.boletas.map((boleta) => (
                  <TableRow key={boleta.id}>
                    <TableCell className="font-medium">{boleta.numero_completo}</TableCell>
                    <TableCell>{format(new Date(boleta.fecha_emision), "dd/MM/yyyy")}</TableCell>
                    <TableCell className="text-right">{boleta.moneda} {parseFloat(boleta.mto_imp_venta).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default ResumenDiarioResult;
