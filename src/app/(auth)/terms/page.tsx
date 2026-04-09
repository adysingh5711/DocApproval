export default function TermsOfServicePage() {
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
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Terms of Service</h1>
                    <p className="text-sm text-slate-400">Last updated: April 2026</p>
                </div>

                <div className="prose prose-slate max-w-none space-y-8 text-sm leading-relaxed text-slate-600">

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">1. About DocApproval</h2>
                        <p>
                            DocApproval is an open-source document approval tracking tool. It allows users to submit
                            Google Docs URLs, organise them into categories and subcategories, and monitor their
                            approval status. The source code is publicly available on GitHub under its respective
                            open-source license.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">2. Acceptance of Terms</h2>
                        <p>
                            By signing in to DocApproval using your Google account, you agree to these Terms of
                            Service. If you do not agree, do not use the service. These terms apply to all users
                            of the hosted version of DocApproval.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">3. What the Service Does</h2>
                        <p>DocApproval provides the following functionality:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>Analysing Google Docs submitted via URL and tracking their approval status</li>
                            <li>Organising documents into user-defined categories and subcategories</li>
                            <li>Sending approval reminder emails using customisable templates configured in Settings</li>
                            <li>Displaying document status across a personal Dashboard</li>
                        </ul>
                        <p>
                            DocApproval does not store the contents of your Google Docs. It only stores the file ID,
                            title, category, subcategory, approval status, and analysis metadata associated with
                            each submitted document.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">4. User Responsibilities</h2>
                        <p>You agree to:</p>
                        <ul className="list-disc list-inside space-y-1 pl-2">
                            <li>Only submit Google Doc URLs that you own or have permission to track</li>
                            <li>Not use the service to send unsolicited or abusive reminder emails</li>
                            <li>Not attempt to reverse-engineer, exploit, or disrupt the service</li>
                        </ul>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">5. Google Account &amp; OAuth</h2>
                        <p>
                            Authentication is handled exclusively via Google OAuth through NextAuth. DocApproval
                            stores your email address to associate your documents, categories, and settings with
                            your account. We do not store your Google password or access tokens beyond the scope
                            of the active session.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">6. Open Source</h2>
                        <p>
                            DocApproval is open-source software. You may self-host, fork, or contribute to the
                            project under the terms of its license. These Terms of Service apply only to the
                            hosted deployment of DocApproval, not to self-hosted instances.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">7. Availability &amp; Warranty</h2>
                        <p>
                            DocApproval is provided "as is" without warranty of any kind. As an open-source
                            project, uptime and continued availability are not guaranteed. We reserve the right
                            to modify or discontinue the service at any time without notice.
                        </p>
                    </section>

                    <section className="space-y-3">
                        <h2 className="text-base font-semibold text-slate-800">8. Changes to Terms</h2>
                        <p>
                            We may update these terms from time to time. Continued use of the service after
                            changes are posted constitutes acceptance of the updated terms.
                        </p>
                    </section>

                </div>

                <div className="pt-6 border-t border-slate-200 text-xs text-slate-400">
                    DocApproval - open source document approval tracking.
                </div>
            </div>
        </div>
    );
}
