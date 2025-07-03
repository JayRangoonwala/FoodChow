"use client";

import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogTitle } from "@radix-ui/react-dialog";
import { SignUp } from "@/lib/loginService";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";

// SVG icons for eye and eye-off
const EyeIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path
      d="M11.999 8.138c-2.13 0-3.861 1.731-3.861 3.862s1.731 3.862 3.861 3.862c2.131 0 3.862-1.731 3.862-3.862s-1.731-3.862-3.862-3.862Zm-.293 2.717c-.48 0-.88.399-.88.879H9.548c.027-1.199.986-2.158 2.158-2.158v1.279Z"
      fill="black"
    />
    <path
      d="M23.72 11.201c-1.305-1.625-5.967-6.926-11.72-6.926S1.585 9.576.28 11.201c-.373.453-.373 1.119 0 1.598C1.585 14.424 6.247 19.725 12 19.725c5.754 0 10.415-5.301 11.72-6.926.373-.453.373-1.119 0-1.598ZM12 17.594c-3.09 0-5.594-2.504-5.594-5.594 0-3.09 2.504-5.594 5.594-5.594s5.594 2.504 5.594 5.594c0 3.09-2.504 5.594-5.594 5.594Z"
      fill="black"
    />
  </svg>
);

const EyeOffIcon = () => (
  <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
    <path
      d="M2 0l20 20M9.88 9.88A2.986 2.986 0 009 12c0 1.66 1.34 3 3 3 .81 0 1.57-.33 2.12-.88M17.94 17.94C16.37 19.18 14.26 20 12 20c-4.42 0-8.27-3.12-10-8 0 0 1.2-1.7 2.74-3M10.59 5.07C11.06 5.02 11.53 5 12 5c4.42 0 8.27 3.12 10 8 0 0-1.03 1.49-2.33 2.67"
      stroke="black"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

interface SignUpDetailsModalProps {
  open: boolean;
  onClose: () => void;
  mobile?: string;
  countryCode?: string;
  otp?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  onSuccess: () => void;
  onBack: () => void;
  parsedCountryCodes: any;
  onLoginClick?: () => void; // Added prop
}

export default function SignUpDetailsModal({
  open,
  onClose,
  mobile,
  countryCode,
  otp,
  firstName,
  lastName,
  email,
  onSuccess,
  onBack,
  parsedCountryCodes,
  onLoginClick,
}: SignUpDetailsModalProps) {
  const [form, setForm] = useState({
    firstName: email ? firstName : "",
    lastName: email ? lastName : "",
    email: email ? email : "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  useEffect(() => {
    setForm((prev) => ({
      ...prev,
      email: email ?? "",
      firstName: firstName ?? "",
      lastName: lastName ?? "",
      password: "",
      confirmPassword: "",
    }));
    setErrors({
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    });
  }, [email, firstName, lastName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });

    // Clear error for the field on change
    setErrors({ ...errors, [name]: "" });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validate fields
    const newErrors = {
      firstName: form.firstName ? "" : "First name is required",
      lastName: form.lastName ? "" : "Last name is required",
      email: form.email
        ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)
          ? ""
          : "Enter valid email"
        : "Email is required",
      password: form.password
        ? form.password.length >= 8 &&
          /[A-Z]/.test(form.password) &&
          /[a-z]/.test(form.password) &&
          /[0-9]/.test(form.password) &&
          /[!@_/-]/.test(form.password)
          ? ""
          : "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one of @, _, -."
        : "Password is required",
      confirmPassword: form.confirmPassword
        ? form.password === form.confirmPassword
          ? ""
          : "Passwords do not match"
        : "Confirm password is required",
    };

    setErrors(newErrors);

    // If any errors, stop submission
    if (Object.values(newErrors).some((error) => error !== "")) {
      return;
    }

    const data = {
      firstName: form.firstName,
      lastName: form.lastName,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword,
    };
    // console.log(data);

    const res = await SignUp(data);

    if (res === "Email already registered") {
      setErrors({ ...errors, email: "Email already registered" });
      return;
    }

    if (res.message === "Signup successful") {
      localStorage.setItem(
        "userInfo",
        JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
        })
      );
      onSuccess();
    }
  };

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
              <h2 className="text-[25px] font-semibold text-black">Sign Up</h2>
            </div>
          </div>

        {/* Form */}
        <form className="px-6 pb-8 space-y-2" onSubmit={handleSubmit}>
          {[
            "firstName",
            "lastName",
            "email",
            "password",
            "confirmPassword",
          ].map((field) => {
            const isPassword = field.toLowerCase().includes("password");
            const showIcon =
              field === "password"
                ? showPassword
                : field === "confirmPassword"
                ? showConfirmPassword
                : null;
            const setShow =
              field === "password"
                ? setShowPassword
                : field === "confirmPassword"
                ? setShowConfirmPassword
                : null;

            return (
              <div key={field} className="relative">
                <label className="block text-[16px] font-medium text-[#000000] mb-1 capitalize">
                  {field === "email"
                    ? "Email Address"
                    : field.replace(/([A-Z])/g, " $1")}
                  <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Input
                    type={
                      isPassword
                        ? showIcon
                          ? "text"
                          : "password"
                        : field === "email"
                        ? "email"
                        : "text"
                    }
                    name={field}
                    placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
                    value={form[field as keyof typeof form]}
                    onChange={handleChange}
                    className={`w-full border font-normal text-[#302f2f] border-[#929292] rounded-md px-3 py-3 text-[14px] outline-none ${
                      errors[field as keyof typeof errors]
                        ? "border-red-500"
                        : ""
                    }`}
                  />
                  {isPassword && (
                    <div
                      onClick={() => setShow && setShow(!showIcon)}
                      className="absolute top-1.5 right-3 cursor-pointer"
                    >
                      {showIcon ? <EyeIcon /> : <EyeOffIcon />}
                    </div>
                  )}
                </div>
                {errors[field as keyof typeof errors] && (
                  <div className="flex items-center mt-1 bg-[#FFE6E6] px-2 py-1 rounded">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 16 16"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      className="mr-2"
                    >
                      <circle cx="8" cy="8" r="8" fill="#FF0000" />
                      <path
                        d="M8 4V8.5M8 11V12"
                        stroke="white"
                        strokeWidth="2"
                        strokeLinecap="round"
                      />
                    </svg>
                    <p className="text-red-500 text-xs">
                      {errors[field as keyof typeof errors]}
                    </p>
                  </div>
                )}
              </div>
            );
          })}

          <Button
            type="submit"
            className={`w-full mt-[35px] ${
              form.firstName &&
              form.lastName &&
              form.email &&
              form.email &&
              form.password &&
              form.confirmPassword &&
              form.password === form.confirmPassword &&
              /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) &&
              form.password.length >= 8 &&
              /[A-Z]/.test(form.password) &&
              /[a-z]/.test(form.password) &&
              /[0-9]/.test(form.password) &&
              /[!@_/-]/.test(form.password)
                ? "bg-[#0AA89E]"
                : "bg-[#CACACA]"
            } text-[17px] text-white font-semibold py-3 rounded-md cursor-pointer`}
          >
            CREATE ACCOUNT
          </Button>

          <p className="text-center text-[17px] font-medium text-black mt-4">
            Already have an account?{" "}
            <span
              className="text-[#00C2CB] text-[17px] font-medium cursor-pointer"
              onClick={onLoginClick || onClose} // Updated to use onLoginClick
            >
              Log in here
            </span>
          </p>
        </form>
      </DialogContent>
    </Dialog>
  );
}


