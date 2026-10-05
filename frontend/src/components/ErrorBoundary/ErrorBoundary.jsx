import { Component } from "react";

class ErrorBoundary extends Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("Uncaught application runtime error:", error, errorInfo);
    }

    handleReset = () => {
        this.setState({ hasError: false, error: null });
        window.location.href = "/";
    };

    render() {
        if (this.state.hasError) {
            return (
                <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center p-4">
                    <div className="bg-slate-900 border border-red-500/40 rounded-2xl p-8 max-w-md text-center space-y-4 shadow-2xl">
                        <div className="w-16 h-16 bg-red-500/20 text-red-400 rounded-full flex items-center justify-center text-3xl mx-auto">
                            ⚠️
                        </div>
                        <h2 className="text-xl font-bold text-slate-100">
                            Something went wrong
                        </h2>
                        <p className="text-xs text-slate-400">
                            An unexpected interface error occurred. You can return to the home screen safely.
                        </p>
                        <div className="pt-2 flex gap-3 justify-center">
                            <button
                                onClick={this.handleReset}
                                className="px-5 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-xl shadow transition"
                            >
                                Return to Home
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
