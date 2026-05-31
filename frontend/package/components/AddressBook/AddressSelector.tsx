"use client";

import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronDown, MapPin } from "lucide-react";
import type { Address } from "./AddressBook";

export interface AddressSelectorProps {
  onSelect: (address: Address) => void;
  selectedId?: string;
  placeholder?: string;
}

const fetchAddresses = async (): Promise<Address[]> => {
  const res = await fetch("/api/addresses");
  if (!res.ok) throw new Error("Failed to fetch addresses");
  return res.json();
};

export const AddressSelector: React.FC<AddressSelectorProps> = ({ 
  onSelect, 
  selectedId,
  placeholder = "Select an address..."
}) => {
  const [isOpen, setIsOpen] = useState(false);
  
  const { data: addresses = [], isLoading } = useQuery<Address[]>({
    queryKey: ["addresses"],
    queryFn: fetchAddresses,
  });

  const selectedAddress = addresses.find(a => a.id === selectedId);

  if (isLoading) {
    return <div className="p-2 border rounded-md text-gray-500 bg-gray-50">Loading addresses...</div>;
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between border rounded-md p-3 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 text-left"
      >
        <div className="flex items-center gap-2 truncate">
          <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
          {selectedAddress ? (
            <span className="truncate font-medium text-gray-900">
              {selectedAddress.label} - <span className="text-gray-500 font-normal">{selectedAddress.city}, {selectedAddress.country}</span>
            </span>
          ) : (
            <span className="text-gray-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown className="w-4 h-4 text-gray-400 shrink-0 ml-2" />
      </button>

      {isOpen && (
        <>
          <div className="fixed inset-0 z-10" onClick={() => setIsOpen(false)} />
          <div className="absolute z-20 w-full mt-1 bg-white border rounded-md shadow-lg max-h-60 overflow-auto">
            {addresses.length === 0 ? (
              <div className="p-3 text-sm text-gray-500 text-center">No saved addresses</div>
            ) : (
              <ul className="py-1">
                {addresses.map((address) => (
                  <li key={address.id}>
                    <button
                      type="button"
                      className={`w-full text-left px-4 py-2 text-sm hover:bg-blue-50 focus:bg-blue-50 focus:outline-none transition-colors
                        ${selectedId === address.id ? "bg-blue-50 text-blue-700" : "text-gray-700"}
                      `}
                      onClick={() => {
                        onSelect(address);
                        setIsOpen(false);
                      }}
                    >
                      <div className="font-medium flex items-center gap-2">
                        {address.label}
                        {address.isDefault && (
                          <span className="text-[10px] uppercase tracking-wider bg-green-100 text-green-800 px-1.5 rounded-full">Default</span>
                        )}
                      </div>
                      <div className="text-gray-500 text-xs mt-0.5 truncate">
                        {address.street}, {address.city}, {address.postalCode}, {address.country}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </>
      )}
    </div>
  );
};
