"use client";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSession } from "next-auth/react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import Image from "next/image";
import { signIn } from "next-auth/react";
import { useLoginStore } from "@/store/loginStore";
import { ForgotPassword } from "@/lib/loginService";
import { set } from "date-fns";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

const signUpEmailSchema = z.object({
  email: z
    .string()
    .email("Please enter a valid email address.")
    .min(1, "Email is required."),
});
type SignUpEmailFormData = z.infer<typeof signUpEmailSchema>;

export default function SignUpMobileModal({
  open,
  onClose,
  onNext,
  onLoginClick,
  parsedCountryCodes,
  onSocialLogin,
}: {
  open: boolean;
  onClose: () => void;
  onNext: (email: string) => void;
  onLoginClick: () => void;
  parsedCountryCodes: any;
  onSocialLogin?: (email: string) => void;
}) {
  const [pendingGoogleLogin, setPendingGoogleLogin] = useState(false);
  const { data: session } = useSession();
  const [isLogin, setIsLogin] = useState(false);
  const isLoginModalOpen = useLoginStore((state) => state.isLoginModalOpen);
  const setIsLoginModalOpen = useLoginStore(
    (state) => state.setIsLoginModalOpen
  );
  const [errorMessage, setErrorMessage] = useState("");

  const form = useForm<SignUpEmailFormData>({
    resolver: zodResolver(signUpEmailSchema),
    defaultValues: {
      email: "",
    },
  });

  useEffect(() => {
    if (pendingGoogleLogin && session?.user?.email) {
      onSocialLogin?.(session.user.email);
      setPendingGoogleLogin(false);
    }
  }, [session, onSocialLogin]);

  const onSubmit = async (data: SignUpEmailFormData) => {
    const response = await ForgotPassword(data.email);
    if (JSON.parse(response.mvcResponse).response_code === "1") {
      onNext(data.email);
    } else {
      setErrorMessage("Something went wrong. Please try again.");
    }
  };

  const handleGoogleLogin = async () => {
    try {
      setPendingGoogleLogin(true);
      await signIn("google", {
        callbackUrl: `${window.location.pathname}?signup=1`,
      });
    } catch (error) {
      console.error("Google login failed:", error);
      setPendingGoogleLogin(false);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      setPendingGoogleLogin(true);
      await signIn("facebook", {
        callbackUrl: `${window.location.pathname}?signup=1`,
      });
    } catch (error) {
      console.error("Facebook login failed:", error);
      setPendingGoogleLogin(false);
    }
  };

  // const handleGoogleLogin = async () => {
  //   try {
  //     setPendingGoogleLogin(true);
  //     await signIn("google", {
  //       callbackUrl: `${window.location.pathname}?signup=1`,
  //     });
  //   } catch (error) {
  //     console.error("Google login failed:", error);
  //     setPendingGoogleLogin(false);
  //   }
  // };

  // const handleFacebookLogin = async () => {
  //   try {
  //     setPendingGoogleLogin(true);
  //     await signIn("facebook", {
  //       callbackUrl: `${window.location.pathname}?signup=1`,
  //     });
  //   } catch (error) {
  //     console.error("Facebook login failed:", error);
  //     setPendingGoogleLogin(false);
  //   }
  // };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
        {/* Header */}
        <DialogTitle>
        <VisuallyHidden>OTP Verification</VisuallyHidden> 
      </DialogTitle>
        
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
            <h2 className="text-[25px] font-semibold text-black">Sign up</h2>
          </div>
        </div>

        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="px-6 pb-8 mt-5 space-y-4"
          >
            {/* Email Field */}
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="block text-[16px] font-medium text-[#000000] mb-1">
                    Email <span className="text-red-500">*</span>
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter Email"
                      {...field}
                      className={cn(
                        "w-full border font-normal text-[#606060] border-[#929292] rounded-md px-3 py-3 text-[14px] outline-none",
                        form.formState.errors.email ? "border-red-500" : ""
                      )}
                    />
                  </FormControl>
                  {form.formState.errors.email && (
                    <FormMessage className="text-red-500 text-xs mt-1">
                      {form.formState.errors.email.message}
                    </FormMessage>
                  )}
                  {errorMessage && (
                    <FormMessage className="text-red-500 text-xs mt-1">
                      {errorMessage}
                    </FormMessage>
                  )}
                </FormItem>
              )}
            />

            {/* Submit Button */}
            <Button
              type="submit"
              className={cn(
                "w-full mt-[60px] text-[17px] text-white font-semibold py-3 rounded-md flex items-center justify-center",
                form.formState.isValid ? "bg-teal-500" : "bg-[#CACACA]"
              )}
              disabled={!form.formState.isValid}
            >
              GET OTP
            </Button>

            <p className="text-center text-[17px] font-medium text-black mt-4">
              Already have an account?{" "}
              <span
                className="text-[#00C2CB] text-[17px] font-medium cursor-pointer"
                onClick={() => {
                  onClose();
                  setIsLoginModalOpen(true);
                }}
              >
                Log in here
              </span>
            </p>
          </form>
        </Form>

        <div className="relative flex items-center justify-center my-0">
          <div className="border-t border-gray-300 absolute w-full"></div>
          <div className="bg-white px-2 relative text-xs text-gray-500 z-10">
            Or Sign Up With
          </div>
        </div>

        <div className="flex justify-center mb-3 ">
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
      </DialogContent>
    </Dialog>
  );
}

