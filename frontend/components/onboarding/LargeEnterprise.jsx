"use client"

import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import * as yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import FileUpload from './FileUpload';
import Input from '../ui/Input';
import Button from '../ui/Button';
import Select from '../ui/Select';

// Enhanced Validation schema with more detailed error messages
const validationSchema = yup.object().shape({
    companyName: yup.string()
        .trim()
        .required('Company Name is required')
        .min(2, 'Company Name must be at least 2 characters')
        .max(100, 'Company Name must not exceed 100 characters'),

    companyRegistrationNumber: yup.string()
        .trim()
        .required('Company Registration Number is required')
        .matches(/^[A-Za-z0-9-]+$/, 'Invalid registration number format'),

    industryTypes: yup.string()
        .required('Industry Type is required')
        .oneOf(['Manufacturing', 'Logistics', 'Supply Chain'], 'Please select a valid industry type'),

    businessLocations: yup.string()
        .required('Business Locations are required')
        .oneOf(['Local', 'National', 'International'], 'Please select a valid business location'),

    logisticManagerName: yup.string()
        .trim()
        .required('Logistics Manager Name is required')
        .matches(/^[A-Za-z\s]+$/, 'Name should contain only letters')
        .min(2, 'Name must be at least 2 characters')
        .max(50, 'Name must not exceed 50 characters'),

    logisticManagerEmail: yup.string()
        .trim()
        .required('Email is required')
        .email('Invalid email format')
        .max(100, 'Email must not exceed 100 characters'),

    logisticManagerContact: yup.string()
        .trim()
        .required('Contact number is required')
        .matches(/^[+]?[\d\s()-]{10,15}$/, 'Invalid contact number format'),

    expectedMonthlyShipmentVolume: yup.number()
        .typeError('Monthly Shipment Volume must be a number')
        .required('Monthly Shipment Volume is required')
        .positive('Shipment volume must be a positive number')
        .integer('Shipment volume must be a whole number')
        .max(1000000, 'Shipment volume is too high'),

    preferredCargoHandlingMethod: yup.string()
        .required('Preferred Cargo Handling Method is required')
        .oneOf(['Air Freight', 'Sea Freight', 'Road Transport'], 'Please select a valid cargo handling method'),

    warehouseLocations: yup.string()
        .optional()
        .max(200, 'Warehouse locations description is too long'),

    apiIntegration: yup.string()
        .required('API Integration Requirement is required')
        .oneOf(['Yes', 'No'], 'Please select Yes or No'),
});

