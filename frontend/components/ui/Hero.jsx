import Link from "next/link";
import Button from "./Button";








const Hero = ({ bg, heading, content, buttonText, linkUrl }) => {


    return (
      <div className="w-full h-[720px] flex flex-col items-center justify-center overflow-hidden bg-cover bg-no-repeat  text-[#ffffff] px-5  "
      style={{
        backgroundImage: `url(${bg})`,
      }}
       >
      <div className=" flex items-center justify-center gap-2  md:gap-4 flex-col w-full max-w-[1018px] text-center " >
      <h1 className="font-semibold text-3xl md:text-5xl mb-2 md:mb-4   " >{heading} </h1>
        <p className="font-medium text-lg md:text-2xl mb-5   " >{content} </p>
       <Link href={linkUrl} >
       <Button  className=" text-base md:text-2xl font-normal bg-[#B57704] rounded-[10px] px-8   " text={buttonText} />
        </Link>
      </div>

      </div>
    );
  };

  export default Hero;