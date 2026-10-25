export type Role = 'CUSTOMER' | 'ADMIN';
export interface User { id: string; name: string; email: string; phone?: string | null; role: Role }
export interface Category { id: string; name: string; slug: string; description: string | null; imageUrl: string | null; sortOrder?: number; isActive?: boolean; _count?: { products: number } }
export interface Paged<T> { items: T[]; total: number; page: number; pageSize: number; totalPages: number }
export interface ProductSummary {
  id: string; name: string; slug: string; basePrice: string; comparePrice: string | null; brand: string | null; productType: string | null; unit: string | null; isFeatured: boolean;
  category: { name: string; slug: string }; image: { url: string; alt: string | null } | null; hasVariants: boolean; fromPrice: string; inStock: boolean;
}
export interface Variant { id: string; name: string; sku: string | null; priceOverride: string | null; stockQuantity: number; size: string | null; color: string | null; volume: string | null }
export interface ProductDetail {
  id: string; name: string; slug: string; description: string | null; basePrice: string; comparePrice: string | null; brand: string | null; productType: string | null; unit: string | null;
  attributes: Record<string, unknown> | null; category: { id: string; name: string; slug: string }; images: { id: string; url: string; alt: string | null }[];
  variants: Variant[]; hasVariants: boolean; inStock: boolean; stockQuantity?: number | null; related: ProductSummary[];
}
export interface Facets { filters: string[]; brands?: string[]; types?: string[]; units?: string[]; colors?: string[]; sizes?: string[]; volumes?: string[]; materials?: string[]; price?: { min: string | null; max: string | null } }
export interface CartLine {
  id: string | null; productId: string; variantId: string | null; quantity: number; name: string; slug: string | null; image: string | null; variantName: string | null; unit: string | null;
  unitPrice: string; lineTotal: string; available: number | null; issue: string | null; ok: boolean;
}
export interface CartView { lines: CartLine[]; subtotal: string; deliveryFee: string; deliveryEnabled: boolean; collectionEnabled: boolean; valid: boolean; itemCount: number }
export interface Settings {
  storeName: string; storeDescription: string | null; logoUrl: string | null; contactPhone: string | null; contactEmail: string | null; businessAddress: string | null;
  socialLinks: Record<string, string> | null; deliveryEnabled: boolean; deliveryFee: string; collectionEnabled: boolean; paymentInstructions: string | null;
}
export interface OrderItem { id: string; productName: string; variantName: string | null; quantity: number; unitPrice: string; lineTotal: string }
export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'COMPLETED' | 'CANCELLED';
export type PaymentStatus = 'UNPAID' | 'PROOF_SUBMITTED' | 'VERIFIED' | 'REJECTED' | 'REFUNDED';
export interface Order {
  id: string; orderNumber: string; status: OrderStatus; paymentStatus: PaymentStatus; paymentMethod: string; fulfilmentType: 'DELIVERY' | 'COLLECTION';
  subtotal: string; deliveryFee: string; total: string; customerName: string; customerEmail: string; customerPhone: string; deliveryAddress: Record<string, string> | null;
  notes: string | null; createdAt: string; items: OrderItem[]; history: { id: string; fromStatus: OrderStatus | null; toStatus: OrderStatus; createdAt: string }[];
  hasPaymentProof: boolean; paymentProofUrl?: string | null; user?: { id: string; name: string; email: string };
}
