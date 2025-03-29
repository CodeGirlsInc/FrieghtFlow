"use client";

import { useState, useEffect } from "react";
import {
  Check,
  Clock,
  CreditCard,
  FileText,
  Globe,
  Lock,
  MapPin,
  Package,
  Plus,
  Shield,
  Upload,
  User,
  Wallet,
  X,
} from "lucide-react";

// Mock data for form options
const mockFormData = {
  shipmentTypes: [
    "Standard Freight",
    "Express Shipping",
    "Temperature-Controlled",
    "Hazardous Materials",
    "Oversized Cargo",
  ],
  containerTypes: [
    "20ft Standard",
    "40ft Standard",
    "40ft High Cube",
    "Refrigerated Container",
    "Open Top Container",
    "Flat Rack Container",
  ],
  packagingTypes: [
    "Pallets",
    "Boxes",
    "Crates",
    "Drums",
    "Rolls",
    "Loose Cargo",
  ],
  countries: [
    "United States",
    "China",
    "Germany",
    "United Kingdom",
    "Japan",
    "France",
    "India",
    "Netherlands",
    "Singapore",
    "Canada",
  ],
  incoterms: [
    "EXW (Ex Works)",
    "FOB (Free on Board)",
    "CIF (Cost, Insurance, Freight)",
    "DAP (Delivered at Place)",
    "DDP (Delivered Duty Paid)",
  ],
  currencies: ["USD", "EUR", "GBP", "JPY", "CNY", "AUD", "CAD", "SGD", "INR"],
  customsDocuments: [
    "Commercial Invoice",
    "Packing List",
    "Certificate of Origin",
    "Dangerous Goods Declaration",
    "Shipper's Letter of Instruction",
    "Import/Export License",
  ],
  notificationMethods: ["Email", "SMS", "In-app Notification", "Webhook"],
  paymentMethods: [
    "Credit Card",
    "Bank Transfer",
    "StarkNet Wallet",
    "Invoice (Net 30)",
  ],
  insuranceOptions: [
    "Basic Coverage (included)",
    "Extended Coverage",
    "Full Value Protection",
    "No Insurance",
  ],
};

