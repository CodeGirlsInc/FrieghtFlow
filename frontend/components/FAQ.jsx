'use client'; 
import { useState } from "react";
import { PlusIcon, MinusIcon } from "lucide-react";

const FAQ = () => {
  const [openIndex, setOpenIndex] = useState(null);

  const faqs = [
    {
      question: "What is Lorem Ipsum?",
      answer: "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.",
    },
    {
      question: "Why do we use it?",
      answer: "It is a long established fact that a reader will be distracted by the readable content of a page when looking at its layout.",
    },
    {
      question: "Where does it come from?",
      answer: "Contrary to popular belief, Lorem Ipsum is not simply random text. It has roots in a piece of classical Latin literature.",
    },
    {
      question: "How can I use it?",
      answer: "There are many variations of passages of Lorem Ipsum available, but the majority have suffered alteration in some form.",
    },
  ];

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };

  return (
    <div className="p-6 lg:px-20 md:px-10 px-5 w-full">
      <div className="grid lg:grid-cols-2 grid-cols-1 gap-8">
        <div>
          <h1 className="lg:text-4xl text-2xl font-semibold">
            Frequently Asked <span className="text-[var(--brown)]">Questions</span>
          </h1>
          <p className="mt-4 text-gray-600">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nulla quam velit.
          </p>
        </div>
        <div>
          {faqs.map((faq, index) => (
            <div key={index} className="mb-4">
              <button
                className="w-full text-left font-semibold text-lg border border-gray-200 px-5 py-4 rounded-lg flex items-center justify-between text-gray-600 shadow-md hover:bg-gray-50 transition-colors duration-300"
                onClick={() => toggleFAQ(index)}
              >
                {faq.question}
                <div className="w-8 h-8 rounded-full border border-gray-300 flex items-center justify-center">
                  {openIndex === index ? (
                    <MinusIcon className="w-5 h-5 text-gray-600" />
                  ) : (
                    <PlusIcon className="w-5 h-5 text-gray-600" />
                  )}
                </div>
              </button>
              {openIndex === index && (
                <p className="mt-2 text-gray-600 bg-gray-50 pl-5 p-4 rounded-lg">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default FAQ;