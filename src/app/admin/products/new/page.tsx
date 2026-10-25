'use client';
import { PageHeading } from '@/components/ui';
import { emptyProduct, ProductForm } from '@/components/product-form';
export default function NewProduct() { return (<><PageHeading title="New product" /><ProductForm initial={emptyProduct()} /></>); }