// import { useEffect, useState } from "react";
// import {
//   Dialog,
//   DialogContent,
//   DialogHeader,
//   DialogTitle,
// } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import {
//   Popover,
//   PopoverTrigger,
//   PopoverContent,
// } from "@/components/ui/popover";
// import {
//   Command,
//   CommandInput,
//   CommandList,
//   CommandEmpty,
//   CommandGroup,
//   CommandItem,
// } from "@/components/ui/command";
// import { ChevronsUpDown, Check } from "lucide-react";
// import { cn } from "@/lib/utils";
// import { useForm } from "react-hook-form";
// import { z } from "zod";
// import { zodResolver } from "@hookform/resolvers/zod";
// import { useSession } from "next-auth/react";
// import {
//   Form,
//   FormField,
//   FormItem,
//   FormLabel,
//   FormControl,
//   FormMessage,
// } from "@/components/ui/form";
// import Image from "next/image";
// import { signIn } from "next-auth/react";

// const signUpMobileSchema = z.object({
//   countryCode: z.string().min(1, "Please select a country code."),
//   mobile: z
//     .string()
//     .min(10, "Mobile number must be 10 digits.")
//     .max(10, "Mobile number must be 10 digits.")
//     .regex(/^[0-9]+$/, "Mobile number must contain only numbers."),
// });
// type SignUpMobileFormData = z.infer<typeof signUpMobileSchema>;

// export default function SignUpMobileModal({
//   open,
//   onClose,
//   onNext,
//   onLoginClick,
//   parsedCountryCodes,
//   onSocialLogin,
// }: {
//   open: boolean;
//   onClose: () => void;
//   onNext: (mobile: string, countryCode: string) => void;
//   onLoginClick: () => void;
//   parsedCountryCodes: any;
//   onSocialLogin?: (email: string) => void;
// }) {
//   const [openSelect, setOpenSelect] = useState(false);
//   const [search, setSearch] = useState("");
//   const { data: session } = useSession();
//   const [pendingGoogleLogin, setPendingGoogleLogin] = useState(false);

//   const form = useForm<SignUpMobileFormData>({
//     resolver: zodResolver(signUpMobileSchema),
//     defaultValues: {
//       countryCode: parsedCountryCodes?.[0]?.code || "",
//       mobile: "",
//     },
//   });

//   const countryCode = form.watch("countryCode");
//   const mobile = form.watch("mobile");
//   const selectedCountry = parsedCountryCodes?.find(
//     (item: any) => item.code === countryCode
//   );