// // import { useState, useEffect } from "react";
// // import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { DialogTitle } from "@radix-ui/react-dialog";
// // import { CountryCodeSelect } from "@/components/ui/CountryCode";
// // import { SignUp } from "@/lib/loginService";
// // // SVG icons for eye and eye-off
// // const EyeIcon = () => (
// //   <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
// // );
// // const EyeOffIcon = () => (
// //   <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m2.1-2.1A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.03M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6L6 6" /></svg>
// // );

// // export default function SignUpDetailsModal({
// //   open,
// //   onClose,
// //   mobile,
// //   countryCode,
// //   otp,
// //   firstName,
// //   lastName,
// //   email,
// //   onSuccess,
// //   onBack,
// //   parsedCountryCodes
// // }: {
// //   open: boolean;
// //   onClose: () => void;
// //   mobile?: string;
// //   countryCode?: string;
// //   otp?: string;
// //   email?: string;
// //   firstName?: string;
// //   lastName?: string;
// //   onSuccess: () => void;
// //   onBack: () => void;
// //   parsedCountryCodes: any;
// // }) {
// //   const [form, setForm] = useState({
// //     firstName: email ? firstName : "",
// //     lastName: email ? lastName : "",
// //     email: email ? email : "",
// //     mobile: email ? "" : (mobile ? mobile : ""),
// //     countryCode: email ? "" : (countryCode ? countryCode : ""),
// //     password: "",
// //     confirmPassword: ""
// //   });
// //   const [error, setError] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// //   // Add this effect to update form when mobile/countryCode/email change
// //   useEffect(() => {
// //     if (email) {
// //       setForm((prev) => ({
// //         ...prev,
// //         email: email ?? "",
// //         mobile: "",
// //         countryCode: "",
// //         firstName: firstName ?? "",
// //         lastName: lastName ?? "",
// //       }));
// //     } else {
// //       setForm((prev) => ({
// //         ...prev,
// //         mobile: mobile ?? "",
// //         countryCode: countryCode ?? "",
// //         email: "",
// //         firstName:"",
// //         lastName:"",
// //       }));
// //     }
// //   }, [mobile, countryCode, email, firstName, lastName]);

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
// //     setForm({ ...form, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
// //       setError("All fields are required");
// //       return;
// //     }
// //     if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
// //       setError("Enter valid email");
// //       return;
// //     }
// //     if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password) || !/[!@_/-]/.test(form.password)) {
// //       setError("Password must contains at least 8 characters and one uppercase, one lowercase, one number and one of @, _ , -.");
// //       return;
// //     }
// //     if (form.password !== form.confirmPassword) {
// //       setError("Passwords do not match");
// //       return;
// //     }
// //     setError("");
// //     // Here you would call your API to create the account

