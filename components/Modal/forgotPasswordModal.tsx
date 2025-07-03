import { useEffect, useRef, useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Check, Eye, EyeOff } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import Image from "next/image";
import { ForgotPassword, ResetPassword, VerifyOtp } from "@/lib/loginService";
import { toast } from "sonner";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { DialogTitle } from "@radix-ui/react-dialog";

const forgotPasswordSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

const forgotRequestSchema = z.object({
  value: z.string().refine(
    (val) => {
      // Check if it's a valid email or a 10-digit mobile
      const emailRegex = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
      return emailRegex.test(val);
    },
    { message: "Enter a valid email" }
  ),
});

function ForgotPasswordRequestModal({
  open,
  onClose,
  onNext,
}: {
  open: boolean;
  onClose: () => void;
  onNext: (value: string) => void;
}) {
  const form = useForm<z.infer<typeof forgotRequestSchema>>({
    resolver: zodResolver(forgotRequestSchema),
    defaultValues: { value: "" },
  });
  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-md rounded-3xl p-0 pt-0 gap-1 overflow-hidden bg-white shadow-2xl border-0">
        <DialogTitle>
          <VisuallyHidden>Forgot Password</VisuallyHidden>
        </DialogTitle>
        {/* Header Part */}
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
            <h2 className="text-[25px] font-semibold text-black">
              Forgot Password
            </h2>
          </div>
        </div>
        {/* Main Part */}
        <div className="mb-2 text-sm text-black px-4 font-medium">
          Enter your registered email address.
        </div>

        <form
          onSubmit={form.handleSubmit(async (data) => {
            const res = await ForgotPassword(data.value);
            if (res.message === "OTP sent successfully.") {
              onNext(data.value);
            } else {
              form.setError("value", { message: "Enter a valid Email" });
            }
          })}
          className="space-y-6 p-3"
        >
          <div className="relative group">
            {/* <div className="absolute left-4 top-1/2 transform -translate-y-1/2 z-10">
              <svg
                className="w-5 h-5 text-gray-400 group-focus-within:text-blue-500 transition-colors"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"
                />
              </svg>
            </div> */}
            <Input
              placeholder="Enter your email address"
              {...form.register("value")}
              className="pl-3 pr-4 py-4 border-2 border-gray-200 rounded-md focus:border-blue-500 focus:ring-4 focus:ring-blue-100 transition-all duration-300 hover:border-gray-300 text-sm font-normal"
            />
          </div>

          {form.formState.errors.value && (
            <div className="text-xs text-red-500 mt-2 flex items-center bg-red-50 p-3 rounded-lg">
              <svg
                className="w-4 h-4 mr-2 flex-shrink-0"
                fill="currentColor"
                viewBox="0 0 20 20"
              >
                <path
                  fillRule="evenodd"
                  d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
              {form.formState.errors.value.message}
            </div>
          )}

          <Button
            className="w-full py-4 bg-[#0AA89E] text-white font-semibold rounded-xl transition-all duration-300 transform hover:shadow-xl focus:ring-4 focus:ring-blue-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none text-base"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <div className="flex items-center justify-center space-x-2">
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                <span>Sending OTP...</span>
              </div>
            ) : (
              <div className="flex items-center justify-center space-x-2">
                <span>Send OTP</span>
              </div>
            )}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ForgotPasswordNewModal({
  open,
  onClose,
  onSubmission,
  email,
}: {
  open: boolean;
  onClose: () => void;
  onSubmission: () => void;
  email: string;
}) {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const form = useForm<z.infer<typeof forgotPasswordSchema>>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { password: "", confirmPassword: "" },
  });
  useEffect(() => {
    if (open) {
      form.reset();
    }
  }, [open]);

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-md rounded-xl gap-1 p-0">
        <DialogTitle>
          <VisuallyHidden>Forgot Password</VisuallyHidden>
        </DialogTitle>
        {/* Header Part */}
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
            <h2 className="text-[25px] font-semibold text-black">
              Forgot Password
            </h2>
          </div>
        </div>

        {/* Main Part */}

        <div className="mb-2 text-sm px-4">Enter your new password below.</div>
        <form
          onSubmit={form.handleSubmit(async (formData) => {
            const data: any = {
              email: email,
              newPassword: formData.password,
              confirmPassword: formData.confirmPassword,
            };
            const res = await ResetPassword(data);

            if (res.error) {
              form.setError("password", { message: res.error });
            }

            if (res.message === "Password reset successfully.") {
              onSubmission();
            }
          })}
          className="space-y-2 p-3 gap-3"
        >
          <div className="mb-2">
            <label className="block text-xs font-medium mb-1">
              New Password
            </label>
            <div className="relative">
              <Input
                type={showPassword ? "text" : "password"}
                {...form.register("password")}
                className="pr-8 border-2 border-gray-300"
                placeholder="New Password"
                autoComplete="off"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                tabIndex={-1}
                onClick={() => setShowPassword((v) => !v)}
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {form.formState.errors.password && (
              <div className="text-xs text-red-600 mt-1">
                {form.formState.errors.password.message}
              </div>
            )}
          </div>
          <div className="mb-2">
            <label className="block text-xs mt-2 font-medium mb-1">
              Confirm Password
            </label>
            <div className="relative">
              <Input
                type={showConfirm ? "text" : "password"}
                {...form.register("confirmPassword")}
                className="pr-8  border-2 border-gray-300"
                placeholder="Confirm Password"
                autoComplete="off"
              />
              <button
                type="button"
                className="absolute right-2 top-2 text-gray-500"
                tabIndex={-1}
                onClick={() => setShowConfirm((v) => !v)}
              >
                {showConfirm ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {form.formState.errors.confirmPassword && (
              <div className="text-xs text-red-600 mt-1">
                {form.formState.errors.confirmPassword.message}
              </div>
            )}
          </div>
          <Button
            className="w-full mt-2 bg-[#0AA89E]"
            type="submit"
            disabled={form.formState.isSubmitting}
          >
            Set New Password
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function ForgotPasswordSuccessModal({
  open,
  onLogin,
}: {
  open: boolean;
  onLogin: () => void;
}) {
  return (
    <Dialog open={open}>
      <DialogContent className="max-w-xs w-sm rounded-xl p-0 flex flex-col items-center justify-center gap-0">
        <DialogTitle>
          <VisuallyHidden>Forgot Password</VisuallyHidden>
        </DialogTitle>
        {/* Header Part */}
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
            <h2 className="text-[25px] font-semibold text-black">Success</h2>
          </div>
        </div>

        {/* Main Part */}
        <div className="p-3 pt-0 w-full flex flex-col items-center">
          <div className="flex flex-col items-center justify-center mb-4 bg-green-600 rounded-full p-2">
            <Check className="w-10 h-10 text-white" />
          </div>
          <div className="text-lg font- font-medium text-center mb-4">
            Password Changed Successfully
          </div>
          <Button className="w-full bg-[#0AA89E]" onClick={onLogin}>
            Login
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export default function ForgotPasswordModal({
  open,
  onClose,
  onLogin,
}: {
  open: boolean;
  onClose: () => void;
  onLogin: () => void;
}) {
  const [step, setStep] = useState<"request" | "otp" | "new" | "success">(
    "request"
  );
  const [value, setValue] = useState("");
  const [otp, setOtp] = useState("");

  return (
    <>
      <ForgotPasswordRequestModal
        open={open && step === "request"}
        onClose={onClose}
        onNext={(val) => {
          setValue(val);
          setStep("otp");
        }}
      />
      <SignUpOtpModal
        open={open && step === "otp"}
        onClose={onClose}
        email={value}
        onNext={() => {
          setStep("new");
        }}
        onBack={() => setStep("request")}
      />
      <ForgotPasswordNewModal
        open={open && step === "new"}
        onClose={onClose}
        email={value}
        onSubmission={() => {
          setStep("success");
        }}
      />
      <ForgotPasswordSuccessModal
        open={open && step === "success"}
        onLogin={() => {
          setStep("request");
          onClose();
          if (onLogin) onLogin();
        }}
      />
    </>
  );
}

export function SignUpOtpModal({
  open,
  onClose,
  email,
  onNext,
  onBack,
}: {
  open: boolean;
  onClose: () => void;
  email: string;
  onNext: () => void;
  onBack: () => void;
}) {
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [error, setError] = useState("");
  const otpValue = otp.join("");
  const canSubmit = otpValue.length === 6 && otp.every((d) => d !== "");
  const firstInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) {
      setOtp(["", "", "", "", "", ""]);
      setError("");
      setTimeout(() => {
        firstInputRef.current?.focus();
      }, 0);
    }
  }, [open]);

  const handleChange = (idx: number, value: string) => {
    if (/^[0-9]?$/.test(value)) {
      const newOtp = [...otp];
      newOtp[idx] = value;
      setOtp(newOtp);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (otpValue.length !== 6) {
      setError("Enter 6 digit OTP");
      return;
    }
    setError("");
    // console.log(email, otpValue);
    const res = await VerifyOtp(email, otpValue);

    if (res.error === "Invalid OTP.") {
      setError("Invalid OTP");
    }
    if (res === "OTP verified successfully.") {
      onNext();
    } else {
      setError("Failed to verify OTP");
    }
  };

  const handleEdit = () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    onBack(); // Go back to edit mobile
  };

  const handleResend = async () => {
    setOtp(["", "", "", "", "", ""]);
    setError("");
    const res = await ForgotPassword(email);
    if (res.message === "OTP sent successfully.") {
      return;
    } else {
      setError("Failed to send OTP");
    }
    // TODO: Implement resend OTP logic
    // You can show a toast or feedback here
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogTitle>
        <VisuallyHidden>OTP Verification</VisuallyHidden> 
      </DialogTitle>
      <DialogContent className="w-full max-w-md sm:max-w-lg md:max-w-md rounded-xl p-0 pt-0 overflow-hidden">
        {/* Header Part */}
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
            <h2 className="text-[25px] font-semibold text-black">
              OTP Verification
            </h2>
          </div>
        </div>
        {/* Message */}
        <div className="text-center text-sm m-0">
          We've sent to verification code to <br />
          <span className="font-medium">{email}</span>{" "}
          <button
            type="button"
            className="text-primary underline text-sm ml-1"
            onClick={handleEdit}
          >
            Edit
          </button>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col items-center gap-2 px-3 pb-3"
        >
          {/* OTP Inputs */}
          <div className="flex gap-3 justify-center mb-1">
            {otp.map((digit, idx) => (
              <input
                key={idx}
                ref={idx === 0 ? firstInputRef : undefined}
                type="text"
                inputMode="numeric"
                maxLength={1}
                autoComplete="off"
                className="w-10 h-12 text-center border border-gray-300 rounded text-lg focus:border-primary outline-none"
                value={digit}
                onChange={(e) => {
                  const val = e.target.value;
                  handleChange(idx, val);
                  if (/^[0-9]$/.test(val) && idx < 5) {
                    const next = document.getElementById(
                      `otp-input-${idx + 1}`
                    );
                    if (next) (next as HTMLInputElement).focus();
                  }
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
          {/* Resend */}
          <div className="text-center text-sm mb-1">
            Didn't receive the OTP?{" "}
            <button
              type="button"
              className="text-primary underline"
              onClick={handleResend}
            >
              Resend
            </button>
          </div>
          {error && <p className="text-xs text-red-600">{error}</p>}
          {/* VERIFY OTP Button */}
          <Button
            type="submit"
            className="w-full bg-[#0AA89E] text-white h-10 rounded-lg text-sm font-semibold disabled:opacity-60"
            disabled={!canSubmit}
          >
            VERIFY OTP
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