const LargeEnterprise = () => {

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitError, setSubmitError] = useState(null);
    const [submitSuccess, setSubmitSuccess] = useState(false);

    const methods = useForm({
        resolver: yupResolver(validationSchema),
        mode: 'all',
        reValidateMode: 'onChange'
    });


    const {
        handleSubmit,
        formState: { errors },
        reset
    } = methods;

    const onSubmit = async (data) => {
        // Reset previous submission states
        setSubmitError(null);
        setSubmitSuccess(false);
        setIsSubmitting(true);

        try {
            // Simulate an API call with error handling
            await new Promise((resolve, reject) => {
                setTimeout(() => {
                    resolve(data);
                }, 2000);
            });

            // Handle successful submission
            setSubmitSuccess(true);
            alert('Form submitted successfully!');
            reset(); // Reset form fields
        } catch (error) {
            // Handle submission error
            console.error('Submission error:', error);
            setSubmitError(error instanceof Error ? error.message : 'Submission failed');
            alert('Submission failed. Please try again.');
        } finally {
            // Always reset submitting state
            setIsSubmitting(false);
        }
    };
    return (
        <div className="min-h-screen flex items-center justify-center p-4 relative">
            <div className="w-full mx-auto relative z-10">
                <div className="grid">
                    {/* Gradient Background Section */}
                    <div className="md:block bg-gradient-to-br from-black to-amber-600 absolute left-0 top-0 bottom-[45%] w-full z-0">
                        <h2 className="text-[32px] mt-[41px] text-white font-[700] text-center">Large Enterprise</h2>
                        <p className="text-[20px] text-center font-[300] text-gray-300 mb-6">
                            Suitable for corporations, supply chain companies, manufacturers with high-volume logistics
                        </p>
                    </div>

                    {/* White Form Container */}
                    <div className="md:col-span-1 md:mx-auto mx-auto md:mt-[150px] mt-[190px] bg-white shadow-md rounded-2xl p-8 relative z-10 w-[90%] md:w-[80%]">
                        <FormProvider {...methods}>
                            <form onSubmit={handleSubmit(onSubmit)} className="mx-2 md:mx-12 space-y-7 md:space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                                    <Input
                                        type="text"
                                        name="companyName"
                                        label="Company Name"
                                        placeholder="Enter business name"
                                        required
                                        ErrorMessage={errors.companyName?.message}
                                    />
                                    <Input
                                        type="text"
                                        name="logisticManagerContact"
                                        label="Logistics & Supply Chain Manager Contact"
                                        placeholder="Enter contact number"
                                        required
                                        ErrorMessage={errors.logisticManagerContact?.message}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                                    <Input
                                        type="text"
                                        name="companyRegistrationNumber"
                                        label="Company Registration Number"
                                        placeholder="Enter company registration number"
                                        required
                                        ErrorMessage={errors.companyRegistrationNumber?.message}
                                    />
                                    <Input
                                        type="number"
                                        name="expectedMonthlyShipmentVolume"
                                        label="Expected Monthly Shipment Volume"
                                        placeholder="Enter value"
                                        required
                                        ErrorMessage={errors.expectedMonthlyShipmentVolume?.message}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                                    <Select
                                        label="Industry Type"
                                        name="industryTypes"
                                        placeholder={"E.g E-commerce, manufacturing, FMCG"}
                                        value1="Manufacturing"
                                        value2="Logistics"
                                        value3="Supply Chain"
                                        ErrorMessage={errors.industryTypes?.message}
                                    />
                                    <Select
                                        label={"Preferred Cargo Handling Method"}
                                        name={"preferredCargoHandlingMethod"}
                                        placeholder="E.g Air, sea, road, rail"
                                        value1={"Air Freight"}
                                        value2={"Sea Freight"}
                                        value3={"Road Transport"}
                                        ErrorMessage={errors.preferredCargoHandlingMethod?.message}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                                    <Select
                                        label={"Business Locations"}
                                        name={"businessLocations"}
                                        placeholder={"Select business location"}
                                        value1={"Local"}
                                        value2={"National"}
                                        value3={"International"}
                                        ErrorMessage={errors.businessLocations?.message}
                                    />
                                    <Input
                                        type="text"
                                        name="warehouseLocations"
                                        label="Warehouse Locations (Optional)"
                                        placeholder="Enter warehouse locations"
                                        ErrorMessage={errors.warehouseLocations?.message}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                                    <Input
                                        type="text"
                                        name="logisticManagerName"
                                        label="Logistics & Supply Chain Manager Name"
                                        placeholder="Enter full name"
                                        required
                                        ErrorMessage={errors.logisticManagerName?.message}
                                    />
                                    <Select
                                        label={"API Integration Requirement"}
                                        name={"apiIntegration"}
                                        placeholder={"Yes or No"}
                                        value1={"Yes"}
                                        value2={"No"}
                                        ErrorMessage={errors.apiIntegration?.message}
                                    />
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-6">
                                    <Input
                                        type="email"
                                        name="logisticManagerEmail"
                                        label="Logistics & Supply Chain Manager Email Address"
                                        placeholder="Enter email address"
                                        required
                                        ErrorMessage={errors.logisticManagerEmail?.message}
                                    />

                                    <div>
                                        <label className="text-[var(--headerText)] font-[400] open_sans text-[16.56px]">
                                            Compliance & Certification Document
                                        </label>
                                        <FileUpload
                                            label="Upload document"
                                            onFileSelect={(file) => console.log(file)}
                                        />
                                    </div>
                                </div>
                                <div className="text-center mt-6">
                                    <Button
                                        text={isSubmitting ? "SUBMITTING..." : "REGISTER"}
                                        type="submit"
                                        disabled={isSubmitting}
                                        className={`rounded-xl lg:w-[491px] ${isSubmitting ? 'opacity-50 cursor-not-allowed' : ''}`}
                                    />
                                </div>
                            </form>
                        </FormProvider>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LargeEnterprise;