import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      toastOptions={{
        style: {
          background: "rgba(255, 255, 255, 0.85)",
          backdropFilter: "blur(16px)",
          WebkitBackdropFilter: "blur(16px)",
          borderRadius: "24px",
          fontSize: "14px",
          fontWeight: "700",
          color: "#0F172A",
          padding: "16px 20px",
          border: "1px solid rgba(255, 255, 255, 0.6)",
          boxShadow: "0 10px 40px -10px rgba(0,0,0,0.1)",
        },
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-white/80 group-[.toaster]:backdrop-blur-xl group-[.toaster]:text-[#0F172A] group-[.toaster]:border-white/60 group-[.toaster]:shadow-[0_12px_40px_rgb(0,0,0,0.08)] group-[.toaster]:rounded-[24px] group-[.toaster]:px-5 group-[.toaster]:py-4 group-[.toaster]:font-bold",
          description: "group-[.toast]:text-gray-500 group-[.toast]:font-medium",
          actionButton:
            "group-[.toast]:bg-[#0F172A] group-[.toast]:text-white group-[.toast]:rounded-full group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:font-bold hover:group-[.toast]:bg-gray-800 transition-colors",
          cancelButton:
            "group-[.toast]:bg-gray-100 group-[.toast]:text-gray-600 group-[.toast]:rounded-full group-[.toast]:px-4 group-[.toast]:py-2 group-[.toast]:font-bold hover:group-[.toast]:bg-gray-200 transition-colors",
          success: "group-[.toaster]:bg-[#F0FDF4]/90 group-[.toaster]:text-[#16A34A] group-[.toaster]:border-[#BBF7D0]/50",
          error: "group-[.toaster]:bg-[#FEF2F2]/90 group-[.toaster]:text-[#DC2626] group-[.toaster]:border-[#FECACA]/50",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
