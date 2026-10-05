import { useState } from "react";
import { useAuth } from "../../context/useAuth";

function AuthDialog() {
    const {
        isAuthDialogOpen,
        closeAuthDialog,
        login,
        register,
        isSigningIn,
        authError,
    } = useAuth();
    const [isRegistering, setIsRegistering] = useState(false);
    const [displayName, setDisplayName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");

    if (!isAuthDialogOpen) return null;

    const handleSubmit = async (event) => {
        event.preventDefault();
        try {
            if (isRegistering) {
                await register(displayName, email, password);
            } else {
                await login(email, password);
            }
        } catch {
            // The authentication context exposes the server error in the dialog.
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/80 p-4" role="presentation">
            <section
                aria-labelledby="auth-dialog-title"
                aria-modal="true"
                className="w-full max-w-md space-y-5 rounded-2xl border border-slate-700 bg-slate-900 p-6 shadow-2xl"
                role="dialog"
            >
                <div className="flex items-start justify-between gap-4">
                    <div>
                        <h2 id="auth-dialog-title" className="text-xl font-bold text-white">
                            {isRegistering ? "Create your account" : "Sign in to Samadhan AI"}
                        </h2>
                        <p className="mt-1 text-sm text-slate-400">
                            {isRegistering ? "Track your reports and their progress." : "Use your email and password to continue."}
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={closeAuthDialog}
                        aria-label="Close sign in dialog"
                        className="rounded-lg px-2 py-1 text-slate-400 hover:bg-slate-800 hover:text-white"
                    >
                        ✕
                    </button>
                </div>
                <form className="space-y-4" onSubmit={handleSubmit}>
                    {isRegistering && (
                        <label className="block space-y-1 text-sm text-slate-300">
                            Name
                            <input
                                autoComplete="name"
                                className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                                maxLength={100}
                                minLength={2}
                                onChange={(event) => setDisplayName(event.target.value)}
                                required
                                value={displayName}
                            />
                        </label>
                    )}
                    <label className="block space-y-1 text-sm text-slate-300">
                        Email
                        <input
                            autoComplete="email"
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                            onChange={(event) => setEmail(event.target.value)}
                            required
                            type="email"
                            value={email}
                        />
                    </label>
                    <label className="block space-y-1 text-sm text-slate-300">
                        Password
                        <input
                            autoComplete={isRegistering ? "new-password" : "current-password"}
                            className="w-full rounded-lg border border-slate-700 bg-slate-950 px-3 py-2 text-white"
                            minLength={8}
                            onChange={(event) => setPassword(event.target.value)}
                            required
                            type="password"
                            value={password}
                        />
                    </label>
                    {authError && (
                        <p className="rounded-lg border border-red-500/40 bg-red-950/40 p-3 text-sm text-red-200" role="alert">
                            {authError}
                        </p>
                    )}
                    <button
                        className="w-full rounded-lg bg-blue-600 px-4 py-2.5 font-semibold text-white hover:bg-blue-500 disabled:opacity-50"
                        disabled={isSigningIn}
                        type="submit"
                    >
                        {isSigningIn ? "Please wait..." : isRegistering ? "Create account" : "Sign in"}
                    </button>
                </form>
                <p className="text-center text-sm text-slate-400">
                    {isRegistering ? "Already registered?" : "New to Samadhan AI?"}{" "}
                    <button
                        className="font-semibold text-cyan-300 hover:text-white"
                        onClick={() => setIsRegistering((value) => !value)}
                        type="button"
                    >
                        {isRegistering ? "Sign in" : "Create an account"}
                    </button>
                </p>
            </section>
        </div>
    );
}

export default AuthDialog;
