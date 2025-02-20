import Image from "next/image";
import banner from "../../../Public/Assets/signinbanner.png"
import google from '../../../Public/Assets/Google.svg'
import Facebook from '../../../Public/Assets/Facebook.svg'
import SigninForm from "@/components/ui/SigninForm";
export const metadata = {
  title: "Sign In",
  description: "Sign in to your FreightFlow account",
  robots: {
    index: false,
    follow: false,
  },
};

export default function SignIn() {

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 bg-white text-black min-h-screen max-h-screen h-screen overflow-y-hidden w-full px-6 sm:px-0">
      <section className="">
        <main className="h-auto w-[251px] md:w-[251px] m-auto xl:ml-[150px] mt-[63px]">
          <h1 className="text-[24px] font-[400] font-poppins">Sign in</h1>
          <div className="mt-[32px] flex flex-col gap-[10px]">
          <p className="text-[12px] font-[400] text-[#565A65] text-center">Sign in with</p>

            <section className="flex flex-row gap-4">
              <button className="bg-[#8770FF1A] p-[12px] h-[48px] w-[124px] rounded-[8px] flex flex-row items-center gap-[4px] text-[16px] font-[400] text-[#565A65]"><Image src={google} alt="google-icon" />Google</button>
              <button className="bg-[#8770FF1A] p-[12px] h-[48px] w-[124px] rounded-[8px] flex flex-row items-center gap-[4px] text-[16px] font-[400] text-[#565A65]"><Image src={Facebook} alt="facebook-icon" />Facebook</button>
            </section>
            <p className="text-[12px] font-[400] text-[#565A65] text-center">Or</p>
            <SigninForm />
            <p className="text-[16px] font-[400] text-[#565A65] text-left mt-2">Don't have an account? <span className="text-[#1150AB] underline">Sign up</span></p>
          </div>
        </main>
      </section>
      <section className="border hidden md:flex">
        <Image src={banner} alt="banner" className="w-full h-full" />
      </section>
    </div>
  );
}
