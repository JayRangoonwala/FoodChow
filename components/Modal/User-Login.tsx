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
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { ChevronsUpDown, Check, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import Image from "next/image";
import SignUpMobileModal from "./SignUpMobileModal";
import SignUpOtpModal from "./SignUpOtpModal";
import SignUpDetailsModal from "./SignUpDetailsModal";
import ForgotPasswordModal from "./forgotPasswordModal";
import { useSession } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Login } from "@/lib/loginService";
import { toast } from "sonner";

// 1. Define validation schema
const loginSchema = z.object({
  email: z.string().email("Enter valid email"),
  password: z.string().min(8, "Password must be at least 8 characters"),
});

// 2. Infer types from schema
type LoginFormData = z.infer<typeof loginSchema>;

export default function UserLoginModal({
  open,
  onClose,
  parsedCountryCodes,
}: {
  open: boolean;
  onClose: () => void;
  parsedCountryCodes: any;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [openSelect, setOpenSelect] = useState(false);
  const [activeTab, setActiveTab] = useState<"password" | "otp">("password");
  // Sign up modal state
  const [signUpStep, setSignUpStep] = useState<
    null | "mobile" | "otp" | "details" | "login"
  >(null);
  const [signUpMobile, setSignUpMobile] = useState("");
  const [signUpCountryCode, setSignUpCountryCode] = useState("");
  const [signUpOtp, setSignUpOtp] = useState("");
  const [otpStep, setOtpStep] = useState<"mobile" | "otp">("mobile");
  const [otpMobile, setOtpMobile] = useState("");
  const [otpCountryCode, setOtpCountryCode] = useState(
    parsedCountryCodes?.[0]?.code || ""
  );
  const [otpMobileError, setOtpMobileError] = useState("");
  const [otpCode, setOtpCode] = useState(["", "", "", "", "", ""]);
  const [otpError, setOtpError] = useState("");
  const [showOtpModal, setShowOtpModal] = useState(false);
  const [showForgot, setShowForgot] = useState(false);
  const [signUpEmail, setSignUpEmail] = useState("");
  const { data: session } = useSession();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [loginError, setLoginError] = useState("");

  // 3. Setup react-hook-form
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    reset
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  // const countryCode = watch("country_code");

  // // 4. Persist selected country
  // useEffect(() => {
  //   const stored = localStorage.getItem("xCountryCode");
  //   if (stored) {
  //     setValue("country_code", stored);
  //     clearErrors("country_code");
  //   }
  // }, [setValue, clearErrors]);

  useEffect(() => {
    if (searchParams.get("signup") === "1" && session?.user?.email) {
      setSignUpEmail(session.user.email);
      setFirstName(session.user.name?.split(" ")[0] || "");
      setLastName(session.user.name?.split(" ")[1] || "");
      setSignUpStep("details");
      // Remove the query param for a clean URL
      router.replace(window.location.pathname);
    }
  }, [searchParams, session, router]); 

  // useEffect(() => {
  //   if (countryCode) {
  //     localStorage.setItem("xCountryCode", countryCode);
  //   }
  // }, [countryCode]);

  // const selectedCountry = parsedCountryCodes?.find(
  //   (item: any) => item.code === countryCode
  // );
  useEffect(() => {
    if(open){
      reset({email:"", password:""})
    }
  }, [open, reset])

  // 5. Submit handler
  const onSubmit = async (formData: LoginFormData) => {
    try {

      const data = {
        identifier : formData.email,
        password : formData.password,
      }
      const res = await Login(data);
      if(res.error){
        setLoginError(res.error);
      }
      if(res.message){
        setLoginError("");

        localStorage.setItem("userInfo", JSON.stringify({
          firstName: res.user[0][0].name,
          lastName: res.user[0][0].last_name,
          email: res.user[0][0].email_id,
          mobile: res.user[0][0].mobile_no,
        }));
        onClose();
        window.location.reload();
        // window.location.href = "/final-checkout";
      }
      // Handle actual login logic here
      // Example: await loginUser(data);
      // onClose(); // Close modal on success
    } catch (error) {
      console.error("Login failed:", error);
      // Handle error (show toast, etc.)
    }
  };

  const handleGoogleLogin = async () => {
    // const data = {
    //   identifier: session?.user?.email,
    // }
    // const res = await Login();
    
  };

  const handleFacebookLogin = () => {
    console.log("Facebook Login");
  };

  const handleAppleLogin = () => {
    console.log("Apple Login");
  };

  return (
    <>
      <Dialog open={open || signUpStep === "login"} onOpenChange={onClose}>
        <DialogContent className="max-w-xs w-sm rounded-xl p-3 box-content overflow-hidden">
          <DialogHeader>
            <DialogTitle className="sr-only">Login</DialogTitle>
          </DialogHeader>
          {/* Header with close button */}
          <div className="relative bg-[#dff3f4] px-1.5 py-2 text-center rounded-t-xl">
            <h2 className="text-lg font-semibold text-gray-800">Log in</h2>
            {/* Tab Switcher */}
            <div className="flex mt-1 gap-1 justify-center">
              <button
                className={`flex-1 py-1.5 rounded-l-lg border font-medium text-xs ${
                  activeTab === "password"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
                onClick={() => setActiveTab("password")}
                type="button"
              >
                Login With Password
              </button>
              <button
                className={`flex-1 py-1.5 rounded-r-lg border font-medium text-xs ${
                  activeTab === "otp"
                    ? "bg-primary text-white"
                    : "bg-white text-gray-700 border-gray-300"
                }`}
                onClick={() => setActiveTab("otp")}
                type="button"
              >
                Login With OTP
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "password" ? (
            <form
              onSubmit={handleSubmit(onSubmit)}
              className="space-y-2 mt-2 px-1"
            >
              {/* Mobile Field */}
              <div>
                <label className="text-xs font-medium">Email</label>
                <div className="relative mt-0.5">
                  <Input
                    type="email"
                    placeholder="Enter Email"
                    {...register("email")}
                    className={cn(
                      "pr-8 border h-7 text-xs px-1.5 py-1",
                      errors.email ? "border-red-500" : "border-gray-300"
                    )}
                  />
                </div>
                {errors.email && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {errors.email.message}
                  </p>
                )}
              </div>

              {/* Password Field */}
              <div>
                <label className="text-xs font-medium">Password</label>
                <div className="relative mt-0.5">
                  <Input
                    type={showPassword ? "text" : "password"}
                    placeholder="Enter Password"
                    {...register("password")}
                    className={cn(
                      "pr-8 border h-7 text-xs px-1.5 py-1",
                      errors.password ? "border-red-500" : "border-gray-300"
                    )}
                  />
                  <button
                    type="button"
                    className="absolute right-2 top-1 text-gray-500 hover:text-gray-700"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
                {errors.password && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {errors.password.message}
                  </p>
                )}
                <div className="text-right text-xs mt-0.5 text-gray-600 hover:underline cursor-pointer" onClick={() => setShowForgot(true)}>Forgot Password?</div>
              </div>

                {loginError && (
                  <p className="text-xs text-red-600 mt-0.5">
                    {loginError}
                  </p>
                )}

              <Button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-primary hover:bg-primary/90 text-white disabled:opacity-50 h-7 text-xs rounded-lg"
              >
                {isSubmitting ? "LOGGING IN..." : "LOGIN"}
              </Button>

              <p className="text-center text-xs">
                Don't have an account?{" "}
                <span
                  className="text-primary hover:underline cursor-pointer"
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
            // OTP Login Tab Content (inline, not modal)
            <div className="mt-2 px-1">
              {otpStep === "mobile" ? (
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    setOtpMobileError("");
                    if (!otpMobile || otpMobile.length !== 10) {
                      setOtpMobileError("Enter valid mobile number");
                      return;
                    }
                    if (!otpCountryCode) {
                      setOtpMobileError("Select a country");
                      return;
                    }
                    setShowOtpModal(true);
                  }}
                  className="space-y-2"
                >
                  <label className="text-xs font-medium">Mobile Number</label>
                  <div className="flex gap-1 mt-0.5">
                    <Popover open={openSelect} onOpenChange={setOpenSelect}>
                      <PopoverTrigger asChild>
                        <Button
                          type="button"
                          variant="outline"
                          role="combobox"
                          className={cn(
                            "w-24 justify-between border text-left text-xs h-7 px-1.5",
                            !otpCountryCode
                              ? "border-red-500"
                              : "border-gray-300"
                          )}
                        >
                          <span className="truncate">
                            {otpCountryCode ? `+${otpCountryCode}` : "Select"}
                          </span>
                          <ChevronsUpDown className="w-3 h-3 opacity-50 ml-1 flex-shrink-0" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent
                        className="w-44 p-0"
                        align="start"
                        side="bottom"
                        sideOffset={4}
                      >
                        <Command>
                          <CommandInput
                            placeholder="Search country..."
                            className="h-7 border-none focus:ring-0 text-xs"
                          />
                          <CommandList className="max-h-60 overflow-y-auto">
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {parsedCountryCodes?.map((item: any) => (
                                <CommandItem
                                  key={item.country}
                                  value={`${item.code} ${item.country}`}
                                  onSelect={() => {
                                    setOtpCountryCode(item.code);
                                    setOpenSelect(false);
                                  }}
                                  className="cursor-pointer hover:bg-gray-100 text-xs"
                                >
                                  <div className="flex justify-between items-center w-full">
                                    <span className="flex-1 text-xs">
                                      +{item.code} {item.country}
                                    </span>
                                    {item.code === otpCountryCode && (
                                      <Check className="w-3 h-3 text-green-600 ml-2 flex-shrink-0" />
                                    )}
                                  </div>
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                    <Input
                      type="tel"
                      placeholder="Enter Mobile No"
                      value={otpMobile}
                      onChange={(e) =>
                        setOtpMobile(
                          e.target.value.replace(/[^0-9]/g, "").slice(0, 10)
                        )
                      }
                      className={cn(
                        "flex-1 border h-7 text-xs px-1.5",
                        otpMobileError ? "border-red-500" : "border-gray-300"
                      )}
                      maxLength={10}
                    />
                  </div>
                  {otpMobileError && (
                    <p className="text-xs text-red-600 mt-0.5">
                      {otpMobileError}
                    </p>
                  )}
                  <Button
                    type="submit"
                    className="w-full bg-primary text-white h-7 text-xs rounded-lg"
                  >
                    GET OTP
                  </Button>
                  <p className="text-center text-xs">
                    Don't have an account?{" "}
                    <span
                      className="text-primary hover:underline cursor-pointer"
                      onClick={() => {
                        setSignUpStep("mobile");
                        onClose();
                      }}
                    >
                      Sign up Now
                    </span>
                  </p>
                </form>
              ) : null}
              <SignUpOtpModal
                open={showOtpModal}
                onClose={() => setShowOtpModal(false)}
                mobile={otpMobile}
                countryCode={otpCountryCode}
                onNext={() => {
                  setShowOtpModal(false);
                  setOtpStep("mobile");
                  setActiveTab("password");
                  // You can handle successful OTP login here
                }}
                onBack={() => setShowOtpModal(false)}
              />
            </div>
          )}

          <div className="relative flex items-center justify-center mt-3">
            <div className="border-t border-gray-300 absolute w-full"></div>
            <div className="bg-white px-2 relative text-xs text-gray-500">
              Or Login With
            </div>
          </div>
          <div className="flex justify-center gap-2 mb-3">
            <Button
              variant="outline"
              className="w-8 h-8 border-gray-300 rounded-full p-0.5 hover:bg-gray-100"
              onClick={handleGoogleLogin}
            >
              <Image
                src="/google.svg"
                alt="Google"
                width={20}
                height={20}
                className="p-0.5 hover:cursor-pointer transition-colors"
              />
            </Button>
            <Button
              variant="outline"
              className="w-8 h-8 border-gray-300 rounded-full p-0.5 hover:bg-gray-100"
              onClick={handleFacebookLogin}
            >
              <Image
                src="/facebook.svg"
                alt="Facebook"
                width={20}
                height={20}
                className="p-0.5 hover:cursor-pointer hover:border-gray-400 transition-colors"
              />
            </Button>
            <Button
              variant="outline"
              className="w-8 h-8 border-gray-300 rounded-full p-0.5 hover:bg-gray-100"
              onClick={handleAppleLogin}
            >
              <Image
                src="/apple.svg"
                alt="Apple"
                width={20}
                height={20}
                className="p-0.5 hover:cursor-pointer hover:border-gray-400 transition-colors"
              />
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      {/* Sign Up Step 1: Mobile */}
      <SignUpMobileModal
        open={signUpStep === "mobile"}
        onClose={() => setSignUpStep(null)}
        onNext={(mobile: string, countryCode: string) => {
          setSignUpMobile(mobile);
          setSignUpCountryCode(countryCode);
          setSignUpStep("otp");
        }}
        onLoginClick={() => {
          setSignUpStep("login");
          setActiveTab("password");
        }}
        onSocialLogin={(email:string) => {
          setSignUpEmail(email)
          setSignUpStep("details"); 
        }}
        parsedCountryCodes={parsedCountryCodes}
      />
      {/* Sign Up Step 2: OTP */}
      <SignUpOtpModal
        open={signUpStep === "otp"}
        onClose={() => setSignUpStep(null)}
        mobile={signUpMobile}
        countryCode={signUpCountryCode}
        onNext={(otp) => {
          setSignUpOtp(otp);
          setSignUpStep("details");
        }}
        onBack={() => setSignUpStep("mobile")}
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
          // Optionally, show a success message or auto-login
        }}
        onBack={() => setSignUpStep("otp")}
        parsedCountryCodes={parsedCountryCodes}
      />
      <ForgotPasswordModal open={showForgot} onClose={() => setShowForgot(false)} onLogin={() => {
        setSignUpStep("login");
        setActiveTab("password");
      }} />
    </>
  );
}