// //     const data = {
// //       firstName: form.firstName,
// //       lastName: form.lastName,
// //       mobileNumber: form.mobile,
// //       email: form.email,
// //       password: form.password,
// //       confirmPassword: form.confirmPassword
// //     }
// //     console.log(data);

// //     const res = await SignUp(data);

// //     if(res === "Email already registered"){
// //       setError("Email already registered");
// //       return;
// //     }

// //     if(res.message === "Signup successful"){
// //       localStorage.setItem("userInfo", JSON.stringify({
// //           firstName: form.firstName,
// //           lastName: form.lastName,
// //           email: form.email,
// //           mobile: form.mobile,
// //         }));
// //       onSuccess();
// //     }

// //      // Store user info in localStorage
// //     //  localStorage.setItem("userInfo", JSON.stringify({
// //     //   firstName: form.firstName,
// //     //   lastName: form.lastName,
// //     //   email: form.email,
// //     //   mobile: form.mobile,
// //     //   countryCode: form.countryCode
// //     // }));
// //   // onSuccess();
// //   };

// //   return (
// //     <Dialog open={open} onOpenChange={onClose}>
// //       <DialogContent className="max-w-xs w-full rounded-xl px-[1px] py-3 overflow-hidden m-0 sm:m-4 max-sm:p-2">
// //       <DialogHeader>
// //         <DialogTitle className="text-center">Sign Up</DialogTitle>
// //       </DialogHeader>
// //         {/* Welcome Banner */}
// //         <div className="bg-teal-50 border border-teal-200 px-4 py-4 flex items-start gap-2">
// //           <span className="text-xl">👋</span>
// //           <div>
// //             <div className="font-semibold text-teal-900 text-base">Welcome {form.lastName || "User"}</div>
// //             <div className="text-xs text-teal-800">You're almost ready to start ordering. Please complete your profile by providing:</div>
// //           </div>
// //         </div>
// //         <form onSubmit={handleSubmit} className="px-3 pt-2 pb-1 space-y-2">
// //           {/* First/Last Name */}
// //           <div className="flex gap-2">
// //             <div className="flex-1">
// //               <label htmlFor="firstName" className="block text-xs font-medium mb-1">First Name</label>
// //               <Input id="firstName" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className="h-8 text-sm" />
// //             </div>
// //             <div className="flex-1">
// //               <label htmlFor="lastName" className="block text-xs font-medium mb-1">Last Name</label>
// //               <Input id="lastName" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="h-8 text-sm" />
// //             </div>
// //           </div>
// //           {/* Email */}
// //           <div>
// //             <label htmlFor="email" className="block text-xs font-medium mb-1">Email Address <span className="text-red-500">*</span></label>
// //             <Input id="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="h-8 text-sm" />
// //           </div>
// //           {/* Mobile Number */}
// //           <div className="flex gap-2">
// //             <div>
// //               <label htmlFor="countryCode" className="block text-xs font-medium mb-1">Country</label>
// //               <CountryCodeSelect
// //                 value={form.countryCode}
// //                 onChange={(code:string) => setForm({ ...form, countryCode: code })}
// //                 countryCodes={parsedCountryCodes}
// //                 className="h-8 text-sm"
// //               />
// //             </div>
// //             <div className="flex-1">
// //               <label htmlFor="mobile" className="block text-xs font-medium mb-1">Mobile Number</label>
// //               <Input id="mobile" name="mobile" placeholder="Mobile Number" value={form.mobile} onChange={handleChange} className="h-8 text-sm" />
// //             </div>
// //           </div>
// //           {/* Password */}
// //           <div className="relative">
// //             <label htmlFor="password" className="block text-xs font-medium mb-1">Password</label>
// //             <Input
// //               id="password"
// //               name="password"
// //               type={showPassword ? "text" : "password"}
// //               placeholder="Password"
// //               value={form.password}
// //               onChange={handleChange}
// //               className="px-3 py-[14px] text-sm"
// //             />
// //             <button
// //               type="button"
// //               className="absolute right-2 top-7 text-gray-500"
// //               tabIndex={-1}
// //               onClick={() => setShowPassword((v) => !v)}
// //               aria-label={showPassword ? "Hide password" : "Show password"}
// //             >
// //               {showPassword ? <EyeOffIcon /> : <EyeIcon />}
// //             </button>
// //             <div className="text-xs text-gray-500 mt-1 pl-1">Password must be at least 8 characters</div>
// //           </div>
// //           {/* Confirm Password */}
// //           <div className="relative">
// //             <label htmlFor="confirmPassword" className="block text-xs font-medium mb-1">Confirm Password</label>
// //             <Input
// //               id="confirmPassword"
// //               name="confirmPassword"
// //               type={showConfirmPassword ? "text" : "password"}
// //               placeholder="Confirm Password"
// //               value={form.confirmPassword}
// //               onChange={handleChange}
// //               className="pr-8 h-8 text-sm"
// //             />
// //             <button
// //               type="button"
// //               className="absolute right-2 top-7 text-gray-500"
// //               tabIndex={-1}
// //               onClick={() => setShowConfirmPassword((v) => !v)}
// //               aria-label={showConfirmPassword ? "Hide password" : "Show password"}
// //             >
// //               {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
// //             </button>
// //           </div>
// //           {error && <p className="text-xs text-red-600 pl-1">{error}</p>}
// //           <div className="flex w-full gap-2 mt-1">
// //             <Button type="button" variant="outline" className="flex-1 h-8 text-xs" onClick={onBack}>Back</Button>
// //             <Button type="submit" className="flex-1 bg-primary text-white h-8 text-xs">CREATE ACCOUNT</Button>
// //           </div>
// //         </form>
// //         <div className="text-center text-xs py-2 border-t mt-1">
// //           Already have an account?{' '}
// //           <a href="#" className="text-primary font-medium hover:underline">Log in here</a>
// //         </div>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }

