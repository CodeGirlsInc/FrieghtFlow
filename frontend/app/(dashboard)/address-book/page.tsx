'use client';

import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { toast } from 'sonner';
import { Button } from '../../../components/ui/button';
import { Input } from '../../../components/ui/input';
import { Label } from '../../../components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '../../../components/ui/card';

const ADDRESS_LABELS = ['Home', 'Warehouse', 'Office', 'Factory', 'Port', 'Other'] as const;

const addressSchema = z.object({
  label: z.enum(ADDRESS_LABELS, 'Select a label'),
  street: z.string().min(2, 'Street address is required'),
  city: z.string().min(1, 'City is required'),
  state: z.string().optional(),
  postalCode: z.string().optional(),
  country: z.string().min(1, 'Country is required'),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  isDefault: z.boolean().optional(),
});
type AddressData = z.infer<typeof addressSchema>;

interface SavedAddress extends AddressData {
  id: string;
}

const STORAGE_KEY = 'ff_address_book';

function loadAddresses(): SavedAddress[] {
  if (typeof window === 'undefined') return [];
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch {
    return [];
  }
}

function saveAddresses(addresses: SavedAddress[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(addresses));
}

export default function AddressBookPage() {
  const [addresses, setAddresses] = useState<SavedAddress[]>([]);
  const [search, setSearch] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<AddressData>({
    resolver: zodResolver(addressSchema),
    defaultValues: { label: 'Home', isDefault: false },
  });

  useEffect(() => {
    setAddresses(loadAddresses());
  }, []);

  const onSubmit = (data: AddressData) => {
    const fullAddress: SavedAddress = {
      ...data,
      id: editingId ?? `addr-${Date.now()}`,
    };

    let next: SavedAddress[];
    if (editingId) {
      next = addresses.map((a) => (a.id === editingId ? fullAddress : a));
    } else {
      next = [...addresses, fullAddress];
    }

    setAddresses(next);
    saveAddresses(next);
    toast.success(editingId ? 'Address updated!' : 'Address saved!');
    reset({ label: 'Home', street: '', city: '', state: '', postalCode: '', country: '', contactName: '', contactPhone: '', isDefault: false });
    setShowForm(false);
    setEditingId(null);
  };

  const handleEdit = (addr: SavedAddress) => {
    setEditingId(addr.id);
    reset(addr);
    setShowForm(true);
  };

  const handleDelete = (id: string) => {
    if (!confirm('Delete this address?')) return;
    const next = addresses.filter((a) => a.id !== id);
    setAddresses(next);
    saveAddresses(next);
    toast.success('Address deleted.');
  };

  const handleSetDefault = (id: string) => {
    const next = addresses.map((a) => ({ ...a, isDefault: a.id === id }));
    setAddresses(next);
    saveAddresses(next);
    toast.success('Default address updated.');
  };

  const filtered = addresses.filter((a) => {
    if (!search) return true;
    const q = search.toLowerCase();
    return (
      a.label.toLowerCase().includes(q) ||
      a.street.toLowerCase().includes(q) ||
      a.city.toLowerCase().includes(q) ||
      a.country.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 sm:p-8 max-w-3xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Address Book</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Save and manage frequently used addresses for faster shipment creation.
          </p>
        </div>
        <Button
          onClick={() => {
            setShowForm(!showForm);
            setEditingId(null);
            reset({ label: 'Home', street: '', city: '', state: '', postalCode: '', country: '', contactName: '', contactPhone: '', isDefault: false });
          }}
        >
          {showForm ? 'Cancel' : '+ Add Address'}
        </Button>
      </div>

      {/* Add/Edit form */}
      {showForm && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">{editingId ? 'Edit Address' : 'New Address'}</CardTitle>
          </CardHeader>
          <form onSubmit={handleSubmit(onSubmit)}>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="label">Label</Label>
                  <select
                    id="label"
                    className="w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground"
                    {...register('label')}
                  >
                    {ADDRESS_LABELS.map((l) => (
                      <option key={l} value={l}>{l}</option>
                    ))}
                  </select>
                  {errors.label && <p className="text-sm text-destructive">{errors.label.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="street">Street address</Label>
                  <Input id="street" {...register('street')} placeholder="123 Main St" />
                  {errors.street && <p className="text-sm text-destructive">{errors.street.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="city">City</Label>
                  <Input id="city" {...register('city')} placeholder="Lagos" />
                  {errors.city && <p className="text-sm text-destructive">{errors.city.message}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="state">State/Province</Label>
                  <Input id="state" {...register('state')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="postalCode">Postal code</Label>
                  <Input id="postalCode" {...register('postalCode')} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="country">Country</Label>
                  <Input id="country" {...register('country')} placeholder="Nigeria" />
                  {errors.country && <p className="text-sm text-destructive">{errors.country.message}</p>}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="contactName">Contact name (optional)</Label>
                  <Input id="contactName" {...register('contactName')} placeholder="John Doe" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactPhone">Contact phone (optional)</Label>
                  <Input id="contactPhone" type="tel" {...register('contactPhone')} placeholder="+234 800 000 0000" />
                </div>
              </div>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" className="rounded" {...register('isDefault')} />
                Set as default address
              </label>
              <div className="flex justify-end gap-2 pt-2">
                <Button type="button" variant="outline" onClick={() => { setShowForm(false); setEditingId(null); }}>
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? 'Saving...' : editingId ? 'Update address' : 'Save address'}
                </Button>
              </div>
            </CardContent>
          </form>
        </Card>
      )}

      {/* Search */}
      {addresses.length > 0 && (
        <Input
          placeholder="Search addresses..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="max-w-sm"
        />
      )}

      {/* Address list */}
      {filtered.length === 0 ? (
        <Card>
          <CardContent className="py-12 text-center">
            <p className="text-sm text-muted-foreground">
              {addresses.length === 0
                ? 'No saved addresses yet. Add one to speed up shipment creation.'
                : 'No addresses match your search.'}
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((addr) => (
            <Card key={addr.id} className={addr.isDefault ? 'border-primary' : ''}>
              <CardContent className="py-4">
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold">{addr.label}</span>
                      {addr.isDefault && (
                        <span className="px-1.5 py-0.5 rounded-full bg-primary/10 text-primary text-[10px] font-medium">
                          Default
                        </span>
                      )}
                    </div>
                    <p className="text-sm text-muted-foreground mt-0.5">{addr.street}</p>
                    <p className="text-sm text-muted-foreground">
                      {addr.city}{addr.state ? `, ${addr.state}` : ''} {addr.postalCode ?? ''}, {addr.country}
                    </p>
                    {(addr.contactName || addr.contactPhone) && (
                      <p className="text-xs text-muted-foreground mt-1">
                        {addr.contactName && addr.contactPhone
                          ? `${addr.contactName} · ${addr.contactPhone}`
                          : addr.contactName ?? addr.contactPhone}
                      </p>
                    )}
                  </div>
                  <div className="flex gap-1 shrink-0">
                    {!addr.isDefault && (
                      <button
                        onClick={() => handleSetDefault(addr.id)}
                        className="px-2 py-1 text-xs rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                      >
                        Set default
                      </button>
                    )}
                    <button
                      onClick={() => handleEdit(addr)}
                      className="px-2 py-1 text-xs rounded border border-border text-muted-foreground hover:text-foreground hover:bg-accent transition-colors"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(addr.id)}
                      className="px-2 py-1 text-xs rounded border border-border text-destructive hover:bg-destructive/10 transition-colors"
                    >
                      Delete
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
