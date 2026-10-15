export interface PurchasingInfo {
  pgr: string;
  description: string | null;
  telephone: string | null;
  faxNumber: string | null;
}

export interface PoInfo {
  nomorPr: string;
  keterangan: string | null;
  quantity: number | null;
  unitOfMeasure: string | null;
  valuationPrice: number | null;
  total: number | null;
  noPo: string | null;
  pgr: string | null;
  purchasing: PurchasingInfo | null;
}

export interface CreatedTrackingInfo {
  idCreated: string;
  capexNo: string | null;
  type: string | null;
  requestor: string | null;
  reqDate: string | null;
  nama: string | null;
  dateApprove: string | null;
  notes: string | null;
  budgetStatus: string | null;
  kodeApprover: string | null;
}

export interface CapexItem {
  idTotal: string;
  nomorPr: string | null;
  capexNo: string | null;
  description: string | null;
  budgetType: string | null;
  budgetStatus: string | null;
  reqDate: string | null;
  quantity: number | null;
  amount: number | null;
  costCenter: string | null;
  io: string | null;
  mo: string | null;
  wbs: string | null;
  statusCapex: string | null;
  tahun: number | null;
  komoditi: string | null;
  isManuallyClose: boolean;
  closedAt: string | null;
  closedBy: string | null;
  kategori: string | null;
  po: PoInfo | null;
  createdList: CreatedTrackingInfo[];
}

export interface PendingCapexItem {
  idCreated: string;
  capexNo: string | null;
  description: string | null;
  amount: number | null;
  io: string | null;
  mo: string | null;
  wbs: string | null;
  reqDate: string | null;
  budgetStatus: string | null;
  notes: string | null;
  dateApprove: string | null;
}

export interface UserApproverItem {
  kodeApprover: string;
  nama: string | null;
  pendingCount: number;
  pendingItems: PendingCapexItem[];
}

export interface CapexMainFilterValues {
  kategori: string;
  costCenter: string;
  statusCapex: string;
}