// // "use client";

// // import { useState, useEffect } from "react";
// // import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
// // import { Button } from "@/components/ui/button";
// // import { Input } from "@/components/ui/input";
// // import { DialogTitle } from "@radix-ui/react-dialog";
// // import { SignUp } from "@/lib/loginService";

// // // SVG icons for eye and eye-off (from reference UI)
// // const EyeIcon = () => (
// //   <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
// //     <path
// //       d="M11.999 8.138c-2.13 0-3.861 1.731-3.861 3.862s1.731 3.862 3.861 3.862c2.131 0 3.862-1.731 3.862-3.862s-1.731-3.862-3.862-3.862Zm-.293 2.717c-.48 0-.88.399-.88.879H9.548c.027-1.199.986-2.158 2.158-2.158v1.279Z"
// //       fill="black"
// //     />
// //     <path
// //       d="M23.72 11.201c-1.305-1.625-5.967-6.926-11.72-6.926S1.585 9.576.28 11.201c-.373.453-.373 1.119 0 1.598C1.585 14.424 6.247 19.725 12 19.725c5.754 0 10.415-5.301 11.72-6.926.373-.453.373-1.119 0-1.598ZM12 17.594c-3.09 0-5.594-2.504-5.594-5.594 0-3.09 2.504-5.594 5.594-5.594s5.594 2.504 5.594 5.594c0 3.09-2.504 5.594-5.594 5.594Z"
// //       fill="black"
// //     />
// //   </svg>
// // );

// // const EyeOffIcon = () => (
// //   <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
// //     <path
// //       d="M2 0l20 20M9.88 9.88A2.986 2.986 0 009 12c0 1.66 1.34 3 3 3 .81 0 1.57-.33 2.12-.88M17.94 17.94C16.37 19.18 14.26 20 12 20c-4.42 0-8.27-3.12-10-8 0 0 1.2-1.7 2.74-3M10.59 5.07C11.06 5.02 11.53 5 12 5c4.42 0 8.27 3.12 10 8 0 0-1.03 1.49-2.33 2.67"
// //       stroke="black"
// //       strokeWidth="2"
// //       strokeLinecap="round"
// //       strokeLinejoin="round"
// //     />
// //   </svg>
// // );

