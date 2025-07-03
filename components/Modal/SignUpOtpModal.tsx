"use client";

import { useEffect, useState, useRef, use } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ForgotPassword, VerifyOtp } from "@/lib/loginService";
import { set } from "date-fns";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";


interface SignUpOtpModalProps {
  open: boolean;
  onClose: () => void;
  mobile?: string;
  countryCode?: string;
  email?: string;
  onNext: (email: string) => void;
  onBack: () => void;
}

export default function SignUpOtpModal({
  open,
  onClose,
  mobile,
  countryCode,
  email,
  onNext,
  onBack,
}: SignUpOtpModalProps) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const otpValue = otp.join("");
  const canSubmit = otpValue.length === 6 && otp.every((d) => d !== "");
  const firstInputRef = useRef<HTMLInputElement>(null);
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (open) {
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  useEffect(() => {
    if(message != ""){
      setTimeout(() => {
        setMessage("");
      }, 3000);
    }
  }, [message]);

  const handleChange = (idx: number, value: string) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[idx] = value;
      setOtp(newOtp);
      if (/^[0-9]$/.test(value) && idx < 5) {
        const next = document.getElementById(`otp-input-${idx + 1}`);
        if (next) (next as HTMLInputElement).focus();
      }
    }
  };

  const handleSubmit = async(e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }
    setError("");

    const response = await VerifyOtp(email, otpValue);
    if(response === "OTP verified successfully."){
      onNext(email ? email : "");
    }
    else{
      setError(response.error || "Failed to verify OTP. Please try again.");
      return;
    }
    // onNext(otpValue);
  };

  const handleEdit = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    onBack(); // Go back to edit email or mobile
  };

  const handleResend = async() => {
    setOtp(["", "", "", "", "", ""]);
    const response = await ForgotPassword(email);
    if (JSON.parse(response.mvcResponse).response_code === "1") {
      // onNext(email);
      setMessage("OTP sent successfully to your email.");
    }
    setError("");
    // TODO: Implement resend OTP logic
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
            <h2 className="text-[25px] font-semibold text-black">Sign up</h2>
          </div>
        </div>

        <div className="px-6 py-4 text-center">
          <p className="mb-2 text-[17px] font-normal">
            We’ve sent a verification code to <br />
            <span className="text-[17px] font-normal">
              {email ||
                (mobile && countryCode
                  ? `+${countryCode} ${mobile}`
                  : "your account")}
            </span>{" "}
            <button
              type="button"
              className="text-[#003BFE] cursor-pointer underline font-normal text-[17px]"
              onClick={handleEdit}
            >
              Edit
            </button>
          </p>

          <div className="flex justify-center gap-3 mb-5 mt-5">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={idx === 0 ? firstInputRef : undefined}
                type="text"
                inputMode="numeric"
                maxLength={1}
                className="w-12 h-12 text-xl text-center border border-[#929292] rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={digit}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange(idx, val);
                }}
                onKeyDown={(e) => {
                  if (e.key === "Backspace" && !otp[idx] && idx > 0) {
                    const prev = document.getElementById(
                      `otp-input-${idx - 1}`
                    );
                    if (prev) (prev as HTMLInputElement).focus();
                  }
                }}
                id={`otp-input-${idx}`}
                autoFocus={idx === 0}
              />
            ))}
          </div>

          <p className="text-[15px] font-normal mb-4">
            Didn’t receive the OTP?{" "}
            <button
              type="button"
              className={
                canSubmit
                  ? "text-[#003BFE] cursor-pointer underline font-semibold text-[15px]"
                  : "text-[#003BFE] cursor-pointer underline font-normal text-[15px]"
              }
              onClick={handleResend}
            >
              Resend
            </button>
          </p>

          {error && <p className="text-red-500 text-xs mb-2">{error}</p>}
          {message && (
            <p className="text-green-500 text-xs mb-2">{message}</p>
          )}

          <Button
            type="submit"
            onClick={handleSubmit}
            className={
              canSubmit
                ? "w-full bg-[#0AA89E] cursor-pointer text-white py-3 rounded-lg text-[17px] font-semibold"
                : "w-full bg-[#D0D0D0] cursor-not-allowed text-white py-3 rounded-lg text-[17px] font-semibold"
            }
            disabled={!canSubmit}
          >
            {canSubmit ? "CONTINUE" : "VERIFY OTP"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}


// import { useEffect, useState, useRef } from "react";
// import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// import { Button } from "@/components/ui/button";

