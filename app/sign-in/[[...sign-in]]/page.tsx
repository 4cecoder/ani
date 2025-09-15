import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 flex items-center justify-center p-4">
      <div className="bg-black/30 backdrop-blur-sm rounded-lg border border-white/10 p-8 max-w-md w-full">
        <SignIn
          appearance={{
            baseTheme: undefined,
            variables: {
              colorPrimary: "#8b5cf6",
              colorBackground: "transparent",
              colorInputBackground: "rgba(255, 255, 255, 0.1)",
              colorInputText: "white",
              colorText: "white",
              borderRadius: "0.5rem"
            },
            elements: {
              card: "bg-transparent shadow-none",
              headerTitle: "text-white",
              headerSubtitle: "text-white/70",
              formButtonPrimary: "bg-purple-600 hover:bg-purple-700",
              formFieldInput: "border-white/20 focus:border-purple-400",
              formFieldLabel: "text-white",
              footerActionLink: "text-purple-400 hover:text-purple-300"
            }
          }}
        />
      </div>
    </div>
  );
}