// // export default function SignUpDetailsModal({
// //   open,
// //   onClose,
// //   mobile,
// //   countryCode,
// //   otp,
// //   firstName,
// //   lastName,
// //   email,
// //   onSuccess,
// //   onBack,
// //   parsedCountryCodes,
// // }: {
// //   open: boolean;
// //   onClose: () => void;
// //   mobile?: string;
// //   countryCode?: string;
// //   otp?: string;
// //   email?: string;
// //   firstName?: string;
// //   lastName?: string;
// //   onSuccess: () => void;
// //   onBack: () => void;
// //   parsedCountryCodes: any;
// // }) {
// //   const [form, setForm] = useState({
// //     firstName: email ? firstName : "",
// //     lastName: email ? lastName : "",
// //     email: email ? email : "",
// //     password: "",
// //     confirmPassword: "",
// //   });
// //   const [error, setError] = useState("");
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

// //   useEffect(() => {
// //     setForm((prev) => ({
// //       ...prev,
// //       email: email ?? "",
// //       firstName: firstName ?? "",
// //       lastName: lastName ?? "",
// //       password: "",
// //       confirmPassword: "",
// //     }));
// //   }, [email, firstName, lastName]);

// //   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
// //     setForm({ ...form, [e.target.name]: e.target.value });
// //   };

// //   const handleSubmit = async (e: React.FormEvent) => {
// //     e.preventDefault();
// //     if (
// //       !form.firstName ||
// //       !form.lastName ||
// //       !form.email ||
// //       !form.password ||
// //       !form.confirmPassword
// //     ) {
// //       setError("All fields are required");
// //       return;
// //     }
// //     if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
// //       setError("Enter valid email");
// //       return;
// //     }
// //     if (
// //       form.password.length < 8 ||
// //       !/[A-Z]/.test(form.password) ||
// //       !/[a-z]/.test(form.password) ||
// //       !/[0-9]/.test(form.password) ||
// //       !/[!@_/-]/.test(form.password)
// //     ) {
// //       setError(
// //         "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one of @, _, -."
// //       );
// //       return;
// //     }
// //     if (form.password !== form.confirmPassword) {
// //       setError("Passwords do not match");
// //       return;
// //     }
// //     setError("");

// //     const data = {
// //       firstName: form.firstName,
// //       lastName: form.lastName,
// //       email: form.email,
// //       password: form.password,
// //       confirmPassword: form.confirmPassword,
// //     };
// //     console.log(data);

// //     const res = await SignUp(data);

// //     if (res === "Email already registered") {
// //       setError("Email already registered");
// //       return;
// //     }

// //     if (res.message === "Signup successful") {
// //       localStorage.setItem(
// //         "userInfo",
// //         JSON.stringify({
// //           firstName: form.firstName,
// //           lastName: form.lastName,
// //           email: form.email,
// //         })
// //       );
// //       onSuccess();
// //     }
// //   };

// //   return (
// //     <Dialog open={open} onOpenChange={onClose}>
// //       <DialogContent className="w-full max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
// //         {/* Header */}
// //         <div className="relative w-full h-[224px] -mt-[50px] overflow-hidden">
// //           <div
// //             className="w-full h-[225px] bg-contain bg-no-repeat"
// //             style={{
// //               backgroundImage: "url('/login.jpg')",
// //               backgroundPosition: "40% center",
// //             }}
// //           />
// //           <div
// //             className="absolute top-0 left-0 w-[490px] h-[200px] bg-no-repeat bg-contain bg-left"
// //             style={{ backgroundImage: "url('/loginleft.png')" }}
// //           />
// //           <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
// //             <h2 className="text-[25px] font-semibold text-black">Sign up</h2>
// //           </div>
// //         </div>

// //         {/* Form */}
// //         <form className="px-6 pb-8  space-y-2" onSubmit={handleSubmit}>
// //           {[
// //             "firstName",
// //             "lastName",
// //             "email",
// //             "password",
// //             "confirmPassword",
// //           ].map((field) => {
// //             const isPassword = field.toLowerCase().includes("password");
// //             const showIcon =
// //               field === "password"
// //                 ? showPassword
// //                 : field === "confirmPassword"
// //                 ? showConfirmPassword
// //                 : null;
// //             const setShow =
// //               field === "password"
// //                 ? setShowPassword
// //                 : field === "confirmPassword"
// //                 ? setShowConfirmPassword
// //                 : null;