//   useEffect(() => {
//     if (pendingGoogleLogin && session?.user?.email) {
//       onSocialLogin?.(session.user.email);
//       setPendingGoogleLogin(false);
//     }
//   }, [pendingGoogleLogin, session, onSocialLogin]);

//   const onSubmit = (data: SignUpMobileFormData) => {
//     onNext(data.mobile, data.countryCode);
//   };

//   const handleGoogleLogin = async () => {
//     try {
//       await signIn("google", {
//         callbackUrl: `${window.location.pathname}?signup=1`,
//       });
//     } catch (error) {
//       console.error("Google login failed:", error);
//     }
//   };

//   const handleFacebookLogin = async () => {
//     try {
//       await signIn("facebook", {
//         callbackUrl: `${window.location.pathname}?signup=1`,
//       });
//     } catch (error) {
//       console.error("Facebook login failed:", error);
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-xs rounded-xl p-3 box-content overflow-hidden w-sm gap-2">
//         {/* Header */}
//         <div className="relative bg-[#dff3f4] px-1.5 py-2 text-center rounded-t-xl">
//           <DialogHeader>
//             <DialogTitle className="text-lg font-semibold text-gray-800 text-center">
//               Sign up
//             </DialogTitle>
//           </DialogHeader>
//         </div>
//         <Form {...form}>
//           <form
//             onSubmit={form.handleSubmit(onSubmit)}
//             className="space-y-2 mt-2 px-1"
//           >
//             {/* Mobile Number Row */}
//             <div className="flex gap-1 mb-2 w-full">
//               <FormField
//                 control={form.control}
//                 name="countryCode"
//                 render={({ field }) => (
//                   <FormItem className="w-16 sm:w-20 flex-shrink-0">
//                     <Popover open={openSelect} onOpenChange={setOpenSelect}>
//                       <PopoverTrigger asChild>
//                         <FormControl>
//                           <Button
//                             type="button"
//                             variant="outline"
//                             role="combobox"
//                             className={cn(
//                               "justify-center border-2 font-semibold text-xs px-1.5 py-1 h-7 w-full text-center rounded-lg transition-all duration-200 hover:border-primary hover:shadow-md focus:ring-2 focus:ring-primary/20",
//                               !field.value && "text-muted-foreground",
//                               field.value && "border-primary/60 bg-primary/5"
//                             )}
//                           >
//                             <span className="truncate">
//                               {countryCode ? `+${countryCode}` : "Code"}
//                             </span>
//                             <ChevronsUpDown className="opacity-50 w-3 h-3 ml-1 flex-shrink-0" />
//                           </Button>
//                         </FormControl>
//                       </PopoverTrigger>
//                       <PopoverContent className="p-0 w-44 shadow-lg border-2">
//                         <Command>
//                           <CommandInput
//                             placeholder="Search country..."
//                             value={search}
//                             onValueChange={setSearch}
//                             className="h-7 border-b text-xs"
//                           />
//                           <CommandList className="max-h-60 overflow-y-auto">
//                             <CommandEmpty>No country found.</CommandEmpty>
//                             <CommandGroup>
//                               {parsedCountryCodes
//                                 .filter(
//                                   (item: any) =>
//                                     item.country
//                                       .toLowerCase()
//                                       .includes(search.toLowerCase()) ||
//                                     item.code.toString().includes(search)
//                                 )
//                                 .map((item: any) => (
//                                   <CommandItem
//                                     key={`${item.code}-${item.country}`}
//                                     value={item.code + item.country}
//                                     onSelect={() => {
//                                       form.setValue("countryCode", item.code);
//                                       setOpenSelect(false);
//                                       setSearch("");
//                                     }}
//                                     className="hover:bg-primary/10 cursor-pointer py-1 text-xs"
//                                   >
//                                     <div className="flex items-center justify-between w-full">
//                                       <span className="font-medium text-xs">
//                                         +{item.code}
//                                       </span>
//                                       <span className="text-xs text-gray-600 truncate ml-2">
//                                         {item.country}
//                                       </span>
//                                       {countryCode === item.code && (
//                                         <Check className="w-3 h-3 text-primary ml-2 flex-shrink-0" />
//                                       )}
//                                     </div>
//                                   </CommandItem>
//                                 ))}
//                             </CommandGroup>
//                           </CommandList>
//                         </Command>
//                       </PopoverContent>
//                     </Popover>
//                   </FormItem>
//                 )}
//               />
//               <FormField
//                 control={form.control}
//                 name="mobile"
//                 render={({ field }) => (
//                   <FormItem className="flex-1">
//                     <FormControl>
//                       <Input
//                         type="tel"
//                         placeholder="Enter Mobile Number"
//                         {...field}
//                         onChange={(e) => {
//                           const value = e.target.value.replace(/[^0-9]/g, "");
//                           field.onChange(value);
//                         }}
//                         className={cn(
//                           "w-full border-2 text-xs px-1.5 py-1 h-7 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary/20",
//                           form.formState.errors.mobile
//                             ? "border-red-500 focus:border-red-500"
//                             : "border-gray-300 focus:border-primary hover:border-primary/60"
//                         )}
//                         maxLength={10}
//                       />
//                     </FormControl>
//                     {/* Error message with icon, only for mobile */}
//                     {form.formState.errors.mobile && (
//                       <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
//                         <svg
//                           xmlns="http://www.w3.org/2000/svg"
//                           fill="none"
//                           viewBox="0 0 24 24"
//                           strokeWidth={2}
//                           stroke="currentColor"
//                           className="w-3 h-3"
//                         >
//                           <path
//                             strokeLinecap="round"
//                             strokeLinejoin="round"
//                             d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
//                           />
//                         </svg>
//                         {form.formState.errors.mobile.message}
//                       </div>
//                     )}
//                   </FormItem>
//                 )}
//               />
//             </div>
//             <Button
//               type="submit"
//               className={`w-full bg-[#E0E0E0] mt-1 text-gray-500 font-semibold h-7 rounded-lg text-xs disabled:opacity-100 transition-all duration-200 ${
//                 form.formState.isValid
//                   ? "bg-primary text-white hover:bg-primary/90"
//                   : "bg-[#E0E0E0] text-gray-500"
//               }`}
//               disabled={!form.formState.isValid}
//             >
//               GET OTP
//             </Button>
//           </form>
//         </Form>
//         <div className="text-center text-xs mt-1 mb-2">
//           Already have an account?{" "}
//           <span
//             className="text-primary hover:underline cursor-pointer font-semibold"
//             onClick={() => {
//               onClose();
//               onLoginClick();
//             }}
//           >
//             Log in here
//           </span>
//         </div>
//         <div className="relative flex items-center justify-center my-0">
//           <div className="border-t border-gray-300 absolute w-full"></div>
//           <div className="bg-white px-2 relative text-xs text-gray-500 z-10">
//             Or Login With
//           </div>
//         </div>
//         <div className="flex justify-center gap-2 mb-2">
//           <Button
//             variant="outline"
//             className="w-8 h-8 border-gray-300 rounded-full p-0.5 hover:bg-gray-100"
//             onClick={handleGoogleLogin}
//           >
//             <Image
//               src="/google.svg"
//               alt="Google"
//               width={20}
//               height={20}
//               className="p-0.5 hover:cursor-pointer transition-colors"
//             />
//           </Button>
//           <Button
//             variant="outline"
//             className="w-8 h-8 border-gray-300 rounded-full p-0.5 hover:bg-gray-100"
//             onClick={handleFacebookLogin}
//           >
//             <Image
//               src="/facebook.svg"
//               alt="Facebook"
//               width={20}
//               height={20}
//               className="p-0.5 hover:cursor-pointer hover:border-gray-400 transition-colors"
//             />
//           </Button>
//         </div>
//       </DialogContent>
//     </Dialog>
//   );
// }
