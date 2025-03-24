"use client"

const SearchButton = ({ text, onClick, className, disabled }) => {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`${className} border border-[var(--brown)] h-[57.6px] w-[full] text-[#B57704] hover:bg-[#f8f5f1] transition-colors`}
    >
      {text}
    </button>
  )
}

export default SearchButton

