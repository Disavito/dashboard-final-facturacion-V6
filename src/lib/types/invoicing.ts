import { z } from 'zod';

// Esquema para un solo item en el formulario de boleta
export const DetalleBoletaSchema = z.object({
  codigo: z.string().optional(),
  descripcion: z.string().min(1, "La descripción es requerida."),
  unidad: z.string().min(1, "La unidad es requerida (ej: NIU)."),
  cantidad: z.coerce.number().min(0.01, "La cantidad debe ser mayor a 0."),
  mto_valor_unitario: z.coerce.number().min(0, "El precio no puede ser negativo."),
  porcentaje_igv: z.coerce.number().min(0, "El % IGV no puede ser negativo."),
  tip_afe_igv: z.string().min(1, "Seleccione un tipo de afectación."),
  codigo_producto_sunat: z.string().optional(),
});

// Esquema para el objeto cliente en el formulario de boleta
export const ClientBoletaSchema = z.object({
  tipo_documento: z.string().min(1, "Seleccione un tipo de documento."),
  numero_documento: z.string().min(1, "El número de documento es requerido."),
  razon_social: z.string().min(1, "La razón social o nombre es requerido."),
  nombre_comercial: z.string().optional().or(z.literal('')),
  direccion: z.string().optional().or(z.literal('')),
  ubigeo: z.string().optional().or(z.literal('')),
  distrito: z.string().optional().or(z.literal('')),
  provincia: z.string().optional().or(z.literal('')),
  departamento: z.string().optional().or(z.literal('')),
  telefono: z.string().optional().or(z.literal('')),
  email: z.string().email("Email inválido.").optional().or(z.literal('')),
});

// Esquema principal para validar el formulario de boleta
export const BoletaFormSchema = z.object({
  serie: z.string(),
  fecha_emision: z.string(),
  moneda: z.string().min(1, "Seleccione una moneda."),
  tipo_operacion: z.string(),
  metodo_envio: z.string(),
  forma_pago_tipo: z.string(),
  usuario_creacion: z.string(),
  client: ClientBoletaSchema,
  detalles: z.array(DetalleBoletaSchema).min(1, "Debe agregar al menos un producto o servicio."),
  // --- CAMPOS NUEVOS PARA EL INGRESO ---
  create_income_record: z.boolean().default(true),
  income_date: z.string().optional(),
  income_numero_operacion: z.string().optional(),
  income_account: z.string().optional(),
}).refine(data => {
    if (data.create_income_record) {
        return !!data.income_date && !!data.income_numero_operacion && !!data.income_account;
    }
    return true;
}, {
    message: "La fecha, número de operación y cuenta son requeridos para registrar el ingreso.",
    path: ["create_income_record"], // Puedes asociar el error a un campo si lo deseas
});


// Tipo para los valores del formulario, inferido del esquema
export type BoletaFormValues = z.infer<typeof BoletaFormSchema>;

// --- Esquemas y Tipos para el PAYLOAD de la API ---

// Esquema para el cliente dentro del payload
export const ClientPayloadSchema = z.object({
  tipo_documento: z.string(),
  numero_documento: z.string(),
  razon_social: z.string(),
  nombre_comercial: z.string().optional(),
  direccion: z.string().optional(),
  ubigeo: z.string().optional(),
  distrito: z.string().optional(),
  provincia: z.string().optional(),
  departamento: z.string().optional(),
  telefono: z.string().optional(),
  email: z.string().email().optional(),
});

// Esquema para un detalle dentro del payload
export const DetallePayloadSchema = z.object({
    codigo: z.string().optional(),
    descripcion: z.string(),
    unidad: z.string(),
    cantidad: z.number(),
    mto_valor_unitario: z.number(), // Valor base sin IGV
    porcentaje_igv: z.number(),
    tip_afe_igv: z.string(),
    codigo_producto_sunat: z.string().optional(),
});

