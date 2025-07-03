import React from "react";
import { Dialog, DialogTitle, DialogContent, DialogActions, Button } from "@mui/material";
import { IoIosCloseCircleOutline } from "react-icons/io";

type Props = {
  open: boolean;
  setSkipDeal: (value:boolean) => void;
  orderMethods: string; 
};
const methodMap: Record<string, string> = {
    "1": "Take Away",
    "2": "Dine-In",
    "5": "Home Delivery",
  };

const DealNotAvailableModal = ({ open,setSkipDeal, orderMethods}: Props) => {
    const readableMethods = orderMethods
    .split(",")
    .map((id) => methodMap[id])
    .filter(Boolean) // removes undefined values
    .join(", ");
  return (
    <Dialog open={open} onClose={()=>{setSkipDeal(false)}}
   >
    <div
     style={{
        display:'flex',
        flexDirection:"column",
        justifyContent:"center",
        alignItems:'center',
        // background:'blue',
        width:'350px',
        padding:'10px',
        borderRadius:'5px'
    }}>
      <div>
         <IoIosCloseCircleOutline  style={{  color: "#f27474",fontSize: '80px'}}/>
      </div>
      <DialogContent
      style={{
        textAlign:'center',
        fontSize:'20px',
        textTransform:"none",
      }}>
        This deal is available for:{readableMethods} only.
      </DialogContent>
      {/* <DialogActions> */}
        <Button onClick={()=>{setSkipDeal(false)}} variant="contained" autoFocus style={{
            background:' var(--primary)'
        }}>
          OK
        </Button>
      {/* </DialogActions> */}
      </div>
    </Dialog>
  );
};

export default DealNotAvailableModal;
