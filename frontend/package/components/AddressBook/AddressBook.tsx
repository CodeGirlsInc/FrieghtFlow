"use client";

import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { MapPin, Star, Edit2, Trash2, Plus, X } from "lucide-react";

export interface Address {
  id: string;
  label: string;
  street: string;
  city: string;
  country: string;
  postalCode: string;
  isDefault: boolean;
}

const fetchAddresses = async (): Promise<Address[]> => {
  const res = await fetch("/api/addresses");
  if (!res.ok) throw new Error("Failed to fetch addresses");
  return res.json();
};

const createAddress = async (data: Partial<Address>) => {
  const res = await fetch("/api/addresses", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to create address");
  return res.json();
};

const updateAddress = async ({ id, data }: { id: string; data: Partial<Address> }) => {
  const res = await fetch(`/api/addresses/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error("Failed to update address");
  return res.json();
};

const deleteAddress = async (id: string) => {
  const res = await fetch(`/api/addresses/${id}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete address");
  return res.json();
};

export const AddressBook: React.FC = () => {
  const queryClient = useQueryClient();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState<Address | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
  });

  const { register, handleSubmit, reset, setValue } = useForm<Partial<Address>>();

  const createMutation = useMutation({
    mutationFn: createAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      closeModal();
    },
  });

  const updateMutation = useMutation({
    mutationFn: updateAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      closeModal();
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteAddress,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["addresses"] });
      setDeletingId(null);
    },
  });

  const openModal = (address?: Address) => {
    if (address) {
      setEditingAddress(address);
      setValue("label", address.label);
      setValue("street", address.street);
      setValue("city", address.city);
      setValue("country", address.country);
      setValue("postalCode", address.postalCode);
    } else {
      setEditingAddress(null);
      reset();
    }
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingAddress(null);
    reset();
  };

  const onSubmit = (data: Partial<Address>) => {
    if (editingAddress) {
      updateMutation.mutate({ id: editingAddress.id, data });
    } else {
      createMutation.mutate(data);
    }
  };

  const handleSetDefault = (id: string) => {
    // In a real app, the backend might handle unsetting the previous default.
    // We'll just patch this one to true.
    updateMutation.mutate({ id, data: { isDefault: true } });
  };

  if (isLoading) {
    return <div className="p-4 text-gray-500">Loading address book...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <MapPin className="text-blue-600" />
          Address Book
        </h2>
        <button
          onClick={() => openModal()}
          className="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 flex items-center gap-2"
        >
          <Plus className="w-4 h-4" /> Add Address
        </button>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {addresses.length === 0 ? (
          <div className="col-span-full p-8 text-center text-gray-500 border-2 border-dashed rounded-lg">
            No addresses saved yet.
          </div>
        ) : (
          addresses.map((address) => (
            <div key={address.id} className="border rounded-lg p-4 bg-white shadow-sm relative">
              <div className="flex justify-between items-start mb-2">
                <h3 className="font-semibold text-lg flex items-center gap-2">
                  {address.label}
                  {address.isDefault && (
                    <span className="bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded-full flex items-center gap-1">
                      <Star className="w-3 h-3 fill-current" /> Default
                    </span>
                  )}
                </h3>
                <div className="flex gap-2">
                  <button onClick={() => openModal(address)} className="text-gray-400 hover:text-blue-600" aria-label="Edit">
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button onClick={() => setDeletingId(address.id)} className="text-gray-400 hover:text-red-600" aria-label="Delete">
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
              <p className="text-gray-600 text-sm">{address.street}</p>
              <p className="text-gray-600 text-sm">{address.city}, {address.postalCode}</p>
              <p className="text-gray-600 text-sm mb-4">{address.country}</p>
              
              {!address.isDefault && (
                <button
                  onClick={() => handleSetDefault(address.id)}
                  className="text-sm text-blue-600 hover:text-blue-800 font-medium"
                >
                  Set as Default
                </button>
              )}
            </div>
          ))
        )}
      </div>

      {/* Add/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6 relative">
            <button onClick={closeModal} className="absolute top-4 right-4 text-gray-400 hover:text-gray-600">
              <X className="w-5 h-5" />
            </button>
            <h3 className="text-xl font-bold mb-4">
              {editingAddress ? "Edit Address" : "Add New Address"}
            </h3>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Label (e.g. Warehouse A)</label>
                <input {...register("label", { required: true })} className="w-full border rounded-md p-2" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Street</label>
                <input {...register("street", { required: true })} className="w-full border rounded-md p-2" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">City</label>
                  <input {...register("city", { required: true })} className="w-full border rounded-md p-2" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Postal Code</label>
                  <input {...register("postalCode", { required: true })} className="w-full border rounded-md p-2" />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Country</label>
                <input {...register("country", { required: true })} className="w-full border rounded-md p-2" />
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button type="button" onClick={closeModal} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
                <button type="submit" disabled={createMutation.isPending || updateMutation.isPending} className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50">
                  Save Address
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {deletingId && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-sm p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-2">Delete Address</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to delete this address? This action cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setDeletingId(null)} className="px-4 py-2 border rounded-md hover:bg-gray-50">Cancel</button>
              <button 
                onClick={() => deleteMutation.mutate(deletingId)}
                disabled={deleteMutation.isPending}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {deleteMutation.isPending ? "Deleting..." : "Delete"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