// //             return (
// //               <div key={field} className="relative">
// //                 <label className="block text-[16px] font-medium text-[#000000] mb-1 capitalize">
// //                   {field === "email"
// //                     ? "Email Address"
// //                     : field.replace(/([A-Z])/g, " $1")}
// //                   <span className="text-red-500">*</span>
// //                 </label>
// //                 <div className="relative">
// //                   <Input
// //                     type={
// //                       isPassword
// //                         ? showIcon
// //                           ? "text"
// //                           : "password"
// //                         : field === "email"
// //                         ? "email"
// //                         : "text"
// //                     }
// //                     name={field}
// //                     placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
// //                     value={form[field as keyof typeof form]}
// //                     onChange={handleChange}
// //                     className={`w-full border font-normal text-[#606060] border-[#929292] rounded-md px-3 py-3 text-[14px] outline-none ${
// //                       error && field === "email" && form.email === email
// //                         ? "border-red-500"
// //                         : ""
// //                     }`}
// //                   />
// //                   {isPassword && (
// //                     <div
// //                       onClick={() => setShow && setShow(!showIcon)}
// //                       className="absolute top-2.5 right-3 cursor-pointer"
// //                     >
// //                       {showIcon ? <EyeIcon /> : <EyeOffIcon />}
// //                     </div>
// //                   )}
// //                 </div>
// //                 {error && (
// //                   <div className="flex items-center mt-1 bg-[#FFE6E6] px-2 py-1 rounded">
// //                     <svg
// //                       width="16"
// //                       height="16"
// //                       viewBox="0 0 16 16"
// //                       fill="none"
// //                       xmlns="http://www.w3.org/2000/svg"
// //                       className="mr-2"
// //                     >
// //                       <circle cx="8" cy="8" r="8" fill="#FF0000" />
// //                       <path
// //                         d="M8 4V8.5M8 11V12"
// //                         stroke="white"
// //                         strokeWidth="2"
// //                         strokeLinecap="round"
// //                       />
// //                     </svg>
// //                     <p className="text-red-500 text-xs">{error}</p>
// //                   </div>
// //                 )}
// //               </div>
// //             );
// //           })}

// //           <Button
// //             type="submit"
// //             className={`w-full mt-[35px] ${
// //               form.firstName &&
// //               form.lastName &&
// //               form.email &&
// //               form.password &&
// //               form.confirmPassword &&
// //               form.password === form.confirmPassword &&
// //               /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) &&
// //               form.password.length >= 8 &&
// //               /[A-Z]/.test(form.password) &&
// //               /[a-z]/.test(form.password) &&
// //               /[0-9]/.test(form.password) &&
// //               /[!@_/-]/.test(form.password)
// //                 ? "bg-[#0AA89E]"
// //                 : "bg-[#CACACA]"
// //             } text-[17px] text-white font-semibold py-3 rounded-md cursor-pointer`}
// //           >
// //             CREATE ACCOUNT
// //           </Button>

// //           <p className="text-center text-[17px] font-medium text-black mt-4">
// //             Already have an account?{" "}
// //             <span
// //               className="text-[#00C2CB] text-[17px] font-medium cursor-pointer"
// //               onClick={onClose}
// //             >
// //               Log in here
// //             </span>
// //           </p>
// //         </form>
// //       </DialogContent>
// //     </Dialog>
// //   );
// // }

// "use client";

// import { useState, useEffect } from "react";
// import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";
// import { Input } from "@/components/ui/input";
// import { DialogTitle } from "@radix-ui/react-dialog";
// import { SignUp } from "@/lib/loginService";

// // SVG icons for eye and eye-off
// const EyeIcon = () => (
//   <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
//     <path
//       d="M11.999 8.138c-2.13 0-3.861 1.731-3.861 3.862s1.731 3.862 3.861 3.862c2.131 0 3.862-1.731 3.862-3.862s-1.731-3.862-3.862-3.862Zm-.293 2.717c-.48 0-.88.399-.88.879H9.548c.027-1.199.986-2.158 2.158-2.158v1.279Z"
//       fill="black"
//     />
//     <path
//       d="M23.72 11.201c-1.305-1.625-5.967-6.926-11.72-6.926S1.585 9.576.28 11.201c-.373.453-.373 1.119 0 1.598C1.585 14.424 6.247 19.725 12 19.725c5.754 0 10.415-5.301 11.72-6.926.373-.453.373-1.119 0-1.598ZM12 17.594c-3.09 0-5.594-2.504-5.594-5.594 0-3.09 2.504-5.594 5.594-5.594s5.594 2.504 5.594 5.594c0 3.09-2.504 5.594-5.594 5.594Z"
//       fill="black"
//     />
//   </svg>
// );