const CreateNewShipmentPage = () => {
  // Form state
  const [formData, setFormData] = useState({
    shipmentType: "",
    origin: {
      country: "",
      city: "",
      address: "",
      zipCode: "",
      contact: {
        name: "",
        phone: "",
        email: "",
      },
    },
    destination: {
      country: "",
      city: "",
      address: "",
      zipCode: "",
      contact: {
        name: "",
        phone: "",
        email: "",
      },
    },
    cargo: {
      containerType: "",
      packagingType: "",
      contents: [],
      totalWeight: "",
      weightUnit: "kg",
      totalVolume: "",
      volumeUnit: "m³",
      dimensions: {
        length: "",
        width: "",
        height: "",
        unit: "cm",
      },
      hazardousGoods: false,
      hazardClass: "",
      unNumber: "",
      temperatureControl: false,
      minTemp: "",
      maxTemp: "",
      tempUnit: "°C",
      declaredValue: "",
      currency: "USD",
      specialInstructions: "",
    },
    customs: {
      documentsRequired: [],
      hsCode: "",
      goodsDescription: "",
      countryOfOrigin: "",
      customsValue: "",
      customsValueCurrency: "USD",
      documentFiles: [],
    },
    tracking: {
      notificationPreferences: [],
      notificationEmail: "",
      notificationPhone: "",
      milestoneAlerts: {
        departure: true,
        arrival: true,
        clearance: true,
        delivery: true,
        exceptions: true,
      },
      shareTrackingWith: [],
    },
    payment: {
      method: "",
      walletAddress: "",
      insuranceOption: "Basic Coverage (included)",
      billingAddress: {
        sameAsOrigin: true,
        country: "",
        city: "",
        address: "",
        zipCode: "",
      },
    },
    shipmentDetails: {
      incoterm: "",
      pickupDate: "",
      pickupTimeWindow: "",
      deliveryDeadline: "",
      specialHandling: [],
    },
  });

  // Validation state
  const [validationErrors, setValidationErrors] = useState({});
  const [currentStep, setCurrentStep] = useState(1);
  const totalSteps = 8;

  // Dynamic content state
  const [cargoContents, setCargoContents] = useState([
    { description: "", quantity: "", weight: "", hsCode: "" },
  ]);

  const [trackingEmails, setTrackingEmails] = useState([""]);
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [estimatedPrice, setEstimatedPrice] = useState(null);

  // Calculate estimated price based on form data
  useEffect(() => {
    if (
      formData.shipmentType &&
      formData.origin.country &&
      formData.destination.country &&
      formData.cargo.containerType
    ) {
      // This would be replaced with an actual API call in production
      const basePrice =
        {
          "Standard Freight": 1000,
          "Express Shipping": 2500,
          "Temperature-Controlled": 3000,
          "Hazardous Materials": 3500,
          "Oversized Cargo": 4000,
        }[formData.shipmentType] || 1000;

      const distanceFactor = Math.random() * 1.5 + 0.5; // Simulated distance factor
      const calculatedPrice = Math.round(basePrice * distanceFactor);

      setEstimatedPrice({
        baseCost: calculatedPrice,
        fees: Math.round(calculatedPrice * 0.1),
        insurance: Math.round(calculatedPrice * 0.05),
        taxes: Math.round(calculatedPrice * 0.15),
        total: Math.round(calculatedPrice * 1.3),
        currency: "USD",
      });
    }
  }, [
    formData.shipmentType,
    formData.origin.country,
    formData.destination.country,
    formData.cargo.containerType,
  ]);

  // Validation function
  const validateStep = () => {
    const errors = {};

    switch (currentStep) {
      case 1:
        if (!formData.shipmentType)
          errors.shipmentType = "Shipment type is required";
        break;
      case 2:
        // Origin validation
        if (!formData.origin.country)
          errors.originCountry = "Origin country is required";
        if (!formData.origin.city)
          errors.originCity = "Origin city is required";
        if (!formData.origin.address)
          errors.originAddress = "Origin address is required";
        if (!formData.origin.contact.name)
          errors.originContactName = "Contact name is required";
        if (!formData.origin.contact.email)
          errors.originContactEmail = "Contact email is required";
        break;
      case 3:
        // Destination validation
        if (!formData.destination.country)
          errors.destinationCountry = "Destination country is required";
        if (!formData.destination.city)
          errors.destinationCity = "Destination city is required";
        if (!formData.destination.address)
          errors.destinationAddress = "Destination address is required";
        if (!formData.destination.contact.name)
          errors.destinationContactName = "Contact name is required";
        if (!formData.destination.contact.email)
          errors.destinationContactEmail = "Contact email is required";
        break;
      case 4:
        // Cargo validation
        if (!formData.cargo.containerType)
          errors.containerType = "Container type is required";
        if (!formData.cargo.packagingType)
          errors.packagingType = "Packaging type is required";
        if (cargoContents.length === 0)
          errors.cargoContents = "At least one cargo item is required";
        if (!formData.cargo.totalWeight)
          errors.totalWeight = "Total weight is required";
        if (formData.cargo.hazardousGoods && !formData.cargo.hazardClass) {
          errors.hazardClass = "Hazard class is required for hazardous goods";
        }
        break;
      case 5:
        // Customs validation
        if (formData.customs.documentsRequired.length === 0) {
          errors.documentsRequired = "At least one document type is required";
        }
        if (!formData.customs.goodsDescription) {
          errors.goodsDescription = "Goods description is required";
        }
        break;
      case 6:
        // Tracking validation
        if (formData.tracking.notificationPreferences.length === 0) {
          errors.notificationPreferences =
            "At least one notification method is required";
        }
        if (
          formData.tracking.notificationPreferences.includes("Email") &&
          !formData.tracking.notificationEmail
        ) {
          errors.notificationEmail =
            "Email is required for email notifications";
        }
        if (
          formData.tracking.notificationPreferences.includes("SMS") &&
          !formData.tracking.notificationPhone
        ) {
          errors.notificationPhone =
            "Phone number is required for SMS notifications";
        }
        break;
      case 7:
        // Payment validation
        if (!formData.payment.method) {
          errors.paymentMethod = "Payment method is required";
        }
        if (
          formData.payment.method === "StarkNet Wallet" &&
          !formData.payment.walletAddress
        ) {
          errors.walletAddress = "Wallet address is required";
        }
        break;
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  // Step navigation
  const nextStep = () => {
    if (validateStep()) {
      setCurrentStep(Math.min(currentStep + 1, totalSteps));
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setCurrentStep(Math.max(currentStep - 1, 1));
    window.scrollTo(0, 0);
  };

  // Input change handlers
  const handleChange = (e, section = null, subSection = null) => {
    const { name, value, type, checked } = e.target;

    if (section) {
      if (subSection) {
        setFormData((prev) => ({
          ...prev,
          [section]: {
            ...prev[section],
            [subSection]: {
              ...prev[section][subSection],
              [name]: type === "checkbox" ? checked : value,
            },
          },
        }));
      } else {
        setFormData((prev) => ({
          ...prev,
          [section]: {
            ...prev[section],
            [name]: type === "checkbox" ? checked : value,
          },
        }));
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  // Checkbox array handler
  const handleCheckboxArray = (e, section, field) => {
    const { value, checked } = e.target;

    setFormData((prev) => {
      const currentArray = [...prev[section][field]];

      if (checked) {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: [...currentArray, value],
          },
        };
      } else {
        return {
          ...prev,
          [section]: {
            ...prev[section],
            [field]: currentArray.filter((item) => item !== value),
          },
        };
      }
    });
  };

  // Cargo content management
  const addCargoContent = () => {
    setCargoContents([
      ...cargoContents,
      { description: "", quantity: "", weight: "", hsCode: "" },
    ]);
  };

  const updateCargoContent = (index, field, value) => {
    const updatedContents = [...cargoContents];
    updatedContents[index][field] = value;
    setCargoContents(updatedContents);
  };

  const removeCargoContent = (index) => {
    const updatedContents = cargoContents.filter((_, i) => i !== index);
    setCargoContents(updatedContents);
  };

  // Tracking email management
  const addTrackingEmail = () => {
    setTrackingEmails([...trackingEmails, ""]);
  };

  const updateTrackingEmail = (index, value) => {
    const updatedEmails = [...trackingEmails];
    updatedEmails[index] = value;
    setTrackingEmails(updatedEmails);
  };

  const removeTrackingEmail = (index) => {
    const updatedEmails = trackingEmails.filter((_, i) => i !== index);
    setTrackingEmails(updatedEmails);
  };

  // File upload handler
  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);

    // In a real app, you would upload these to a server
    // For now, we'll just store them in state
    const newFiles = files.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      lastModified: file.lastModified,
    }));

    setUploadedFiles([...uploadedFiles, ...newFiles]);
  };

  const removeFile = (index) => {
    const updatedFiles = uploadedFiles.filter((_, i) => i !== index);
    setUploadedFiles(updatedFiles);
  };

  // Render current step
  const renderStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#0c1421] mb-6">
              Shipment Type
            </h2>
            <div className="grid md:grid-cols-3 gap-4">
              {mockFormData.shipmentTypes.map((type) => (
                <button
                  key={type}
                  onClick={() => {
                    setFormData((prev) => ({ ...prev, shipmentType: type }));
                  }}
                  className={`
                    p-4 rounded-lg border-2 text-left
                    ${
                      formData.shipmentType === type
                        ? "border-[#b57704] bg-[#f4f6f3]"
                        : "border-[#d9d9d9] hover:bg-[#f4f6f3]"
                    }
                  `}
                >
                  <h3 className="font-semibold text-[#0c1421]">{type}</h3>
                  <p className="text-[#313957] text-sm mt-2">
                    {type === "Standard Freight" &&
                      "Reliable and cost-effective shipping"}
                    {type === "Express Shipping" &&
                      "Fastest delivery option available"}
                    {type === "Temperature-Controlled" &&
                      "For sensitive and perishable goods"}
                    {type === "Hazardous Materials" &&
                      "Specialized handling for dangerous goods"}
                    {type === "Oversized Cargo" &&
                      "For large and non-standard shipments"}
                  </p>
                </button>
              ))}
            </div>
            {validationErrors.shipmentType && (
              <p className="text-red-600 mt-2">
                {validationErrors.shipmentType}
              </p>
            )}
          </div>
        );

      case 2:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#0c1421] mb-6">
              Origin Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#313957] mb-2">Country*</label>
                <select
                  name="country"
                  value={formData.origin.country}
                  onChange={(e) => handleChange(e, "origin")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                >
                  <option value="">Select Country</option>
                  {mockFormData.countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {validationErrors.originCountry && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.originCountry}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">City*</label>
                <input
                  type="text"
                  name="city"
                  value={formData.origin.city}
                  onChange={(e) => handleChange(e, "origin")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter city"
                />
                {validationErrors.originCity && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.originCity}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[#313957] mb-2">Address*</label>
                <input
                  type="text"
                  name="address"
                  value={formData.origin.address}
                  onChange={(e) => handleChange(e, "origin")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter street address"
                />
                {validationErrors.originAddress && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.originAddress}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Zip/Postal Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.origin.zipCode}
                  onChange={(e) => handleChange(e, "origin")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter zip/postal code"
                />
              </div>

              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Contact Information
                </h3>
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Contact Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.origin.contact.name}
                  onChange={(e) => handleChange(e, "origin", "contact")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter contact name"
                />
                {validationErrors.originContactName && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.originContactName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.origin.contact.email}
                  onChange={(e) => handleChange(e, "origin", "contact")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter email address"
                />
                {validationErrors.originContactEmail && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.originContactEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.origin.contact.phone}
                  onChange={(e) => handleChange(e, "origin", "contact")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>
        );

      case 3:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#0c1421] mb-6">
              Destination Details
            </h2>
            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#313957] mb-2">Country*</label>
                <select
                  name="country"
                  value={formData.destination.country}
                  onChange={(e) => handleChange(e, "destination")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                >
                  <option value="">Select Country</option>
                  {mockFormData.countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
                {validationErrors.destinationCountry && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.destinationCountry}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">City*</label>
                <input
                  type="text"
                  name="city"
                  value={formData.destination.city}
                  onChange={(e) => handleChange(e, "destination")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter city"
                />
                {validationErrors.destinationCity && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.destinationCity}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <label className="block text-[#313957] mb-2">Address*</label>
                <input
                  type="text"
                  name="address"
                  value={formData.destination.address}
                  onChange={(e) => handleChange(e, "destination")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter street address"
                />
                {validationErrors.destinationAddress && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.destinationAddress}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Zip/Postal Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.destination.zipCode}
                  onChange={(e) => handleChange(e, "destination")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter zip/postal code"
                />
              </div>

              <div className="md:col-span-2 mt-4">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Contact Information
                </h3>
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Contact Name*
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.destination.contact.name}
                  onChange={(e) => handleChange(e, "destination", "contact")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter contact name"
                />
                {validationErrors.destinationContactName && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.destinationContactName}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">Email*</label>
                <input
                  type="email"
                  name="email"
                  value={formData.destination.contact.email}
                  onChange={(e) => handleChange(e, "destination", "contact")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter email address"
                />
                {validationErrors.destinationContactEmail && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.destinationContactEmail}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Phone Number
                </label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.destination.contact.phone}
                  onChange={(e) => handleChange(e, "destination", "contact")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter phone number"
                />
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#0c1421] mb-6">
              Cargo Details
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <label className="block text-[#313957] mb-2">
                  Container Type*
                </label>
                <select
                  name="containerType"
                  value={formData.cargo.containerType}
                  onChange={(e) => handleChange(e, "cargo")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                >
                  <option value="">Select Container Type</option>
                  {mockFormData.containerTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {validationErrors.containerType && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.containerType}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Packaging Type*
                </label>
                <select
                  name="packagingType"
                  value={formData.cargo.packagingType}
                  onChange={(e) => handleChange(e, "cargo")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                >
                  <option value="">Select Packaging Type</option>
                  {mockFormData.packagingTypes.map((type) => (
                    <option key={type} value={type}>
                      {type}
                    </option>
                  ))}
                </select>
                {validationErrors.packagingType && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.packagingType}
                  </p>
                )}
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Cargo Contents
                </h3>

                {cargoContents.map((item, index) => (
                  <div
                    key={index}
                    className="grid md:grid-cols-4 gap-4 mb-4 p-4 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  >
                    <div className="md:col-span-2">
                      <label className="block text-[#313957] mb-2">
                        Description
                      </label>
                      <input
                        type="text"
                        value={item.description}
                        onChange={(e) =>
                          updateCargoContent(
                            index,
                            "description",
                            e.target.value
                          )
                        }
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-white"
                        placeholder="Item description"
                      />
                    </div>

                    <div>
                      <label className="block text-[#313957] mb-2">
                        Quantity
                      </label>
                      <input
                        type="number"
                        value={item.quantity}
                        onChange={(e) =>
                          updateCargoContent(index, "quantity", e.target.value)
                        }
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-white"
                        placeholder="Qty"
                      />
                    </div>

                    <div>
                      <label className="block text-[#313957] mb-2">
                        Weight (kg)
                      </label>
                      <input
                        type="number"
                        value={item.weight}
                        onChange={(e) =>
                          updateCargoContent(index, "weight", e.target.value)
                        }
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-white"
                        placeholder="Weight"
                      />
                    </div>

                    <div className="md:col-span-3">
                      <label className="block text-[#313957] mb-2">
                        HS Code (Optional)
                      </label>
                      <input
                        type="text"
                        value={item.hsCode}
                        onChange={(e) =>
                          updateCargoContent(index, "hsCode", e.target.value)
                        }
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-white"
                        placeholder="Harmonized System Code"
                      />
                    </div>

                    <div className="flex justify-end items-center md:col-span-1">
                      {index > 0 && (
                        <button
                          type="button"
                          onClick={() => removeCargoContent(index)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                        >
                          <X size={20} />
                        </button>
                      )}
                    </div>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addCargoContent}
                  className="flex items-center gap-2 text-[#b57704] font-medium mt-2"
                >
                  <Plus size={18} /> Add Another Item
                </button>

                {validationErrors.cargoContents && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.cargoContents}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Total Weight*
                </label>
                <div className="flex">
                  <input
                    type="number"
                    name="totalWeight"
                    value={formData.cargo.totalWeight}
                    onChange={(e) => handleChange(e, "cargo")}
                    className="flex-1 p-3 border border-[#d9d9d9] rounded-l-md bg-[#f4f6f3]"
                    placeholder="Enter total weight"
                  />
                  <select
                    name="weightUnit"
                    value={formData.cargo.weightUnit}
                    onChange={(e) => handleChange(e, "cargo")}
                    className="w-20 p-3 border border-l-0 border-[#d9d9d9] rounded-r-md bg-[#f4f6f3]"
                  >
                    <option value="kg">kg</option>
                    <option value="lb">lb</option>
                  </select>
                </div>
                {validationErrors.totalWeight && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.totalWeight}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Total Volume
                </label>
                <div className="flex">
                  <input
                    type="number"
                    name="totalVolume"
                    value={formData.cargo.totalVolume}
                    onChange={(e) => handleChange(e, "cargo")}
                    className="flex-1 p-3 border border-[#d9d9d9] rounded-l-md bg-[#f4f6f3]"
                    placeholder="Enter total volume"
                  />
                  <select
                    name="volumeUnit"
                    value={formData.cargo.volumeUnit}
                    onChange={(e) => handleChange(e, "cargo")}
                    className="w-20 p-3 border border-l-0 border-[#d9d9d9] rounded-r-md bg-[#f4f6f3]"
                  >
                    <option value="m³">m³</option>
                    <option value="ft³">ft³</option>
                  </select>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Dimensions
                </h3>
                <div className="grid md:grid-cols-4 gap-4">
                  <div>
                    <label className="block text-[#313957] mb-2">Length</label>
                    <input
                      type="number"
                      name="length"
                      value={formData.cargo.dimensions.length}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          cargo: {
                            ...prev.cargo,
                            dimensions: {
                              ...prev.cargo.dimensions,
                              length: e.target.value,
                            },
                          },
                        }));
                      }}
                      className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                      placeholder="Length"
                    />
                  </div>

                  <div>
                    <label className="block text-[#313957] mb-2">Width</label>
                    <input
                      type="number"
                      name="width"
                      value={formData.cargo.dimensions.width}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          cargo: {
                            ...prev.cargo,
                            dimensions: {
                              ...prev.cargo.dimensions,
                              width: e.target.value,
                            },
                          },
                        }));
                      }}
                      className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                      placeholder="Width"
                    />
                  </div>

                  <div>
                    <label className="block text-[#313957] mb-2">Height</label>
                    <input
                      type="number"
                      name="height"
                      value={formData.cargo.dimensions.height}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          cargo: {
                            ...prev.cargo,
                            dimensions: {
                              ...prev.cargo.dimensions,
                              height: e.target.value,
                            },
                          },
                        }));
                      }}
                      className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                      placeholder="Height"
                    />
                  </div>

                  <div>
                    <label className="block text-[#313957] mb-2">Unit</label>
                    <select
                      name="unit"
                      value={formData.cargo.dimensions.unit}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          cargo: {
                            ...prev.cargo,
                            dimensions: {
                              ...prev.cargo.dimensions,
                              unit: e.target.value,
                            },
                          },
                        }));
                      }}
                      className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                    >
                      <option value="cm">cm</option>
                      <option value="in">in</option>
                      <option value="m">m</option>
                      <option value="ft">ft</option>
                    </select>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Special Cargo Requirements
                </h3>

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="hazardousGoods"
                    name="hazardousGoods"
                    checked={formData.cargo.hazardousGoods}
                    onChange={(e) => handleChange(e, "cargo")}
                    className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                  />
                  <label
                    htmlFor="hazardousGoods"
                    className="ml-2 text-[#313957]"
                  >
                    Hazardous Goods
                  </label>
                </div>

                {formData.cargo.hazardousGoods && (
                  <div className="grid md:grid-cols-2 gap-4 p-4 border border-[#d9d9d9] rounded-md bg-[#f4f6f3] mb-4">
                    <div>
                      <label className="block text-[#313957] mb-2">
                        Hazard Class*
                      </label>
                      <input
                        type="text"
                        name="hazardClass"
                        value={formData.cargo.hazardClass}
                        onChange={(e) => handleChange(e, "cargo")}
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-white"
                        placeholder="Enter hazard class"
                      />
                      {validationErrors.hazardClass && (
                        <p className="text-red-600 mt-2">
                          {validationErrors.hazardClass}
                        </p>
                      )}
                    </div>

                    <div>
                      <label className="block text-[#313957] mb-2">
                        UN Number
                      </label>
                      <input
                        type="text"
                        name="unNumber"
                        value={formData.cargo.unNumber}
                        onChange={(e) => handleChange(e, "cargo")}
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-white"
                        placeholder="Enter UN number"
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="temperatureControl"
                    name="temperatureControl"
                    checked={formData.cargo.temperatureControl}
                    onChange={(e) => handleChange(e, "cargo")}
                    className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                  />
                  <label
                    htmlFor="temperatureControl"
                    className="ml-2 text-[#313957]"
                  >
                    Temperature Controlled
                  </label>
                </div>

                {formData.cargo.temperatureControl && (
                  <div className="grid md:grid-cols-3 gap-4 p-4 border border-[#d9d9d9] rounded-md bg-[#f4f6f3] mb-4">
                    <div>
                      <label className="block text-[#313957] mb-2">
                        Min Temperature
                      </label>
                      <input
                        type="number"
                        name="minTemp"
                        value={formData.cargo.minTemp}
                        onChange={(e) => handleChange(e, "cargo")}
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-white"
                        placeholder="Min temp"
                      />
                    </div>

                    <div>
                      <label className="block text-[#313957] mb-2">
                        Max Temperature
                      </label>
                      <input
                        type="number"
                        name="maxTemp"
                        value={formData.cargo.maxTemp}
                        onChange={(e) => handleChange(e, "cargo")}
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-white"
                        placeholder="Max temp"
                      />
                    </div>

                    <div>
                      <label className="block text-[#313957] mb-2">Unit</label>
                      <select
                        name="tempUnit"
                        value={formData.cargo.tempUnit}
                        onChange={(e) => handleChange(e, "cargo")}
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-white"
                      >
                        <option value="°C">°C</option>
                        <option value="°F">°F</option>
                      </select>
                    </div>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Declared Value
                </label>
                <div className="flex">
                  <select
                    name="currency"
                    value={formData.cargo.currency}
                    onChange={(e) => handleChange(e, "cargo")}
                    className="w-24 p-3 border border-r-0 border-[#d9d9d9] rounded-l-md bg-[#f4f6f3]"
                  >
                    {mockFormData.currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="declaredValue"
                    value={formData.cargo.declaredValue}
                    onChange={(e) => handleChange(e, "cargo")}
                    className="flex-1 p-3 border border-[#d9d9d9] rounded-r-md bg-[#f4f6f3]"
                    placeholder="Enter value"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[#313957] mb-2">
                  Special Instructions
                </label>
                <textarea
                  name="specialInstructions"
                  value={formData.cargo.specialInstructions}
                  onChange={(e) => handleChange(e, "cargo")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3] min-h-[100px]"
                  placeholder="Enter any special handling instructions or notes"
                ></textarea>
              </div>
            </div>
          </div>
        );

      case 5:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#0c1421] mb-6">
              Customs Documentation
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Required Documents
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockFormData.customsDocuments.map((doc) => (
                    <div key={doc} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`doc-${doc}`}
                        value={doc}
                        checked={formData.customs.documentsRequired.includes(
                          doc
                        )}
                        onChange={(e) =>
                          handleCheckboxArray(e, "customs", "documentsRequired")
                        }
                        className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                      />
                      <label
                        htmlFor={`doc-${doc}`}
                        className="ml-2 text-[#313957]"
                      >
                        {doc}
                      </label>
                    </div>
                  ))}
                </div>
                {validationErrors.documentsRequired && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.documentsRequired}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">HS Code</label>
                <input
                  type="text"
                  name="hsCode"
                  value={formData.customs.hsCode}
                  onChange={(e) => handleChange(e, "customs")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                  placeholder="Enter Harmonized System code"
                />
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Country of Origin
                </label>
                <select
                  name="countryOfOrigin"
                  value={formData.customs.countryOfOrigin}
                  onChange={(e) => handleChange(e, "customs")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                >
                  <option value="">Select Country</option>
                  {mockFormData.countries.map((country) => (
                    <option key={country} value={country}>
                      {country}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-[#313957] mb-2">
                  Goods Description*
                </label>
                <textarea
                  name="goodsDescription"
                  value={formData.customs.goodsDescription}
                  onChange={(e) => handleChange(e, "customs")}
                  className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3] min-h-[100px]"
                  placeholder="Detailed description of goods for customs purposes"
                ></textarea>
                {validationErrors.goodsDescription && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.goodsDescription}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-[#313957] mb-2">
                  Customs Value
                </label>
                <div className="flex">
                  <select
                    name="customsValueCurrency"
                    value={formData.customs.customsValueCurrency}
                    onChange={(e) => handleChange(e, "customs")}
                    className="w-24 p-3 border border-r-0 border-[#d9d9d9] rounded-l-md bg-[#f4f6f3]"
                  >
                    {mockFormData.currencies.map((currency) => (
                      <option key={currency} value={currency}>
                        {currency}
                      </option>
                    ))}
                  </select>
                  <input
                    type="number"
                    name="customsValue"
                    value={formData.customs.customsValue}
                    onChange={(e) => handleChange(e, "customs")}
                    className="flex-1 p-3 border border-[#d9d9d9] rounded-r-md bg-[#f4f6f3]"
                    placeholder="Enter customs value"
                  />
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Upload Documents
                </h3>
                <div className="border-2 border-dashed border-[#d9d9d9] rounded-md p-6 text-center bg-[#f4f6f3]">
                  <div className="flex flex-col items-center">
                    <Upload size={40} className="text-[#b57704] mb-2" />
                    <p className="text-[#313957] mb-2">
                      Drag and drop files here, or click to browse
                    </p>
                    <p className="text-[#313957] text-sm mb-4">
                      Supported formats: PDF, JPG, PNG (Max 10MB)
                    </p>
                    <input
                      type="file"
                      id="document-upload"
                      multiple
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                    <label
                      htmlFor="document-upload"
                      className="bg-[#b57704] text-white px-4 py-2 rounded-md hover:bg-[#9c6503] cursor-pointer"
                    >
                      Select Files
                    </label>
                  </div>
                </div>

                {uploadedFiles.length > 0 && (
                  <div className="mt-4">
                    <h4 className="font-medium text-[#0c1421] mb-2">
                      Uploaded Files
                    </h4>
                    <div className="space-y-2">
                      {uploadedFiles.map((file, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-between p-3 bg-white border border-[#d9d9d9] rounded-md"
                        >
                          <div className="flex items-center">
                            <FileText
                              size={20}
                              className="text-[#b57704] mr-2"
                            />
                            <span className="text-[#313957]">{file.name}</span>
                          </div>
                          <button
                            type="button"
                            onClick={() => removeFile(index)}
                            className="text-red-600 hover:text-red-800"
                          >
                            <X size={18} />
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        );

      case 6:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#0c1421] mb-6">
              Tracking & Notifications
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Notification Preferences
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockFormData.notificationMethods.map((method) => (
                    <div key={method} className="flex items-center">
                      <input
                        type="checkbox"
                        id={`notify-${method}`}
                        value={method}
                        checked={formData.tracking.notificationPreferences.includes(
                          method
                        )}
                        onChange={(e) =>
                          handleCheckboxArray(
                            e,
                            "tracking",
                            "notificationPreferences"
                          )
                        }
                        className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                      />
                      <label
                        htmlFor={`notify-${method}`}
                        className="ml-2 text-[#313957]"
                      >
                        {method}
                      </label>
                    </div>
                  ))}
                </div>
                {validationErrors.notificationPreferences && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.notificationPreferences}
                  </p>
                )}
              </div>

              {formData.tracking.notificationPreferences.includes("Email") && (
                <div>
                  <label className="block text-[#313957] mb-2">
                    Notification Email*
                  </label>
                  <input
                    type="email"
                    name="notificationEmail"
                    value={formData.tracking.notificationEmail}
                    onChange={(e) => handleChange(e, "tracking")}
                    className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                    placeholder="Enter email for notifications"
                  />
                  {validationErrors.notificationEmail && (
                    <p className="text-red-600 mt-2">
                      {validationErrors.notificationEmail}
                    </p>
                  )}
                </div>
              )}

              {formData.tracking.notificationPreferences.includes("SMS") && (
                <div>
                  <label className="block text-[#313957] mb-2">
                    Notification Phone*
                  </label>
                  <input
                    type="tel"
                    name="notificationPhone"
                    value={formData.tracking.notificationPhone}
                    onChange={(e) => handleChange(e, "tracking")}
                    className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                    placeholder="Enter phone for SMS notifications"
                  />
                  {validationErrors.notificationPhone && (
                    <p className="text-red-600 mt-2">
                      {validationErrors.notificationPhone}
                    </p>
                  )}
                </div>
              )}

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Milestone Alerts
                </h3>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="alert-departure"
                      checked={formData.tracking.milestoneAlerts.departure}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          tracking: {
                            ...prev.tracking,
                            milestoneAlerts: {
                              ...prev.tracking.milestoneAlerts,
                              departure: e.target.checked,
                            },
                          },
                        }));
                      }}
                      className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                    />
                    <label
                      htmlFor="alert-departure"
                      className="ml-2 text-[#313957]"
                    >
                      Departure
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="alert-arrival"
                      checked={formData.tracking.milestoneAlerts.arrival}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          tracking: {
                            ...prev.tracking,
                            milestoneAlerts: {
                              ...prev.tracking.milestoneAlerts,
                              arrival: e.target.checked,
                            },
                          },
                        }));
                      }}
                      className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                    />
                    <label
                      htmlFor="alert-arrival"
                      className="ml-2 text-[#313957]"
                    >
                      Arrival
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="alert-clearance"
                      checked={formData.tracking.milestoneAlerts.clearance}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          tracking: {
                            ...prev.tracking,
                            milestoneAlerts: {
                              ...prev.tracking.milestoneAlerts,
                              clearance: e.target.checked,
                            },
                          },
                        }));
                      }}
                      className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                    />
                    <label
                      htmlFor="alert-clearance"
                      className="ml-2 text-[#313957]"
                    >
                      Customs Clearance
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="alert-delivery"
                      checked={formData.tracking.milestoneAlerts.delivery}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          tracking: {
                            ...prev.tracking,
                            milestoneAlerts: {
                              ...prev.tracking.milestoneAlerts,
                              delivery: e.target.checked,
                            },
                          },
                        }));
                      }}
                      className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                    />
                    <label
                      htmlFor="alert-delivery"
                      className="ml-2 text-[#313957]"
                    >
                      Delivery
                    </label>
                  </div>

                  <div className="flex items-center">
                    <input
                      type="checkbox"
                      id="alert-exceptions"
                      checked={formData.tracking.milestoneAlerts.exceptions}
                      onChange={(e) => {
                        setFormData((prev) => ({
                          ...prev,
                          tracking: {
                            ...prev.tracking,
                            milestoneAlerts: {
                              ...prev.tracking.milestoneAlerts,
                              exceptions: e.target.checked,
                            },
                          },
                        }));
                      }}
                      className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                    />
                    <label
                      htmlFor="alert-exceptions"
                      className="ml-2 text-[#313957]"
                    >
                      Exceptions/Delays
                    </label>
                  </div>
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Share Tracking With
                </h3>
                <p className="text-[#313957] mb-4">
                  Add email addresses of people who should receive tracking
                  updates
                </p>

                {trackingEmails.map((email, index) => (
                  <div key={index} className="flex items-center gap-2 mb-2">
                    <input
                      type="email"
                      value={email}
                      onChange={(e) =>
                        updateTrackingEmail(index, e.target.value)
                      }
                      className="flex-1 p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                      placeholder="Enter email address"
                    />
                    {index > 0 && (
                      <button
                        type="button"
                        onClick={() => removeTrackingEmail(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-full"
                      >
                        <X size={20} />
                      </button>
                    )}
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addTrackingEmail}
                  className="flex items-center gap-2 text-[#b57704] font-medium mt-2"
                >
                  <Plus size={18} /> Add Another Email
                </button>
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#0c1421] mb-6">
              Payment & Insurance
            </h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Payment Method
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockFormData.paymentMethods.map((method) => (
                    <div key={method} className="relative">
                      <input
                        type="radio"
                        id={`payment-${method}`}
                        name="method"
                        value={method}
                        checked={formData.payment.method === method}
                        onChange={(e) => handleChange(e, "payment")}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={`payment-${method}`}
                        className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer bg-[#f4f6f3] peer-checked:border-[#b57704] peer-checked:bg-[#f4f6f3]/80 hover:bg-[#f4f6f3]/90"
                      >
                        {method === "Credit Card" && (
                          <CreditCard className="text-[#313957]" size={24} />
                        )}
                        {method === "Bank Transfer" && (
                          <Globe className="text-[#313957]" size={24} />
                        )}
                        {method === "StarkNet Wallet" && (
                          <Wallet className="text-[#313957]" size={24} />
                        )}
                        {method === "Invoice (Net 30)" && (
                          <FileText className="text-[#313957]" size={24} />
                        )}
                        <div>
                          <span className="font-medium text-[#0c1421]">
                            {method}
                          </span>
                          {method === "StarkNet Wallet" && (
                            <p className="text-xs text-[#313957] mt-1">
                              Pay with cryptocurrency on StarkNet
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
                {validationErrors.paymentMethod && (
                  <p className="text-red-600 mt-2">
                    {validationErrors.paymentMethod}
                  </p>
                )}
              </div>

              {formData.payment.method === "StarkNet Wallet" && (
                <div className="md:col-span-2">
                  <label className="block text-[#313957] mb-2">
                    Wallet Address*
                  </label>
                  <div className="flex">
                    <input
                      type="text"
                      name="walletAddress"
                      value={formData.payment.walletAddress}
                      onChange={(e) => handleChange(e, "payment")}
                      className="flex-1 p-3 border border-[#d9d9d9] rounded-l-md bg-[#f4f6f3]"
                      placeholder="Enter your StarkNet wallet address"
                    />
                    <button
                      type="button"
                      className="bg-[#b57704] text-white px-4 py-2 rounded-r-md hover:bg-[#9c6503]"
                    >
                      Connect Wallet
                    </button>
                  </div>
                  {validationErrors.walletAddress && (
                    <p className="text-red-600 mt-2">
                      {validationErrors.walletAddress}
                    </p>
                  )}
                  <p className="text-sm text-[#313957] mt-2 flex items-center">
                    <Lock size={14} className="mr-1" /> Your transaction will be
                    secured on StarkNet blockchain
                  </p>
                </div>
              )}

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Insurance Options
                </h3>
                <div className="grid md:grid-cols-2 gap-4">
                  {mockFormData.insuranceOptions.map((option) => (
                    <div key={option} className="relative">
                      <input
                        type="radio"
                        id={`insurance-${option}`}
                        name="insuranceOption"
                        value={option}
                        checked={formData.payment.insuranceOption === option}
                        onChange={(e) => handleChange(e, "payment")}
                        className="peer sr-only"
                      />
                      <label
                        htmlFor={`insurance-${option}`}
                        className="flex items-center gap-3 p-4 border-2 rounded-lg cursor-pointer bg-[#f4f6f3] peer-checked:border-[#b57704] peer-checked:bg-[#f4f6f3]/80 hover:bg-[#f4f6f3]/90"
                      >
                        <Shield className="text-[#313957]" size={24} />
                        <div>
                          <span className="font-medium text-[#0c1421]">
                            {option}
                          </span>
                          {option === "Basic Coverage (included)" && (
                            <p className="text-xs text-[#313957] mt-1">
                              Covers up to $1,000 in damages
                            </p>
                          )}
                          {option === "Extended Coverage" && (
                            <p className="text-xs text-[#313957] mt-1">
                              Covers up to $10,000 in damages (+$50)
                            </p>
                          )}
                          {option === "Full Value Protection" && (
                            <p className="text-xs text-[#313957] mt-1">
                              Covers full declared value (+$120)
                            </p>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="md:col-span-2">
                <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                  Billing Address
                </h3>
                <div className="flex items-center mb-4">
                  <input
                    type="checkbox"
                    id="sameAsOrigin"
                    name="sameAsOrigin"
                    checked={formData.payment.billingAddress.sameAsOrigin}
                    onChange={(e) => {
                      setFormData((prev) => ({
                        ...prev,
                        payment: {
                          ...prev.payment,
                          billingAddress: {
                            ...prev.payment.billingAddress,
                            sameAsOrigin: e.target.checked,
                          },
                        },
                      }));
                    }}
                    className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                  />
                  <label htmlFor="sameAsOrigin" className="ml-2 text-[#313957]">
                    Same as origin address
                  </label>
                </div>

                {!formData.payment.billingAddress.sameAsOrigin && (
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[#313957] mb-2">
                        Country
                      </label>
                      <select
                        name="country"
                        value={formData.payment.billingAddress.country}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            payment: {
                              ...prev.payment,
                              billingAddress: {
                                ...prev.payment.billingAddress,
                                country: e.target.value,
                              },
                            },
                          }));
                        }}
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                      >
                        <option value="">Select Country</option>
                        {mockFormData.countries.map((country) => (
                          <option key={country} value={country}>
                            {country}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-[#313957] mb-2">City</label>
                      <input
                        type="text"
                        name="city"
                        value={formData.payment.billingAddress.city}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            payment: {
                              ...prev.payment,
                              billingAddress: {
                                ...prev.payment.billingAddress,
                                city: e.target.value,
                              },
                            },
                          }));
                        }}
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                        placeholder="Enter city"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-[#313957] mb-2">
                        Address
                      </label>
                      <input
                        type="text"
                        name="address"
                        value={formData.payment.billingAddress.address}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            payment: {
                              ...prev.payment,
                              billingAddress: {
                                ...prev.payment.billingAddress,
                                address: e.target.value,
                              },
                            },
                          }));
                        }}
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                        placeholder="Enter address"
                      />
                    </div>

                    <div>
                      <label className="block text-[#313957] mb-2">
                        Zip/Postal Code
                      </label>
                      <input
                        type="text"
                        name="zipCode"
                        value={formData.payment.billingAddress.zipCode}
                        onChange={(e) => {
                          setFormData((prev) => ({
                            ...prev,
                            payment: {
                              ...prev.payment,
                              billingAddress: {
                                ...prev.payment.billingAddress,
                                zipCode: e.target.value,
                              },
                            },
                          }));
                        }}
                        className="w-full p-3 border border-[#d9d9d9] rounded-md bg-[#f4f6f3]"
                        placeholder="Enter zip/postal code"
                      />
                    </div>
                  </div>
                )}
              </div>

              {estimatedPrice && (
                <div className="md:col-span-2 mt-4">
                  <h3 className="text-lg font-semibold text-[#0c1421] mb-4">
                    Estimated Cost
                  </h3>
                  <div className="bg-[#f4f6f3] p-4 rounded-lg border border-[#d9d9d9]">
                    <div className="flex justify-between py-2 border-b border-[#d9d9d9]">
                      <span className="text-[#313957]">Base Shipping Cost</span>
                      <span className="font-medium text-[#0c1421]">
                        ${estimatedPrice.baseCost.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#d9d9d9]">
                      <span className="text-[#313957]">Fees</span>
                      <span className="font-medium text-[#0c1421]">
                        ${estimatedPrice.fees.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#d9d9d9]">
                      <span className="text-[#313957]">Insurance</span>
                      <span className="font-medium text-[#0c1421]">
                        ${estimatedPrice.insurance.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 border-b border-[#d9d9d9]">
                      <span className="text-[#313957]">Taxes</span>
                      <span className="font-medium text-[#0c1421]">
                        ${estimatedPrice.taxes.toLocaleString()}
                      </span>
                    </div>
                    <div className="flex justify-between py-2 mt-2">
                      <span className="font-semibold text-[#0c1421]">
                        Total Estimated Cost
                      </span>
                      <span className="font-semibold text-[#b57704]">
                        ${estimatedPrice.total.toLocaleString()}
                      </span>
                    </div>
                    <p className="text-xs text-[#313957] mt-4">
                      * Final price may vary based on actual weight, dimensions,
                      and additional services
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        );

      case 8:
        return (
          <div>
            <h2 className="text-2xl font-bold text-[#0c1421] mb-6">
              Shipment Summary
            </h2>
            <div className="bg-[#f4f6f3] p-6 rounded-lg border border-[#d9d9d9]">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <h3 className="font-semibold text-[#0c1421] mb-4 flex items-center">
                    <Package className="mr-2" size={20} /> Shipment Details
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#313957]">Shipment Type:</span>
                      <span className="font-medium text-[#0c1421]">
                        {formData.shipmentType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#313957]">Container Type:</span>
                      <span className="font-medium text-[#0c1421]">
                        {formData.cargo.containerType}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#313957]">Total Weight:</span>
                      <span className="font-medium text-[#0c1421]">
                        {formData.cargo.totalWeight} {formData.cargo.weightUnit}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#313957]">Declared Value:</span>
                      <span className="font-medium text-[#0c1421]">
                        {formData.cargo.declaredValue
                          ? `${formData.cargo.currency} ${formData.cargo.declaredValue}`
                          : "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#0c1421] mb-4 flex items-center">
                    <MapPin className="mr-2" size={20} /> Route Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#313957]">Origin:</span>
                      <span className="font-medium text-[#0c1421]">
                        {formData.origin.city}, {formData.origin.country}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#313957]">Destination:</span>
                      <span className="font-medium text-[#0c1421]">
                        {formData.destination.city},{" "}
                        {formData.destination.country}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#313957]">Incoterm:</span>
                      <span className="font-medium text-[#0c1421]">
                        {formData.shipmentDetails.incoterm || "Not specified"}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#0c1421] mb-4 flex items-center">
                    <User className="mr-2" size={20} /> Contact Information
                  </h3>
                  <div className="space-y-3">
                    <div>
                      <span className="text-[#313957] block">
                        Origin Contact:
                      </span>
                      <span className="font-medium text-[#0c1421] block">
                        {formData.origin.contact.name}
                      </span>
                      <span className="text-[#313957] text-sm block">
                        {formData.origin.contact.email}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#313957] block">
                        Destination Contact:
                      </span>
                      <span className="font-medium text-[#0c1421] block">
                        {formData.destination.contact.name}
                      </span>
                      <span className="text-[#313957] text-sm block">
                        {formData.destination.contact.email}
                      </span>
                    </div>
                  </div>
                </div>

                <div>
                  <h3 className="font-semibold text-[#0c1421] mb-4 flex items-center">
                    <CreditCard className="mr-2" size={20} /> Payment
                    Information
                  </h3>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-[#313957]">Payment Method:</span>
                      <span className="font-medium text-[#0c1421]">
                        {formData.payment.method}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#313957]">Insurance:</span>
                      <span className="font-medium text-[#0c1421]">
                        {formData.payment.insuranceOption}
                      </span>
                    </div>
                    {estimatedPrice && (
                      <div className="flex justify-between">
                        <span className="text-[#313957]">Estimated Total:</span>
                        <span className="font-medium text-[#b57704]">
                          ${estimatedPrice.total.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="md:col-span-2">
                  <h3 className="font-semibold text-[#0c1421] mb-4 flex items-center">
                    <Clock className="mr-2" size={20} /> Tracking &
                    Notifications
                  </h3>
                  <div className="grid md:grid-cols-2 gap-4">
                    <div>
                      <span className="text-[#313957] block">
                        Notification Methods:
                      </span>
                      <span className="font-medium text-[#0c1421] block">
                        {formData.tracking.notificationPreferences.length > 0
                          ? formData.tracking.notificationPreferences.join(", ")
                          : "None selected"}
                      </span>
                    </div>
                    <div>
                      <span className="text-[#313957] block">
                        Milestone Alerts:
                      </span>
                      <span className="font-medium text-[#0c1421] block">
                        {Object.entries(formData.tracking.milestoneAlerts)
                          .filter(([_, value]) => value)
                          .map(
                            ([key]) =>
                              key.charAt(0).toUpperCase() + key.slice(1)
                          )
                          .join(", ")}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="md:col-span-2 mt-4">
                  <div className="bg-white p-4 rounded-lg border border-[#d9d9d9]">
                    <div className="flex items-center mb-4">
                      <input
                        type="checkbox"
                        id="terms"
                        className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                      />
                      <label htmlFor="terms" className="ml-2 text-[#313957]">
                        I agree to the{" "}
                        <a href="#" className="text-[#b57704] hover:underline">
                          Terms and Conditions
                        </a>{" "}
                        and{" "}
                        <a href="#" className="text-[#b57704] hover:underline">
                          Privacy Policy
                        </a>
                      </label>
                    </div>

                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        id="blockchain"
                        className="w-5 h-5 text-[#b57704] border-[#d9d9d9] rounded focus:ring-[#b57704]"
                      />
                      <label
                        htmlFor="blockchain"
                        className="ml-2 text-[#313957]"
                      >
                        I agree to store shipment data on StarkNet blockchain
                        for enhanced security and transparency
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        );
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#171717] font-sans">
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white border border-[#d9d9d9] rounded-2xl shadow-lg">
          {/* Header */}
          <div className="bg-[#f4f6f3] p-6 border-b border-[#d9d9d9]">
            <h1 className="text-3xl font-bold text-[#0c1421]">
              Create New Shipment
            </h1>
            <p className="text-[#313957] mt-2">
              Start a new shipment in just a few steps
            </p>
          </div>

          {/* Step Indicator */}
          <div className="p-6 border-b border-[#d9d9d9]">
            <div className="flex justify-between items-center">
              {Array.from({ length: totalSteps }).map((_, index) => {
                const step = index + 1;
                return (
                  <div key={step} className="flex flex-col items-center">
                    <div
                      className={`
                        w-10 h-10 rounded-full flex items-center justify-center
                        ${
                          currentStep === step
                            ? "bg-[#b57704] text-white"
                            : currentStep > step
                            ? "bg-green-500 text-white"
                            : "bg-[#d9d9d9] text-[#313957]"
                        }
                      `}
                    >
                      {currentStep > step ? <Check size={16} /> : step}
                    </div>
                    <span className="text-xs text-[#313957] mt-1 hidden md:block">
                      {step === 1 && "Type"}
                      {step === 2 && "Origin"}
                      {step === 3 && "Destination"}
                      {step === 4 && "Cargo"}
                      {step === 5 && "Customs"}
                      {step === 6 && "Tracking"}
                      {step === 7 && "Payment"}
                      {step === 8 && "Summary"}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Form Content */}
          <div className="p-6">{renderStep()}</div>

          {/* Navigation Buttons */}
          <div className="p-6 border-t border-[#d9d9d9] flex justify-between">
            {currentStep > 1 && (
              <button
                onClick={prevStep}
                className="bg-[#f4f6f3] text-[#313957] px-6 py-3 rounded-md hover:bg-[#e0e4dc]"
              >
                Previous
              </button>
            )}
            {currentStep < totalSteps ? (
              <button
                onClick={nextStep}
                className="bg-[#b57704] text-white px-6 py-3 rounded-md hover:bg-[#9c6503] ml-auto"
              >
                Next
              </button>
            ) : (
              <button className="bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700 ml-auto">
                Confirm Shipment
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateNewShipmentPage;
