"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  CreditCard,
  Edit,
  MoreHorizontal,
  Plus,
  Trash2,
} from "lucide-react";

// Mock data for payment methods
const mockPaymentMethods = [
  {
    id: "pm-1",
    type: "visa",
    last4: "4242",
    expMonth: 9,
    expYear: 2025,
    name: "Alex Thompson",
    isDefault: true,
  },
  {
    id: "pm-2",
    type: "mastercard",
    last4: "5555",
    expMonth: 11,
    expYear: 2024,
    name: "Alex Thompson",
    isDefault: false,
  },
  {
    id: "pm-3",
    type: "bank",
    accountLast4: "9876",
    bankName: "Chase Bank",
    accountType: "Checking",
    name: "Global Logistics Inc.",
    isDefault: false,
  },
];

export default function PaymentMethods({ billingData, updateBillingData }) {
  const [paymentMethods, setPaymentMethods] = useState(mockPaymentMethods);
  const [isAddCardOpen, setIsAddCardOpen] = useState(false);
  const [isAddBankOpen, setIsAddBankOpen] = useState(false);

  const getCardIcon = (type) => {
    if (type === "visa") {
      return (
        <svg
          width="40"
          height="24"
          viewBox="0 0 40 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="40" height="24" rx="4" fill="#1A1F71" />
          <path d="M16 15H12L14.5 9H19L16 15Z" fill="#FFFFFF" />
          <path
            d="M25.5 9.2C24.8 9 24 8.9 23 9.3C23 9.3 23.3 9 24.1 9H26.9L26.5 11C26.5 11 26.3 10.3 25.5 9.2Z"
            fill="#FFFFFF"
          />
          <path
            d="M26.4 11.7C26.4 11.7 26.6 11.6 26.8 11.5L27 11L26.7 13C26.7 13 26.5 12.1 26.4 11.7Z"
            fill="#FFFFFF"
          />
          <path
            d="M23.1 13.1L23.5 11.3C23.5 11.3 24.1 12.3 24.2 12.9L23.8 14.7C23.8 14.7 23.2 13.7 23.1 13.1Z"
            fill="#FFFFFF"
          />
          <path
            d="M28 9H25.5L25.1 10.6C25.1 10.6 25.7 11.4 26 11.5L28 9Z"
            fill="#FFFFFF"
          />
          <path
            d="M24.5 12.5C24.8 12.6 25.2 12.6 25.6 12.4L26 11L25.2 14.5C25.2 14.5 24.9 13.8 24.5 13.5L24.5 12.5Z"
            fill="#FFFFFF"
          />
        </svg>
      );
    } else if (type === "mastercard") {
      return (
        <svg
          width="40"
          height="24"
          viewBox="0 0 40 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <rect width="40" height="24" rx="4" fill="#F7F7F7" />
          <circle cx="16" cy="12" r="6" fill="#EB001B" />
          <circle cx="24" cy="12" r="6" fill="#F79E1B" />
          <path
            fillRule="evenodd"
            clipRule="evenodd"
            d="M20 16.8C21.3062 15.8348 22.1285 14.3488 22.1285 12.7C22.1285 11.0512 21.3062 9.56517 20 8.6C18.6938 9.56517 17.8715 11.0512 17.8715 12.7C17.8715 14.3488 18.6938 15.8348 20 16.8Z"
            fill="#FF5F00"
          />
        </svg>
      );
    } else {
      return (
        <div className="bg-inputBackground p-2 rounded-md">
          <CreditCard className="h-5 w-5" />
        </div>
      );
    }
  };

  const getBankIcon = () => {
    return (
      <div className="bg-inputBackground p-2 rounded-md">
        <svg
          width="20"
          height="20"
          viewBox="0 0 24 24"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M3 21H21V17H3V21ZM3 7H21V3H3V7ZM3 15H21V9H3V15Z"
            fill="#0C1421"
          />
        </svg>
      </div>
    );
  };

  const setDefaultPaymentMethod = (id) => {
    setPaymentMethods(
      paymentMethods.map((pm) => ({
        ...pm,
        isDefault: pm.id === id,
      }))
    );

    // Update the billing data with the new default payment method
    const newDefaultMethod = paymentMethods.find((pm) => pm.id === id);
    if (newDefaultMethod) {
      updateBillingData({
        paymentMethod: newDefaultMethod,
      });
    }
  };

  const deletePaymentMethod = (id) => {
    // Don't allow deleting the default payment method
    if (paymentMethods.find((pm) => pm.id === id)?.isDefault) {
      return;
    }

    setPaymentMethods(paymentMethods.filter((pm) => pm.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Payment Methods</h3>
        <div className="flex gap-2">
          <Dialog open={isAddBankOpen} onOpenChange={setIsAddBankOpen}>
            <DialogTrigger asChild>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Bank Account
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add Bank Account</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="accountName">Account Holder Name</Label>
                  <Input
                    id="accountName"
                    placeholder="Individual or business name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="bankName">Bank Name</Label>
                  <Input id="bankName" placeholder="Enter bank name" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="routingNumber">Routing Number</Label>
                    <Input id="routingNumber" placeholder="123456789" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="accountNumber">Account Number</Label>
                    <Input id="accountNumber" placeholder="1234567890" />
                  </div>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <select
                    id="accountType"
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <option value="checking">Checking</option>
                    <option value="savings">Savings</option>
                    <option value="business">Business</option>
                  </select>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="defaultBank"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="defaultBank">
                    Set as default payment method
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Add Bank Account</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={isAddCardOpen} onOpenChange={setIsAddCardOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Card</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="Name as it appears on card"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input id="cardNumber" placeholder="1234 5678 9012 3456" />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="expiration">Expiration Date</Label>
                    <Input id="expiration" placeholder="MM/YY" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="cvv">CVV</Label>
                    <Input id="cvv" placeholder="123" />
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    id="defaultCard"
                    className="rounded border-gray-300"
                  />
                  <Label htmlFor="defaultCard">
                    Set as default payment method
                  </Label>
                </div>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button variant="outline">Cancel</Button>
                </DialogClose>
                <Button>Add Card</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <div className="space-y-4">
        {paymentMethods.map((method) => (
          <Card key={method.id} className="overflow-hidden">
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  {method.type === "bank"
                    ? getBankIcon()
                    : getCardIcon(method.type)}
                  <div>
                    {method.type === "bank" ? (
                      <>
                        <h3 className="font-medium">
                          {method.bankName} - {method.accountType}
                        </h3>
                        <p className="text-sm text-subText">
                          Account ending in {method.accountLast4}
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="font-medium">
                          {method.type.charAt(0).toUpperCase() +
                            method.type.slice(1)}{" "}
                          ending in {method.last4}
                        </h3>
                        <p className="text-sm text-subText">
                          Expires {method.expMonth.toString().padStart(2, "0")}/
                          {method.expYear}
                        </p>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {method.isDefault && (
                    <Badge className="bg-green-100 text-green-800 border-green-200">
                      Default
                    </Badge>
                  )}
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {!method.isDefault && (
                        <DropdownMenuItem
                          onClick={() => setDefaultPaymentMethod(method.id)}
                        >
                          <Check className="mr-2 h-4 w-4" />
                          <span>Set as Default</span>
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuItem>
                        <Edit className="mr-2 h-4 w-4" />
                        <span>Edit</span>
                      </DropdownMenuItem>
                      {!method.isDefault && (
                        <DropdownMenuItem
                          onClick={() => deletePaymentMethod(method.id)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          <span>Delete</span>
                        </DropdownMenuItem>
                      )}
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
