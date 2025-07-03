import axios from "axios";
import apiClient from "./apiClient";
import { headers } from "next/headers";

export const SignUp = async (data: any) => {
    try {
        const res = await axios.post("https://api.foodchow.com/api/UserMaster/signup", data);
        return res.data;
    } catch (error: any) {
        console.error("Error signing up:", error);
        if(error.response.status === 500){
            return error.response.data.error;
        }
    }
}

export const Login = async (data: any) => {
    try {
        const res = await axios.post("https://api.foodchow.com/api/UserMaster/newlogin", data);
        return res.data;
    } catch (error: any) {
        return {error:error.response.data.message}
    }
}

export const ForgotPassword = async (email: any) => {
    try {
        const res = await axios.post(`https://api.foodchow.com/api/UserMaster/ForgotPassword?Email=${email}`);
        return res.data;
    } catch (error: any) {
        console.error("Error signing up:", error);
    }
}

export const VerifyOtp = async (email: any, otp: any) => {
    try {
        const res = await axios.post(`https://api.foodchow.com/api/UserMaster/VerifyOtp?Email=${email}&enteredOtp=${otp}`);
        return res.data;
    } catch (error: any) {
        return {error:error.response.data}
    }
}

export const ResetPassword = async (data: any) => {
    try {
        const res = await axios.post(`https://api.foodchow.com/api/UserMaster/ResetPassword`, data);
        return res.data;
    } catch (error: any) {
        console.error("Error resetting password:", error);
        return {error:error.response.data.message};
    }
}

export const LoginWithSocial = async (data: any) => {
    try {
        const res = await axios.post(`https://api.foodchow.com/api/UserMaster/PerformUserLoginWithSocialMedia`, data);
        return res.data;
    } catch (error: any) {
        console.error("Error resetting password:", error);
        return {error:error.response.data.message};
    }
}
