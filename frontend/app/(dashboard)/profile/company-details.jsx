"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Building2,
  Globe,
  Mail,
  MapPin,
  Phone,
  User2,
  Users,
} from "lucide-react";

export default function CompanyDetails({ user, setUser }) {
  const [companyData, setCompanyData] = useState({
    name: user.company,
    website: "www.globallogistics.com",
    industry: "Logistics & Transportation",
    size: "100-250 employees",
    yearFounded: "2005",
    taxId: "US-123456789",
    address: {
      street: "123 Shipping Lane",
      city: "Cargo City",
      state: "FL",
      zip: "33101",
      country: "United States",
    },
    contacts: [
      {
        id: "contact-1",
        name: "Sarah Johnson",
        title: "Operations Manager",
        email: "sarah@globallogistics.com",
        phone: "+1 (555) 987-6543",
      },
      {
        id: "contact-2",
        name: "Michael Chen",
        title: "Finance Director",
        email: "michael@globallogistics.com",
        phone: "+1 (555) 456-7890",
      },
    ],
  });

  const [isEditing, setIsEditing] = useState(false);
  const [editedCompany, setEditedCompany] = useState(companyData);

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.includes(".")) {
      const [parent, child] = name.split(".");
      setEditedCompany({
        ...editedCompany,
        [parent]: {
          ...editedCompany[parent],
          [child]: value,
        },
      });
    } else {
      setEditedCompany({
        ...editedCompany,
        [name]: value,
      });
    }
  };

  const handleContactChange = (id, field, value) => {
    setEditedCompany({
      ...editedCompany,
      contacts: editedCompany.contacts.map((contact) =>
        contact.id === id ? { ...contact, [field]: value } : contact
      ),
    });
  };

  const handleSave = () => {
    setCompanyData(editedCompany);
    setUser({
      ...user,
      company: editedCompany.name,
    });
    setIsEditing(false);
  };

  return (
    <Tabs defaultValue="details" className="w-full">
      <TabsList className="grid w-full grid-cols-3 mb-6">
        <TabsTrigger value="details">Company Details</TabsTrigger>
        <TabsTrigger value="contacts">Contacts</TabsTrigger>
        <TabsTrigger value="locations">Locations</TabsTrigger>
      </TabsList>

      <TabsContent value="details">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Company Information</h3>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Details
              </Button>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Company Name</Label>
                {isEditing ? (
                  <Input
                    id="name"
                    name="name"
                    value={editedCompany.name}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <Building2 className="h-4 w-4 text-subText" />
                    <span>{companyData.name}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="website">Website</Label>
                {isEditing ? (
                  <Input
                    id="website"
                    name="website"
                    value={editedCompany.website}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <Globe className="h-4 w-4 text-subText" />
                    <span>{companyData.website}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="industry">Industry</Label>
                {isEditing ? (
                  <Input
                    id="industry"
                    name="industry"
                    value={editedCompany.industry}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <span>{companyData.industry}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="size">Company Size</Label>
                {isEditing ? (
                  <Input
                    id="size"
                    name="size"
                    value={editedCompany.size}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <Users className="h-4 w-4 text-subText" />
                    <span>{companyData.size}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="yearFounded">Year Founded</Label>
                {isEditing ? (
                  <Input
                    id="yearFounded"
                    name="yearFounded"
                    value={editedCompany.yearFounded}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <span>{companyData.yearFounded}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="taxId">Tax ID / VAT Number</Label>
                {isEditing ? (
                  <Input
                    id="taxId"
                    name="taxId"
                    value={editedCompany.taxId}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <span>{companyData.taxId}</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          <Separator />

          <div className="space-y-4">
            <h3 className="text-lg font-medium">Primary Address</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="address.street">Street Address</Label>
                {isEditing ? (
                  <Input
                    id="address.street"
                    name="address.street"
                    value={editedCompany.address.street}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <MapPin className="h-4 w-4 text-subText" />
                    <span>{companyData.address.street}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.city">City</Label>
                {isEditing ? (
                  <Input
                    id="address.city"
                    name="address.city"
                    value={editedCompany.address.city}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <span>{companyData.address.city}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.state">State / Province</Label>
                {isEditing ? (
                  <Input
                    id="address.state"
                    name="address.state"
                    value={editedCompany.address.state}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <span>{companyData.address.state}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.zip">Postal / Zip Code</Label>
                {isEditing ? (
                  <Input
                    id="address.zip"
                    name="address.zip"
                    value={editedCompany.address.zip}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <span>{companyData.address.zip}</span>
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="address.country">Country</Label>
                {isEditing ? (
                  <Input
                    id="address.country"
                    name="address.country"
                    value={editedCompany.address.country}
                    onChange={handleChange}
                  />
                ) : (
                  <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                    <span>{companyData.address.country}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </TabsContent>

      <TabsContent value="contacts">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Company Contacts</h3>
            {isEditing ? (
              <div className="flex gap-2">
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancel
                </Button>
                <Button onClick={handleSave}>Save Changes</Button>
              </div>
            ) : (
              <Button variant="outline" onClick={() => setIsEditing(true)}>
                Edit Contacts
              </Button>
            )}
          </div>

          <div className="space-y-6">
            {(isEditing ? editedCompany.contacts : companyData.contacts).map(
              (contact, index) => (
                <div key={contact.id} className="p-4 border rounded-md">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor={`contact-${index}-name`}>Name</Label>
                      {isEditing ? (
                        <Input
                          id={`contact-${index}-name`}
                          value={contact.name}
                          onChange={(e) =>
                            handleContactChange(
                              contact.id,
                              "name",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                          <User2 className="h-4 w-4 text-subText" />
                          <span>{contact.name}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`contact-${index}-title`}>Title</Label>
                      {isEditing ? (
                        <Input
                          id={`contact-${index}-title`}
                          value={contact.title}
                          onChange={(e) =>
                            handleContactChange(
                              contact.id,
                              "title",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                          <span>{contact.title}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`contact-${index}-email`}>Email</Label>
                      {isEditing ? (
                        <Input
                          id={`contact-${index}-email`}
                          value={contact.email}
                          onChange={(e) =>
                            handleContactChange(
                              contact.id,
                              "email",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                          <Mail className="h-4 w-4 text-subText" />
                          <span>{contact.email}</span>
                        </div>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor={`contact-${index}-phone`}>Phone</Label>
                      {isEditing ? (
                        <Input
                          id={`contact-${index}-phone`}
                          value={contact.phone}
                          onChange={(e) =>
                            handleContactChange(
                              contact.id,
                              "phone",
                              e.target.value
                            )
                          }
                        />
                      ) : (
                        <div className="flex items-center gap-2 h-10 px-3 rounded-md border border-input bg-background">
                          <Phone className="h-4 w-4 text-subText" />
                          <span>{contact.phone}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )
            )}

            {isEditing && (
              <Button
                variant="outline"
                className="w-full"
                onClick={() => {
                  setEditedCompany({
                    ...editedCompany,
                    contacts: [
                      ...editedCompany.contacts,
                      {
                        id: `contact-${Date.now()}`,
                        name: "",
                        title: "",
                        email: "",
                        phone: "",
                      },
                    ],
                  });
                }}
              >
                Add Contact
              </Button>
            )}
          </div>
        </div>
      </TabsContent>

      <TabsContent value="locations">
        <div className="space-y-6">
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-medium">Company Locations</h3>
            <Button variant="outline">Add Location</Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 border rounded-md">
              <h4 className="font-medium">Headquarters</h4>
              <p className="text-sm text-subText mt-1">Primary Location</p>
              <div className="mt-3 space-y-1 text-sm">
                <p>{companyData.address.street}</p>
                <p>
                  {companyData.address.city}, {companyData.address.state}{" "}
                  {companyData.address.zip}
                </p>
                <p>{companyData.address.country}</p>
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h4 className="font-medium">West Coast Office</h4>
              <p className="text-sm text-subText mt-1">Regional Office</p>
              <div className="mt-3 space-y-1 text-sm">
                <p>789 Pacific Avenue</p>
                <p>San Francisco, CA 94111</p>
                <p>United States</p>
              </div>
            </div>

            <div className="p-4 border rounded-md">
              <h4 className="font-medium">East Coast Distribution Center</h4>
              <p className="text-sm text-subText mt-1">Warehouse</p>
              <div className="mt-3 space-y-1 text-sm">
                <p>456 Harbor Drive</p>
                <p>Newark, NJ 07101</p>
                <p>United States</p>
              </div>
            </div>

            <div className="p-4 border rounded-md border-dashed flex items-center justify-center h-[140px] cursor-pointer">
              <div className="flex flex-col items-center text-subText">
                <MapPin className="h-6 w-6 mb-2" />
                <span className="font-medium">Add New Location</span>
              </div>
            </div>
          </div>
        </div>
      </TabsContent>
    </Tabs>
  );
}
