import { useTheme } from "next-themes";
import { Toaster as Sonner, type ToasterProps } from "sonner";

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = "system" } = useTheme();

  return (
    <Sonner
      theme={theme as ToasterProps["theme"]}
      className="toaster group"
      {...props}
      toastOptions={{
        ...props.toastOptions,
        classNames: {
          toast:
            "group toast !bg-white/80 !backdrop-blur-[30px] !border !border-white/60 !shadow-[0_12px_40px_rgba(0,0,0,0.12)] !rounded-full !px-5 !py-3.5 !font-semibold !text-[14px] !text-slate-900 flex items-center justify-between !w-auto !min-w-[300px]",
          description: "!text-slate-500 !font-medium",
          actionButton:
            "!bg-slate-900 !text-white !rounded-full !px-5 !py-2 !font-semibold !text-[13px] hover:!bg-black transition-all !shadow-sm !ml-auto",
          cancelButton:
            "!bg-slate-100 !text-slate-600 !rounded-full !px-5 !py-2 !font-semibold !text-[13px] hover:!bg-slate-200 transition-all",
          success: "!bg-[#F0FDF4]/90 !text-[#16A34A] !border-[#BBF7D0]/50",
          error: "!bg-[#FEF2F2]/90 !text-[#DC2626] !border-[#FECACA]/50",
          ...props.toastOptions?.classNames,
        },
      }}
    />
  );
};

export { Toaster };
