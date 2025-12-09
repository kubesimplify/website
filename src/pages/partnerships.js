import React from 'react';
import Layout from '@theme/Layout';
import Link from '@docusaurus/Link';

const OfferingCard = ({ title, notes, icon }) => (
    <div className="group bg-dark-card p-8 rounded-3xl border border-white/5 hover:border-primary/50 transition-all duration-500 hover:shadow-[0_0_30px_rgba(0,242,255,0.15)] hover:-translate-y-2 h-full flex flex-col">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-6 group-hover:bg-primary group-hover:scale-110 transition-all duration-300 text-primary">
            {icon}
        </div>
        <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-primary transition-colors duration-300">{title}</h3>
        <p className="text-gray-400 leading-relaxed flex-1 text-base">{notes}</p>
    </div>
);

const SectionTitle = ({ title, subtitle }) => (
    <div className="text-center mb-16 w-full">
        <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">{title}</h2>
        <p className="text-xl text-gray-400 max-w-2xl w-full mx-auto">{subtitle}</p>
    </div>
);

export default function Partnerships() {
    const contentOfferings = [
        {
            title: "YouTube Technical Deep-Dive",
            notes: "End-to-end production of a high-quality technical video with a clear Call to Action. Perfect for product demos and tutorials.",
            icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        },
        {
            title: "Sponsored Ad Segment",
            notes: "10–15s dedicated segment inserted into an existing high-reach video. Ideal for brand awareness and quick announcements.",
            icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5.882V19.24a1.76 1.76 0 01-3.417.592l-2.147-6.15M18 13a3 3 0 100-6M5.436 13.683A4.001 4.001 0 017 6h1.832c4.1 0 7.625-1.234 9.168-3" /></svg>
        },
        {
            title: "Webinar Hosting",
            notes: "Interactive webinar session hosted on Kubesimplify, perfect for lead generation and direct community engagement.",
            icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" /></svg>
        },
        {
            title: "Video + Webinar Bundle",
            notes: "High-impact combination of a deep-dive video and an interactive webinar. Maximum exposure across multiple channels.",
            icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
        },
        {
            title: "Blog Post + Promotion",
            notes: "Technical blog post on kubesimplify.com with social media distribution. SEO-friendly and long-lasting content.",
            icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" /></svg>
        },
        {
            title: "LinkedIn Article",
            notes: "SEO-optimized long-form article for maximum professional reach on the world's largest professional network.",
            icon: <svg className="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
        },
    ];

    return (
        <Layout title="Partnerships" description="Partner with Kubesimplify">
            <div className="bg-dark-bg min-h-screen py-32 relative overflow-clip">
                {/* Background Blobs */}
                <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-secondary/10 rounded-full blur-[100px] -z-10 opacity-30 pointer-events-none animate-blob" />
                <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-primary/10 rounded-full blur-[100px] -z-10 opacity-30 pointer-events-none animate-blob animation-delay-2000" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-primary/5 rounded-full blur-[120px] -z-10 opacity-40" />

                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                    {/* Back Button */}
                    <div className="mb-12 w-full flex justify-start">
                        <Link to="/" className="inline-flex items-center gap-2 text-gray-400 hover:text-primary transition-all duration-300 group">
                            <svg className="w-5 h-5 transform group-hover:-translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
                            <span>Back to Home</span>
                        </Link>
                    </div>

                    {/* Header */}
                    <div className="text-center mb-32 animate-fade-in max-w-4xl mx-auto">
                        <div className="inline-block mb-6 px-4 py-1.5 rounded-full border border-primary/20 bg-primary/10 backdrop-blur-md">
                            <span className="text-primary font-bold tracking-wide text-sm uppercase">Partnership Opportunities</span>
                        </div>
                        <h1 className="text-5xl md:text-7xl font-extrabold text-white mb-8 tracking-tight leading-tight">
                            Partner with Us
                        </h1>
                        <p className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto leading-relaxed">
                            Accelerate your growth in the Cloud Native ecosystem. Connect with over <span className="text-primary font-bold">100k+ developers</span> through our tailored content offerings.
                        </p>
                    </div>

                    {/* Content Offerings */}
                    <div className="w-full max-w-7xl mx-auto mb-32">
                        <SectionTitle title="Content Offerings" subtitle="High-quality technical content tailored to your brand goals." />
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {contentOfferings.map((item, index) => (
                            <OfferingCard key={index} {...item} />
                        ))}
                        </div>
                    </div>

                    {/* CTA Section */}
                    <div className="max-w-4xl mx-auto mt-32">
                        <div className="relative bg-gradient-to-br from-primary/10 via-secondary/5 to-primary/10 rounded-[2.5rem] p-12 md:p-16 text-center border border-white/10 overflow-hidden backdrop-blur-sm">
                            <div className="absolute inset-0 bg-[url('/img/grid.svg')] opacity-10" />
                            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-primary/5 to-transparent opacity-50" />
                            <div className="relative z-10">
                                <h2 className="text-3xl md:text-5xl font-bold mb-6 text-white">Ready to make an impact?</h2>
                                <p className="text-lg md:text-xl text-gray-400 mb-10 max-w-2xl mx-auto leading-relaxed">
                                    Let's discuss how we can help you achieve your DevRel and marketing goals with custom packages.
                                </p>
                                <Link
                                    to="mailto:kubesimplify@gmail.com"
                                    className="inline-flex items-center justify-center px-10 py-5 text-lg font-bold text-black transition-all duration-300 bg-white rounded-full hover:bg-gray-200 hover:shadow-[0_0_40px_rgba(0,242,255,0.4)] hover:-translate-y-1 transform"
                                >
                                    Contact Us Today
                                    <svg className="w-5 h-5 ml-2 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                                </Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </Layout >
    );
}
