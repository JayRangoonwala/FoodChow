import { Box, Modal } from "@mui/material";

const MaxQuantity = () => {
  return (
    <Modal
      open={true}
      // onClose={handleClose}
      aria-labelledby="modal-modal-title"
      aria-describedby="modal-modal-description"
    >
      <Box
        sx={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          bgcolor: "background.paper",
          borderRadius: 2,
          boxShadow: 24,
          p: 4,
        }}
      >
        <p>dddddd</p>
      </Box>
    </Modal>
  );
};
export default MaxQuantity;
