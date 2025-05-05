"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Building2, Mail, MapPin, Phone } from "lucide-react";

export default function BillingAddress({ billingData, updateBillingData }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(billingData.billingAddress);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSave = () => {
    updateBillingData({
      billingAddress: formData,
    });
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData(billingData.billingAddress);
    setIsEditing(false);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Billing Address</h3>
        {isEditing ? (
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={handleCancel}>
              Cancel
            </Button>
            <Button size="sm" onClick={handleSave}>
              Save Changes
            </Button>
          </div>
        ) : (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setIsEditing(true)}
          >
            Edit Address
          </Button>
        )}
      </div>

      <Separator />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Company Name</Label>
            {isEditing ? (
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
              />
            ) : (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                <Building2 className="h-4 w-4 text-subText" />
                <span>{billingData.billingAddress.name}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Street Address</Label>
            {isEditing ? (
              <Input
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
              />
            ) : (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                <MapPin className="h-4 w-4 text-subText" />
                <span>{billingData.billingAddress.address}</span>
              </div>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              {isEditing ? (
                <Input
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                />
              ) : (
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                  <span>{billingData.billingAddress.city}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State / Province</Label>
              {isEditing ? (
                <Input
                  id="state"
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                />
              ) : (
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                  <span>{billingData.billingAddress.state}</span>
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="zip">Postal / Zip Code</Label>
              {isEditing ? (
                <Input
                  id="zip"
                  name="zip"
                  value={formData.zip}
                  onChange={handleChange}
                />
              ) : (
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                  <span>{billingData.billingAddress.zip}</span>
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              {isEditing ? (
                <Input
                  id="country"
                  name="country"
                  value={formData.country}
                  onChange={handleChange}
                />
              ) : (
                <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                  <span>{billingData.billingAddress.country}</span>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Billing Email</Label>
            {isEditing ? (
              <Input
                id="email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            ) : (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                <Mail className="h-4 w-4 text-subText" />
                <span>{billingData.billingAddress.email}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="phone">Billing Phone</Label>
            {isEditing ? (
              <Input
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
              />
            ) : (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                <Phone className="h-4 w-4 text-subText" />
                <span>{billingData.billingAddress.phone}</span>
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="taxId">Tax ID / VAT Number</Label>
            {isEditing ? (
              <Input
                id="taxId"
                name="taxId"
                value={billingData.taxId}
                onChange={(e) => updateBillingData({ taxId: e.target.value })}
              />
            ) : (
              <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                <span>{billingData.taxId}</span>
              </div>
            )}
          </div>

          <div className="pt-4">
            <p className="text-sm text-subText">
              Your billing address is used for invoice generation and tax
              purposes. Make sure this information is accurate and up-to-date.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
