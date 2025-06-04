import { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogHeader } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DialogTitle } from "@radix-ui/react-dialog";
import { CountryCodeSelect } from "@/components/ui/CountryCode";
import { SignUp } from "@/lib/loginService";
// SVG icons for eye and eye-off
const EyeIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" /></svg>
);
const EyeOffIcon = () => (
  <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.542-7a9.956 9.956 0 012.293-3.95m2.1-2.1A9.956 9.956 0 0112 5c4.478 0 8.268 2.943 9.542 7a9.973 9.973 0 01-4.293 5.03M15 12a3 3 0 11-6 0 3 3 0 016 0zm6 6L6 6" /></svg>
);

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
  parsedCountryCodes
}: {
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
}) {
  const [form, setForm] = useState({
    firstName: email ? firstName : "",
    lastName: email ? lastName : "",
    email: email ? email : "",
    mobile: email ? "" : (mobile ? mobile : ""),
    countryCode: email ? "" : (countryCode ? countryCode : ""),
    password: "",
    confirmPassword: ""
  });
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Add this effect to update form when mobile/countryCode/email change
  useEffect(() => {
    if (email) {
      setForm((prev) => ({
        ...prev,
        email: email ?? "",
        mobile: "",
        countryCode: "",
        firstName: firstName ?? "",
        lastName: lastName ?? "",
      }));
    } else {
      setForm((prev) => ({
        ...prev,
        mobile: mobile ?? "",
        countryCode: countryCode ?? "",
        email: "",
        firstName:"",
        lastName:"",
      }));
    }
  }, [mobile, countryCode, email, firstName, lastName]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName || !form.email || !form.password || !form.confirmPassword) {
      setError("All fields are required");
      return;
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) {
      setError("Enter valid email");
      return;
    }
    if (form.password.length < 8 || !/[A-Z]/.test(form.password) || !/[a-z]/.test(form.password) || !/[0-9]/.test(form.password) || !/[!@_/-]/.test(form.password)) {
      setError("Password must contains at least 8 characters and one uppercase, one lowercase, one number and one of @, _ , -.");
      return;
    }
    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match");
      return;
    }
    setError("");
    // Here you would call your API to create the account

    
    const data = {
      firstName: form.firstName,
      lastName: form.lastName,
      mobileNumber: form.mobile,
      email: form.email,
      password: form.password,
      confirmPassword: form.confirmPassword
    }
    console.log(data);
    
    const res = await SignUp(data);

    if(res === "Email already registered"){
      setError("Email already registered");
      return;
    }

    if(res.message === "Signup successful"){
      localStorage.setItem("userInfo", JSON.stringify({
          firstName: form.firstName,
          lastName: form.lastName,
          email: form.email,
          mobile: form.mobile,
        }));
      onSuccess();
    }

     // Store user info in localStorage
    //  localStorage.setItem("userInfo", JSON.stringify({
    //   firstName: form.firstName,
    //   lastName: form.lastName,
    //   email: form.email,
    //   mobile: form.mobile,
    //   countryCode: form.countryCode
    // }));
  // onSuccess();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>   
      <DialogContent className="max-w-xs w-full rounded-xl px-[1px] py-3 overflow-hidden m-0 sm:m-4 max-sm:p-2">
      <DialogHeader>
        <DialogTitle className="text-center">Sign Up</DialogTitle>
      </DialogHeader>
        {/* Welcome Banner */}
        <div className="bg-teal-50 border border-teal-200 px-4 py-4 flex items-start gap-2">
          <span className="text-xl">👋</span>
          <div>
            <div className="font-semibold text-teal-900 text-base">Welcome {form.lastName || "User"}</div>
            <div className="text-xs text-teal-800">You're almost ready to start ordering. Please complete your profile by providing:</div>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="px-3 pt-2 pb-1 space-y-2">
          {/* First/Last Name */}
          <div className="flex gap-2">
            <div className="flex-1">
              <label htmlFor="firstName" className="block text-xs font-medium mb-1">First Name</label>
              <Input id="firstName" name="firstName" placeholder="First Name" value={form.firstName} onChange={handleChange} className="h-8 text-sm" />
            </div>
            <div className="flex-1">
              <label htmlFor="lastName" className="block text-xs font-medium mb-1">Last Name</label>
              <Input id="lastName" name="lastName" placeholder="Last Name" value={form.lastName} onChange={handleChange} className="h-8 text-sm" />
            </div>
          </div>
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-xs font-medium mb-1">Email Address <span className="text-red-500">*</span></label>
            <Input id="email" name="email" placeholder="Email Address" value={form.email} onChange={handleChange} className="h-8 text-sm" />
          </div>
          {/* Mobile Number */}
          <div className="flex gap-2">
            <div>
              <label htmlFor="countryCode" className="block text-xs font-medium mb-1">Country</label>
              <CountryCodeSelect
                value={form.countryCode}
                onChange={(code:string) => setForm({ ...form, countryCode: code })}
                countryCodes={parsedCountryCodes}
                className="h-8 text-sm"
              />
            </div>
            <div className="flex-1">
              <label htmlFor="mobile" className="block text-xs font-medium mb-1">Mobile Number</label>
              <Input id="mobile" name="mobile" placeholder="Mobile Number" value={form.mobile} onChange={handleChange} className="h-8 text-sm" />
            </div>
          </div>
          {/* Password */}
          <div className="relative">
            <label htmlFor="password" className="block text-xs font-medium mb-1">Password</label>
            <Input
              id="password"
              name="password"
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={form.password}
              onChange={handleChange}
              className="px-3 py-[14px] text-sm"
            />
            <button
              type="button"
              className="absolute right-2 top-7 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
            >
              {showPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
            <div className="text-xs text-gray-500 mt-1 pl-1">Password must be at least 8 characters</div>
          </div>
          {/* Confirm Password */}
          <div className="relative">
            <label htmlFor="confirmPassword" className="block text-xs font-medium mb-1">Confirm Password</label>
            <Input
              id="confirmPassword"
              name="confirmPassword"
              type={showConfirmPassword ? "text" : "password"}
              placeholder="Confirm Password"
              value={form.confirmPassword}
              onChange={handleChange}
              className="pr-8 h-8 text-sm"
            />
            <button
              type="button"
              className="absolute right-2 top-7 text-gray-500"
              tabIndex={-1}
              onClick={() => setShowConfirmPassword((v) => !v)}
              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
            >
              {showConfirmPassword ? <EyeOffIcon /> : <EyeIcon />}
            </button>
          </div>
          {error && <p className="text-xs text-red-600 pl-1">{error}</p>}
          <div className="flex w-full gap-2 mt-1">
            <Button type="button" variant="outline" className="flex-1 h-8 text-xs" onClick={onBack}>Back</Button>
            <Button type="submit" className="flex-1 bg-primary text-white h-8 text-xs">CREATE ACCOUNT</Button>
          </div>
        </form>
        <div className="text-center text-xs py-2 border-t mt-1">
          Already have an account?{' '}
          <a href="#" className="text-primary font-medium hover:underline">Log in here</a>
        </div>
      </DialogContent>
    </Dialog>
  );
}
