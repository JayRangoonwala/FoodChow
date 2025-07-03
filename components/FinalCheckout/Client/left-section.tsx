"use client";

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "../../ui/card";
import { cn } from "@/lib/utils";
import PaymentMetod from "./payment-methods";
import GuestForm from "@/components/Forms/guest-form";
import { useCheckoutStore } from "@/store/checkoutStore";
import { Mail, PhoneCall, User } from "lucide-react";
import { LoginWithSocial } from "@/lib/loginService";
import { useSearchParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useLoginStore } from "@/store/loginStore";

type SocialData = {
  user_email: string;
  login_type: string;
};

export default function LeftSection({
  parsedCountryCodes,
  parsedUserOptions,
}: {
  parsedCountryCodes: any;
  parsedUserOptions: any;
}) {
  const [currentActive, setCurrentActive] = useState<any>("contact_form");

  const [selectedOrderType, setSelectedOrderType] = useState<any>(null);
  const [accActivated, setAccActivated] = useState<any>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { gstDetailsSaved, setGstDetailsSaved } = useCheckoutStore();
  const { data: session } = useSession();
  const [userInfo, setUserInfo] = useState<null | {
    firstName: string;
    lastName: string;
    email: string;
    mobile: string;
  }>(null);
  const isLoginModalOpen = useLoginStore((state) => state.isLoginModalOpen);
  const setIsLoginModalOpen = useLoginStore(
    (state) => state.setIsLoginModalOpen
  );

  useEffect(() => {
    const selectedOption = localStorage.getItem("selectedOption");
    const selectedService = localStorage.getItem("selectedService");
    const selectedTable = localStorage.getItem("selectedTable");

    if (selectedOption) {
      const parsedOption = JSON.parse(selectedOption);
      setSelectedOrderType((prev: any) => {
        return { ...prev, parsedOption };
      });
    }

    if (selectedService) {
      const parsedService = JSON.parse(selectedService);
      setSelectedOrderType((prev: any) => {
        return { ...prev, parsedService };
      });
    }
    if (selectedTable) {
      const parsedTable = JSON.parse(selectedTable);
      setSelectedOrderType((prev: any) => {
        return { ...prev, parsedTable };
      });
    }
  }, []);
  console.log("selectedOrderType", selectedOrderType);

  useEffect(() => {
    if (gstDetailsSaved > 0) {
      setCurrentActive("payment_method");
      setAccActivated(true);
    }
  }, [gstDetailsSaved]);

  useEffect(() => {
    // Function to load userInfo from localStorage
    const loadUserInfo = () => {
      const stored = localStorage.getItem("userInfo");
      if (stored) {
        setUserInfo(JSON.parse(stored));
        setAccActivated(true);
        setCurrentActive("payment_method");
      } else {
        setUserInfo(null);
      }
    };

    // Load on mount
    loadUserInfo();

    // Listen for updates
    window.addEventListener("userInfoUpdated", loadUserInfo);

    // Cleanup
    return () => {
      window.removeEventListener("userInfoUpdated", loadUserInfo);
    };
  }, []);

  useEffect(() => {
    const Login = async (login_type: string, email: string) => {
      const data: SocialData = {
        user_email: email,
        login_type: login_type,
      };
      const res = await LoginWithSocial(data);
      if (res.responseCode == 0) {
        alert(res.message);
        setIsLoginModalOpen(true);
      } else if (res.responseCode == 1) {
        const user = {
          firstName: res.data[0].name,
          lastName: res.data[0].last_name,
          email: res.data[0].email_id,
          mobile: res.data[0].mobile_no,
        };
        localStorage.setItem("userInfo", JSON.stringify(user));
        setUserInfo(user);
        router.replace(window.location.pathname);
        setAccActivated(true);
        setCurrentActive("payment_method");
        // window.location.reload();
      }
    };
    if (searchParams.get("socialLogin") === "0" && session?.user?.email) {
      Login("G", session?.user?.email);
    } else if (
      searchParams.get("socialLogin") === "1" &&
      session?.user?.email
    ) {
      Login("F", session?.user?.email);
    }
  }, [session, searchParams]);

  // console.log(UserData);

  // useEffect(() => {
  //   // Function to load userInfo from localStorage
  //   const loadUserInfo = () => {
  //     const stored = localStorage.getItem("userInfo");
  //     if (stored) {
  //       setUserInfo(UserData);
  //       setAccActivated(true);
  //       setCurrentActive("payment_method");
  //     } else {
  //       setUserInfo(null);
  //     }
  //   };

  //   // Load on mount
  //   loadUserInfo();

  //   // Listen for updates
  //   window.addEventListener("userInfoUpdated", loadUserInfo);

  //   // Cleanup
  //   return () => {
  //     window.removeEventListener("userInfoUpdated", loadUserInfo);
  //   };
  // }, [UserData]);

  // console.log("selectedOrderType",selectedOrderType );

  return (
    <div className="">
      {userInfo ? (
        <div className="border rounded-lg p-4 mb-4 bg-white flex flex-col gap-2 max-sm:text-sm">
          <div className="flex items-center gap-2 max-sm:gap-3">
            <span className="font-semibold flex items-center gap-2 flex-1">
              <User className="w-4 h-4" />
              {userInfo.firstName} {userInfo.lastName}
            </span>
            <span className="flex items-center gap-1">
              <PhoneCall className="w-4 h-4" />
              {userInfo.mobile}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Mail className="w-4 h-4" />
            <span>{userInfo.email}</span>
          </div>
          <div className="flex items-center gap-2">
            <input type="checkbox" checked readOnly className="mr-2" />
            <span className="text-xs">
              You agree to be remembered on this device and to receive money-off
              coupons & exclusive offers
            </span>
          </div>
        </div>
      ) : (
        <Card className="mb-4 shadow-sm">
          <CardContent>
            <div>
              <h2 className="text-lg font-semibold mb-1">
                Contact information
              </h2>
              <div
                className="w-full border-1 mb-4"
                style={{ border: "1px solid #D3D3D3" }}
              ></div>

              {parsedUserOptions && (
                <GuestForm
                  parsedCountryCodes={parsedCountryCodes}
                  parsedUserOptions={parsedUserOptions}
                />
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Order Type Section (like your image) */}
      <div className="rounded-xl shadow-sm p-4 bg-white mb-4">
        <div className="flex justify-between items-center">
          <p className="text-sm font-semibold">
            Selected Order Type:{" "}
            <span className="text-teal-600">
              {selectedOrderType?.parsedService
                ? selectedOrderType?.parsedService
                : null}
            </span>
          </p>
          {/* Optional table no */}
          {selectedOrderType?.parsedTable ? (
            <p className="text-sm font-semibold">
              Table No {selectedOrderType?.parsedTable}
            </p>
          ) : null
          }
        </div>

        <div
          className="w-full border-1 mt-2"
          style={{ border: "1px solid #D3D3D3" }}
        ></div>

        <div className="flex justify-between items-center mt-3">
          <div>
            <p className="text-sm font-medium">Manage Later Time</p>
            {/* <p className="text-xs text-gray-500 mt-1">29 Apr 2025 6:40 PM</p> */}
          </div>
          <button className="border border-black rounded-full px-4 py-1 text-sm font-medium hover:bg-gray-100">
            Edit
          </button>
        </div>
      </div>

      {/* Accordion Section */}
      <div className="rounded-xl shadow-sm p-4 bg-white mt-4">
        <div className="flex justify-between items-center">
          <h2 className="text-sm font-semibold text-gray-800">
            PAYMENT METHOD
          </h2>
        </div>
        <div
          className="w-full border-1 mt-2"
          style={{ border: "1px solid #D3D3D3" }}
        ></div>
        <div className="mt-5">
          <PaymentMetod />
        </div>
      </div>
    </div>
  );
}
