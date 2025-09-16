import { Waitlist } from "@clerk/nextjs";

export default function SignUpPage() {
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
        <div className="bg-background/95 backdrop-blur-xl border border-border/50 rounded-2xl shadow-2xl p-8 max-w-md w-full">
          <div className="text-center mb-6">
            <div className="w-16 h-16 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full flex items-center justify-center mx-auto mb-4">
              <span className="text-white font-bold text-2xl">🎉</span>
            </div>
            <h1 className="text-2xl font-bold text-foreground mb-2">Join the Waitlist</h1>
            <p className="text-muted-foreground">Get early access to Ani when we launch</p>
          </div>
          
           <Waitlist
             appearance={{
               baseTheme: "dark",
              variables: {
                colorPrimary: "#8b5cf6",
                colorBackground: "transparent",
                colorInputBackground: "hsl(var(--muted))",
                colorInputText: "hsl(var(--foreground))",
                colorText: "hsl(var(--foreground))",
                colorTextSecondary: "hsl(var(--muted-foreground))",
                borderRadius: "0.75rem",
                fontFamily: "inherit",
                fontSize: "0.875rem"
              },
              elements: {
                card: "bg-transparent shadow-none border-none",
                headerTitle: "text-foreground text-xl font-semibold",
                headerSubtitle: "text-muted-foreground",
                formButtonPrimary: "bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-medium rounded-lg transition-all duration-200 transform hover:scale-105",
                formFieldInput: "bg-muted border-border focus:border-primary focus:ring-2 focus:ring-primary/20 rounded-lg transition-all duration-200",
                formFieldLabel: "text-foreground font-medium",
                footerActionLink: "text-primary hover:text-primary/80 transition-colors duration-200",
                socialButtonsBlockButton: "bg-muted border-border hover:bg-muted/80 text-foreground rounded-lg transition-all duration-200",
                dividerLine: "bg-border",
                dividerText: "text-muted-foreground",
                identityPreviewText: "text-foreground",
                identityPreviewEditButton: "text-primary hover:text-primary/80",
                formFieldInputShowPasswordButton: "text-muted-foreground hover:text-foreground",
                formFieldInputShowPasswordIcon: "text-muted-foreground",
                footerActionText: "text-muted-foreground",
                formFieldErrorText: "text-red-500",
                alertText: "text-red-500",
                formFieldSuccessText: "text-green-500"
              }
            }}
          />
        </div>
      </div>
    </div>
  );
}