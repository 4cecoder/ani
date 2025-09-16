import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900/90 via-blue-900/90 to-indigo-900/90 dark:from-purple-950/95 dark:via-blue-950/95 dark:to-indigo-950/95 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.02] to-transparent animate-pulse"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-pink-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[40rem] h-[40rem] bg-blue-500/5 rounded-full blur-3xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 flex items-center justify-center min-h-screen p-4">
        <div className="bg-gray-900 border border-gray-700 rounded-2xl shadow-2xl p-6 max-w-md w-full">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">🎉</span>
            </div>
            <h1 className="text-2xl font-bold text-white mb-2">Welcome to Ani</h1>
            <p className="text-gray-300">Sign in to join the hangout</p>
          </div>
          
          <div className="flex justify-center">
            <SignIn
            appearance={{
              variables: {
                colorPrimary: "#8b5cf6",
                colorBackground: "#1f2937",
                colorInputBackground: "#374151",
                colorInputText: "#ffffff",
                colorText: "#ffffff",
                colorTextSecondary: "#d1d5db",
                borderRadius: "0.75rem",
                fontFamily: "inherit",
                fontSize: "0.875rem"
              },
              elements: {
                card: "bg-gray-800 shadow-none border-none",
                headerTitle: "text-white text-xl font-semibold",
                headerSubtitle: "text-gray-300",
                formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105",
                formFieldInput: "bg-gray-700 border-gray-600 text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 rounded-lg transition-all duration-200",
                formFieldLabel: "text-white font-medium",
                footerActionLink: "text-purple-400 hover:text-purple-300 transition-colors duration-200",
                socialButtonsBlockButton: "bg-gray-700 border-gray-600 hover:bg-gray-600 text-white rounded-lg transition-all duration-200",
                dividerLine: "bg-gray-600",
                dividerText: "text-gray-400",
                identityPreviewText: "text-white",
                identityPreviewEditButton: "text-purple-400 hover:text-purple-300",
                formFieldInputShowPasswordButton: "text-gray-400 hover:text-white",
                formFieldInputShowPasswordIcon: "text-gray-400",
                footerActionText: "text-gray-400",
                formFieldErrorText: "text-red-400",
                alertText: "text-red-400",
                formFieldSuccessText: "text-green-400"
              }
            }}
          />
          </div>
        </div>
      </div>
    </div>
  );
}