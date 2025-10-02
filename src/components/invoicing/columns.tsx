"use client"

import { DailySummary } from "@/lib/types/invoicing";
import { ColumnDef } from "@tanstack/react-table";
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Badge } from "../ui/badge";
import { ArrowUpDown } from "lucide-react";
import { Button } from "../ui/button";

const getStatusVariant = (status: string | null | undefined): "default" | "secondary" | "destructive" | "outline" => {
  switch (status?.toLowerCase()) {
    case 'aceptado':
      return 'default'; // Usará el color de success de la Badge
    case 'rechazado':
      return 'destructive';
    case 'pendiente':
      return 'secondary';
    default:
      return 'outline';
  }
};

const getStatusColorClass = (status: string | null | undefined): string => {
    switch (status?.toLowerCase()) {
      case 'aceptado':
        return 'bg-success/20 text-success-foreground border-success/40';
      case 'rechazado':
        return 'bg-error/20 text-error-foreground border-error/40';
      case 'pendiente':
        return 'bg-warning/20 text-warning-foreground border-warning/40';
      default:
        return 'bg-muted/50 text-muted-foreground border-border';
    }
  };

export const columns: ColumnDef<DailySummary>[] = [
  {
    accessorKey: "fecha_resumen",
    header: ({ column }) => {
        return (
          <Button
            variant="ghost"
            onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          >
            Fecha de Resumen
            <ArrowUpDown className="ml-2 h-4 w-4" />
          </Button>
        )
      },
    cell: ({ row }) => {
      const date = new Date(row.getValue("fecha_resumen"));
      // Sumar un día porque JS puede interpretar la fecha YYYY-MM-DD como UTC medianoche
      date.setDate(date.getDate() + 1);
      return <div className="font-medium">{format(date, "dd 'de' MMMM, yyyy", { locale: es })}</div>;
    },
  },
  {
    accessorKey: "numero_completo",
    header: "Número de Resumen",
  },
  {
    accessorKey: "ticket",
    header: "Ticket SUNAT",
  },
  {
    accessorKey: "estado_sunat",
    header: "Estado SUNAT",
    cell: ({ row }) => {
      const status = row.getValue("estado_sunat") as string | null;
      const statusText = status || 'No disponible';
      return (
        <Badge variant={getStatusVariant(status)} className={`capitalize ${getStatusColorClass(status)}`}>
          {statusText}
        </Badge>
      );
    },
  },
]
