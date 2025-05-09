import React, { createContext, useContext, useState, ReactNode } from "react";
import { Snackbar } from "react-native-paper";

type SnackbarContextType = {
  showError: (message: string) => void;
};

const SnackbarContext = createContext<SnackbarContextType | undefined>(undefined);

export const useSnackbar = () => {
  const context = useContext(SnackbarContext);
  if (!context) throw new Error("useSnackbar must be used within SnackbarProvider");
  return context;
};

export const SnackbarProvider = ({ children }: { children: ReactNode }) => {
  const [visible, setVisible] = useState(false);
  const [message, setMessage] = useState("");

  const showError = (msg: string) => {
    setMessage(msg);
    setVisible(true);
  };

  return (
    <SnackbarContext.Provider value={{ showError }}>
      {children}
      <Snackbar
        visible={visible}
        onDismiss={() => setVisible(false)}
        duration={3000}
        style={{ backgroundColor: "#d32f2f" }} // red background for error
        action={{
          label: "Dismiss",
          onPress: () => setVisible(false),
          textColor: "#fff",
        }}
      >
        {message}
      </Snackbar>
    </SnackbarContext.Provider>
  );
};
