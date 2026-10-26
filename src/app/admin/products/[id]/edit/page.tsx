'use client';
import { useParams } from 'next/navigation';
import { Alert, PageHeading, Skeleton } from '@/components/ui';
import { ProductForm, type ProductFormData } from '@/components/product-form';
import { useApi } from '@/hooks/use-api';

type EditableProduct = {
  id: string;
  name: string;
  description: string | null;
  categoryId: string;
  basePrice: string | number;
  comparePrice: string | number | null;
  brand: string | null;
  productType: string | null;
  unit: string | null;
  trackStock: boolean;
  stockQuantity: number;
  isFeatured: boolean;
  isActive: boolean;
  images: { url: string; storageKey: string | null; alt: string | null }[];
  variants: { id: string; name: string; sku: string | null; priceOverride: string | number | null; stockQuantity: number; size: string | null; color: string | null; volume: string | null; isActive: boolean }[];
  attributes: Record<string, unknown> | null;
};

export default function EditProduct() {
  const { id } = useParams<{ id: string }>();
  const { data: p, error, loading } = useApi<EditableProduct>(`/admin/products/${id}`);
  if (error) return <Alert tone="error">{error}</Alert>;
  if (loading || !p) return <Skeleton className="h-96" />;
  const init: ProductFormData = {
    id: p.id, name: p.name, description: p.description ?? '', categoryId: p.categoryId, basePrice: String(p.basePrice), comparePrice: p.comparePrice ? String(p.comparePrice) : '',
    brand: p.brand ?? '', productType: p.productType ?? '', unit: p.unit ?? '', trackStock: p.trackStock, stockQuantity: String(p.stockQuantity), isFeatured: p.isFeatured, isActive: p.isActive,
    images: p.images.map((i) => ({ url: i.url, storageKey: i.storageKey ?? undefined, alt: i.alt ?? undefined })),
    variants: p.variants.map((v) => ({ id: v.id, name: v.name, sku: v.sku ?? '', priceOverride: v.priceOverride ? String(v.priceOverride) : '', stockQuantity: String(v.stockQuantity), size: v.size ?? '', color: v.color ?? '', volume: v.volume ?? '', isActive: v.isActive })),
    attributes: Object.entries(p.attributes ?? {}).map(([k, v]) => ({ k, v: String(v) })),
  };
  return (<><PageHeading title={`Edit: ${p.name}`} /><ProductForm initial={init} /></>);
}
