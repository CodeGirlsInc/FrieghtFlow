import { useClickOutside } from "@/hooks/useClickOutside";
import { useRef, useState } from "react";

const SelectV2 = ({
  label,
  options,
  placeholder,
  optional = false,
  value,
  onChange,
  error,
  ...props
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const selectRef = useRef();

  useClickOutside(selectRef, () => setIsOpen(false));

  const handleSelect = (value, label) => {
    setSelectedOption(label);
    onChange(value);
    setIsOpen(false);
  };

  return (
    <div className="mb-4" ref={selectRef}>
      <label className="block text-[#0C1421] text-[14.72px] font-open-sans font-normal mb-1 leading-[100%] tracking-[1%] align-middle">
        {label}{" "}
        {optional && (
          <span className="text-[#0C1421] text-sm italic text-[14.72px]  font-open-sans font-normal leading-[100%] tracking-[1%] align-middle">
            (Optional)
          </span>
        )}
      </label>
      <div className="relative">
        {/* Custom select header */}
        <div
          className="w-[100%]  h-[51.2px]  px-4 py-2 flex items-center justify-between bg-[#F4F6F3] border border-gray-200  rounded-[4px] cursor-pointer"
          style={{ borderRadius: "4px" }}
          onClick={() => setIsOpen(!isOpen)}
        >
          <span
            className={`${
              selectedOption
                ? "text-[14.4px] text-[#8897AD] leading-[100%] tracking-[1%] align-middle font-open-sans font-normal "
                : "text-[14.4px] text-[#8897AD] leading-[100%] tracking-[1%] align-middle font-open-sans font-normal "
            }`}
          >
            {selectedOption || placeholder}
          </span>
          <span className="text-[#1B1E1F80] ">▼</span>
        </div>

        {/* Dropdown options */}
        {isOpen && (
          <div className="absolute z-10 w-[100%]   mt-1 bg-white border border-gray-200 rounded shadow-lg">
            {options?.map((option, index) => (
              <div
                key={index}
                className="flex items-center px-4 py-2 hover:bg-[#E9D7B4] cursor-pointer"
                onClick={() => handleSelect(option.value, option.label)}
              >
                <div className="w-5 h-5 mr-2 border border-[#D4D7E3] bg-[#FFFFFF]  hover:border-[#D4D7E3] hover:bg-[#FFFFFF] flex items-center justify-center">
                  {selectedOption === option.label && (
                    <div className="w-3 h-3 bg-[#ffffff]"></div>
                  )}
                </div>
                <span>{option.label}</span>
              </div>
            ))}
          </div>
        )}

        {/* Hidden native select for form submission */}
        <select className="sr-only" value={selectedOption} {...props}>
          <option value="" disabled>
            {placeholder}
          </option>
          {options?.map((option, index) => (
            <option key={index} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  );
};
export default SelectV2;
