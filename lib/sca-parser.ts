// eslint-disable-next-line @typescript-eslint/no-require-imports
const XLSX = require("xlsx");

export interface SCARow {
  nome: string;
  telefone?: string;
  email?: string;
  dataNasc?: string;
  plano?: string;
  valorPlano?: number;
  vencimento?: string;
  dataMatricula?: string;
  status: string;
  extra?: Record<string, string>;
}

// Mapeamento flexível de colunas do SCA → nossos campos
// O SCA pode ter diferentes nomes dependendo da versão
const COLUMN_MAP: Record<string, keyof SCARow> = {
  // Nome
  "nome": "nome",
  "nome completo": "nome",
  "aluno": "nome",
  "cliente": "nome",
  // Telefone
  "telefone": "telefone",
  "celular": "telefone",
  "tel": "telefone",
  "fone": "telefone",
  "whatsapp": "telefone",
  // Email
  "email": "email",
  "e-mail": "email",
  // Data de nascimento
  "data de nascimento": "dataNasc",
  "nascimento": "dataNasc",
  "data nasc": "dataNasc",
  "dt nasc": "dataNasc",
  "dt. nasc": "dataNasc",
  // Plano / modalidade
  "plano": "plano",
  "modalidade": "plano",
  "produto": "plano",
  "servico": "plano",
  "serviço": "plano",
  // Valor
  "valor": "valorPlano",
  "mensalidade": "valorPlano",
  "valor plano": "valorPlano",
  "preco": "valorPlano",
  "preço": "valorPlano",
  // Vencimento
  "vencimento": "vencimento",
  "data vencimento": "vencimento",
  "dt vencimento": "vencimento",
  "vence": "vencimento",
  "validade": "vencimento",
  // Matrícula
  "matricula": "dataMatricula",
  "matrícula": "dataMatricula",
  "data matricula": "dataMatricula",
  "data de matricula": "dataMatricula",
  // Status
  "status": "status",
  "situacao": "status",
  "situação": "status",
};

function normalizeKey(key: string): string {
  return key
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim();
}

function detectStatus(raw: string): string {
  const s = raw.toLowerCase().trim();
  if (s.includes("inadim") || s.includes("atras") || s.includes("devend")) return "INADIMPLENTE";
  if (s.includes("inativ") || s.includes("cancel") || s.includes("encerr")) return "INATIVO";
  return "ATIVO";
}

function parseValue(raw: string): number | undefined {
  if (!raw) return undefined;
  const cleaned = raw.replace(/[R$\s.]/g, "").replace(",", ".");
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : num;
}

export function parseSCABuffer(buffer: Buffer, filename: string): SCARow[] {
  let rows: Record<string, string>[] = [];

  if (filename.endsWith(".csv")) {
    rows = parseCSV(buffer.toString("utf-8"));
  } else {
    // XLSX / XLS
    const workbook = XLSX.read(buffer, { type: "buffer" });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    rows = XLSX.utils.sheet_to_json(sheet, { raw: false, defval: "" });
  }

  return rows.map((row) => mapRow(row)).filter((r) => r.nome.trim().length > 0);
}

function parseCSV(content: string): Record<string, string>[] {
  // Suporta ; e , como separador
  const lines = content.split(/\r?\n/).filter((l) => l.trim());
  if (lines.length < 2) return [];

  const sep = lines[0].includes(";") ? ";" : ",";
  const headers = lines[0].split(sep).map((h) => h.replace(/^"|"$/g, "").trim());

  return lines.slice(1).map((line) => {
    const values = parseCsvLine(line, sep);
    const obj: Record<string, string> = {};
    headers.forEach((h, i) => {
      obj[h] = (values[i] ?? "").replace(/^"|"$/g, "").trim();
    });
    return obj;
  });
}

function parseCsvLine(line: string, sep: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;

  for (const char of line) {
    if (char === '"') {
      inQuotes = !inQuotes;
    } else if (char === sep && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += char;
    }
  }
  result.push(current);
  return result;
}

function mapRow(row: Record<string, string>): SCARow {
  const mapped: Partial<SCARow> = {};
  const extra: Record<string, string> = {};

  for (const [key, value] of Object.entries(row)) {
    const normalized = normalizeKey(key);
    const field = COLUMN_MAP[normalized];

    if (field) {
      if (field === "valorPlano") {
        mapped.valorPlano = parseValue(value);
      } else if (field === "status") {
        mapped.status = detectStatus(value || "ativo");
      } else {
        (mapped as Record<string, unknown>)[field] = value || undefined;
      }
    } else if (value) {
      extra[key] = value;
    }
  }

  return {
    nome: mapped.nome ?? "Sem nome",
    telefone: mapped.telefone,
    email: mapped.email,
    dataNasc: mapped.dataNasc,
    plano: mapped.plano,
    valorPlano: mapped.valorPlano,
    vencimento: mapped.vencimento,
    dataMatricula: mapped.dataMatricula,
    status: mapped.status ?? "ATIVO",
    extra: Object.keys(extra).length > 0 ? extra : undefined,
  };
}
