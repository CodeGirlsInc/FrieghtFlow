import React from "react";
import { useFormContext } from "react-hook-form";
import Input from "./Input";

const Select = ({ name, label, placeholder, value1, value2, value3, ErrorMessage }) => {
   const {
      register,
      formState: { errors },
   } = useFormContext();

   return (
      <div className="flex flex-col">
         {/* <label htmlFor={name} className="text-[var(--headerText)] font-[400] open_sans text-[16.56px]">
            {label}
         </label> */}
         <Input
            type="text"
            name={name}
            label={label}
            placeholder={placeholder ?? "E.g Shipper, Carrier, Freight Broker"}
            list={`${name}-options`}
            {...register(name)}
            ErrorMessage={ErrorMessage}
         />
         <datalist id={`${name}-options`} className="bg-white">
            <option value={value1}>{value1}</option>
            <option value={value2}>{value2}</option>
            {value3 && <option value={value3}>{value3}</option>}
         </datalist>
      </div>
   );
};

export default Select;