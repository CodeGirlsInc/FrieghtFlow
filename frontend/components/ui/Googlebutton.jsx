
import { useGoogleLogin } from "@react-oauth/google";
import { useRouter } from "next/router";
import Image from 'next/image';
import googlelogo from '../../public/googlelogo.png';

const GoogleLoginButton = () => {
    const router = useRouter()
    const { redirect } = router.query;
    
    const signup = useGoogleLogin({
      onSuccess: async (credentialResponse) => {
        if (credentialResponse.access_token) {
          try {
            const response = await ApiFetcher.post('/auth/google', {
              token: credentialResponse.access_token,
            });
            loginAuth(response.data.data.access_token);
            localStorage.setItem(
              'user-accessToken',
              JSON.stringify(response.data.data.access_token),
            );
            const redirectPath = redirect
              ? `/${(redirect).replace('_', '/')}`
              : '/';
            window.location.href = redirectPath;
          } catch (error) {
            toast.error('Unable to sign up with Google, kindly use other method');
          }
        }
      },
      onError: () => {
        console.log('Login Failed');
      },
    });
  
    return (
      <div>
        <button
          onClick={() => signup()}
          className="py-2 w-full border flex justify-center items-center gap-2 border-gray-200 rounded-lg"
        >
          <Image src={googlelogo} alt="Google logo" width={24} height={24} />
          Sign Up with Google
        </button>
      </div>
    );
};

export default GoogleLoginButton;