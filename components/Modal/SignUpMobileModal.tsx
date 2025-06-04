import { useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import {
  Command,
  CommandInput,
  CommandList,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "@/components/ui/command";
import { ChevronsUpDown, Check } from "lucide-react";
import { cn } from "@/lib/utils";
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

const signUpMobileSchema = z.object({
  countryCode: z.string().min(1, "Please select a country code."),
  mobile: z
    .string()
    .min(10, "Mobile number must be 10 digits.")
    .max(10, "Mobile number must be 10 digits.")
    .regex(/^[0-9]+$/, "Mobile number must contain only numbers."),
});
type SignUpMobileFormData = z.infer<typeof signUpMobileSchema>;

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
  onNext: (mobile: string, countryCode: string) => void;
  onLoginClick: () => void;
  parsedCountryCodes: any;
  onSocialLogin?: (email:string) => void;
}) {
  const [openSelect, setOpenSelect] = useState(false);
  const [search, setSearch] = useState("");
  const { data: session } = useSession();
  const [pendingGoogleLogin, setPendingGoogleLogin] = useState(false);

  const form = useForm<SignUpMobileFormData>({
    resolver: zodResolver(signUpMobileSchema),
    defaultValues: {
      countryCode: parsedCountryCodes?.[0]?.code || "",
      mobile: "",
    },
  });

  const countryCode = form.watch("countryCode");
  const mobile = form.watch("mobile");
  const selectedCountry = parsedCountryCodes?.find(
    (item: any) => item.code === countryCode
  );

  useEffect(() => {
    if (pendingGoogleLogin && session?.user?.email) {
      onSocialLogin?.(session.user.email);
      setPendingGoogleLogin(false);
    }
  }, [pendingGoogleLogin, session, onSocialLogin]);

  const onSubmit = (data: SignUpMobileFormData) => {
    onNext(data.mobile, data.countryCode);
  };

  const handleGoogleLogin = async () => {
    try {
      await signIn("google", {
        callbackUrl: `${window.location.pathname}?signup=1`,
      });
    } catch (error) {
      console.error("Google login failed:", error);
    }
  };

  const handleFacebookLogin = async () => {
    try {
      await signIn("facebook", {
        callbackUrl: `${window.location.pathname}?signup=1`,
      });
    } catch (error) {
      console.error("Facebook login failed:", error);
    }
  };  

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-xs rounded-xl p-3 box-content overflow-hidden w-sm gap-2">
        {/* Header */}
        <div className="relative bg-[#dff3f4] px-1.5 py-2 text-center rounded-t-xl">
          <DialogHeader>
            <DialogTitle className="text-lg font-semibold text-gray-800 text-center">
              Sign up
            </DialogTitle>
          </DialogHeader>
        </div>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(onSubmit)}
            className="space-y-2 mt-2 px-1"
          >
            {/* Mobile Number Row */}
            <div className="flex gap-1 mb-2 w-full">
              <FormField
                control={form.control}
                name="countryCode"
                render={({ field }) => (
                  <FormItem className="w-16 sm:w-20 flex-shrink-0">
                    <Popover open={openSelect} onOpenChange={setOpenSelect}>
                      <PopoverTrigger asChild>
                        <FormControl>
                          <Button
                            type="button"
                            variant="outline"
                            role="combobox"
                            className={cn(
                              "justify-center border-2 font-semibold text-xs px-1.5 py-1 h-7 w-full text-center rounded-lg transition-all duration-200 hover:border-primary hover:shadow-md focus:ring-2 focus:ring-primary/20",
                              !field.value && "text-muted-foreground",
                              field.value && "border-primary/60 bg-primary/5"
                            )}
                          >
                            <span className="truncate">
                              {countryCode ? `+${countryCode}` : "Code"}
                            </span>
                            <ChevronsUpDown className="opacity-50 w-3 h-3 ml-1 flex-shrink-0" />
                          </Button>
                        </FormControl>
                      </PopoverTrigger>
                      <PopoverContent className="p-0 w-44 shadow-lg border-2">
                        <Command>
                          <CommandInput
                            placeholder="Search country..."
                            value={search}
                            onValueChange={setSearch}
                            className="h-7 border-b text-xs"
                          />
                          <CommandList className="max-h-60 overflow-y-auto">
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {parsedCountryCodes
                                .filter(
                                  (item: any) =>
                                    item.country
                                      .toLowerCase()
                                      .includes(search.toLowerCase()) ||
                                    item.code.toString().includes(search)
                                )
                                .map((item: any) => (
                                  <CommandItem
                                    key={`${item.code}-${item.country}`}
                                    value={item.code + item.country}
                                    onSelect={() => {
                                      form.setValue("countryCode", item.code);
                                      setOpenSelect(false);
                                      setSearch("");
                                    }}
                                    className="hover:bg-primary/10 cursor-pointer py-1 text-xs"
                                  >
                                    <div className="flex items-center justify-between w-full">
                                      <span className="font-medium text-xs">+{item.code}</span>
                                      <span className="text-xs text-gray-600 truncate ml-2">
                                        {item.country}
                                      </span>
                                      {countryCode === item.code && (
                                        <Check className="w-3 h-3 text-primary ml-2 flex-shrink-0" />
                                      )}
                                    </div>
                                  </CommandItem>
                                ))}
                            </CommandGroup>
                          </CommandList>
                        </Command>
                      </PopoverContent>
                    </Popover>
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="mobile"
                render={({ field }) => (
                  <FormItem className="flex-1">
                    <FormControl>
                      <Input
                        type="tel"
                        placeholder="Enter Mobile Number"
                        {...field}
                        onChange={(e) => {
                          const value = e.target.value.replace(/[^0-9]/g, "");
                          field.onChange(value);
                        }}
                        className={cn(
                          "w-full border-2 text-xs px-1.5 py-1 h-7 rounded-lg transition-all duration-200 focus:ring-2 focus:ring-primary/20",
                          form.formState.errors.mobile
                            ? "border-red-500 focus:border-red-500"
                            : "border-gray-300 focus:border-primary hover:border-primary/60"
                        )}
                        maxLength={10}
                      />
                    </FormControl>
                    {/* Error message with icon, only for mobile */}
                    {form.formState.errors.mobile && (
                      <div className="flex items-center gap-1 mt-1 text-xs text-red-600">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth={2}
                          stroke="currentColor"
                          className="w-3 h-3"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {form.formState.errors.mobile.message}
                      </div>
                    )}
                  </FormItem>
                )}
              />
            </div>
            <Button
              type="submit"
              className={`w-full bg-[#E0E0E0] mt-1 text-gray-500 font-semibold h-7 rounded-lg text-xs disabled:opacity-100 transition-all duration-200 ${
                form.formState.isValid
                  ? "bg-primary text-white hover:bg-primary/90"
                  : "bg-[#E0E0E0] text-gray-500"
              }`}
              disabled={!form.formState.isValid}
            >
              GET OTP
            </Button>
          </form>
        </Form>
        <div className="text-center text-xs mt-1 mb-2">
          Already have an account?{" "}
          <span
            className="text-primary hover:underline cursor-pointer font-semibold"
            onClick={() => {
              onClose();
              onLoginClick();
            }}
          >
            Log in here
          </span>
        </div>
        <div className="relative flex items-center justify-center my-0">
          <div className="border-t border-gray-300 absolute w-full"></div>
          <div className="bg-white px-2 relative text-xs text-gray-500 z-10">
            Or Login With
          </div>
        </div>
        <div className="flex justify-center gap-2 mb-2">
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
        </div>
      </DialogContent>
    </Dialog>
  );
}