// Esquema para el payload completo que se envía a la API de boletas
export const BoletaPayloadSchema = z.object({
  company_id: z.string(),
  branch_id: z.string(),
  serie: z.string(),
  fecha_emision: z.string(),
  moneda: z.string(),
  tipo_operacion: z.string(),
  metodo_envio: z.string(),
  forma_pago_tipo: z.string(),
  usuario_creacion: z.string(),
  client: ClientPayloadSchema,
  detalles: z.array(DetallePayloadSchema),
});

export type BoletaPayload = z.infer<typeof BoletaPayloadSchema>;


// --- Esquemas y Tipos existentes (sin cambios) ---

// Esquema para la respuesta de la emisión de boleta
export const IssueResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.number(),
    numero_completo: z.string(),
    pdf_path: z.string().nullish(),
    xml_path: z.string().nullish(),
    cdr_path: z.string().nullish(),
    sunat_status: z.string().nullish(),
  }),
});

export type IssueResponse = z.infer<typeof IssueResponseSchema>;

// Tipo para los datos de un cliente
export interface Client {
  id?: number; // ID del socio en la tabla socio_titulares
  tipo_documento: string;
  numero_documento: string;
  razon_social: string;
  nombre_comercial?: string;
  direccion: string;
  ubigeo?: string;
  distrito?: string;
  provincia?: string;
  departamento?: string;
  telefono?: string;
  email?: string;
}

// Tipo para el calendario de facturación
export interface InvoicingCalendarItem {
  id: number;
  type: 'Boleta' | 'Factura' | 'Nota Crédito';
  serie: string;
  clientName: string;
  amount: number;
  date: string;
  status: 'Aceptado' | 'Pendiente' | 'Rechazado';
}

// Esquema para el formulario de creación de Resumen Diario
export const ResumenDiarioSchema = z.object({
  fecha_resumen: z.string({
    required_error: "La fecha de resumen es obligatoria.",
  }).min(1, "Por favor, seleccione una fecha válida."),
});

export type ResumenDiarioFormValues = z.infer<typeof ResumenDiarioSchema>;

// --- ESQUEMAS PARA LA RESPUESTA DE CREACIÓN DE RESUMEN ---

// Esquema para una boleta individual dentro del resumen
const BoletaInSummarySchema = z.object({
  id: z.number(),
  numero_completo: z.string(),
  fecha_emision: z.string(),
  moneda: z.string(),
  mto_imp_venta: z.string(), // Viene como string, se parsea en el componente
});

// Esquema para el objeto 'data' que se muestra en el resultado
const SummaryDataSchema = z.object({
  id: z.number(),
  numero_completo: z.string(),
  fecha_resumen: z.string(),
  estado_proceso: z.string(),
  estado_sunat: z.string(),
  boletas: z.array(BoletaInSummarySchema).optional().default([]), // Clave: opcional y con valor por defecto
});

// Tipo exportado para ser usado en los componentes
export type SummaryData = z.infer<typeof SummaryDataSchema>;

// Esquema para la respuesta COMPLETA de la API de creación de resumen
export const CreateSummaryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: SummaryDataSchema,
});

export type CreateSummaryResponse = z.infer<typeof CreateSummaryResponseSchema>;


// Esquema para la respuesta de envío de resumen a SUNAT
const SummaryDetailSchema = z.object({
  serie_numero: z.string(),
});

export const SendSummaryResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  data: z.object({
    id: z.number(),
    fecha_resumen: z.string(),
    numero_completo: z.string(),
    correlativo: z.string(),
    ticket: z.string(),
    estado_sunat: z.string().nullable(),
    detalles: z.array(SummaryDetailSchema),
  }),
});

export type SendSummaryResponse = z.infer<typeof SendSummaryResponseSchema>;
export type SendSummaryData = SendSummaryResponse['data'];

// Tipo para los datos de un resumen diario recuperado de Supabase
export type DailySummary = {
  id: number;
  created_at: string;
  fecha_resumen: string;
  numero_completo: string;
  correlativo: string;
  ticket: string;
  estado_sunat: string | null;
  summary_api_id: number | null;
};
