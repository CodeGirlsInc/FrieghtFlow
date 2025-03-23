import React from "react";
import {useForm, useFormContext} from "react-hook-form";
import Input from "./Input";

const Select = ({name, label, value1, value2, value3}) => {
   const {
      register,
      formState: {errors},
   } = useFormContext();

   return (
      <div className="flex flex-col">
         {/* <label htmlFor={name} className="text-[var(--headerText)] font-[400] open_sans text-[16.56px]">
            {label}
         </label> */}
         <Input type={"text"} name={name} list="businessType" label={label} placeholder={"E.g Shipper, Carrier, Freight Broker"} />
         <datalist id="businessType" className=" bg-white">
            <option value={value1}>{value1}</option>
            <option value={value2}>{value2}</option>
            <option value={value3}>{value3}</option>
         </datalist>
         {/* </select> */}
      </div>
   );
};

export default Select;