// export default function SignUpOtpModal({
//   open,
//   onClose,
//   mobile,
//   countryCode,
//   onNext,
//   onBack
// }: {
//   open: boolean;
//   onClose: () => void;
//   mobile: string;
//   countryCode: string;
//   onNext: (otp: string) => void;
//   onBack: () => void;
// }) {
//   const [otp, setOtp] = useState(["", "", "", "", "", ""]);
//   const [error, setError] = useState("");
//   const otpValue = otp.join("");
//   const canSubmit = otpValue.length === 6 && otp.every((d) => d !== "");
//   const firstInputRef = useRef<HTMLInputElement>(null);

//   useEffect(() => {
//     if (open) {
//       setOtp(["", "", "", "", "", ""]);
//       setError("");
//       setTimeout(() => {
//         firstInputRef.current?.focus();
//       }, 0);
//     }
//   }, [open]);

//   const handleChange = (idx: number, value: string) => {
//     if (/^[0-9]?$/.test(value)) {
//       const newOtp = [...otp];
//       newOtp[idx] = value;
//       setOtp(newOtp);
//     }
//   };

//   const handleSubmit = (e: React.FormEvent) => {
//     e.preventDefault();
//     if (otpValue.length !== 6) {
//       setError("Enter 6 digit OTP");
//       return;
//     }
//     setError("");
//     onNext(otpValue);
//   };

//   const handleEdit = () => {
//     setOtp(["", "", "", "", "", ""]);
//     setError("");
//     onBack(); // Go back to edit mobile
//   };

//   const handleResend = () => {
//     setOtp(["", "", "", "", "", ""]);
//     setError("");
//     // TODO: Implement resend OTP logic
//     // You can show a toast or feedback here
//   };

//   return (
//     <Dialog open={open} onOpenChange={onClose}>
//       <DialogContent className="max-w-xs w-sm rounded-xl p-2 pt-0 overflow-hidden">
//         {/* Header */}
//         <div className="relative bg-[#dff3f4] px-2 py-4 text-center rounded-t-xl">
//           <DialogHeader>
//             <DialogTitle className="text-lg font-bold text-center">OTP Verification</DialogTitle>
//           </DialogHeader>
//         </div>
//         {/* Message */}
//         <div className="text-center text-sm mt-2 mb-1">
//           We've sent to verification code to <br />
//           <span className="font-medium">+{countryCode} {mobile}</span>{" "}
//           <button type="button" className="text-primary underline text-sm ml-1" onClick={handleEdit}>Edit</button>
//         </div>
//         <form onSubmit={handleSubmit} className="flex flex-col items-center gap-3 px-1">
//           {/* OTP Inputs */}
//           <div className="flex gap-1 justify-center mb-1">
//             {otp.map((digit, idx) => (
//               <input
//                 key={idx}
//                 ref={idx === 0 ? firstInputRef : undefined}
//                 type="text"
//                 inputMode="numeric"
//                 maxLength={1}
//                 className="w-8 h-10 text-center border border-gray-300 rounded text-lg focus:border-primary outline-none"
//                 value={digit}
//                 onChange={e => {
//                   const val = e.target.value;
//                   handleChange(idx, val);
//                   if (/^[0-9]$/.test(val) && idx < 5) {
//                     const next = document.getElementById(`otp-input-${idx + 1}`);
//                     if (next) (next as HTMLInputElement).focus();
//                   }
//                 }}
//                 onKeyDown={e => {
//                   if (e.key === 'Backspace' && !otp[idx] && idx > 0) {
//                     const prev = document.getElementById(`otp-input-${idx - 1}`);
//                     if (prev) (prev as HTMLInputElement).focus();
//                   }
//                 }}
//                 id={`otp-input-${idx}`}
//                 autoFocus={idx === 0}
//               />
//             ))}
//           </div>
//           {/* Resend */}
//           <div className="text-center text-xs mb-1">
//             Didn't receive the OTP?{' '}
//             <button type="button" className="text-primary underline" onClick={handleResend}>Resend</button>
//           </div>
//           {error && <p className="text-xs text-red-600">{error}</p>}
//           {/* VERIFY OTP Button */}
//           <Button
//             type="submit"
//             className="w-full bg-primary text-white h-10 rounded-lg text-sm font-semibold disabled:opacity-60"
//             disabled={!canSubmit}
//           >
//             VERIFY OTP
//           </Button>
//         </form>
//       </DialogContent>
//     </Dialog>
//   );
// }
