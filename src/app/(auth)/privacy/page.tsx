export default function PrivacyPolicyPage() {
    return (
        <div className="h-screen bg-slate-50 font-sans overflow-y-auto custom-scrollbar">
            <div className="max-w-3xl mx-auto px-6 py-16 space-y-10">

                {/* Header */}
                <div className="space-y-2">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-bold text-sm select-none">
                            D
                        </div>
                        <span className="text-lg font-semibold text-slate-800 tracking-tight">DocApproval</span>
                    </div>
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Privacy Policy</h1>
                    <p className="text-sm text-slate-400">Last updated: April 2026</p>
                </div>

                <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-600">

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">1. What We Collect</h2>
                        <p>When you use DocApproval, we store the following data:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li><strong className="text-slate-700">Google account email address</strong> — used to identify your account and associate your data</li>
                            <li><strong className="text-slate-700">Document metadata</strong> — the Google Docs file ID, document title, category, subcategory, approval status, and last analysis timestamp for each document you submit</li>
                            <li><strong className="text-slate-700">Content taxonomy</strong> — the category and subcategory names you define in Settings</li>
                            <li><strong className="text-slate-700">Email reminder templates</strong> — the custom subject and body text you configure in Settings for reminder emails</li>
                        </ul>
                        <p>
                            We do <strong className="text-slate-700">not</strong> store the body or contents of your Google Docs. We do not access
                            your Google Drive beyond resolving the file ID from the URL you provide.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">2. How We Use Your Data</h2>
                        <p>Your data is used solely to operate the DocApproval service:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>To display your documents and their approval status on the Dashboard</li>
                            <li>To enable document analysis and status tracking via the Analyse feature</li>
                            <li>To populate reminder emails with your configured template and document details</li>
                            <li>To organise your documents using your content taxonomy from Settings</li>
                        </ul>
                        <p>
                            We do not sell, share, or use your data for advertising or any purpose outside of
                            providing the DocApproval service to you.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">3. Authentication</h2>
                        <p>
                            Sign-in is handled via Google OAuth using NextAuth. We receive your email address
                            and basic profile from Google at sign-in. We do not store your Google password or
                            long-lived access tokens. Session tokens are managed securely by NextAuth and expire
                            on sign-out.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">4. Data Storage</h2>
                        <p>
                            All user data is stored in Convex, a hosted real-time database. Data is associated
                            with your account by email address. You can delete individual documents and categories
                            at any time from the Dashboard and Settings pages.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">5. Reminder Emails</h2>
                        <p>
                            DocApproval may send approval reminder emails on your behalf using the template you
                            configure in Settings. These emails are sent only when you explicitly trigger them.
                            We do not send automated or marketing emails.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">6. Open Source &amp; Self-Hosting</h2>
                        <p>
                            DocApproval is open-source. If you self-host the application, this Privacy Policy
                            does not apply — you are responsible for your own data handling. This policy applies
                            only to the hosted deployment of DocApproval.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">7. Your Rights</h2>
                        <p>
                            You can delete your documents and categories at any time from within the app. If you
                            want your account and all associated data permanently deleted, contact the project
                            maintainer via the GitHub repository.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">8. Changes to This Policy</h2>
                        <p>
                            We may update this policy as the project evolves. Continued use of the service after
                            updates are posted constitutes acceptance of the revised policy.
                        </p>
                    </section>

                </div>

                <div className="pt-6 border-t border-slate-200 text-xs text-slate-400">
                    DocApproval — open source document approval tracking.
                </div>
            </div>
        </div>
    );
}
