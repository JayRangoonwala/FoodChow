"use client";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import SignUpMobileModal from "./SignUpMobileModal";
import SignUpOtpModal from "./SignUpOtpModal";
import SignUpDetailsModal from "./SignUpDetailsModal";
import ForgotPasswordModal from "./forgotPasswordModal";
import { signIn, useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Login, LoginWithSocial } from "@/lib/loginService";
import { toast } from "sonner";
import { set } from "date-fns";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


type SocialData = {
  user_email: string;
  login_type: "G" | "F" ;  
}
// 1. Define validation schemas
const loginSchema = z.object({
  email: z.string().email("Enter valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

const otpSchema = z.object({
  email: z.string().email("Enter valid email"),
});

// 2. Infer types from schemas
type LoginFormData = z.infer<typeof loginSchema>;
type OtpFormData = z.infer<typeof otpSchema>;

export default function UserLoginModal({
  open,
  onClose,
  parsedCountryCodes
}: {
  open: boolean;
  onClose: () => void;
  parsedCountryCodes?: any;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [activeTab, setActiveTab] = useState<"password" | "otp">("password");
  const [signUpStep, setSignUpStep] = useState<
    null | "mobile" | "otp" | "details" | "login"
  >(null);
  const [signUpMobile, setSignUpMobile] = useState("");
  const [signUpCountryCode, setSignUpCountryCode] = useState("");
  const [signUpOtp, setSignUpOtp] = useState("");
  const [otpEmailError, setOtpEmailError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loading, setLoading] = useState(false);
  // 3. Setup react-hook-form for password login
  const {
    register: registerLogin,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors, isSubmitting: isSubmittingLogin },
    reset: resetLogin,
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // 4. Setup react-hook-form for OTP login
  const {
    register: registerOtp,
    handleSubmit: handleOtpSubmit,
    formState: { errors: otpErrors },
    reset: resetOtp,
  } = useForm<OtpFormData>({
    resolver: zodResolver(otpSchema),
    defaultValues: { email: "" },
  });

  useEffect(() => {
    if (searchParams.get("signup") === "1" && session?.user?.email) {
      setSignUpEmail(session.user.email);
      setFirstName(session.user.name?.split(" ")[0] || "");
      setLastName(session.user.name?.split(" ")[1] || "");
      setSignUpStep("details"); // Updated from "otpModal" to match valid state
      router.replace(window.location.pathname);
    }
  }, [searchParams, session, router]);

  useEffect(() => {
    if (open) {
      resetLogin({ email: "", password: "" });
      resetOtp({ email: "" });
    }
  }, [open, resetLogin, resetOtp]);

  // 5. Password login submit handler
  const onLoginSubmit = async (formData: LoginFormData) => {
    try {
      const data = {
        identifier: formData.email, // Fixed reference to formData
        password: formData.password,
      };
      const res = await Login(data);
      if (res.error) {
        setLoginError(res.error);
      }
      if (res.message) {
        setLoginError("");
        localStorage.setItem(
          "userInfo",
          JSON.stringify({
            firstName: res.user[0][0].name,
            lastName: res.user[0][0].last_name,
            email: res.user[0][0].email_id,
            mobile: res.user[0][0].mobile_no,
          })
        );
        setLoading(false);
        onClose();
        window.location.reload();
      }
    } catch (error) {
      console.error("Login failed:", error);
      setLoading(false);
    }
  };

  // 6. OTP submit handler
  const onOtpSubmit = async (formData: OtpFormData) => {
    setOtpEmailError("");
    if (!formData.email) {
      setOtpEmailError("Enter valid email");
      return;
    }
    // Trigger OTP sending logic here (e.g., API call to send OTP to email)
    setShowOtpModal(true);
  };

  const handleGoogleLogin = async () => {
    try {
      signIn("google",{
        callbackUrl: `${window.location.pathname}?socialLogin=0`,
      });
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const handleFacebookLogin = () => {
    try{
    signIn("facebook",{
      callbackUrl: `${window.location.pathname}?socialLogin=1`,
    });
  } catch (error) {
    console.error("Google login failed:", error);
  }
  };

  return (
    <>
      <Dialog open={open || signUpStep === "login"} onOpenChange={onClose}>
        <DialogContent className="w-full max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
          <DialogTitle>
        <VisuallyHidden>OTP Verification</VisuallyHidden> 
      </DialogTitle>
          {/* Header with background image */}
          <div className="relative w-full h-[234px] -mt-[59px] overflow-hidden">
            <div
              className="w-full h-[230px] bg-contain bg-no-repeat"
              style={{
                backgroundImage: "url('/login.jpg')",
                backgroundPosition: "40% center",
              }}
            >
              <div className="w-full flex justify-start overflow-visible">
                <div
                  className="w-[490px] h-[200px] bg-no-repeat bg-contain bg-left"
                  style={{ backgroundImage: "url('/loginleft.png')" }}
                ></div>
              </div>
            </div>
            <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
              <h2 className="text-[25px] font-semibold text-black">Login</h2>
            </div>
          </div>

          {/* Tab Content */}
          <div className="px-6 py-0 space-y-3">
            {/* Tab Buttons */}
            <div className="flex space-x-2 mb-1">
              <button
                type="button"
                className={`flex-1 py-1.5 rounded-md text-[13px] font-normal ${
                  activeTab === "password"
                    ? "bg-teal-500 text-white"
                    : "border border-gray-400"
                }`}
                onClick={() => setActiveTab("password")}
              >
                Login With Password
              </button>
              <button
                type="button"
                className={`flex-1 py-1.5 rounded-md text-[13px] font-normal ${
                  activeTab === "otp"
                    ? "bg-teal-500 text-white"
                    : "border border-gray-400"
                }`}
                onClick={() => setActiveTab("otp")}
              >
                Login With OTP
              </button>
            </div>

            {activeTab === "password" ? (
              <form
                onSubmit={handleLoginSubmit(onLoginSubmit)}
                className="space-y-3"
              >
                {/* Email Field */}
                <div className="mb-3">
                  <label className="block text-[14px] font-medium text-black">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <div className="flex mt-0.5 border border-[#929292] rounded-md overflow-hidden">
                    <Input
                      type="email"
                      placeholder="Enter Email"
                      {...registerLogin("email")}
                      className={cn(
                        "w-full px-2 py-2 text-sm outline-none",
                        loginErrors.email ? "border-red-500" : ""
                      )}
                    />
                  </div>
                  {loginErrors.email && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {loginErrors.email.message}
                    </p>
                  )}
                </div>

                {/* Password Field */}
                <div className="mb-1">
                  <label className="block text-[14px] font-medium text-black">
                    Password<span className="text-red-500">*</span>
                  </label>
                  <div className="relative mt-0.5">
                    <Input
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter Password"
                      {...registerLogin("password")}
                      className={cn(
                        "w-full px-2 py-2 border border-[#A2A2A2] rounded-md text-sm",
                        loginErrors.password ? "border-red-500" : ""
                      )}
                    />
                    <span
                      className="absolute right-2 top-2 cursor-pointer"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? (
                        <svg
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          xmlns="http://www.w3.org/2000/svg"
                        >
                          <path
                            d="M11.9991 8.1377C9.86813 8.1377 8.13672 9.86911 8.13672 12.0001C8.13672 14.131 9.86813 15.8624 11.9991 15.8624C14.1301 15.8624 15.8615 14.131 15.8615 12.0001C15.8615 9.86911 14.1301 8.1377 11.9991 8.1377ZM11.7061 10.8547C11.2266 10.8547 10.8271 11.2542 10.8271 11.7337H9.54848C9.57512 10.535 10.5341 9.5761 11.7061 9.5761V10.8547Z"
                            fill="black"
                          />
                          <path
                            d="M23.7203 11.201C22.4151 9.57617 17.7536 4.27539 12 4.27539C6.24639 4.27539 1.58491 9.57617 0.279689 11.201C-0.0932297 11.6539 -0.0932297 12.3198 0.279689 12.7993C1.58491 14.4241 6.24639 19.7249 12 19.7249C17.7536 19.7249 22.4151 14.4241 23.7203 12.7993C24.0932 12.3464 24.0932 11.6805 23.7203 11.201ZM12 17.5939C8.9101 17.5939 6.40622 15.09 6.40622 12.0001C6.40622 8.91024 8.9101 6.40636 12 6.40636C15.0899 6.40636 17.5938 8.91024 17.5938 12.0001C17.5938 15.09 15.0899 17.5939 12 17.5939Z"
                            fill="black"
                          />
                        </svg>
                      ) : (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                        >
                          <path
                            d="M2 2L22 22M9.88 9.88C9.33 10.43 9 11.19 9 12C9 13.66 10.34 15 12 15C12.81 15 13.57 14.67 14.12 14.12M17.94 17.94C16.37 19.18 14.26 20 12 20C7.58 20 3.73 16.88 2 12C2.72 10.06 3.92 8.36 5.46 7.06M10.59 5.07C11.06 5.02 11.53 5 12 5C16.42 5 20.27 8.12 22 13C21.4 14.68 20.37 16.17 19.07 17.35"
                            stroke="black"
                            strokeWidth="2"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                      )}
                    </span>
                  </div>
                  {loginErrors.password && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {loginErrors.password.message}
                    </p>
                  )}
                  <div
                    className="text-right text-[13px] text-black mt-2 font-normal cursor-pointer"
                    onClick={() => setShowForgot(true)}
                  >
                    Forgot Password?
                  </div>
                </div>

                {loginError && (
                  <p className="text-red-500 text-xs mt-0.5">{loginError}</p>
                )}

                <Button
                  type="submit"
                  disabled={isSubmittingLogin}
                  className={`w-full py-2 text-[15px] rounded-md font-semibold text-white ${
                    !loginErrors.email && !loginErrors.password
                      ? "bg-teal-500"
                      : "bg-[#CACACA]"
                  }`}
                >
                  {isSubmittingLogin ? "LOGGING IN..." : "LOGIN"}
                </Button>

                <p className="text-center text-[15px] font-medium mt-3">
                  Don't have an account?{" "}
                  <span
                    className="text-teal-500 text-[15px] cursor-pointer font-medium"
                    onClick={() => {
                      setSignUpStep("mobile");
                      onClose();
                    }}
                  >
                    Sign up Now
                  </span>
                </p>
              </form>
            ) : (
              <form
                onSubmit={handleOtpSubmit(onOtpSubmit)}
                className="space-y-3"
              >
                {/* Email Field for OTP */}
                <div className="mb-3">
                  <label className="block text-[14px] font-medium text-black">
                    Email<span className="text-red-500">*</span>
                  </label>
                  <div className="flex mt-0.5 border border-[#929292] rounded-md overflow-hidden">
                    <Input
                      type="email"
                      placeholder="Enter Email"
                      {...registerOtp("email")}
                      className={cn(
                        "w-full px-2 py-2 text-sm outline-none",
                        otpErrors.email || otpEmailError ? "border-red-500" : ""
                      )}
                    />
                  </div>
                  {(otpErrors.email || otpEmailError) && (
                    <p className="text-red-500 text-xs mt-0.5">
                      {otpErrors.email?.message || otpEmailError}
                    </p>
                  )}
                </div>

                <Button
                  type="submit"
                  className="w-full py-2 text-[15px] rounded-md font-semibold text-white bg-teal-500"
                >
                  GET OTP
                </Button>

                <p className="text-center text-[15px] font-medium ">
                  Don't have an account?{" "}
                  <span
                    className="text-teal-500 text-[15px] cursor-pointer font-medium"
                    onClick={() => {
                      setSignUpStep("mobile");
                      onClose();
                    }}
                  >
                    Sign up Now
                  </span>
                </p>
              </form>
            )}
          </div>

          <div className="w-full max-w-md mx-auto mt-1 mb-3">
            <div className="relative flex items-center justify-center">
              <div className="w-[340px] border-t border-[#9C9C9C]"></div>
              <span className="absolute bg-white px-4 text-[#707070] text-[13px] font-normal">
                Or Login With
              </span>
            </div>

            <div className="flex justify-center mt-4 ">
              <div className="flex space-x-3">
                <button
                  onClick={handleGoogleLogin}
                  className="focus:outline-none"
                  aria-label="Login with Google"
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="0 0 45 45"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="0.5"
                      y="0.5"
                      width="45"
                      height="45"
                      rx="22.5"
                      fill="white"
                      stroke="#C4C4C4"
                    />
                    <path
                      d="M16.3189 26.1833L15.4835 29.302L12.4301 29.3666C11.5176 27.6741 11 25.7376 11 23.6798C11 21.6899 11.4839 19.8134 12.3418 18.1611H12.3424L15.0608 18.6595L16.2516 21.3616C16.0024 22.0882 15.8665 22.8682 15.8665 23.6798C15.8666 24.5607 16.0262 25.4047 16.3189 26.1833Z"
                      fill="#FBBB00"
                    />
                    <path
                      d="M34.7902 21.4375C34.928 22.1634 34.9999 22.9131 34.9999 23.6793C34.9999 24.5384 34.9095 25.3764 34.7375 26.1848C34.1533 28.9355 32.6269 31.3375 30.5124 33.0373L30.5118 33.0366L27.0878 32.8619L26.6032 29.8368C28.0063 29.014 29.1028 27.7263 29.6804 26.1848H23.2637V21.4375H34.7902Z"
                      fill="#518EF8"
                    />
                    <path
                      d="M30.5114 33.0374L30.5121 33.0381C28.4556 34.691 25.8433 35.68 22.9996 35.68C18.4297 35.68 14.4565 33.1258 12.4297 29.3669L16.3185 26.1836C17.3319 28.8882 19.9409 30.8135 22.9996 30.8135C24.3143 30.8135 25.546 30.4581 26.6029 29.8376L30.5114 33.0374Z"
                      fill="#28B446"
                    />
                    <path
                      d="M30.6596 14.4423L26.7721 17.6249C25.6783 16.9412 24.3853 16.5462 23 16.5462C19.8721 16.5462 17.2143 18.5599 16.2517 21.3614L12.3425 18.161H12.3418C14.339 14.3105 18.3622 11.6797 23 11.6797C25.9117 11.6797 28.581 12.7168 30.6596 14.4423Z"
                      fill="#F14336"
                    />
                  </svg>
                </button>
                <button
                  onClick={handleFacebookLogin}
                  className="focus:outline-none"
                  aria-label="Login with Facebook"
                >
                  <svg
                    width="40"
                    height="40"
                    viewBox="64 0 45 45"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <rect
                      x="64.1865"
                      y="0.5"
                      width="45"
                      height="45"
                      rx="22.5"
                      fill="white"
                      stroke="#C4C4C4"
                    />
                    <path
                      fillRule="evenodd"
                      clipRule="evenodd"
                      d="M86.6859 12.0635C88.8493 12.0882 90.8038 12.6199 92.5493 13.6587C94.2739 14.6767 95.7086 16.1201 96.716 17.8509C97.7484 19.6069 98.2769 21.5732 98.3016 23.7498C98.2402 26.7279 97.3009 29.2715 95.4836 31.3806C93.6662 33.4897 91.3387 34.7945 88.9292 35.2947V26.945H91.2072L91.7223 23.6638H88.2729V21.5146C88.2538 21.0691 88.3947 20.6314 88.6702 20.2808C88.946 19.9291 89.4318 19.7443 90.1275 19.7263H92.2104V16.852C92.1805 16.8424 91.8969 16.8043 91.3597 16.7379C90.7503 16.6666 90.1375 16.6285 89.524 16.6238C88.1355 16.6302 87.0374 17.0219 86.2296 17.7989C85.4218 18.5756 85.0092 19.6993 84.9917 21.1701V23.6638H82.3667V26.945H84.9917V35.2947C82.0332 34.7946 79.7056 33.4898 77.8883 31.3807C76.0709 29.2716 75.1316 26.7279 75.0703 23.7498C75.0948 21.5731 75.6233 19.6068 76.6558 17.8509C77.6633 16.1201 79.0979 14.6766 80.8226 13.6586C82.568 12.6201 84.5225 12.0884 86.6859 12.0635Z"
                      fill="#1976D2"
                    />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      {/* Sign Up Step 1: Mobile */}
      <SignUpMobileModal
        open={signUpStep === "mobile"}
        onClose={() => setSignUpStep(null)}
        onNext={(email: string) => {
          setSignUpEmail(email);
          setSignUpStep("otp");
        }}
        onLoginClick={() => {
          setSignUpStep("login");
          setActiveTab("password");
        }}
        onSocialLogin={(email: string) => {
          setSignUpEmail(email);
        }}
        parsedCountryCodes={parsedCountryCodes}
      />
      {/* Sign Up Step 2: OTP */}
      <SignUpOtpModal
        open={signUpStep === "otp" || showOtpModal}
        onClose={() => {
          setShowOtpModal(false);
          setSignUpStep(null);
        }}
        mobile={signUpMobile}
        countryCode={signUpCountryCode}
        email={showOtpModal ? otpErrors.email?.ref?.value : signUpEmail}
        onNext={(email) => {
          setShowOtpModal(false);
          setSignUpEmail(email);
          setSignUpStep("details");
          setActiveTab("password");
        }}
        onBack={() => {
          setShowOtpModal(false);
          setSignUpStep("mobile");
        }}
      />
      {/* Sign Up Step 3: Details */}
      <SignUpDetailsModal
        open={signUpStep === "details"}
        onClose={() => setSignUpStep(null)}
        mobile={signUpMobile}
        firstName={firstName}
        lastName={lastName}
        countryCode={signUpCountryCode}
        otp={signUpOtp}
        email={signUpEmail}
        onSuccess={() => {
          setSignUpStep(null);
          window.location.reload();
        }}
        onBack={() => setSignUpStep("otp")}
        parsedCountryCodes={parsedCountryCodes}
        onLoginClick={() => {
          setSignUpStep("login");
          setActiveTab("password");
        }} // Added prop
      />
      <ForgotPasswordModal
        open={showForgot}
        onClose={() => setShowForgot(false)}
        onLogin={() => {
          setSignUpStep("login");
          setActiveTab("password");
        }}
      />
    </>
  );
}


// // "use client";

// // import { useForm } from "react-hook-form";
// // import { z } from "zod";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { useEffect, useState } from "react";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import {
// //   Popover,
// //   PopoverContent,
// //   PopoverTrigger,
// // } from "@/components/ui/popover";
// // import {
// //   Command,
// //   CommandEmpty,
// //   CommandGroup,
// //   CommandInput,
// //   CommandItem,
// //   CommandList,
// // } from "@/components/ui/command";
// // import { ChevronsUpDown, Check, Eye, EyeOff } from "lucide-react";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { cn } from "@/lib/utils";
// // import Image from "next/image";
// // import SignUpMobileModal from "./SignUpMobileModal";
// // import SignUpOtpModal from "./SignUpOtpModal";
// // import SignUpDetailsModal from "./SignUpDetailsModal";
// // import ForgotPasswordModal from "./forgotPasswordModal";
// // import { useSession } from "next-auth/react";
// // import { useRouter, useSearchParams } from "next/navigation";
// // import { Login } from "@/lib/loginService";
// // import { toast } from "sonner";

// // // 1. Define validation schema
// // const loginSchema = z.object({
// //   email: z.string().email("Enter valid email"),
// //   password: z.string().min(8, "Password must be at least 8 characters"),
// // });

// // // 2. Infer types from schema
// // type LoginFormData = z.infer<typeof loginSchema>;

// // export default function UserLoginModal({
// //   open,
// //   onClose,
// //   parsedCountryCodes,
// // }: {
// //   open: boolean;
// //   onClose: () => void;
// //   parsedCountryCodes: any;
// // }) {
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [openSelect, setOpenSelect] = useState(false);
// //   const [activeTab, setActiveTab] = useState<"password" | "otp">("password");
// //   // Sign up modal state
// //   const [signUpStep, setSignUpStep] = useState<
// //     null | "mobile" | "otp" | "details" | "login"
// //   >(null);
// //   const [signUpMobile, setSignUpMobile] = useState("");
// //   const [signUpCountryCode, setSignUpCountryCode] = useState("");
// //   const [signUpOtp, setSignUpOtp] = useState("");
// //   const [otpStep, setOtpStep] = useState<"mobile" | "otp">("mobile");
// //   const [otpMobile, setOtpMobile] = useState("");
// //   const [otpCountryCode, setOtpCountryCode] = useState(
// //     parsedCountryCodes?.[0]?.code || ""
// //   );
// //   const [otpMobileError, setOtpMobileError] = useState("");
// //   const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
// //   const [otpError, setOtpError] = useState("");
// //   const [showOtpModal, setShowOtpModal] = useState(false);
// //   const [showForgot, setShowForgot] = useState(false);
// //   const [signUpEmail, setSignUpEmail] = useState("");
// //   const { data: session } = useSession();
// //   const router = useRouter();
// //   const searchParams = useSearchParams();
// //   const [firstName, setFirstName] = useState("");
// //   const [lastName, setLastName] = useState("");
// //   const [loginError, setLoginError] = useState("");

// //   // 3. Setup react-hook-form
// //   const {
// //     register,
// //     handleSubmit,
// //     formState: { errors, isSubmitting },
// //     reset
// //   } = useForm<LoginFormData>({
// //     resolver: zodResolver(loginSchema),
// //     defaultValues: {
// //       email: "",
// //       password: "",
// //     },
// //   });

// //   // const countryCode = watch("country_code");

// //   // // 4. Persist selected country
// //   // useEffect(() => {
// //   //   const stored = localStorage.getItem("xCountryCode");
// //   //   if (stored) {
// //   //     setValue("country_code", stored);
// //   //     clearErrors("country_code");
// //   //   }
// //   // }, [setValue, clearErrors]);

// //   useEffect(() => {
// //     if (searchParams.get("signup") === "1" && session?.user?.email) {
// //       setSignUpEmail(session.user.email);
// //       setFirstName(session.user.name?.split(" ")[0] || "");
// //       setLastName(session.user.name?.split(" ")[1] || "");
// //       setSignUpStep("details");
// //       // Remove the query param for a clean URL
// //       router.replace(window.location.pathname);
// //     }
// //   }, [searchParams, session, router]);

// //   // useEffect(() => {
// //   //   if (countryCode) {
// //   //     localStorage.setItem("xCountryCode", countryCode);
// //   //   }
// //   // }, [countryCode]);

// //   // const selectedCountry = parsedCountryCodes?.find(
// //   //   (item: any) => item.code === countryCode
// //   // );
// //   useEffect(() => {
// //     if(open){
// //       reset({email:"", password:""})
// //     }
// //   }, [open, reset])

// //   // 5. Submit handler
// //   const onSubmit = async (formData: LoginFormData) => {
// //     try {

// //       const data = {
// //         identifier : formData.email,
// //         password : formData.password,
// //       }
// //       const res = await Login(data);
// //       if(res.error){
// //         setLoginError(res.error);
// //       }
// //       if(res.message){
// //         setLoginError("");

// //         localStorage.setItem("userInfo", JSON.stringify({
// //           firstName: res.user[0][0].name,
// //           lastName: res.user[0][0].last_name,
// //           email: res.user[0][0].email_id,
// //           mobile: res.user[0][0].mobile_no,
// //         }));
// //         onClose();
// //         window.location.reload();
// //         // window.location.href = "/final-checkout";
// //       }
// //       // Handle actual login logic here
// //       // Example: await loginUser(data);
// //       // onClose(); // Close modal on success
// //     } catch (error) {
// //       console.error("Login failed:", error);
// //       // Handle error (show toast, etc.)
// //     }
// //   };

// //   const handleGoogleLogin = async () => {
// //     // const data = {
// //     //   identifier: session?.user?.email,
// //     // }
// //     // const res = await Login();

// //   };

// //   const handleFacebookLogin = () => {
// //     console.log("Facebook Login");
// //   };

// //   const handleAppleLogin = () => {
// //     console.log("Apple Login");
// //   };

// //   return (
// //     <>
// //       <Dialog open={open || signUpStep === "login"} onOpenChange={onClose}>
// //         <DialogContent className="max-w-xs w-sm rounded-xl p-3 box-content overflow-hidden">
// //           <DialogHeader>
// //             <DialogTitle className="sr-only">Login</DialogTitle>
// //           </DialogHeader>
// //           {/* Header with close button */}
// //           <div className="relative bg-[#dff3f4] px-1.5 py-2 text-center rounded-t-xl">
// //             <h2 className="text-lg font-semibold text-gray-800">Log in</h2>
// //             {/* Tab Switcher */}
// //             <div className="flex mt-1 gap-1 justify-center">
// //               <button
// //                 className={`flex-1 py-1.5 rounded-l-lg border font-medium text-xs ${
// //                   activeTab === "password"
// //                     ? "bg-primary text-white"
// //                     : "bg-white text-gray-700 border-gray-300"
// //                 }`}
// //                 onClick={() => setActiveTab("password")}
// //                 type="button"
// //               >
// //                 Login With Password
// //               </button>
// //               <button
// //                 className={`flex-1 py-1.5 rounded-r-lg border font-medium text-xs ${
// //                   activeTab === "otp"
// //                     ? "bg-primary text-white"
// //                     : "bg-white text-gray-700 border-gray-300"
// //                 }`}
// //                 onClick={() => setActiveTab("otp")}
// //                 type="button"
// //               >
// //                 Login With OTP
// //               </button>
// //             </div>
// //           </div>

// //           {/* Tab Content */}
// //           {activeTab === "password" ? (
// //             <form
// //               onSubmit={handleSubmit(onSubmit)}
// //               className="space-y-2 mt-2 px-1"
// //             >
// //               {/* Mobile Field */}
// //               <div>
// //                 <label className="text-xs font-medium">Email</label>
// //                 <div className="relative mt-0.5">
// //                   <Input
// //                     type="email"
// //                     placeholder="Enter Email"
// //                     {...register("email")}
// //                     className={cn(
// //                       "pr-8 border h-7 text-xs px-1.5 py-1",
// //                       errors.email ? "border-red-500" : "border-gray-300"
// //                     )}
// //                   />
// //                 </div>
// //                 {errors.email && (
// //                   <p className="text-xs text-red-600 mt-0.5">
// //                     {errors.email.message}
// //                   </p>
// //                 )}
// //               </div>

// //               {/* Password Field */}
// //               <div>
// //                 <label className="text-xs font-medium">Password</label>
// //                 <div className="relative mt-0.5">
// //                   <Input
// //                     type={showPassword ? "text" : "password"}
// //                     placeholder="Enter Password"
// //                     {...register("password")}
// //                     className={cn(
// //                       "pr-8 border h-7 text-xs px-1.5 py-1",
// //                       errors.password ? "border-red-500" : "border-gray-300"
// //                     )}
// //                   />
// //                   <button
// //                     type="button"
// //                     className="absolute right-2 top-1 text-gray-500 hover:text-gray-700"
// //                     onClick={() => setShowPassword(!showPassword)}
// //                   >
// //                     {showPassword ? (
// //                       <EyeOff className="w-4 h-4" />
// //                     ) : (
// //                       <Eye className="w-4 h-4" />
// //                     )}
// //                   </button>
// //                 </div>
// //                 {errors.password && (
// //                   <p className="text-xs text-red-600 mt-0.5">
// //                     {errors.password.message}
// //                   </p>
// //                 )}
// //                 <div className="text-right text-xs mt-0.5 text-gray-600 hover:underline cursor-pointer" onClick={() => setShowForgot(true)}>Forgot Password?</div>
// //               </div>

// //                 {loginError && (
// //                   <p className="text-xs text-red-600 mt-0.5">
// //                     {loginError}
// //                   </p>
// //                 )}

// //               <Button
// //                 type="submit"
// //                 disabled={isSubmitting}
// //                 className="w-full bg-primary hover:bg-primary/90 text-white disabled:opacity-50 h-7 text-xs rounded-lg"
// //               >
// //                 {isSubmitting ? "LOGGING IN..." : "LOGIN"}
// //               </Button>

// //               <p className="text-center text-xs">
// //                 Don't have an account?{" "}
// //                 <span
// //                   className="text-primary hover:underline cursor-pointer"
// //                   onClick={() => {
// //                     setSignUpStep("mobile");
// //                     onClose();
// //                   }}
// //                 >
// //                   Sign up Now
// //                 </span>
// //               </p>
// //             </form>
// //           ) : (
// //             // OTP Login Tab Content (inline, not modal)
// //             <div className="mt-2 px-1">
// //               {otpStep === "mobile" ? (
// //                 <form
// //                   onSubmit={(e) => {
// //                     e.preventDefault();
// //                     setOtpMobileError("");
// //                     if (!otpMobile || otpMobile.length !== 10) {
// //                       setOtpMobileError("Enter valid mobile number");
// //                       return;
// //                     }
// //                     if (!otpCountryCode) {
// //                       setOtpMobileError("Select a country");
// //                       return;
// //                     }
// //                     setShowOtpModal(true);
// //                   }}
// //                   className="space-y-2"
// //                 >
// //                   <label className="text-xs font-medium">Mobile Number</label>
// //                   <div className="flex gap-1 mt-0.5">
// //                     <Popover open={openSelect} onOpenChange={setOpenSelect}>
// //                       <PopoverTrigger asChild>
// //                         <Button
// //                           type="button"
// //                           variant="outline"
// //                           role="combobox"
// //                           className={cn(
// //                             "w-24 justify-between border text-left text-xs h-7 px-1.5",
// //                             !otpCountryCode
// //                               ? "border-red-500"
// //                               : "border-gray-300"
// //                           )}
// //                         >
// //                           <span className="truncate">
// //                             {otpCountryCode ? `+${otpCountryCode}` : "Select"}
// //                           </span>
// //                           <ChevronsUpDown className="w-3 h-3 opacity-50 ml-1 flex-shrink-0" />
// //                         </Button>
// //                       </PopoverTrigger>
// //                       <PopoverContent
// //                         className="w-44 p-0"
// //                         align="start"
// //                         side="bottom"
// //                         sideOffset={4}
// //                       >
// //                         <Command>
// //                           <CommandInput
// //                             placeholder="Search country..."
// //                             className="h-7 border-none focus:ring-0 text-xs"
// //                           />
// //                           <CommandList className="max-h-60 overflow-y-auto">
// //                             <CommandEmpty>No country found.</CommandEmpty>
// //                             <CommandGroup>
// //                               {parsedCountryCodes?.map((item: any) => (
// //                                 <CommandItem
// //                                   key={item.country}
// //                                   value={`${item.code} ${item.country}`}
// //                                   onSelect={() => {
// //                                     setOtpCountryCode(item.code);
// //                                     setOpenSelect(false);
// //                                   }}
// //                                   className="cursor-pointer hover:bg-gray-100 text-xs"
// //                                 >
// //                                   <div className="flex justify-between items-center w-full">
// //                                     <span className="flex-1 text-xs">
// //                                       +{item.code} {item.country}
// //                                     </span>
// //                                     {item.code === otpCountryCode && (
// //                                       <Check className="w-3 h-3 text-green-600 ml-2 flex-shrink-0" />
// //                                     )}
// //                                   </div>
// //                                 </CommandItem>
// //                               ))}
// //                             </CommandGroup>
// //                           </CommandList>
// //                         </Command>
// //                       </PopoverContent>
// //                     </Popover>
// //                     <Input
// //                       type="tel"
// //                       placeholder="Enter Mobile No"
// //                       value={otpMobile}
// //                       onChange={(e) =>
// //                         setOtpMobile(
// //                           e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
// //                         )
// //                       }
// //                       className={cn(
// //                         "flex-1 border h-7 text-xs px-1.5",
// //                         otpMobileError ? "border-red-500" : "border-gray-300"
// //                       )}
// //                       maxLength={10}
// //                     />
// //                   </div>
// //                   {otpMobileError && (
// //                     <p className="text-xs text-red-600 mt-0.5">
// //                       {otpMobileError}
// //                     </p>
// //                   )}
// //                   <Button
// //                     type="submit"
// //                     className="w-full bg-primary text-white h-7 text-xs rounded-lg"
// //                   >
// //                     GET OTP
// //                   </Button>
// //                   <p className="text-center text-xs">
// //                     Don't have an account?{" "}
// //                     <span
// //                       className="text-primary hover:underline cursor-pointer"
// //                       onClick={() => {
// //                         setSignUpStep("mobile");
// //                         onClose();
// //                       }}
// //                     >
// //                       Sign up Now
// //                     </span>
// //                   </p>
// //                 </form>
// //               ) : null}
// //               <SignUpOtpModal
// //                 open={showOtpModal}
// //                 onClose={() => setShowOtpModal(false)}
// //                 mobile={otpMobile}
// //                 countryCode={otpCountryCode}
// //                 onNext={() => {
// //                   setShowOtpModal(false);
// //                   setOtpStep("mobile");
// //                   setActiveTab("password");
// //                   // You can handle successful OTP login here
// //                 }}
// //                 onBack={() => setShowOtpModal(false)}
// //               />
// //             </div>
// //           )}

// //           <div className="relative flex items-center justify-center mt-3">
// //             <div className="border-t border-gray-300 absolute w-full"></div>
// //             <div className="bg-white px-2 relative text-xs text-gray-500">
// //               Or Login With
// //             </div>
// //           </div>
// //           <div className="flex justify-center gap-2 mb-3">
// //             <Button
// //               variant="outline"
// //               className="w-8 h-8 border-gray-300 rounded-full p-0.5 hover:bg-gray-100"
// //               onClick={handleGoogleLogin}
// //             >
// //               <Image
// //                 src="/google.svg"
// //                 alt="Google"
// //                 width={20}
// //                 height={20}
// //                 className="p-0.5 hover:cursor-pointer transition-colors"
// //               />
// //             </Button>
// //             <Button
// //               variant="outline"
// //               className="w-8 h-8 border-gray-300 rounded-full p-0.5 hover:bg-gray-100"
// //               onClick={handleFacebookLogin}
// //             >
// //               <Image
// //                 src="/facebook.svg"
// //                 alt="Facebook"
// //                 width={20}
// //                 height={20}
// //                 className="p-0.5 hover:cursor-pointer hover:border-gray-400 transition-colors"
// //               />
// //             </Button>
// //             <Button
// //               variant="outline"
// //               className="w-8 h-8 border-gray-300 rounded-full p-0.5 hover:bg-gray-100"
// //               onClick={handleAppleLogin}
// //             >
// //               <Image
// //                 src="/apple.svg"
// //                 alt="Apple"
// //                 width={20}
// //                 height={20}
// //                 className="p-0.5 hover:cursor-pointer hover:border-gray-400 transition-colors"
// //               />
// //             </Button>
// //           </div>
// //         </DialogContent>
// //       </Dialog>
// //       {/* Sign Up Step 1: Mobile */}
// //       <SignUpMobileModal
// //         open={signUpStep === "mobile"}
// //         onClose={() => setSignUpStep(null)}
// //         onNext={(mobile: string, countryCode: string) => {
// //           setSignUpMobile(mobile);
// //           setSignUpCountryCode(countryCode);
// //           setSignUpStep("otp");
// //         }}
// //         onLoginClick={() => {
// //           setSignUpStep("login");
// //           setActiveTab("password");
// //         }}
// //         onSocialLogin={(email:string) => {
// //           setSignUpEmail(email)
// //           setSignUpStep("details");
// //         }}
// //         parsedCountryCodes={parsedCountryCodes}
// //       />
// //       {/* Sign Up Step 2: OTP */}
// //       <SignUpOtpModal
// //         open={signUpStep === "otp"}
// //         onClose={() => setSignUpStep(null)}
// //         mobile={signUpMobile}
// //         countryCode={signUpCountryCode}
// //         onNext={(otp) => {
// //           setSignUpOtp(otp);
// //           setSignUpStep("details");
// //         }}
// //         onBack={() => setSignUpStep("mobile")}
// //       />
// //       {/* Sign Up Step 3: Details */}
// //       <SignUpDetailsModal
// //         open={signUpStep === "details"}
// //         onClose={() => setSignUpStep(null)}
// //         mobile={signUpMobile}
// //         firstName={firstName}
// //         lastName={lastName}
// //         countryCode={signUpCountryCode}
// //         otp={signUpOtp}
// //         email={signUpEmail}
// //         onSuccess={() => {
// //           setSignUpStep(null);
// //           window.location.reload();
// //           // Optionally, show a success message or auto-login
// //         }}
// //         onBack={() => setSignUpStep("otp")}
// //         parsedCountryCodes={parsedCountryCodes}
// //       />
// //       <ForgotPasswordModal open={showForgot} onClose={() => setShowForgot(false)} onLogin={() => {
// //         setSignUpStep("login");
// //         setActiveTab("password");
// //       }} />
// //     </>
// //   );
// // }
// // "use client";

// // import { useForm } from "react-hook-form";
// // import { z } from "zod";
// // import { zodResolver } from "@hookform/resolvers/zod";
// // import { useEffect, useState } from "react";
// // import {
// //   Dialog,
// //   DialogContent,
// //   DialogHeader,
// //   DialogTitle,
// // } from "@/components/ui/dialog";
// // import {
// //   Popover,
// //   PopoverContent,
// //   PopoverTrigger,
// // } from "@/components/ui/popover";
// // import {
// //   Command,
// //   CommandEmpty,
// //   CommandGroup,
// //   CommandInput,
// //   CommandItem,
// //   CommandList,
// // } from "@/components/ui/command";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { cn } from "@/lib/utils";
// // import Image from "next/image";
// // import SignUpMobileModal from "./SignUpMobileModal";
// // import SignUpOtpModal from "./SignUpOtpModal";
// // import SignUpDetailsModal from "./SignUpDetailsModal";
// // import ForgotPasswordModal from "./forgotPasswordModal";
// // import { useSession } from "next-auth/react";
// // import { useRouter, useSearchParams } from "next/navigation";
// // import { Login } from "@/lib/loginService";
// // import { toast } from "sonner";

// // // 1. Define validation schema
// // const loginSchema = z.object({
// //   email: z.string().email("Enter valid email"),
// //   password: z.string().min(8, "Password must be at least 8 characters"),
// // });

// // // 2. Infer types from schema
// // type LoginFormData = z.infer<typeof loginSchema>;

// // export default function UserLoginModal({
// //   open,
// //   onClose,
// //   parsedCountryCodes,
// // }: {
// //   open: boolean;
// //   onClose: () => void;
// //   parsedCountryCodes: any;
// // }) {
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [openSelect, setOpenSelect] = useState(false);
// //   const [activeTab, setActiveTab] = useState<"password" | "otp">("password");
// //   // Sign up modal state
// //   const [signUpStep, setSignUpStep] = useState<
// //     null | "mobile" | "otp" | "details" | "login"
// //   >(null);
// //   const [signUpMobile, setSignUpMobile] = useState("");
// //   const [signUpCountryCode, setSignUpCountryCode] = useState("");
// //   const [signUpOtp, setSignUpOtp] = useState("");
// //   const [otpStep, setOtpStep] = useState<"mobile" | "otp">("mobile");
// //   const [otpMobile, setOtpMobile] = useState("");
// //   const [otpCountryCode, setOtpCountryCode] = useState(
// //     parsedCountryCodes?.[0]?.code || ""
// //   );
// //   const [otpMobileError, setOtpMobileError] = useState("");
// //   const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
// //   const [otpError, setOtpError] = useState("");
// //   const [showOtpModal, setShowOtpModal] = useState(false);
// //   const [showForgot, setShowForgot] = useState(false);
// //   const [signUpEmail, setSignUpEmail] = useState("");
// //   const { data: session } = useSession();
// //   const router = useRouter();
// //   const searchParams = useSearchParams();
// //   const [firstName, setFirstName] = useState("");
// //   const [lastName, setLastName] = useState("");
// //   const [loginError, setLoginError] = useState("");

// //   // 3. Setup react-hook-form
// //   const {
// //     register,
// //     handleSubmit,
// //     formState: { errors, isSubmitting },
// //     reset,
// //   } = useForm<LoginFormData>({
// //     resolver: zodResolver(loginSchema),
// //     defaultValues: {
// //       email: "",
// //       password: "",
// //     },
// //   });

// //   useEffect(() => {
// //     if (searchParams.get("signup") === "1" && session?.user?.email) {
// //       setSignUpEmail(session.user.email);
// //       setFirstName(session.user.name?.split(" ")[0] || "");
// //       setLastName(session.user.name?.split(" ")[1] || "");
// //       setSignUpStep("details");
// //       // Remove the query param for a clean URL
// //       router.replace(window.location.pathname);
// //     }
// //   }, [searchParams, session, router]);

// //   useEffect(() => {
// //     if (open) {
// //       reset({ email: "", password: "" });
// //     }
// //   }, [open, reset]);

// //   // 5. Submit handler
// //   const onSubmit = async (formData: LoginFormData) => {
// //     try {
// //       const data = {
// //         identifier: formData.email,
// //         password: formData.password,
// //       };
// //       const res = await Login(data);
// //       if (res.error) {
// //         setLoginError(res.error);
// //       }
// //       if (res.message) {
// //         setLoginError("");
// //         localStorage.setItem(
// //           "userInfo",
// //           JSON.stringify({
// //             firstName: res.user[0][0].name,
// //             lastName: res.user[0][0].last_name,
// //             email: res.user[0][0].email_id,
// //             mobile: res.user[0][0].mobile_no,
// //           })
// //         );
// //         onClose();
// //         window.location.reload();
// //       }
// //     } catch (error) {
// //       console.error("Login failed:", error);
// //     }
// //   };

// //   const handleGoogleLogin = async () => {
// //     // Implement Google login logic
// //   };

// //   const handleFacebookLogin = () => {
// //     console.log("Facebook Login");
// //   };

// //   const handleAppleLogin = () => {
// //     console.log("Apple Login");
// //   };

// //   return (
// //     <>
// //       <Dialog open={open || signUpStep === "login"} onOpenChange={onClose}>
// //         <DialogContent className="w-full max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
// //           <DialogHeader>
// //             <DialogTitle className="sr-only">Login</DialogTitle>
// //           </DialogHeader>
// //           {/* Header with background image */}
// //           <div className="relative w-full h-[254px] -mt-[59px] overflow-hidden">
// //             <div
// //               className="w-full h-[250px] bg-contain bg-no-repeat"
// //               style={{
// //                 backgroundImage: "url('/login.jpg')",
// //                 backgroundPosition: "40% center",
// //               }}
// //             >
// //               <div className="w-full flex justify-start overflow-visible">
// //                 <div
// //                   className="w-[490px] h-[200px] bg-no-repeat bg-contain bg-left"
// //                   style={{ backgroundImage: "url('/loginleft.png')" }}
// //                 ></div>
// //               </div>
// //             </div>
// //             <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
// //               <h2 className="text-[25px] font-semibold text-black">Login</h2>
// //             </div>
// //           </div>

// //           {/* Tab Content */}
// //           {activeTab === "password" ? (
// //             <form
// //               onSubmit={handleSubmit(onSubmit)}
// //               className="px-6 py-0 space-y-4"
// //             >
// //               <div className="flex space-x-2 mb-4">
// //                 <button
// //                   type="button"
// //                   className={`flex-1 py-2 rounded-md text-[14px] font-normal ${
// //                     activeTab === "password"
// //                       ? "bg-teal-500 text-white"
// //                       : "border border-gray-400"
// //                   }`}
// //                   onClick={() => setActiveTab("password")}
// //                 >
// //                   Login With Password
// //                 </button>
// //                 <button
// //                   type="button"
// //                   className={`flex-1 py-2 rounded-md text-[14px] font-normal ${
// //                     activeTab === "otp"
// //                       ? "bg-teal-500 text-white"
// //                       : "border border-gray-400"
// //                   }`}
// //                   onClick={() => setActiveTab("otp")}
// //                 >
// //                   Login With OTP
// //                 </button>
// //               </div>

// //               {/* Email Field */}
// //               <div className="mb-4">
// //                 <label className="block text-[16px] font-medium text-black">
// //                   Email<span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="flex mt-1 border border-[#929292] rounded-md overflow-hidden">
// //                   <Input
// //                     type="email"
// //                     placeholder="Enter Email"
// //                     {...register("email")}
// //                     className={cn(
// //                       "w-full px-3 py-4 text-sm outline-none",
// //                       errors.email ? "border-red-500" : ""
// //                     )}
// //                   />
// //                 </div>
// //                 {errors.email && (
// //                   <p className="text-red-500 text-sm mt-1">
// //                     {errors.email.message}
// //                   </p>
// //                 )}
// //               </div>

// //               {/* Password Field */}
// //               <div className="mb-4">
// //                 <label className="block text-[16px] font-medium text-black">
// //                   Password<span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative mt-1">
// //                   <Input
// //                     type={showPassword ? "text" : "password"}
// //                     placeholder="Enter Password"
// //                     {...register("password")}
// //                     className={cn(
// //                       "w-full px-3 py-4 border border-[#A2A2A2] rounded-md text-sm",
// //                       errors.password ? "border-red-500" : ""
// //                     )}
// //                   />
// //                   <span
// //                     className="absolute right-3 top-2 cursor-pointer"
// //                     onClick={() => setShowPassword(!showPassword)}
// //                   >
// //                     {showPassword ? (
// //                       <svg
// //                         width="24"
// //                         height="24"
// //                         viewBox="0 0 24 24"
// //                         fill="none"
// //                         xmlns="http://www.w3.org/2000/svg"
// //                       >
// //                         <path
// //                           d="M11.9991 8.1377C9.86813 8.1377 8.13672 9.86911 8.13672 12.0001C8.13672 14.131 9.86813 15.8624 11.9991 15.8624C14.1301 15.8624 15.8615 14.131 15.8615 12.0001C15.8615 9.86911 14.1301 8.1377 11.9991 8.1377ZM11.7061 10.8547C11.2266 10.8547 10.8271 11.2542 10.8271 11.7337H9.54848C9.57512 10.535 10.5341 9.5761 11.7061 9.5761V10.8547Z"
// //                           fill="black"
// //                         />
// //                         <path
// //                           d="M23.7203 11.201C22.4151 9.57617 17.7536 4.27539 12 4.27539C6.24639 4.27539 1.58491 9.57617 0.279689 11.201C-0.0932297 11.6539 -0.0932297 12.3198 0.279689 12.7993C1.58491 14.4241 6.24639 19.7249 12 19.7249C17.7536 19.7249 22.4151 14.4241 23.7203 12.7993C24.0932 12.3464 24.0932 11.6805 23.7203 11.201ZM12 17.5939C8.9101 17.5939 6.40622 15.09 6.40622 12.0001C6.40622 8.91024 8.9101 6.40636 12 6.40636C15.0899 6.40636 17.5938 8.91024 17.5938 12.0001C17.5938 15.09 15.0899 17.5939 12 17.5939Z"
// //                           fill="black"
// //                         />
// //                       </svg>
// //                     ) : (
// //                       <svg
// //                         xmlns="http://www.w3.org/2000/svg"
// //                         width="24"
// //                         height="24"
// //                         viewBox="0 0 24 24"
// //                         fill="none"
// //                       >
// //                         <path
// //                           d="M2 2L22 22M9.88 9.88C9.33 10.43 9 11.19 9 12C9 13.66 10.34 15 12 15C12.81 15 13.57 14.67 14.12 14.12M17.94 17.94C16.37 19.18 14.26 20 12 20C7.58 20 3.73 16.88 2 12C2.72 10.06 3.92 8.36 5.46 7.06M10.59 5.07C11.06 5.02 11.53 5 12 5C16.42 5 20.27 8.12 22 13C21.4 14.68 20.37 16.17 19.07 17.35"
// //                           stroke="black"
// //                           strokeWidth="2"
// //                           strokeLinecap="round"
// //                           strokeLinejoin="round"
// //                         />
// //                       </svg>
// //                     )}
// //                   </span>
// //                 </div>
// //                 {errors.password && (
// //                   <p className="text-red-500 text-sm mt-1">
// //                     {errors.password.message}
// //                   </p>
// //                 )}
// //                 <div
// //                   className="text-right text-[15px] text-black mt-3 font-normal cursor-pointer"
// //                   onClick={() => setShowForgot(true)}
// //                 >
// //                   Forgot Password?
// //                 </div>
// //               </div>

// //               {loginError && (
// //                 <p className="text-red-500 text-sm mt-1">{loginError}</p>
// //               )}

// //               <Button
// //                 type="submit"
// //                 disabled={isSubmitting}
// //                 className={`w-full py-3 text-[17px] rounded-md font-semibold text-white ${
// //                   !errors.email && !errors.password
// //                     ? "bg-teal-500"
// //                     : "bg-[#CACACA]"
// //                 }`}
// //               >
// //                 {isSubmitting ? "LOGGING IN..." : "LOGIN"}
// //               </Button>

// //               <p className="text-center text-[17px] font-medium mt-4">
// //                 Don't have an account?{" "}
// //                 <span
// //                   className="text-teal-500 text-[17px] cursor-pointer font-medium"
// //                   onClick={() => {
// //                     setSignUpStep("mobile");
// //                     onClose();
// //                   }}
// //                 >
// //                   Sign up Now
// //                 </span>
// //               </p>
// //             </form>
// //           ) : (
// //             // OTP Login Tab Content
// //             <div className="px-6 py-6 space-y-4">
// //               {otpStep === "mobile" ? (
// //                 <form
// //                   onSubmit={(e) => {
// //                     e.preventDefault();
// //                     setOtpMobileError("");
// //                     if (!otpMobile || otpMobile.length !== 10) {
// //                       setOtpMobileError("Enter valid mobile number");
// //                       return;
// //                     }
// //                     if (!otpCountryCode) {
// //                       setOtpMobileError("Select a country");
// //                       return;
// //                     }
// //                     setShowOtpModal(true);
// //                   }}
// //                   className="space-y-4"
// //                 >
// //                   <div className="mb-4">
// //                     <label className="block text-[16px] font-medium text-black">
// //                       Mobile Number<span className="text-red-500">*</span>
// //                     </label>
// //                     <div className="flex gap-1 mt-1">
// //                       <Popover open={openSelect} onOpenChange={setOpenSelect}>
// //                         <PopoverTrigger asChild>
// //                           <Button
// //                             type="button"
// //                             variant="outline"
// //                             role="combobox"
// //                             className={cn(
// //                               "w-24 justify-between border text-left text-xs h-7 px-1.5",
// //                               !otpCountryCode
// //                                 ? "border-red-500"
// //                                 : "border-[#929292]"
// //                             )}
// //                           >
// //                             <span className="truncate">
// //                               {otpCountryCode ? `+${otpCountryCode}` : "Select"}
// //                             </span>
// //                             <svg
// //                               width="12"
// //                               height="12"
// //                               viewBox="0 0 12 12"
// //                               fill="none"
// //                               xmlns="http://www.w3.org/2000/svg"
// //                             >
// //                               <path
// //                                 d="M2 4L6 8L10 4"
// //                                 stroke="black"
// //                                 strokeWidth="1.5"
// //                                 strokeLinecap="round"
// //                                 strokeLinejoin="round"
// //                               />
// //                             </svg>
// //                           </Button>
// //                         </PopoverTrigger>
// //                         <PopoverContent
// //                           className="w-44 p-0"
// //                           align="start"
// //                           side="bottom"
// //                           sideOffset={4}
// //                         >
// //                           <Command>
// //                             <CommandInput
// //                               placeholder="Search country..."
// //                               className="h-7 border-none focus:ring-0 text-xs"
// //                             />
// //                             <CommandList className="max-h-60 overflow-y-auto">
// //                               <CommandEmpty>No country found.</CommandEmpty>
// //                               <CommandGroup>
// //                                 {parsedCountryCodes?.map((item: any) => (
// //                                   <CommandItem
// //                                     key={item.country}
// //                                     value={`${item.code} ${item.country}`}
// //                                     onSelect={() => {
// //                                       setOtpCountryCode(item.code);
// //                                       setOpenSelect(false);
// //                                     }}
// //                                     className="cursor-pointer hover:bg-gray-100 text-xs"
// //                                   >
// //                                     <div className="flex justify-between items-center w-full">
// //                                       <span className="flex-1 text-xs">
// //                                         +{item.code} {item.country}
// //                                       </span>
// //                                       {item.code === otpCountryCode && (
// //                                         <svg
// //                                           width="12"
// //                                           height="12"
// //                                           viewBox="0 0 12 12"
// //                                           fill="none"
// //                                           xmlns="http://www.w3.org/2000/svg"
// //                                         >
// //                                           <path
// //                                             d="M2 6L5 9L10 3"
// //                                             stroke="#16A34A"
// //                                             strokeWidth="1.5"
// //                                             strokeLinecap="round"
// //                                             strokeLinejoin="round"
// //                                           />
// //                                         </svg>
// //                                       )}
// //                                     </div>
// //                                   </CommandItem>
// //                                 ))}
// //                               </CommandGroup>
// //                             </CommandList>
// //                           </Command>
// //                         </PopoverContent>
// //                       </Popover>
// //                       <Input
// //                         type="tel"
// //                         placeholder="Enter Mobile No"
// //                         value={otpMobile}
// //                         onChange={(e) =>
// //                           setOtpMobile(
// //                             e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
// //                           )
// //                         }
// //                         className={cn(
// //                           "flex-1 border h-7 text-xs px-1.5",
// //                           otpMobileError ? "border-red-500" : "border-[#929292]"
// //                         )}
// //                         maxLength={10}
// //                       />
// //                     </div>
// //                     {otpMobileError && (
// //                       <p className="text-red-500 text-sm mt-1">
// //                         {otpMobileError}
// //                       </p>
// //                     )}
// //                   </div>
// //                   <Button
// //                     type="submit"
// //                     className="w-full py-3 text-[17px] rounded-md font-semibold text-white bg-teal-500"
// //                   >
// //                     GET OTP
// //                   </Button>
// //                   <p className="text-center text-[17px] font-medium mt-4">
// //                     Don't have an account?{" "}
// //                     <span
// //                       className="text-teal-500 text-[17px] cursor-pointer font-medium"
// //                       onClick={() => {
// //                         setSignUpStep("mobile");
// //                         onClose();
// //                       }}
// //                     >
// //                       Sign up Now
// //                     </span>
// //                   </p>
// //                 </form>
// //               ) : null}
// //               <SignUpOtpModal
// //                 open={showOtpModal}
// //                 onClose={() => setShowOtpModal(false)}
// //                 mobile={otpMobile}
// //                 countryCode={otpCountryCode}
// //                 onNext={() => {
// //                   setShowOtpModal(false);
// //                   setOtpStep("mobile");
// //                   setActiveTab("password");
// //                 }}
// //                 onBack={() => setShowOtpModal(false)}
// //               />
// //             </div>
// //           )}

// //           <div className="w-full max-w-md mx-auto mt-6">
// //             <div className="relative flex items-center justify-center">
// //               <div className="w-[340px] border-t border-[#9C9C9C]"></div>
// //               <span className="absolute bg-white px-4 text-[#707070] text-[14px] font-normal">
// //                 Or Login With
// //               </span>
// //             </div>

// //             <div className="flex justify-center mt-8 mb-6">
// //               <div className="flex space-x-4">
// //                 <button
// //                   onClick={handleGoogleLogin}
// //                   className="focus:outline-none"
// //                   aria-label="Login with Google"
// //                 >
// //                   <svg
// //                     width="45"
// //                     height="45"
// //                     viewBox="0 0 45 45"
// //                     fill="none"
// //                     xmlns="http://www.w3.org/2000/svg"
// //                   >
// //                     <rect
// //                       x="0.5"
// //                       y="0.5"
// //                       width="45"
// //                       height="45"
// //                       rx="22.5"
// //                       fill="white"
// //                       stroke="#C4C4C4"
// //                     />
// //                     <path
// //                       d="M16.3189 26.1833L15.4835 29.302L12.4301 29.3666C11.5176 27.6741 11 25.7376 11 23.6798C11 21.6899 11.4839 19.8134 12.3418 18.1611H12.3424L15.0608 18.6595L16.2516 21.3616C16.0024 22.0882 15.8665 22.8682 15.8665 23.6798C15.8666 24.5607 16.0262 25.4047 16.3189 26.1833Z"
// //                       fill="#FBBB00"
// //                     />
// //                     <path
// //                       d="M34.7902 21.4375C34.928 22.1634 34.9999 22.9131 34.9999 23.6793C34.9999 24.5384 34.9095 25.3764 34.7375 26.1848C34.1533 28.9355 32.6269 31.3375 30.5124 33.0373L30.5118 33.0366L27.0878 32.8619L26.6032 29.8368C28.0063 29.014 29.1028 27.7263 29.6804 26.1848H23.2637V21.4375H34.7902Z"
// //                       fill="#518EF8"
// //                     />
// //                     <path
// //                       d="M30.5114 33.0374L30.5121 33.0381C28.4556 34.691 25.8433 35.68 22.9996 35.68C18.4297 35.68 14.4565 33.1258 12.4297 29.3669L16.3185 26.1836C17.3319 28.8882 19.9409 30.8135 22.9996 30.8135C24.3143 30.8135 25.546 30.4581 26.6029 29.8376L30.5114 33.0374Z"
// //                       fill="#28B446"
// //                     />
// //                     <path
// //                       d="M30.6596 14.4423L26.7721 17.6249C25.6783 16.9412 24.3853 16.5462 23 16.5462C19.8721 16.5462 17.2143 18.5599 16.2517 21.3614L12.3425 18.161H12.3418C14.339 14.3105 18.3622 11.6797 23 11.6797C25.9117 11.6797 28.581 12.7168 30.6596 14.4423Z"
// //                       fill="#F14336"
// //                     />
// //                   </svg>
// //                 </button>
// //                 <button
// //                   onClick={handleFacebookLogin}
// //                   className="focus:outline-none"
// //                   aria-label="Login with Facebook"
// //                 >
// //                   <svg
// //                     width="45"
// //                     height="45"
// //                     viewBox="64 0 45 45"
// //                     fill="none"
// //                     xmlns="http://www.w3.org/2000/svg"
// //                   >
// //                     <rect
// //                       x="64.1865"
// //                       y="0.5"
// //                       width="45"
// //                       height="45"
// //                       rx="22.5"
// //                       fill="white"
// //                       stroke="#C4C4C4"
// //                     />
// //                     <path
// //                       fillRule="evenodd"
// //                       clipRule="evenodd"
// //                       d="M86.6859 12.0635C88.8493 12.0882 90.8038 12.6199 92.5493 13.6587C94.2739 14.6767 95.7086 16.1201 96.716 17.8509C97.7484 19.6069 98.2769 21.5732 98.3016 23.7498C98.2402 26.7279 97.3009 29.2715 95.4836 31.3806C93.6662 33.4897 91.3387 34.7945 88.9292 35.2947V26.945H91.2072L91.7223 23.6638H88.2729V21.5146C88.2538 21.0691 88.3947 20.6314 88.6702 20.2808C88.946 19.9291 89.4318 19.7443 90.1275 19.7263H92.2104V16.852C92.1805 16.8424 91.8969 16.8043 91.3597 16.7379C90.7503 16.6666 90.1375 16.6285 89.524 16.6238C88.1355 16.6302 87.0374 17.0219 86.2296 17.7989C85.4218 18.5756 85.0092 19.6993 84.9917 21.1701V23.6638H82.3667V26.945H84.9917V35.2947C82.0332 34.7946 79.7056 33.4898 77.8883 31.3807C76.0709 29.2716 75.1316 26.7279 75.0703 23.7498C75.0948 21.5731 75.6233 19.6068 76.6558 17.8509C77.6633 16.1201 79.0979 14.6766 80.8226 13.6586C82.568 12.6201 84.5225 12.0884 86.6859 12.0635Z"
// //                       fill="#1976D2"
// //                     />
// //                   </svg>
// //                 </button>
// //                 <button
// //                   onClick={handleAppleLogin}
// //                   className="focus:outline-none"
// //                   aria-label="Login with Apple"
// //                 >
// //                   <svg
// //                     width="45"
// //                     height="45"
// //                     viewBox="121 0 45 45"
// //                     fill="none"
// //                     xmlns="http://www.w3.org/2000/svg"
// //                   >
// //                     <rect
// //                       x="121.5"
// //                       y="0.5"
// //                       width="45"
// //                       height="45"
// //                       rx="22.5"
// //                       fill="white"
// //                       stroke="#C4C4C4"
// //                     />
// //                     <path
// //                       d="M147.926 11H148.09C148.221 12.622 147.602 13.834 146.85 14.7116C146.111 15.5832 145.1 16.4286 143.465 16.3003C143.356 14.7015 143.976 13.5795 144.728 12.7038C145.425 11.8878 146.702 11.1616 147.926 11ZM152.876 27.8826V27.9281C152.417 29.3198 151.761 30.5126 150.961 31.6195C150.231 32.6244 149.336 33.9768 147.738 33.9768C146.358 33.9768 145.441 33.089 144.026 33.0648C142.529 33.0405 141.706 33.8071 140.337 34H139.871C138.866 33.8546 138.055 33.0587 137.464 32.3416C135.722 30.2227 134.375 27.4857 134.125 23.9831V22.954C134.231 20.4472 135.449 18.4091 137.068 17.4214C137.922 16.8962 139.097 16.4488 140.405 16.6488C140.966 16.7356 141.538 16.9275 142.04 17.1174C142.516 17.3002 143.111 17.6244 143.674 17.6072C144.056 17.5961 144.436 17.3971 144.821 17.2568C145.948 16.8497 147.053 16.3831 148.509 16.6023C150.259 16.8669 151.501 17.6446 152.269 18.8444C150.788 19.7867 149.618 21.2067 149.818 23.6317C149.996 25.8344 151.276 27.1231 152.876 27.8826Z"
// //                       fill="black"
// //                     />
// //                   </svg>
// //                 </button>
// //               </div>
// //             </div>
// //           </div>
// //         </DialogContent>
// //       </Dialog>
// //       {/* Sign Up Step 1: Mobile */}
// //       <SignUpMobileModal
// //         open={signUpStep === "mobile"}
// //         onClose={() => setSignUpStep(null)}
// //         onNext={(mobile: string, countryCode: string) => {
// //           setSignUpMobile(mobile);
// //           setSignUpCountryCode(countryCode);
// //           setSignUpStep("otp");
// //         }}
// //         onLoginClick={() => {
// //           setSignUpStep("login");
// //           setActiveTab("password");
// //         }}
// //         onSocialLogin={(email: string) => {
// //           setSignUpEmail(email);
// //           setSignUpStep("details");
// //         }}
// //         parsedCountryCodes={parsedCountryCodes}
// //       />
// //       {/* Sign Up Step 2: OTP */}
// //       <SignUpOtpModal
// //         open={signUpStep === "otp"}
// //         onClose={() => setSignUpStep(null)}
// //         mobile={signUpMobile}
// //         countryCode={signUpCountryCode}
// //         onNext={(otp) => {
// //           setSignUpOtp(otp);
// //           setSignUpStep("details");
// //         }}
// //         onBack={() => setSignUpStep("mobile")}
// //       />
// //       {/* Sign Up Step 3: Details */}
// //       <SignUpDetailsModal
// //         open={signUpStep === "details"}
// //         onClose={() => setSignUpStep(null)}
// //         mobile={signUpMobile}
// //         firstName={firstName}
// //         lastName={lastName}
// //         countryCode={signUpCountryCode}
// //         otp={signUpOtp}
// //         email={signUpEmail}
// //         onSuccess={() => {
// //           setSignUpStep(null);
// //           window.location.reload();
// //         }}
// //         onBack={() => setSignUpStep("otp")}
// //         parsedCountryCodes={parsedCountryCodes}
// //       />
// //       <ForgotPasswordModal
// //         open={showForgot}
// //         onClose={() => setShowForgot(false)}
// //         onLogin={() => {
// //           setSignUpStep("login");
// //           setActiveTab("password");
// //         }}
// //       />
// //     </>
// //   );
// // }
// "use client";

// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { cn } from "@/lib/utils";
// import SignUpMobileModal from "./SignUpMobileModal";
// import SignUpOtpModal from "./SignUpOtpModal";
// import SignUpDetailsModal from "./SignUpDetailsModal";
// import ForgotPasswordModal from "./forgotPasswordModal";
// import { useSession } from "next-auth/react";
// import { useRouter, useSearchParams } from "next/navigation";
// import { Login } from "@/lib/loginService";
// import { toast } from "sonner";

// // 1. Define validation schemas
// const loginSchema = z.object({
//   email: z.string().email("Enter valid email"),
//   password: z.string().min(8, "Password must be at least 8 characters"),
// });

// const otpSchema = z.object({
//   email: z.string().email("Enter valid email"),
// });

// // 2. Infer types from schemas
// type LoginFormData = z.infer<typeof loginSchema>;
// type OtpFormData = z.infer<typeof otpSchema>;

// export default function UserLoginModal({
//   open,
//   onClose,
//   parsedCountryCodes,
// }: {
//   open: boolean;
//   onClose: () => void;
//   parsedCountryCodes: any;
// }) {
//   const [showPassword, setShowPassword] = useState(false);
//   const [activeTab, setActiveTab] = useState<"password" | "otp">("password");
//   const [signUpStep, setSignUpStep] = useState<
//     null | "mobile" | "otp" | "details" | "login"
//   >(null);
//   const [signUpMobile, setSignUpMobile] = useState("");
//   const [signUpCountryCode, setSignUpCountryCode] = useState("");
//   const [signUpOtp, setSignUpOtp] = useState("");
//   const [otpEmailError, setOtpEmailError] = useState("");
//   const [showOtpModal, setShowOtpModal] = useState(false);
//   const [showForgot, setShowForgot] = useState(false);
//   const [signUpEmail, setSignUpEmail] = useState("");
//   const { data: session } = useSession();
//   const router = useRouter();
//   const searchParams = useSearchParams();
//   const [firstName, setFirstName] = useState("");
//   const [lastName, setLastName] = useState("");
//   const [loginError, setLoginError] = useState("");

//   // 3. Setup react-hook-form for password login
//   const {
//     register: registerLogin,
//     handleSubmit: handleLoginSubmit,
//     formState: { errors: loginErrors, isSubmitting: isSubmittingLogin },
//     reset: resetLogin,
//   } = useForm<LoginFormData>({
//     resolver: zodResolver(loginSchema),
//     defaultValues: {
//       email: "",
//       password: "",
//     },
//   });

//   // 4. Setup react-hook-form for OTP login
//   const {
//     register: registerOtp,
//     handleSubmit: handleOtpSubmit,
//     formState: { errors: otpErrors },
//     reset: resetOtp,
//   } = useForm<OtpFormData>({
//     resolver: zodResolver(otpSchema),
//     defaultValues: { email: "" },
//   });
//   useEffect(() => {
//     if (searchParams.get("signup") === "1" && session?.user?.email) {
//       setSignUpEmail(session.user.email);
//       setFirstName(session.user.name?.split(" ")[0] || "");
//       setLastName(session.user.name?.split(" ")[1] || "");
//       setSignUpStep("otpModal");
//       router.replace(window.location.pathname);
//     }
//   }, [searchParams, session, router]);

//   useEffect(() => {
//     if (open) {
//       resetLogin({ email: "", password: "" });
//       resetOtp({ email: "" });
//     }
//   }, [open, resetLogin, resetOtp]);

//   // 5. Password login submit handler
//   const onLoginSubmit = async (formData: LoginFormData) => {
//     try {
//       const data = {
//         identifier: loginFormData.email,
//         password: loginFormData.password,
//       };
//       const res = await Login(data);
//       if (res.error) {
//         setLoginError(res.error);
//       }
//       if (res.message) {
//         setLoginError("");
//         localStorage.setItem(
//           "userInfo",
//           JSON.stringify({
//             firstName: res.user[0][0].name,
//             lastName: res.user[0][0].last_name,
//             email: res.user[0][0].email_id,
//             mobile: res.user[0][0].mobile_no,
//           })
//         );
//         onClose();
//         window.location.reload();
//       }
//     } catch (error) {
//       console.error("Login failed:", error);
//     }
//   };

//   // 6. OTP submit handler
//   const onOtpSubmit = async (formData: OtpFormData) => {
//     setOtpEmailError("");
//     if (!formData.email) {
//       setOtpEmailError("Enter valid email");
//       return;
//     }
//     // Trigger OTP sending logic here (e.g., API call to send OTP to email)
//     setShowOtpModal(true);
//   };

//   const handleGoogleLogin = async () => {
//     // Implement Google login logic
//   };

//   const handleFacebookLogin = () => {
//     console.log("Facebook Login");
//   };

//   const handleAppleLogin = () => {
//     console.log("Apple Login");
//   };

//   return (
//     <>
//       <Dialog open={open || signUpStep === "login"} onOpenChange={onClose}>
//         <DialogContent className="w-full max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
//           <DialogHeader>
//             <DialogTitle className="sr-only">Login</DialogTitle>
//           </DialogHeader>
//           {/* Header with background image */}
//           <div className="relative w-full h-[234px] -mt-[59px] overflow-hidden">
//             <div
//               className="w-full h-[230px] bg-contain bg-no-repeat"
//               style={{
//                 backgroundImage: "url('/login.jpg')",
//                 backgroundPosition: "40% center",
//               }}
//             >
//               <div className="w-full flex justify-start overflow-visible">
//                 <div
//                   className="w-[490px] h-[200px] bg-no-repeat bg-contain bg-left"
//                   style={{ backgroundImage: "url('/loginleft.png')" }}
//                 ></div>
//               </div>
//             </div>
//             <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
//               <h2 className="text-[25px] font-semibold text-black">Login</h2>
//             </div>
//           </div>

//           {/* Tab Content */}
//           <div className="px-6 py-0 space-y-3">
//             {/* Tab Buttons */}
//             <div className="flex space-x-2 mb-1">
//               <button
//                 type="button"
//                 className={`flex-1 py-1.5 rounded-md text-[13px] font-normal ${
//                   activeTab === "password"
//                     ? "bg-teal-500 text-white"
//                     : "border border-gray-400"
//                 }`}
//                 onClick={() => setActiveTab("password")}
//               >
//                 Login With Password
//               </button>
//               <button
//                 type="button"
//                 className={`flex-1 py-1.5 rounded-md text-[13px] font-normal ${
//                   activeTab === "otp"
//                     ? "bg-teal-500 text-white"
//                     : "border border-gray-400"
//                 }`}
//                 onClick={() => setActiveTab("otp")}
//               >
//                 Login With OTP
//               </button>
//             </div>

//             {activeTab === "password" ? (
//               <form
//                 onSubmit={handleLoginSubmit(onLoginSubmit)}
//                 className="space-y-3"
//               >
//                 {/* Email Field */}
//                 <div className="mb-3">
//                   <label className="block text-[14px] font-medium text-black">
//                     Email<span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex mt-0.5 border border-[#929292] rounded-md overflow-hidden">
//                     <Input
//                       type="email"
//                       placeholder="Enter Email"
//                       {...registerLogin("email")}
//                       className={cn(
//                         "w-full px-2 py-2 text-sm outline-none",
//                         loginErrors.email ? "border-red-500" : ""
//                       )}
//                     />
//                   </div>
//                   {loginErrors.email && (
//                     <p className="text-red-500 text-xs mt-0.5">
//                       {loginErrors.email.message}
//                     </p>
//                   )}
//                 </div>

//                 {/* Password Field */}
//                 <div className="mb-1">
//                   <label className="block text-[14px] font-medium text-black">
//                     Password<span className="text-red-500">*</span>
//                   </label>
//                   <div className="relative mt-0.5">
//                     <Input
//                       type={showPassword ? "text" : "password"}
//                       placeholder="Enter Password"
//                       {...registerLogin("password")}
//                       className={cn(
//                         "w-full px-2 py-2 border border-[#A2A2A2] rounded-md text-sm",
//                         loginErrors.password ? "border-red-500" : ""
//                       )}
//                     />
//                     <span
//                       className="absolute right-2 top-2 cursor-pointer"
//                       onClick={() => setShowPassword(!showPassword)}
//                     >
//                       {showPassword ? (
//                         <svg
//                           width="20"
//                           height="20"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                           xmlns="http://www.w3.org/2000/svg"
//                         >
//                           <path
//                             d="M11.9991 8.1377C9.86813 8.1377 8.13672 9.86911 8.13672 12.0001C8.13672 14.131 9.86813 15.8624 11.9991 15.8624C14.1301 15.8624 15.8615 14.131 15.8615 12.0001C15.8615 9.86911 14.1301 8.1377 11.9991 8.1377ZM11.7061 10.8547C11.2266 10.8547 10.8271 11.2542 10.8271 11.7337H9.54848C9.57512 10.535 10.5341 9.5761 11.7061 9.5761V10.8547Z"
//                             fill="black"
//                           />
//                           <path
//                             d="M23.7203 11.201C22.4151 9.57617 17.7536 4.27539 12 4.27539C6.24639 4.27539 1.58491 9.57617 0.279689 11.201C-0.0932297 11.6539 -0.0932297 12.3198 0.279689 12.7993C1.58491 14.4241 6.24639 19.7249 12 19.7249C17.7536 19.7249 22.4151 14.4241 23.7203 12.7993C24.0932 12.3464 24.0932 11.6805 23.7203 11.201ZM12 17.5939C8.9101 17.5939 6.40622 15.09 6.40622 12.0001C6.40622 8.91024 8.9101 6.40636 12 6.40636C15.0899 6.40636 17.5938 8.91024 17.5938 12.0001C17.5938 15.09 15.0899 17.5939 12 17.5939Z"
//                             fill="black"
//                           />
//                         </svg>
//                       ) : (
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           width="20"
//                           height="20"
//                           viewBox="0 0 24 24"
//                           fill="none"
//                         >
//                           <path
//                             d="M2 2L22 22M9.88 9.88C9.33 10.43 9 11.19 9 12C9 13.66 10.34 15 12 15C12.81 15 13.57 14.67 14.12 14.12M17.94 17.94C16.37 19.18 14.26 20 12 20C7.58 20 3.73 16.88 2 12C2.72 10.06 3.92 8.36 5.46 7.06M10.59 5.07C11.06 5.02 11.53 5 12 5C16.42 5 20.27 8.12 22 13C21.4 14.68 20.37 16.17 19.07 17.35"
//                             stroke="black"
//                             strokeWidth="2"
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                           />
//                         </svg>
//                       )}
//                     </span>
//                   </div>
//                   {loginErrors.password && (
//                     <p className="text-red-500 text-xs mt-0.5">
//                       {loginErrors.password.message}
//                     </p>
//                   )}
//                   <div
//                     className="text-right text-[13px] text-black mt-2 font-normal cursor-pointer"
//                     onClick={() => setShowForgot(true)}
//                   >
//                     Forgot Password?
//                   </div>
//                 </div>

//                 {loginError && (
//                   <p className="text-red-500 text-xs mt-0.5">{loginError}</p>
//                 )}

//                 <Button
//                   type="submit"
//                   disabled={isSubmittingLogin}
//                   className={`w-full py-2 text-[15px] rounded-md font-semibold text-white ${
//                     !loginErrors.email && !loginErrors.password
//                       ? "bg-teal-500"
//                       : "bg-[#CACACA]"
//                   }`}
//                 >
//                   {isSubmittingLogin ? "LOGGING IN..." : "LOGIN"}
//                 </Button>

//                 <p className="text-center text-[15px] font-medium mt-3">
//                   Don't have an account?{" "}
//                   <span
//                     className="text-teal-500 text-[15px] cursor-pointer font-medium"
//                     onClick={() => {
//                       setSignUpStep("mobile");
//                       onClose();
//                     }}
//                   >
//                     Sign up Now
//                   </span>
//                 </p>
//               </form>
//             ) : (
//               <form
//                 onSubmit={handleOtpSubmit(onOtpSubmit)}
//                 className="space-y-3"
//               >
//                 {/* Email Field for OTP */}
//                 <div className="mb-3">
//                   <label className="block text-[14px] font-medium text-black">
//                     Email<span className="text-red-500">*</span>
//                   </label>
//                   <div className="flex mt-0.5 border border-[#929292] rounded-md overflow-hidden">
//                     <Input
//                       type="email"
//                       placeholder="Enter Email"
//                       {...registerOtp("email")}
//                       className={cn(
//                         "w-full px-2 py-2 text-sm outline-none",
//                         otpErrors.email || otpEmailError ? "border-red-500" : ""
//                       )}
//                     />
//                   </div>
//                   {(otpErrors.email || otpEmailError) && (
//                     <p className="text-red-500 text-xs mt-0.5">
//                       {otpErrors.email?.message || otpEmailError}
//                     </p>
//                   )}
//                 </div>

//                 <Button
//                   type="submit"
//                   className="w-full py-2 text-[15px] rounded-md font-semibold text-white bg-teal-500"
//                 >
//                   GET OTP
//                 </Button>

//                 <p className="text-center text-[15px] font-medium ">
//                   Don't have an account?{" "}
//                   <span
//                     className="text-teal-500 text-[15px] cursor-pointer font-medium"
//                     onClick={() => {
//                       setSignUpStep("mobile");
//                       onClose();
//                     }}
//                   >
//                     Sign up Now
//                   </span>
//                 </p>
//               </form>
//             )}
//           </div>

//           <div className="w-full max-w-md mx-auto mt-1 mb-3">
//             <div className="relative flex items-center justify-center">
//               <div className="w-[340px] border-t border-[#9C9C9C]"></div>
//               <span className="absolute bg-white px-4 text-[#707070] text-[13px] font-normal">
//                 Or Login With
//               </span>
//             </div>

//             <div className="flex justify-center mt-4 ">
//               <div className="flex space-x-3">
//                 <button
//                   onClick={handleGoogleLogin}
//                   className="focus:outline-none"
//                   aria-label="Login with Google"
//                 >
//                   <svg
//                     width="40"
//                     height="40"
//                     viewBox="0 0 45 45"
//                     fill="none"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <rect
//                       x="0.5"
//                       y="0.5"
//                       width="45"
//                       height="45"
//                       rx="22.5"
//                       fill="white"
//                       stroke="#C4C4C4"
//                     />
//                     <path
//                       d="M16.3189 26.1833L15.4835 29.302L12.4301 29.3666C11.5176 27.6741 11 25.7376 11 23.6798C11 21.6899 11.4839 19.8134 12.3418 18.1611H12.3424L15.0608 18.6595L16.2516 21.3616C16.0024 22.0882 15.8665 22.8682 15.8665 23.6798C15.8666 24.5607 16.0262 25.4047 16.3189 26.1833Z"
//                       fill="#FBBB00"
//                     />
//                     <path
//                       d="M34.7902 21.4375C34.928 22.1634 34.9999 22.9131 34.9999 23.6793C34.9999 24.5384 34.9095 25.3764 34.7375 26.1848C34.1533 28.9355 32.6269 31.3375 30.5124 33.0373L30.5118 33.0366L27.0878 32.8619L26.6032 29.8368C28.0063 29.014 29.1028 27.7263 29.6804 26.1848H23.2637V21.4375H34.7902Z"
//                       fill="#518EF8"
//                     />
//                     <path
//                       d="M30.5114 33.0374L30.5121 33.0381C28.4556 34.691 25.8433 35.68 22.9996 35.68C18.4297 35.68 14.4565 33.1258 12.4297 29.3669L16.3185 26.1836C17.3319 28.8882 19.9409 30.8135 22.9996 30.8135C24.3143 30.8135 25.546 30.4581 26.6029 29.8376L30.5114 33.0374Z"
//                       fill="#28B446"
//                     />
//                     <path
//                       d="M30.6596 14.4423L26.7721 17.6249C25.6783 16.9412 24.3853 16.5462 23 16.5462C19.8721 16.5462 17.2143 18.5599 16.2517 21.3614L12.3425 18.161H12.3418C14.339 14.3105 18.3622 11.6797 23 11.6797C25.9117 11.6797 28.581 12.7168 30.6596 14.4423Z"
//                       fill="#F14336"
//                     />
//                   </svg>
//                 </button>
//                 <button
//                   onClick={handleFacebookLogin}
//                   className="focus:outline-none"
//                   aria-label="Login with Facebook"
//                 >
//                   <svg
//                     width="40"
//                     height="40"
//                     viewBox="64 0 45 45"
//                     fill="none"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <rect
//                       x="64.1865"
//                       y="0.5"
//                       width="45"
//                       height="45"
//                       rx="22.5"
//                       fill="white"
//                       stroke="#C4C4C4"
//                     />
//                     <path
//                       fillRule="evenodd"
//                       clipRule="evenodd"
//                       d="M86.6859 12.0635C88.8493 12.0882 90.8038 12.6199 92.5493 13.6587C94.2739 14.6767 95.7086 16.1201 96.716 17.8509C97.7484 19.6069 98.2769 21.5732 98.3016 23.7498C98.2402 26.7279 97.3009 29.2715 95.4836 31.3806C93.6662 33.4897 91.3387 34.7945 88.9292 35.2947V26.945H91.2072L91.7223 23.6638H88.2729V21.5146C88.2538 21.0691 88.3947 20.6314 88.6702 20.2808C88.946 19.9291 89.4318 19.7443 90.1275 19.7263H92.2104V16.852C92.1805 16.8424 91.8969 16.8043 91.3597 16.7379C90.7503 16.6666 90.1375 16.6285 89.524 16.6238C88.1355 16.6302 87.0374 17.0219 86.2296 17.7989C85.4218 18.5756 85.0092 19.6993 84.9917 21.1701V23.6638H82.3667V26.945H84.9917V35.2947C82.0332 34.7946 79.7056 33.4898 77.8883 31.3807C76.0709 29.2716 75.1316 26.7279 75.0703 23.7498C75.0948 21.5731 75.6233 19.6068 76.6558 17.8509C77.6633 16.1201 79.0979 14.6766 80.8226 13.6586C82.568 12.6201 84.5225 12.0884 86.6859 12.0635Z"
//                       fill="#1976D2"
//                     />
//                   </svg>
//                 </button>
//                 <button
//                   onClick={handleAppleLogin}
//                   className="focus:outline-none"
//                   aria-label="Login with Apple"
//                 >
//                   <svg
//                     width="40"
//                     height="40"
//                     viewBox="121 0 45 45"
//                     fill="none"
//                     xmlns="http://www.w3.org/2000/svg"
//                   >
//                     <rect
//                       x="121.5"
//                       y="0.5"
//                       width="45"
//                       height="45"
//                       rx="22.5"
//                       fill="white"
//                       stroke="#C4C4C4"
//                     />
//                     <path
//                       d="M147.926 11H148.09C148.221 12.622 147.602 13.834 146.85 14.7116C146.111 15.5832 145.1 16.4286 143.465 16.3003C143.356 14.7015 143.976 13.5795 144.728 12.7038C145.425 11.8878 146.702 11.1616 147.926 11ZM152.876 27.8826V27.9281C152.417 29.3198 151.761 30.5126 150.961 31.6195C150.231 32.6244 149.336 33.9768 147.738 33.9768C146.358 33.9768 145.441 33.089 144.026 33.0648C142.529 33.0405 141.706 33.8071 140.337 34H139.871C138.866 33.8546 138.055 33.0587 137.464 32.3416C135.722 30.2227 134.375 27.4857 134.125 23.9831V22.954C134.231 20.4472 135.449 18.4091 137.068 17.4214C137.922 16.8962 139.097 16.4488 140.405 16.6488C140.966 16.7356 141.538 16.9275 142.04 17.1174C142.516 17.3002 143.111 17.6244 143.674 17.6072C144.056 17.5961 144.436 17.3971 144.821 17.2568C145.948 16.8497 147.053 16.3831 148.509 16.6023C150.259 16.8669 151.501 17.6446 152.269 18.8444C150.788 19.7867 149.618 21.2067 149.818 23.6317C149.996 25.8344 151.276 27.1231 152.876 27.8826Z"
//                       fill="black"
//                     />
//                   </svg>
//                 </button>
//               </div>
//             </div>
//           </div>
//         </DialogContent>
//       </Dialog>
//       {/* Sign Up Step 1: Mobile */}
//       <SignUpMobileModal
//         open={signUpStep === "mobile"}
//         onClose={() => setSignUpStep(null)}
//         onNext={(mobile: string, countryCode: string) => {
//           setSignUpMobile(mobile);
//           setSignUpCountryCode(countryCode);
//           setSignUpStep("otp");
//         }}
//         onLoginClick={() => {
//           setSignUpStep("login");
//           setActiveTab("password");
//         }}
//         onSocialLogin={(email: string) => {
//           setSignUpEmail(email);
//           setSignUpStep("details");
//         }}
//         parsedCountryCodes={parsedCountryCodes}
//       />
//       {/* Sign Up Step 2: OTP */}
//       <SignUpOtpModal
//         open={signUpStep === "otp" || showOtpModal}
//         onClose={() => {
//           setShowOtpModal(false);
//           setSignUpStep(null);
//         }}
//         mobile={signUpMobile}
//         countryCode={signUpCountryCode}
//         email={showOtpModal ? otpErrors.email?.ref?.value : signUpEmail}
//         onNext={() => {
//           setShowOtpModal(false);
//           setSignUpStep("details");
//           setActiveTab("password");
//         }}
//         onBack={() => {
//           setShowOtpModal(false);
//           setSignUpStep("mobile");
//         }}
//       />
//       {/* Sign Up Step 3: Details */}
//       <SignUpDetailsModal
//         open={signUpStep === "details"}
//         onClose={() => setSignUpStep(null)}
//         mobile={signUpMobile}
//         firstName={firstName}
//         lastName={lastName}
//         countryCode={signUpCountryCode}
//         otp={signUpOtp}
//         email={signUpEmail}
//         onSuccess={() => {
//           setSignUpStep(null);
//           window.location.reload();
//         }}
//         onBack={() => setSignUpStep("otp")}
//         parsedCountryCodes={parsedCountryCodes}
//       />
//       <ForgotPasswordModal
//         open={showForgot}
//         onClose={() => setShowForgot(false)}
//         onLogin={() => {
//           setSignUpStep("login");
//           setActiveTab("password");
//         }}
//       />
//     </>
//   );
// }