// const EyeOffIcon = () => (
//   <svg width="24" height="24" fill="none" viewBox="0 0 24 24">
//     <path
//       d="M2 0l20 20M9.88 9.88A2.986 2.986 0 009 12c0 1.66 1.34 3 3 3 .81 0 1.57-.33 2.12-.88M17.94 17.94C16.37 19.18 14.26 20 12 20c-4.42 0-8.27-3.12-10-8 0 0 1.2-1.7 2.74-3M10.59 5.07C11.06 5.02 11.53 5 12 5c4.42 0 8.27 3.12 10 8 0 0-1.03 1.49-2.33 2.67"
//       stroke="black"
//       strokeWidth="2"
//       strokeLinecap="round"
//       strokeLinejoin="round"
//     />
//   </svg>
// );

// export default function SignUpDetailsModal({
//   open,
//   onClose,
//   mobile,
//   countryCode,
//   otp,
//   firstName,
//   lastName,
//   email,
//   onSuccess,
//   onBack,
//   parsedCountryCodes,
// }: {
//   open: boolean;
//   onClose: () => void;
//   mobile?: string;
//   countryCode?: string;
//   otp?: string;
//   email?: string;
//   firstName?: string;
//   lastName?: string;
//   onSuccess: () => void;
//   onBack: () => void;
//   parsedCountryCodes: any;
// }) {
//   const [form, setForm] = useState({
//     firstName: email ? firstName : "",
//     lastName: email ? lastName : "",
//     email: email ? email : "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [errors, setErrors] = useState({
//     firstName: "",
//     lastName: "",
//     email: "",
//     password: "",
//     confirmPassword: "",
//   });
//   const [showPassword, setShowPassword] = useState(false);
//   const [showConfirmPassword, setShowConfirmPassword] = useState(false);

//   useEffect(() => {
//     setForm((prev) => ({
//       ...prev,
//       email: email ?? "",
//       firstName: firstName ?? "",
//       lastName: lastName ?? "",
//       password: "",
//       confirmPassword: "",
//     }));
//     setErrors({
//       firstName: "",
//       lastName: "",
//       email: "",
//       password: "",
//       confirmPassword: "",
//     });
//   }, [email, firstName, lastName]);

//   const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     const { name, value } = e.target;
//     setForm({ ...form, [name]: value });

//     // Clear error for the field on change
//     setErrors({ ...errors, [name]: "" });
//   };

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault();

//     // Validate fields
//     const newErrors = {
//       firstName: form.firstName ? "" : "First name is required",
//       lastName: form.lastName ? "" : "Last name is required",
//       email: form.email
//         ? /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)
//           ? ""
//           : "Enter valid email"
//         : "Email is required",
//       password: form.password
//         ? form.password.length >= 8 &&
//           /[A-Z]/.test(form.password) &&
//           /[a-z]/.test(form.password) &&
//           /[0-9]/.test(form.password) &&
//           /[!@_/-]/.test(form.password)
//           ? ""
//           : "Password must contain at least 8 characters, one uppercase, one lowercase, one number, and one of @, _, -."
//         : "Password is required",
//       confirmPassword: form.confirmPassword
//         ? form.password === form.confirmPassword
//           ? ""
//           : "Passwords do not match"
//         : "Confirm password is required",
//     };

//     setErrors(newErrors);

//     // If any errors, stop submission
//     if (Object.values(newErrors).some((error) => error !== "")) {
//       return;
//     }

//     const data = {
//       firstName: form.firstName,
//       lastName: form.lastName,
//       email: form.email,
//       password: form.password,
//       confirmPassword: form.confirmPassword,
//     };
//     console.log(data);

//     const res = await SignUp(data);

//     if (res === "Email already registered") {
//       setErrors({ ...errors, email: "Email already registered" });
//       return;
//     }

