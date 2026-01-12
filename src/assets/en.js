/**
 * Instructions for AI machine:
 * Rule 1: Always use $t instead of importing useI18n
 * Rule 2: Use the file path as prefix for i18n key (e.g., files in @/components/room/OrderRooms.vue is components.room.OrderRooms.whateverYouWantAfterwards)
 * Rule 3: Also use i18n on error messages and placeholder text
 * Rule 4: when the text is combined with date or currency, do it last then ask on how to proceed
 */
const en = {
    "components": {
        "auth": {
            "AuthForm": {
                "signInTitle": "Sign in to your account",
                "createAccountTitle": "Create your account",
                "noAccount": "Don't have an account?",
                "haveAccount": "Already have an account?",
                "signUp": "Sign up",
                "signIn": "Sign in",
                "orContinueWith": "Or continue with",
                "emailLabel": "Email",
                "passwordLabel": "Password",
                "hidePassword": "Hide password",
                "showPassword": "Show password",
                "fullNameLabel": "Full Name",
                "emailPlaceholder": "Enter your email",
                "passwordPlaceholder": "Enter your password",
                "fullNamePlaceholder": "Enter your full name",
                "loading": "Loading...",
                "signInButton": "Sign In",
                "signUpButton": "Sign Up",
                "genericError": "An error occurred. Please try again.",
                "discordLoginError": "Failed to initiate Discord login. Please try again.",
                "linkedInLoginError": "Failed to initiate LinkedIn login. Please try again."
            }
        }
    }
};

export default en;