//     if (res.message === "Signup successful") {
//       localStorage.setItem(
//         "userInfo",
//         JSON.stringify({
//           firstName: form.firstName,
//           lastName: form.lastName,
//           email: form.email,
//         })
//       );
//       onSuccess();
//     }
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="w-full max-w-md mx-auto bg-white rounded-xl overflow-hidden shadow-lg border border-gray-200">
//         {/* Header */}
//         <div className="relative w-full h-[224px] -mt-[50px] overflow-hidden">
//           <div
//             className="w-full h-[225px] bg-contain bg-no-repeat"
//             style={{
//               backgroundImage: "url('/login.jpg')",
//               backgroundPosition: "40% center",
//             }}
//           />
//           <div
//             className="absolute top-0 left-0 w-[490px] h-[200px] bg-no-repeat bg-contain bg-left"
//             style={{ backgroundImage: "url('/loginleft.png')" }}
//           />
//           <div className="absolute top-0 left-0 w-full h-full flex items-center justify-center">
//             <h2 className="text-[25px] font-semibold text-black">Sign up</h2>
//           </div>
//         </div>

//         {/* Form */}
//         <form className="px-6 pb-8 space-y-2" onSubmit={handleSubmit}>
//           {[
//             "firstName",
//             "lastName",
//             "email",
//             "password",
//             "confirmPassword",
//           ].map((field) => {
//             const isPassword = field.toLowerCase().includes("password");
//             const showIcon =
//               field === "password"
//                 ? showPassword
//                 : field === "confirmPassword"
//                 ? showConfirmPassword
//                 : null;
//             const setShow =
//               field === "password"
//                 ? setShowPassword
//                 : field === "confirmPassword"
//                 ? setShowConfirmPassword
//                 : null;

//             return (
//               <div key={field} className="relative">
//                 <label className="block text-[16px] font-medium text-[#000000] mb-1 capitalize">
//                   {field === "email"
//                     ? "Email Address"
//                     : field.replace(/([A-Z])/g, " $1")}
//                   <span className="text-red-500">*</span>
//                 </label>
//                 <div className="relative">
//                   <Input
//                     type={
//                       isPassword
//                         ? showIcon
//                           ? "text"
//                           : "password"
//                         : field === "email"
//                         ? "email"
//                         : "text"
//                     }
//                     name={field}
//                     placeholder={`Enter ${field.replace(/([A-Z])/g, " $1")}`}
//                     value={form[field as keyof typeof form]}
//                     onChange={handleChange}
//                     className={`w-full border font-normal text-[#606060] border-[#929292] rounded-md px-3 py-3 text-[14px] outline-none ${
//                       errors[field as keyof typeof errors]
//                         ? "border-red-500"
//                         : ""
//                     }`}
//                   />
//                   {isPassword && (
//                     <div
//                       onClick={() => setShow && setShow(!showIcon)}
//                       className="absolute top-1.5 right-3 cursor-pointer"
//                     >
//                       {showIcon ? <EyeIcon /> : <EyeOffIcon />}
//                     </div>
//                   )}
//                 </div>
//                 {errors[field as keyof typeof errors] && (
//                   <div className="flex items-center mt-1 bg-[#FFE6E6] px-2 py-1 rounded">
//                     <svg
//                       width="16"
//                       height="16"
//                       viewBox="0 0 16 16"
//                       fill="none"
//                       xmlns="http://www.w3.org/2000/svg"
//                       className="mr-2"
//                     >
//                       <circle cx="8" cy="8" r="8" fill="#FF0000" />
//                       <path
//                         d="M8 4V8.5M8 11V12"
//                         stroke="white"
//                         strokeWidth="2"
//                         strokeLinecap="round"
//                       />
//                     </svg>
//                     <p className="text-red-500 text-xs">
//                       {errors[field as keyof typeof errors]}
//                     </p>
//                   </div>
//                 )}
//               </div>
//             );
//           })}

//           <Button
//             type="submit"
//             className={`w-full mt-[35px] ${
//               form.firstName &&
//               form.lastName &&
//               form.email &&
//               form.password &&
//               form.confirmPassword &&
//               form.password === form.confirmPassword &&
//               /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email) &&
//               form.password.length >= 8 &&
//               /[A-Z]/.test(form.password) &&
//               /[a-z]/.test(form.password) &&
//               /[0-9]/.test(form.password) &&
//               /[!@_/-]/.test(form.password)
//                 ? "bg-[#0AA89E]"
//                 : "bg-[#CACACA]"
//             } text-[17px] text-white font-semibold py-3 rounded-md cursor-pointer`}
//           >
//             CREATE ACCOUNT
//           </Button>

//           <p className="text-center text-[17px] font-medium text-black mt-4">
//             Already have an account?{" "}
//             <span
//               className="text-[#00C2CB] text-[17px] font-medium cursor-pointer"
//               onClick={onClose}
//             >
//               Log in here
//             </span>
//           </p>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
